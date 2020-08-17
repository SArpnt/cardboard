// ==UserScript==
// @name         Cardboard
// @description  Modding api
// @author       SArpnt
// @version      5.1.0
// @namespace    https://boxcrittersmods.ga/authors/sarpnt/
// @homepage     https://boxcrittersmods.ga/projects/cardboard/
// @updateURL    https://github.com/SArpnt/cardboard/raw/master/script.user.js
// @downloadURL  https://github.com/SArpnt/cardboard/raw/master/script.user.js
// @supportURL   https://github.com/SArpnt/cardboard/issues
// @icon         https://github.com/SArpnt/cardboard/raw/master/icon16.png
// @icon64       https://github.com/SArpnt/cardboard/raw/master/icon64.png
// @run-at       document-start
// @grant        none
// @match        https://boxcritters.com/play/
// @match        https://boxcritters.com/play/?*
// @match        https://boxcritters.com/play/#*
// @match        https://boxcritters.com/play/index.html
// @match        https://boxcritters.com/play/index.html?*
// @match        https://boxcritters.com/play/index.html#*
// @require      https://github.com/SArpnt/joinFunction/raw/master/script.js
// @require      https://github.com/SArpnt/EventHandler/raw/master/script.js
// ==/UserScript==

(function () {
	'use strict';

	if (typeof joinFunction == 'undefined') throw '@require https://cdn.jsdelivr.net/gh/SArpnt/joinFunction/script.min.js';
	if (typeof EventHandler == 'undefined') throw '@require https://cdn.jsdelivr.net/gh/SArpnt/EventHandler/script.min.js';

	const VERSION = [5, 1, 0];
	const IS_USERSCRIPT = GM_info.script.name == 'Cardboard';

	if (window.cardboard) {
		window.cardboard.loadCount++;
		let comp = (a, b) => (a < b) - (b < a);
		switch (comp(window.cardboard.version, VERSION)) {
			case 1: // this is newer
				if (window.cardboard.mods) {
					let m = Object.keys(window.cardboard.mods);
					alert(
						`The mod${m.length == 1 ? 's' : ''} ${
						m.map(a => `'${a}'`).join(',')
						} ${m.length == 1 ? 'is' : 'are'} using an older version of cardboard, please reinstall ${m.length == 1 ? 'this mod' : 'these mods'}`
					);
				} else
					alert(`Unknown mods are using an older version of cardboard, Try reinstalling all active mods`);
				return;
			case -1: // this is older
				let o = window.cardboard.register;
				window.cardboard.register = function (mod) {
					alert(`The mod '${mod}' using an older version of cardboard, please reinstall this mod`);
					window.cardboard.register = o;
					return o.apply(window.cardboard, arguments);
				};
				return;
		}
		return;
	}

	let cardboard = new EventHandler([
		'modRegistered',
		'requiredModRegistered',
		'unrequiredModRegistered',
		'allRequiredModsRegistered',

		'loadScripts',
		'runScripts',

		'worldCreated',
		'worldSocketCreated',
		'worldStageCreated',
		'worldManifestCreated',
		'clientCreated',
		'joinRoom',
		'login',
	], false);
	cardboard.version = VERSION;
	window.cardboard = cardboard;

	// register system
	cardboard.mods = {};
	cardboard.loadCount = 1;
	cardboard.registerCount = 0;
	cardboard.register = function (mod, data = {}, count = true) {
		if (typeof mod != 'string') throw new TypeError(`Parameter 1 must be of type 'string'`);
		if (typeof data != 'object' || data === null) throw new TypeError(`Parameter 2 must be of type 'object'`);
		if (count) cardboard.registerCount++;
		cardboard.mods[mod] = data;
		cardboard.emit('modRegistered', mod, data, cardboard.mods);
		cardboard.emit(count ? 'requiredModRegistered' : 'unrequiredModRegistered', mod, data, cardboard.mods);
		return data;
	};
	setTimeout(function () {
		if (cardboard.loadCount != cardboard.registerCount)
			alert(`Mods didn't register! Cardboard has been loaded ${cardboard.loadCount} time(s), but ${cardboard.registerCount} mod(s) registered.
Try reinstalling active mods.`
			);
		cardboard.emit('allRequiredModsRegistered', cardboard.mods);
	}, 0);
	cardboard.register('cardboard', cardboard, IS_USERSCRIPT);

	let ajax = function (url, callback, stopCache = false) {
		if (stopCache)
			url += (url.includes('?') ? '&' : '?') + (new Date).getTime();
		let x = new XMLHttpRequest;
		x.onreadystatechange = e => callback && x.readyState == 4 && x.status == 200 && callback(x.response, x, e);
		try {
			x.open('GET', url, false);
			x.send();
		} catch (e) {
			x.open('GET', url, true);
			x.send();
		}
		return x;
	};

	{ // scriptHandling
		let getScript = function (s) {
			if (s.selector)
				if (typeof s.selector == 'string')
					return document.querySelector(`script[${s.selector}]`);
				else if (s.selector.constructor.name == 'RegExp')
					return Array.from(document.scripts).find(e => s.selector.test(e.src));
				else
					return s.selector();
			else
				return document.querySelector(`script[src="${s.src}"]`);
		};
		let scriptTags = [
			{ name: "Client", selector: /\/lib\/client(-\d+)?\.min\.js/, src: true, state: 0, }, // state 0 unloaded, 1 loaded, 2 ran
			{ name: "Boot", selector: /\/lib\/boot(-\d+)?\.min\.js/, src: '../lib/boot.min.js', state: 0, },
			//{ name: "Login", src: '/scripts/login.js', state: 0, },
			{ name: "Hero", src: 'hero.js', state: 0, },
			{ name: "Shop", src: 'shop.js', state: 0, },
			{ name: "Index", src: 'index.js', state: 0, },
			//{ name: "ShowGame", selector: _ => Array.from(document.scripts).find(e => /showGame/.exec(e.innerHTML)), state: 0, },
			//{ name: "Modal", selector: _ => Array.from(document.scripts).find(e => /var\smodalElement/.exec(e.innerHTML)), state: 0, },
		];
		if (document.scripts)
			for (let s of scriptTags)
				if (getScript(s)) {
					alert(`Cardboard wasn't injected in time!
					1) Try refreshing to see if this fixes the issue
					2) Enable instant script injection in tampermonkey settings:
						- Click tampermonkey's icon, a menu should appear
						- Go to dashboard
						- Select the settings tab near the top right
						- Set config mode to advanced (first setting)
						- Set inject mode to instant (scroll to the bottom of the page)`
					);
					console.log(document.cloneNode(document.documentElement));
					return;
				}
		for (let s of scriptTags)
			if (typeof s.src == 'string')
				s.ajax = ajax(s.src, d => { s.text = d; if (s.state == 1) finish(s); });

		let MO = new MutationObserver((m, o) => {
			for (let s of scriptTags)
				if (!s.state) {
					let tag = getScript(s);
					if (tag) {
						tag.remove();
						s.state = 1;
						tag.addEventListener('beforescriptexecute', e => e.preventDefault()); // firefox fix
						s.tag = document.createElement('script');

						if (tag.src) {
							if (tag.src != s.src) {
								if (s.ajax)
									s.ajax.abort();
								s.ajax = ajax(tag.src, d => { s.text = d; finish(s); });
							}
						} else {
							s.text = tag.innerHTML;
							finish(s);
						}
					}
				}
		});
		MO.observe(document.documentElement, { childList: true, subtree: true });

		let finish = function (s) {
			s.tag.innerHTML = s.text;
			cardboard.emit(`loadScript${s.name}`, s.tag);

			s.state = 2;

			if (Object.values(scriptTags).every(e => e.state >= 2))
				runScripts();
		};
		function runScripts() {
			MO.disconnect();
			cardboard.emit('loadScripts');
			for (let s of scriptTags)
				if (s.state == 2) {
					document.documentElement.appendChild(s.tag);
					s.state = 3;
					cardboard.emit(`runScript${s.name}`, s.tag);
				}
			cardboard.emit('runScripts');
		}

		let pageLoadDebugger = function () {
			let run = false;
			for (let t of scriptTags)
				switch (t.state) {
					case 0:
						console.error(`Cardboard: Script event issues! Couldn't find`, t);
						run = true;
						break;
					case 1:
						console.warn(`Cardboard: Script not ran in time! (Not all script srcs finished loading) May have compatibility issues`, t);
						break;
					//case 2:
					//	console.error(`Cardboard: Script src found but not ran? Needs to be fixed`, t);
					//	run = true;
				}
			if (run) runScripts();
		};
		window.addEventListener('load', _ => setTimeout(pageLoadDebugger, 0));
	}

	{ // getPlayerCrumb
		let crumb = v => function (t, d, w) {
			if (typeof w == 'undefined')
				if (world)
					w = world;
				else
					throw `'world' not found, specify a world`;
			let func;
			if (typeof t == 'function') func = t;
			else func = e => e[t] == d;
			return w.room.playerCrumbs[v](func);
		};
		cardboard.getPlayerCrumb = crumb("find");
		cardboard.getPlayerCrumbs = crumb("filter");
		cardboard.getPlayerSprite = (...a) => world.stage.room.players[cardboard.getPlayerCrumb(...a).i];
		cardboard.getPlayerSprites = (...a) => cardboard.getPlayerCrumbs(...a).map(e => world.stage.room.players[e.i]);
	}

	/*
	cardboard.createButton = function (text, pos, style = "") {
		let b = document.createElement('button'); // acutally maybe copy element
		b.innerText = text;
		b.style = style;
		return b;
	}
	*/
	/**
	 * locations:
	 * 	aboveChat "#chat .above-chat" (make div for it in "#chat .chat-form")
	 * 	chat "#chat .input-group-btn"
	 * 	belowChat "#chat .abelow-chat" (like aboveChat)
	 * 	// (likely not possible yet) footer (sign out button location)
	 */

	cardboard.on('runScriptClient', function () {
		client.World = joinFunction(client.World, function () {
			cardboard.emit('worldCreated', this);
			cardboard.emit('worldStageCreated', this, this.stage); // depricated unless next update uses it
		});
		let p = client.World.prototype;
		p.connect = joinFunction(p.connect, function () {
			cardboard.emit('worldSocketCreated', this, this.socket);
		});
		/*p.loadManifest = joinFunction(p.loadManifest, function (t) {
			cardboard.emit('worldManifestCreated', this, t);
		});*/
		// doesn't exist anymore afaik, loaded dynamically likely
		cardboard.emit('clientCreated', client);
	});

	cardboard.on('worldCreated', function (w) {
		w.on("joinRoom", t =>
			setTimeout(
				_ => cardboard.emit('joinRoom', w, t),
				0));
	});

	cardboard.on('worldSocketCreated', function (w, s) {
		s.on('login', _ =>
			setTimeout(
				_ => cardboard.emit('login', w, s),
				0));
	});
})();