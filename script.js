// ==UserScript==
// @name         Cardboard
// @namespace    http://tampermonkey.net/
// @version      0.0.0
// @run-at       document-start
// @description  modding api
// @author       SArpnt
// @match        https://play.boxcritters.com/*
// @grant        none
// @require      https://raw.githubusercontent.com/SArpnt/joinFunction/master/script.js
// @require      https://raw.githubusercontent.com/SArpnt/EventHandler/master/script.js
// ==/UserScript==

(function () {
	"use strict";

	function versionCompare(a, b) {
		for (let i in a) {
			let c = (a < b) - (a < b);
			if (c) return c;
		}
		return 0;
	};

	if (window.cardboard && versionCompare(window.cardboard.version) != 1) {
		console.log("cardboard already exists");
		return;
	}

	let cardboard = new EventHandler; // not strict yet
	cardboard.version = [0, 0, 0];

	if (document.head) { // dumdum detector
		alert('Enable instant script injection in Tampermonkey settings!');
		return;
	}

	//create button

	let scriptTags = {
		Client: { text: null, src: '/scripts/login.js', state: 0, }, // state 0 unloaded, 1 loaded
		Login: { text: null, src: '/scripts/login.js', state: 0, },
		Index: { text: null, src: '/scripts/login.js', state: 0, },
		UnityProgress: { text: null, src: '/scripts/login.js', state: 0, },
		UnityLoader: { text: null, src: '/scripts/login.js', state: 0, },
		//ShowGame: 		{ text: null, src:false, HTML: '', state: false, },
	};
	for (let s in scriptTags)
		if (s.src)
			$.get(scriptTags[s].src, d => (scriptTags[s].text = d), 'text');


	new MutationObserver((m, o) => { // work on this
		for (let i in scriptTags)
			if (!scriptTags[i].state) {
				var tag = document.querySelector(`script[src="${scriptTags[i].src} "]`);
				if (tag) {
					tag.remove();
					scriptTags[i].tag = tag;

					console.log(`loadScript${i}`, tag);
					cardboard.emit(`loadScript${i}`, tag);

					scripts[i].state = 1;

					if (!Object.values(scriptTags).find(e => !e.stage)) {
						o.disconnect();
						cardboard.emit('loadScripts');
					}
				}
			}
	}).observe(document.documentElement, { childList: true, subtree: true });

	window.addEventListener('load', function () {
		if (!Object.values(scriptTags).find(e => !e.stage)) throw [`What the heck happened to the MutationObserver?`, scriptTags];
		for (let i in scriptTags) {
			console.log(`runScript${i}`, scriptTags[i].tag);
			cardboard.emit(`runScript${i}`, scriptTags[i].tag);
		}
		cardboard.emit('runScripts');
	});

	cardboard.getPlayerCrumb = function (t, d, w) {
		if (typeof w == 'undefined') 
			if (world)
				w = world
			else
				throw `'world' not found, specify a World`
		return w.room.playerCrumbs.find(e => e[t] == d);
	}
	cardboard.getPlayerSprite = (t, d, w) => world.stage.room.players[cardboard.getPlayerCrumb(t, d, w).i];

	cardboard.on('runScriptClient', function () {
		client.World = joinFunction(client.World, function () {
			cardboard.emit('worldCreated', this);
		});
	});

	cardboard.on('worldCreated', function (w) {
		w.socket.on('login', function () {
			setTimeout(function () {
				cardboard.emit('login', w);
			}, 0);
		});
	});

	window.cardboard = cardboard;
})();