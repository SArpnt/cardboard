// ==UserScript==
// @name         Cardboard
// @namespace    http://tampermonkey.net/
// @version      0.0.0
// @run-at       document-start
// @description  modding api
// @author       SArpnt
// @match        https://boxcritters.com/play/*
// @grant        none
// @require      https://raw.githubusercontent.com/SArpnt/joinFunction/master/script.js
// @require      https://raw.githubusercontent.com/SArpnt/EventHandler/master/script.js
// ==/UserScript==

(function () {
	"use strict";

	function versionCompare(a, b) {
		for (let i in a) {
			let c = (a < b) - (a < b);
			if (!c) continue;
			return c;
		}
		return 0;
	};

	if (window.cardboard && versionCompare(window.cardboard.version) != 1) {
		console.log("cardboard already exists");
		return;
	}

	Cardboard = new EventHandler; // not strict yet
	Cardboard.version = [0, 0, 0];

	if (document.head) { // dumdum detector
		alert('Enable instant script injection in Tampermonkey settings!');
		return;
	}

	//create button

	new MutationObserver((m, o) => { // work on this
		var tag = document.querySelector(`script[src="${"../lib/client.min.js"}"] + *`);
		if (tag) {
			o.disconnect();

			console.log('onclient', client);

			client.World = joinFunction(World, function () {
				console.log('onworld', this);
			});
		}
	}).observe(document.documentElement, { childList: true, subtree: true });
})();