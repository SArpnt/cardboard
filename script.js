// ==UserScript==
// @name         Cardboard
// @namespace    http://tampermonkey.net/
// @version      0.1
// @run-at       document-start
// @description  modding api
// @author       SArpnt
// @match        https://boxcritters.com/play/*
// @grant        none
// @require      https://raw.githubusercontent.com/SArpnt/joinFunction/master/script.js
// ==/UserScript==

(function () {
	"use strict";

	if (document.head) { // dumdum detector
		alert('Head already exists - make sure to enable instant script injection');
		return;
	}

	new MutationObserver((m, o) => {
		var tag = document.querySelector('script[src="../lib/client180.min.js"] + *');
		if (tag) {
			o.disconnect();

			console.log('onWorld', World)

			World = joinFunction(World, function () {
				console.log('onworld', this);
			});
		}
	})
		.observe(document.documentElement, { childList: true, subtree: true });
})();