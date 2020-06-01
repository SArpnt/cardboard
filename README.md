# cardboard

modding api

```js
// @require      https://code.jquery.com/jquery-3.5.1.min.js
// @require      https://cdn.jsdelivr.net/gh/sarpnt/joinFunction/script.min.js
// @require      https://cdn.jsdelivr.net/gh/sarpnt/EventHandler/script.min.js
// @require      https://cdn.jsdelivr.net/gh/boxcritters/cardboard/script.user.min.js
```

creates variable cardboard containing useful things
cardboard.version stores version of cardboard
cardboard contains an [EventHandler](https://cdn.jsdelivr.net/gh/sarpnt/EventHandler/script.min.js)
events:

- loadScripts
- runScripts
- loadScript(scriptname)
- runScript(scriptname)
  - Client
  - Boot
  - Login
  - Index
  - UnityProgress
  - UnityLoader
  - ShowGame
- clientCreated
- worldCreated
- worldSocketCreated
- worldStageCreated
- worldManifestCreated
- login
