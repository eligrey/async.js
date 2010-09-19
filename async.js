/*
 * async.js
 *
 * async.js converts synchronous actions to asynchronous actions in functions.
 *
 * 2010-01-31
 * 
 * By Eli Grey, http://eligrey.com
 *
 * License: GNU GPL v3 and the X11/MIT license
 *   See COPYING.md
 */

//@requires JavaScript 1.7

/* Minification note:
 *   Only minify this using Dean Edward's Packer 3.1 or higher.
 *   Previous versions of Packer incorrectly modify the syntax of JavaScript 1.7 code.
 *   See http://base2.googlecode.com/svn/trunk/src/apps/packer/packer.html
 *   You may also have to manually minify object literal (not array literal)
 *   destructuring assignment function parameters. Functions that use this are marked
 *   with "{{OLDA}}" in a comment before them.
*/

/*! @source http://purl.eligrey.com/github/async.js/blob/master/async.js*/

var [async, to] = (function (self, globalEval) {

"use strict";

var StopIter = self.StopIteration,
// store original toString in case it is later overwritten (not for minification)
objToStr = Object.prototype.toString,
async = function async (fn) {
	return function () {
		var gen = fn.apply(this, arguments);
		if (objToStr.call(gen) === "[object Generator]") {
			var callback = function (response) {
				try {
					var descriptor = gen.send(response);
					if (descriptor) {
						descriptor[0](descriptor[1], callback);
					}
				} catch (error if error === StopIter) {}
			};
			callback();
		} else {
			return gen;
		}
	};
},
to = function (func) {
	return [
		function (args, callback) {
			async(func).apply(this, args.concat(callback));
		},
		Array.slice(arguments, 1)
	];
},
True  = !0,
False = !True,
Null  = null,
returnNull = function ({}, callback) {
	callback(Null);
},
l = function (string) {
	return string.toLocaleString();
},
doc           = self.document,
XHR           = self.XMLHttpRequest,
importScripts = self.importScripts,
sleep         = self.sleep,
console       = self.console,
setTimeout    = self.setTimeout,
print         = self.print,
readline      = self.readline,

toUpperCase    = "toLocaleUpperCase",
addEvtListener = "addEventListener",

req = async.request = (function () {
	if (XHR) {
		// {{OLDA}}
		return function ({0: url, 1: method, 2: data, length: argsLen}, callback) {
			var req = new XHR;
			req.open((method || "GET"), url, True);
			req[addEvtListener]("readystatechange", function () {
				if (req.readyState === 4) {
					if (req.status === 200 || req.status === 0) {
						callback(req);
					} else {
						callback(Null);
					}
				}
			}, False);
			req.send(argsLen > 2 ? data : Null);
		};
	} else {
		return returnNull;
	}
}());

async.import = (function () {
	if (importScripts) {
		return function (files, callback) {
			try {
				importScripts.apply(self, files);
			} catch (error) {
				callback(Null);
				return;
			}
			callback(True);
		};
	} else if (XHR) {
		return async(function (files, callback) {
			for (var i = 0, len = files.length; i < len; i++) {
				try {
					globalEval((yield [req, [files[i]]]).responseText);
				} catch (error) {
					callback(Null);
					return;
				}
			}
			callback(True);
		});
	} else {
		return returnNull;
	}
}());

async.sleep = (function () {
	if (setTimeout) { // browser or web worker thread
		return function ([seconds], callback) {
			setTimeout(callback, seconds * 1000);
		};
	} else if (sleep) { // thread-safe shell
		return function ([seconds], callback) {
			sleep(seconds);
			callback(True);
		};
	} else {
		return returnNull;
	}
}());

async.inform = (function () {
	if (console) {
		if (console.info) {
			return function ([message], callback) {
				console.info(message);
				callback(True);
			};
		} else if (console.log) {
			return function ([message], callback) {
				console.log(message);
				callback(True);
			};
		}
	} else if (print && readline) { // shell
		return function ([message], callback) {
			print(message + l("\n\nPress enter to continue"));
			readline();
			callback(True);
		}
	} else {
		return returnNull;
	}
}());

if (doc) {
	(function () {
		
		var createTextNode = function (text) {
			return doc.createTextNode(text);
		},
		createElement = function (tagName) {
			return doc.createElement(tagName);
		},
		$div         = "div",
		$button      = "button",
		$appendChild = "appendChild",
		$click       = "click",
		$style       = "style",
		docElem      = doc.documentElement,
		docElemStyle = docElem[$style],
		$remEvtListener = "removeEventListener",
		
		formsQueue = [],
		currentForm,
		prevPaddingTop = docElemStyle.paddingTop,
		displayForm = function (messageText, controls) {
			var container = createElement($div),
				fieldset  = container[$appendChild](createElement("fieldset")),
				message   = fieldset[$appendChild](createElement("p")),
				containerStyle = container[$style],
				fieldsetStyle  = fieldset[$style],
				messageStyle   = message[$style];
			
			message[$appendChild](createTextNode(messageText || ""));
			
			fieldset[$appendChild](message);
			fieldset[$appendChild](controls);
			
			messageStyle.whiteSpace = "pre-wrap";
			messageStyle.overflow   = "auto";
			
			containerStyle.zIndex     = "99999";
			containerStyle.width      = "100%";
			containerStyle.paddingTop = "5px";
			containerStyle.position   = "fixed";
			containerStyle.left       = "0px";
			containerStyle.top        = "0px";
	
			fieldsetStyle.color           = "black";
			fieldsetStyle.backgroundColor = "white";
			fieldsetStyle.borderRadius = fieldsetStyle.MozBorderRadius = "9px";
	
			currentForm = docElem.insertBefore(container, docElem.firstChild);
			
			prevPaddingTop = docElemStyle.paddingTop;
			docElemStyle.paddingTop = container.clientHeight + "px";
		},
		displayNextForm = function () {
			if (currentForm) {
				docElem.removeChild(currentForm);
				docElemStyle.paddingTop = prevPaddingTop;
				currentForm = Null;
			}
			if (formsQueue.length) {
				displayForm(formsQueue.shift(), formsQueue.shift());
			}
		};
		
		async.prompt = function ([message], callback) {
			var controls      = createElement($div),
			    textArea      = controls[$appendChild](createElement("textarea")),
			    buttons       = controls[$appendChild](createElement($div)),
			    textAreaStyle = textArea[$style];
			
			buttons[$style].textAlign = "right";
			
			textAreaStyle.width  = "100%";
			textAreaStyle.resize = "vertical";
			
			var cancelButton = buttons[$appendChild](createElement($button));
			cancelButton[$appendChild](createTextNode(l("Cancel")));
			buttons[$appendChild](createTextNode(" "));
			var okButton = buttons[$appendChild](createElement($button));
			okButton[$appendChild](createTextNode(l("OK"))),
			clickListener = function (evt) {
				cancelButton[$remEvtListener]($click, clickListener, False);
				okButton[$remEvtListener]($click, clickListener, False);
				callback(evt.target === okButton ? textArea.value : False);
				displayNextForm();
			};
			
			cancelButton[addEvtListener]($click, clickListener, False);
			okButton    [addEvtListener]($click, clickListener, False);
			
			if (currentForm) {
				formsQueue.push(message, controls);
			} else {
				displayForm(message, controls);
			}
		};
		
		async.confirm = function ([message, trueChoice, falseChoice], callback) {
			var buttons     = createElement($div),
			    falseButton = buttons[$appendChild](createElement($button));
			
			buttons[$style].textAlign = "right";
			
			buttons[$appendChild](createTextNode(" "));
	
			var trueButton = buttons[$appendChild](createElement($button)),
			clickListener = function (evt) {
				trueButton[$remEvtListener]($click, clickListener, False);
				falseButton[$remEvtListener]($click, clickListener, False);
				callback(evt.target === trueButton);
				displayNextForm();
			};
			
			falseButton[$appendChild](createTextNode(falseChoice || l("Cancel")));
			trueButton[$appendChild](createTextNode(trueChoice   || l("OK")));
	
			falseButton[addEvtListener]($click, clickListener, False);
			trueButton [addEvtListener]($click, clickListener, False);
	
			if (currentForm) {
				formsQueue.push(message, buttons);
			} else {
				displayForm(message, buttons);
			}
		};
		
		async.inform = function ([message], callback) {
			var okButton      = createElement($button),
			okButtonContainer = createElement($div),
			clickListener     = function (evt) {
				okButton[$remEvtListener]($click, clickListener, False);
				callback(True);
				displayNextForm();
			};
			
			okButtonContainer[$style].textAlign = "right";
			okButton[$appendChild](createTextNode(l("OK")));
			okButtonContainer[$appendChild](okButton);
			
			okButton[addEvtListener]($click, clickListener, False);
			
			if (currentForm) {
				formsQueue.push(message, okButtonContainer);
			} else {
				displayForm(message, okButtonContainer);
			}
		};
	}());
} else {

	var prompt = async.prompt = (function () {
		if (readline && print) { // shell
			return function ([message], callback) {
				if (message) {
					print(message);
				}
				callback(readline());
			};
		} else { // unsupported
			return function (callback) { // silently fail with an empty string
				callback("");
			};
		}
	}());
	
	// {{OLDA}}
	async.confirm = function ({
		0: message, 1: trueChoice, 2: falseChoice, length: argsLen
	}, callback) {
		trueChoice  = trueChoice  || l("Yes");
		falseChoice = falseChoice || l("No");
		var choicesNote = [" (",
			(argsLen > 1 &&
				(trueChoice[toUpperCase]()  !== l("YES") ||
				 falseChoice[toUpperCase]() !== l("NO"))
			? // at least one choice defined
				[
					   "[", trueChoice[0],  "]",  trueChoice.substr(1),
					" / [", falseChoice[0], "]", falseChoice.substr(1)
				].join("")
			:
				"Y/N"
			),
		")"].join("");
		
		prompt(function (response) {
			callback(response &&
			         response[0][toUpperCase]() === trueChoice[0][toUpperCase]());
		}, [message + choicesNote]);
	};
}

to.__noSuchMethod__ = function (id, args) {
	return [async[id], args];
};

return [async, to];

}(this, eval)),
_ = _ || async; // don't overwrite the underscore variable if it's already being used
Function.prototype.async = function () {
	return async(this);
};
