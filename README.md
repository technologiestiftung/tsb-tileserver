# tsb-tileserver

[![Greenkeeper badge](https://badges.greenkeeper.io/technologiestiftung/tsb-tileserver.svg)](https://greenkeeper.io/)

This is a simple self-hosted tile server implementation to work with the mapbox-gl-js frontend library. While this repo contains the structure and code to run the server, it does not contain the actual tiles you need to deliver data to the frontend. See below.

## Setup

```
npm install
```

Add your tiles, glyphs and sprites and then add them to the config.json.

## Running

There are two modes, one which allows all connections:

```
node index.js true
```

and one which runs a CORS check on provided domains (config.json):

```
node index.js
```

## Building Tiles and stuff

### Tiles
While you can of course build your own tiles, the easiest way is going to https://openmaptiles.com/ and get your vector tile extract. 
You can then simply add this to your tiles folder.

### Glyphs
Depending on the style you use, you will need glyphs. You can use the genfontgl module to do so, see here for an example: https://github.com/openmaptiles/fonts

### Sprites
The same accounts for sprites, if you have a folder of SVGs, use spritezero to convert them into a sprite.png/json.

## Deploy
Once the server is running and you have added glyphs and sprites to the according folders you are ready to go. Check the 'client' folder for an example of how to use the vector tiles with mapbox-gl-js.