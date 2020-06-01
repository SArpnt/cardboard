// ==UserScript==
// @name         Cardboard
// @namespace    http://tampermonkey.net/
// @version      0.0.0
// @run-at       document-start
// @description  modding api
// @author       SArpnt
// @match        https://play.boxcritters.com/*
// @grant        none
// @require      https://code.jquery.com/jquery-3.5.1.min.js
// @require      https://cdn.jsdelivr.net/gh/sarpnt/joinFunction/script.min.js
// @require      https://cdn.jsdelivr.net/gh/sarpnt/EventHandler/script.min.js
// ==/UserScript==

(function () {
	if (typeof $ == 'undefined') throw '@require https://code.jquery.com/jquery-3.5.1.min.js';
	if (typeof joinFunction == 'undefined') throw '@require https://cdn.jsdelivr.net/gh/sarpnt/joinFunction/script.min.js';
	if (typeof EventHandler == 'undefined') throw '@require https://cdn.jsdelivr.net/gh/sarpnt/EventHandler/script.min.js';

	const cVersion = [0, 0, 0];

	function versionCompare(a, b) {
		for (let i in a) {
			let c = (a < b) - (b < a);
			if (c) return c;
		}
		return 0;
	};

	if (window.cardboard) {
		console.log("Cardboard already running!");
		if (versionCompare(window.cardboard.version, cVersion) == 1) {
			console.log("Existing is lower version, replacing");
			cardboard.emit('cardboardShutdown');
		} else {
			console.log("Existing is higher/same version, stopping");
			return;
		}
	}

	let cardboard = new EventHandler; // not strict yet
	cardboard.version = cVersion;

	if (document.head) { // dumdum detector
		alert('Enable instant script injection in Tampermonkey settings!');
		return;
	}

	{ // scriptHandling
		let scriptTags = [
			{ name: "Client", selector: `src^="/lib/client.min.js"`, src: '/lib/client.min.js', state: 0, }, // state 0 unloaded, 1 loaded, 2 ran
			{ name: "Boot", selector: `src^="/lib/boot.min.js"`, src: '/lib/boot.min.js', state: 0, },
			{ name: "Login", src: '/scripts/login.js', state: 0, },
			{ name: "Index", src: 'index.js', state: 0, },
			{ name: "UnityProgress", src: '/games/cardgame3/TemplateData/UnityProgress.js', state: 0, },
			{ name: "UnityLoader", src: '/games/cardgame3/Build/UnityLoader.js', state: 0, },
			{ name: "ShowGame", selector: _ => Array.from(document.scripts).find(e => /showGame/.exec(e.innerHTML)), state: 0, },
		];
		for (let s of scriptTags)
			if (s.src)
				$.get(s.src, d => (s.text = d), 'text');

		let MO = new MutationObserver((m, o) => {
			for (let s of scriptTags)
				if (!s.state) {
					var tag;
					if (s.selector)
						if (typeof s.selector == 'string') tag = document.querySelector(`script[${s.selector}]`);
						else tag = s.selector();
					else tag = document.querySelector(`script[src="${s.src}"]`);

					if (tag) {
						tag.remove();
						s.tag = tag;
						s.tag.removeAttribute('src');
						waitForTextLoad(s);
					}
				}
		});
		MO.observe(document.documentElement, { childList: true, subtree: true });
		let waitForTextLoad = function (s) {
			if (s.src)
				if (!s.text) { setTimeout(_ => waitForTextLoad(s), 0); return; }
				else s.tag.innerHTML = s.text;
			else s.text = s.tag.innerHTML;
			finish(s);
		};
		let finish = function (s) {
			cardboard.emit(`loadScript${s.name}`, s.tag);

			s.state = 1;

			if (Object.values(scriptTags).find(e => !e.state) == undefined) {
				MO.disconnect();
				cardboard.emit('loadScripts');
				for (let s of scriptTags) {
					document.documentElement.appendChild(s.tag);
					s.state = 2;
					cardboard.emit(`runScript${s.name}`, s.tag);
				}
				cardboard.emit('runScripts');
			}
		};

		let pageLoadDebugger = function () {
			if (scriptTags.find(e => e.state != 2)) throw `Cardboard: Script event issues!`;
		};
		window.addEventListener('load', pageLoadDebugger);

		cardboard.on('cardboardShutdown', function () {
			MO.disconnect();
			window.removeEventListener('load', pageLoadDebugger);
		});
	}

	cardboard.getPlayerCrumb = function (t, d, w) {
		if (typeof w == 'undefined')
			if (world)
				w = world;
			else
				throw `'world' not found, specify a World`;
		return w.room.playerCrumbs.find(e => e[t] == d);
	};
	cardboard.getPlayerSprite = (t, d, w) => world.stage.room.players[cardboard.getPlayerCrumb(t, d, w).i];

	//cardboard.Button = function () {}
	//cardboard.Button.prototype.remove

	cardboard.on('runScriptClient', function () {
		client.World = joinFunction(client.World, function () {
			cardboard.emit('worldCreated', this);
		});
		let p = client.World.prototype;
		p.addSocket = joinFunction(p.addSocket, function () {
			cardboard.emit('worldSocketCreated', this, this.socket);
		});
		p.addStage = joinFunction(p.addStage, function (t) {
			cardboard.emit('worldStageCreated', this, t);
		});
		p.loadManifest = joinFunction(p.loadManifest, function (t) {
			cardboard.emit('worldManifestCreated', this, t);
		});
		cardboard.emit('clientCreated', client);
	});

	cardboard.on('worldSocketCreated', function (w) {
		w.socket.on('login', function () {
			setTimeout(function () {
				cardboard.emit('login', w);
			}, 0);
		});
	});

	window.cardboard = cardboard;
})();