# cardboard

modding api

```js
// @run-at       document-start

// @require      https://code.jquery.com/jquery-3.5.1.min.js
// @require      https://github.com/sarpnt/joinFunction/raw/master/script.js
// @require      https://github.com/sarpnt/EventHandler/raw/master/script.js
// @require      https://github.com/SArpnt/cardboard/raw/master/script.user.js
```

creates variable cardboard containing useful things.\
\
cardboard.version stores version of cardboard\
\
cardboard.getPlayer\
all types:

- getPlayerCrumb
- getPlayerCrumbs
- getPlayerSprite
- getPlayerSprites

\
cardboard contains an [EventHandler](https://cdn.jsdelivr.net/gh/sarpnt/EventHandler/script.min.js)\
events:

- loadScripts
- runScripts
- loadScript*\[scriptname\]*(script innerHTML)
- runScript*\[scriptname\]*
  - Client
  - Login
  - Index
  - UnityProgress
  - UnityLoader
  - ShowGame
- clientCreated(client)
- worldCreated(world)
- worldSocketCreated(world, socket)
- worldStageCreated(world, stage)
- worldManifestCreated(world, manifest)
- login(world)
- joinRoom(world, roomCrumb)
