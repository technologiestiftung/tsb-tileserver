require('sqlite3').verbose()

var config = require('./config.json'),
  express = require('express'),
  http = require('http'),
  app = express(),
  compression = require('compression'),
  tilelive = require('tilelive')

require('mbtiles').registerProtocols(tilelive)

var sources = config.sources

var source_ref = {};
for(var i in sources){
  source_ref[sources[i].name] = parseInt(i)
}

var source_count = 0

function loadTiles(){
  tilelive.load('mbtiles://'+ __dirname + sources[source_count].url, function(err, source) {
    if (err) { throw err;}

    sources[source_count].source = source

    if(source_count < (sources.length-1)){
      source_count++
      loadTiles()
    }else{
      startServer()
    }
  })
}

loadTiles()

function startServer(){
  app.set('port', 10061);

  app.use(compression())

  app.use((req, res, next) => {
    var origins = config.origins
    for(var i=0;i<origins.length;i++){
      var origin = origins[i]
      if("origin" in req.headers){
        if(req.headers.origin.indexOf(origin) > -1){
          res.header("Access-Control-Allow-Origin", "*")
        }
      }
      if("referer" in req.headers){
        if(req.headers.referer.indexOf(origin) > -1){
          res.header("Access-Control-Allow-Origin", "*")
        }
      }
    }

    if(process.argv.length >= 3 && process.argv[2] === "true"){
      res.header("Access-Control-Allow-Origin", "*")
    }

	res.header('Access-Control-Allow-Credentials', 'true');
  	res.header('Access-Control-Allow-Methods', 'GET,HEAD,PUT,PATCH,POST,DELETE');
	//res.header('Access-Control-Expose-Headers', 'Content-Length');
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");

    next()
  })

  app.use('/glyphs', express.static(__dirname+'/glyphs'))
  app.use('/sprites', express.static(__dirname+'/sprites'))

  app.get(/^\/tiles\/(.*)\/(\d+)\/(\d+)\/(\d+).pbf$/, (req, res) => {
    deliverTile(req, res, 'vector')
  })

  app.get(/^\/tiles\/(.*)\/(\d+)\/(\d+)\/(\d+).png$/, (req, res) => {
    deliverTile(req, res, 'raster')
  });

  var server = http.createServer(app).listen(app.get('port'), function() {
      console.log('Express server listening on port ' + app.get('port'));
  });

  server.on('connection', function(socket) {
	server.setTimeout(240000);
  })

}

function deliverTile(req, res, type){
  var type = req.params[0]
      
  var good = false
  if(type in source_ref){
    if(sources[source_ref[type]].type === type){
      good = true
    }
  }
  
  if(!good){
    //TODO: Add an empty type tileset!
  }

  var z = req.params[1],
    x = req.params[2],
    y = req.params[3];

  sources[source_ref[type]].source.getTile(z, x, y, (err, tile, headers) => {
    if (err) {
      //res.set(headers)
      res.send('')
    } else {
      res.set(headers)
      res.send(tile)
    }
  })
}