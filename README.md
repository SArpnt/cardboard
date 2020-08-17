# cardboard

modding api

```js
// @run-at       document-start

// @require      https://github.com/SArpnt/joinFunction/raw/master/script.js
// @require      https://github.com/SArpnt/EventHandler/raw/master/script.js
// @require      https://github.com/SArpnt/cardboard/raw/master/script.user.js

cardboard.register(MODNAME, /*optional*/ {data})
```

creates variable cardboard containing useful things.\
\
cardboard.version stores version of cardboard\
\
cardboard.mods stores mods and mod data\
use allRequiredModsRegistered event to check when all mods that require cardboard have registered\
use modRegistered to check when a new mod registers\
use unrequiredModRegistered to check when a new mod that doesn't require cardboard registers\
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

- modRegistered
- unrequiredModRegistered
- requiredModRegistered
- allRequiredModsRegistered
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
