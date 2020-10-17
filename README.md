# Cardboard

modding api

if cardboard is required:
```js
// @run-at       document-start

// @require      https://github.com/SArpnt/joinFunction/raw/master/script.js
// @require      https://github.com/SArpnt/EventHandler/raw/master/script.js
// @require      https://github.com/SArpnt/cardboard/raw/master/script.user.js

const MOD_DATA = cardboard.register(MOD_NAME, /*optional*/ {data});
```

if cardboard isn't required:
```js
// @run-at       document-start

let MOD_DATA = {data}; // can be replaced with undefined
const cRegister = _ => cardboard.register(MOD_NAME, MOD_DATA, false, GM_info);
if (window.cardboard)
	cRegister();
else
	window.addEventListener('cardboardLoaded', cRegister);
```

creates variable cardboard containing useful things.

cardboard.version stores version of cardboard

cardboard.mods stores mods and mod data\
use allModsRegistered event to check when all mods that require cardboard have registered\
use modRegistered to check when a new mod registers\
use unrequiredModRegistered to check when a new mod that doesn't require cardboard registers

cardboard contains an [EventHandler](https://cdn.jsdelivr.net/gh/sarpnt/EventHandler/script.min.js)\
events:
- modRegistered(mod, data, cardboard.mods)
- unrequiredModRegistered(mod, data, cardboard.mods)
- requiredModRegistered(mod, data, cardboard.mods)
- allModsRegistered(cardboard.mods)
<br><br>
- loadScripts
- runScripts
- loadScript(scriptname, script tag)
- runScript(scriptname, script tag)
- loadScript*\[scriptname\]*(script tag)
- runScript*\[scriptname\]*(script tag)
  - Bootstrap
  - Createjs
  - SocketIo
  - Client
  - Boot
  - Hero
  - Shop
  - Index
  - Mobile
<br><br>
- clientCreated(client)
- worldCreated(world)
- worldSocketCreated(world, world.socket)
- worldStageCreated(world, world.stage)
- worldManifestCreated(world, manifest)
- login(world, world.player)
- joinRoom(world, roomCrumb)

cardboard.getPlayer\
all types:
- getPlayerCrumb
- getPlayerCrumbs
- getPlayerSprite
- getPlayerSprites