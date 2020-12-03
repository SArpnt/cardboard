// ==UserScript==
// @name         Cardboard
// @description  Modding api
// @author       SArpnt
// @version      5.6.0
// @namespace    https://boxcrittersmods.ga/authors/sarpnt/
// @homepage     https://boxcrittersmods.ga/projects/cardboard/
// @updateURL    https://github.com/SArpnt/cardboard/raw/master/script.user.js
// @downloadURL  https://github.com/SArpnt/cardboard/raw/master/script.user.js
// @supportURL   https://github.com/SArpnt/cardboard/issues
// @icon         https://github.com/SArpnt/cardboard/raw/master/icon16.png
// @icon64       https://github.com/SArpnt/cardboard/raw/master/icon64.png
// @run-at       document-start
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

	if (typeof joinFunction == 'undefined') throw `@require https://cdn.jsdelivr.net/gh/SArpnt/joinFunction/script.min.js`;
	if (typeof EventHandler == 'undefined') throw `@require https://cdn.jsdelivr.net/gh/SArpnt/EventHandler/script.min.js`;

	const uWindow = typeof unsafeWindow != 'undefined' ? unsafeWindow : window;

	const VERSION = [5, 6, 0];
	const IS_USERSCRIPT = GM_info.script.name == 'Cardboard';

	if (uWindow.cardboard) {
		// register
		if (uWindow.cardboard.awaitingReg)
			uWindow.cardboard.unregistered.push(uWindow.cardboard.awaitingReg.script.name);
		else if (uWindow.cardboard.awaitingReg === undefined)
			alert(`The mod '${GM_info.script.name}' loaded late!
Contact the mod developer.`);

		if (IS_USERSCRIPT)
			uWindow.cardboard.awaitingReg = null;
		else
			uWindow.cardboard.awaitingReg = GM_info;

		// version detection
		let comp = (a, b) => (a < b) - (b < a);
		switch (comp(uWindow.cardboard.version, VERSION)) {
			case 1: // this is newer
				if (uWindow.cardboard.mods) {
					let m = Object.keys(uWindow.cardboard.mods);
					alert(`The mod${m.length == 1 ? '' : 's'} ${m.map(a => `'${a}'`).join(',')} ${m.length == 1 ? 'is' : 'are'} using an older version of cardboard.
Try reinstalling ${m.length == 1 ? 'this mod' : 'these mods'}.`);
				} else
					alert(`Unknown mods are using an older version of cardboard.
Try reinstalling all active mods.`);
				break;
			case -1: // this is older
				if (IS_USERSCRIPT)
					alert(`The mod 'Cardboard' (the userscript) is out of date.
Update this mod.`);
				else
					alert(`The mod '${GM_info.script.name}' using an older version of cardboard.
Try reinstalling this mod.`);
				break;
		}
		return;
	}

	let cardboard = new EventHandler([
		'modRegistered',
		'requiredModRegistered',
		'unrequiredModRegistered',
		'allModsRegistered',

		'loadScripts',
		'runScripts',
		'loadScript',
		'runScript',

		'worldCreated',
		'worldSocketCreated',
		'worldStageCreated',
		'worldManifestCreated',
		'clientCreated',
		'joinRoom',
		'login',
	], false);
	cardboard.version = VERSION;

	// register system
	cardboard.mods = {};
	cardboard.awaitingReg = GM_info;
	cardboard.unregistered = [];
	cardboard.register = function (mod, data = {}, req = true, gmInfo) {
		if (typeof mod != 'string' || !mod) throw new TypeError(`Parameter 1 must be of type 'string'`);
		if (!/^[a-z_$][\w$]*$/i.test(mod)) throw new TypeError(`Invalid characters in modname (must be valid for dot notation)`);
		if (typeof data != 'object' || data === null) throw new TypeError(`Parameter 2 must be of type 'object'`);
		if (typeof gmInfo != 'undefined' && (
			typeof gmInfo != 'object' || gmInfo === null ||
			!gmInfo.script || !gmInfo.script.name)) throw new TypeError(`Parameter 4 must be of type GM_info`);

		if (req && !cardboard.awaitingReg) {
			if (cardboard.mods[mod]) {
				alert(`The mod '${(cardboard.mods[mod].GM_info && cardboard.mods[mod].GM_info) || mod}' registered twice!
Contact the mod creator.`);
				return;
			} else {
				alert(`The mod '${mod}' registered without cardboard detecting it beforehand!
Contact the mod creator.`);
			}
		}
		if (cardboard.mods[mod]) {
			alert(`The mod '${(cardboard.awaitingReg && cardboard.awaitingReg.script.name) ||
				(gmInfo && gmInfo.script.name) ||
				mod}' is conflicting with '${mod}'!
Either don't use these mods together or contact the mod creator.`);
			return;
		}
		if (req) { // assign gm_info
			data.GM_info = cardboard.awaitingReg;
			cardboard.awaitingReg = null;
		} else {
			data.GM_info = gmInfo;
			if (!gmInfo)
				console.warn(`No GM_info for mod '${mod}'!`);
		}

		cardboard.mods[mod] = data;
		cardboard.emit('modRegistered', mod, data, cardboard.mods);
		cardboard.emit(req ? 'requiredModRegistered' : 'unrequiredModRegistered', mod, data, cardboard.mods);
		return data;
	};
	setTimeout(function () {
		if (cardboard.awaitingReg)
			cardboard.unregistered.push(cardboard.awaitingReg.script.name);
		delete cardboard.awaitingReg;

		if (cardboard.unregistered.length)
			alert(`The mod${cardboard.unregistered.length == 1 ? '' : 's'} ${cardboard.unregistered.map(a => `'${a}'`).join(',')} didn't register!
Try reinstalling the${cardboard.unregistered.length == 1 ? 'is mod' : 'ese mods'}.`);
		cardboard.register = function (mod) {
			alert(`The mod '${mod}' registered late!
Contact the mod developer.`);
		};
		cardboard.emit('allModsRegistered', cardboard.mods);
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
					return Array.from(document.scripts).find(e => s.selector.test(s.src ? e.src : e.innerHTML));
				else
					return s.selector();
			else
				return document.querySelector(`script[src="${s.src}"]`);
		};
		let scriptTags = [
			{ name: "Bootstrap", selector: /vendor\/js\/bootstrap(\.min)?\.js$/, src: '../vendor/js/bootstrap.min.js', ranTest: _ => uWindow.bootstrap, state: 0, }, // state 0 unloaded, 1 loaded, 2 ran
			{ name: "Createjs", selector: /vendor\/js\/createjs(\.min)?\.js$/, src: '../vendor/js/createjs.min.js', ranTest: _ => uWindow.createjs, state: 0, },
			{ name: "SocketIo", selector: /vendor\/js\/socket\.io(\.min)?\.js$/, src: '../vendor/js/socket.io.js', ranTest: _ => uWindow.io, state: 0, },
			{ name: "World", nicknames: ["Client"], selector: /(lib\/)?world(-?\d+)?(\.min)?\.js$/, src: true, ranTest: _ => uWindow.client, state: 0, },
			{ name: "Boot", selector: /(lib\/)?boot(-?\d+)?(\.min)?\.js$/, src: '../lib/boot.min.js', ranTest: _ => uWindow.boot, state: 0, },
			//{ name: "Login", selector: /(lib\/)?login(-?\d+)?(\.min)?\.js$/, src: 'login.js', state: 0, },
			{ name: "Hero", selector: /(lib\/)?hero(-?\d+)?(\.min)?\.js$/, src: 'hero.js', ranTest: _ => uWindow.addHero, state: 0, },
			{ name: "Shop", selector: /(lib\/)?shop(-?\d+)?(\.min)?\.js$/, src: 'shop.js', ranTest: _ => uWindow.extra, state: 0, },
			{ name: "Play", nicknames: ["Index"], selector: /(lib\/)?play(-?\d+)?(\.min)?\.js$/, src: true, ranTest: _ => uWindow.init, state: 0, },
			//{ name: "ShowGame", selector: /showGame/, state: 0, },
			//{ name: "Modal", selector: /var\smodalElement/, state: 0, },
			{ name: "Mobile", selector: /function\s+mobile/, ranTest: _ => uWindow.mobile, state: 0, },
			{ name: "Ux", src: 'ux.js', ranTest: _ => uWindow.ux, state: 0, },
		];
		if (document.scripts)
			for (let s of scriptTags)
				if (getScript(s) && (!s.ranTest || s.ranTest())) {
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
			cardboard.emit(`loadScript`, s.name, s.tag);
			if (s.nicknames)
				for (let n of s.nicknames) {
					cardboard.emit(`loadScript${n}`, s.tag);
					cardboard.emit(`loadScript`, n, s.tag);
				}

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
					cardboard.emit(`runScript`, s.name, s.tag);
					if (s.nicknames)
						for (let n of s.nicknames) {
							cardboard.emit(`runScript${n}`, s.tag);
							cardboard.emit(`runScript`, n, s.tag);
						}
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
		uWindow.addEventListener('load', _ => setTimeout(pageLoadDebugger, 0));
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
			cardboard.emit('worldStageCreated', this, this.stage); // depricated unless a new update uses it
		});
		let p = client.World.prototype;
		p.connect = joinFunction(p.connect, function () {
			cardboard.emit('worldSocketCreated', this, this.socket);
		});
		cardboard.emit('clientCreated', client);
	});

	cardboard.on('worldCreated', function (w) {
		w.on('login', p =>
			cardboard.emit('login', w, p)
		);
		w.on('joinRoom', t =>
			cardboard.emit('joinRoom', w, t)
		);
	});

	/*cardboard.on('worldSocketCreated', function (w, s) {

	});*/

	uWindow.cardboard = cardboard;
	window.dispatchEvent(new Event('cardboardLoaded'));
})();