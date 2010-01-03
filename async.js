/*
 * async.js
 *
 * async.js converts synchronous actions to asynchronous actions in functions.
 *
 * 2010-01-02
 * 
 * By Elijah Grey, http://eligrey.com
 *
 * License: GNU GPL v3 and the X11/MIT license
 *   See COPYING.md
 */

//@requires JavaScript 1.7

// Minification note: Only minify this using Dean Edward's Packer 3.1 or higher.
// Previous versions of Packer incorrectly modify the syntax of JavaScript 1.7 code.
// http://base2.googlecode.com/svn/trunk/src/apps/packer/packer.html

var [async, to] = (function (self, globalEval) {

"use strict";

var StopIter = self.StopIteration,
async = function async (fn) {
	return function () {
		var gen = fn.apply(this, arguments);
		if (Object.prototype.toString.call(gen) === "[object Generator]") {
			var callback = function (response) {
				try {
					var descriptor = gen.send(response);
					if (descriptor) {
						descriptor[0](descriptor[1], callback);
					}
				} catch (error if error instanceof StopIter) {}
			};
			callback();
		}
	};
},
True  = !0,
False = !true,
Null  = null,
returnNull = function ({}, callback) {
	callback(Null);
};

doc           = self.document,
XHR           = self.XMLHttpRequest,
importScripts = self.importScripts,
sleep         = self.sleep,
console       = self.console,
setTimeout    = self.setTimeout,
print         = self.print,
readline      = self.readline,

$toUpperCase    = "toUpperCase",
$addEvtListener = "addEventListener",

req = async.request = (function () {
	if (XHR) {
		return function ({0: url, 1: method, 2: data, length: argsLen}, callback) {
			var req = new XHR;
			req.open((method || "GET"), url, True);
			req[$addEvtListener]("readystatechange", function () {
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

async.puts = (function () {
	if (console && console.log) {
		return function ([message], callback) {
			console.log(message);
			callback(True);
		};
	} else if (print && !doc) { // shell
		return function ([message], callback) {
			print(message);
			callback(True);
		};
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
		$scroll      = "scroll",
		$style       = "style",
		docElem      = doc.documentElement,
		docElemStyle = docElem[$style],
		
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
			containerStyle.position   = "absolute";
			containerStyle.left       = "0px";
			containerStyle.top        = docElem.scrollTop + "px";
	
			fieldsetStyle.color           = "black";
			fieldsetStyle.backgroundColor = "white";
			fieldsetStyle.borderRadius = fieldsetStyle.MozBorderRadius = "9px";
	
			currentForm = docElem.insertBefore(
				container, docElem.firstChild
			);
			
			prevPaddingTop = docElemStyle.paddingTop;
			docElemStyle.paddingTop = container.clientHeight + "px";
		},
		displayNextForm = function () {
			if (currentForm) {
				currentForm.parentNode.removeChild(currentForm);
				docElemStyle.paddingTop = prevPaddingTop;
				currentForm = Null;
			}
			if (formsQueue.length) {
				displayForm(formsQueue.shift(), formsQueue.shift());
			}
		},
		outContainerStyle;
		
		async.puts === returnNull && (async.puts = function (args, callback) {
		// don't show output log until puts is called once
		
		var window = doc.defaultView,
		outContainer      = createElement($div),
		resizeHandle      = outContainer[$appendChild](createElement($div)),
		output            = outContainer[$appendChild](createElement($div)),
		outputStyle       = output[$style],
		resizeHandleStyle = resizeHandle[$style],
		draggingHandle    = False,
		previousHeight    = False,
		onResize          = function () {
			outputStyle.height = (outContainer.clientHeight -
				                  resizeHandle.clientHeight) + "px";
			// have a blank space large enough to fit the output box at the page's bottom
			docElemStyle.paddingBottom = outContainer.clientHeight + "px";
		};
		
		outContainerStyle = outContainer[$style];
	
		outContainerStyle.zIndex          = "100000";
		outContainerStyle.fontFamily      = "monospace";
		outContainerStyle.color           = "black";
		outContainerStyle.backgroundColor = "white";
		outContainerStyle.position        = "absolute";
		outContainerStyle.width           = "100%";
		outContainerStyle.bottom          = -docElem.scrollTop + "px";
		outContainerStyle.left            = "0px";
		outContainerStyle.height          = "15%";
	
		outputStyle.overflow = "auto";
	
		resizeHandleStyle.height = "4px";
		resizeHandleStyle.cursor = "row-resize";
		resizeHandleStyle.backgroundColor = "black";
	
		window[$addEvtListener]("resize", onResize, False);
		
		docElem.insertBefore(outContainer, docElem.firstChild);
		
		onResize();
	
		doc[$addEvtListener]("mousemove", function (evt) {
			if (draggingHandle) {
				var mouseY = evt.clientY,
				viewHeight = window.innerHeight;
			
				// constrain the output box inside the viewport's dimensions
				if (mouseY < 0) {
					mouseY = 0;
				}
				if (mouseY + resizeHandle.clientHeight > viewHeight) {
					mouseY = viewHeight - resizeHandle.clientHeight;
				}
			
				outContainerStyle.height = 100 - (mouseY / viewHeight) * 100 + "%";
				onResize();
			}
		}, False);
	
		doc[$addEvtListener]("mouseup", function () {
			draggingHandle = False;
		}, False);
	
		resizeHandle[$addEvtListener]("mousedown", function (evt) {
			evt.preventDefault();
			draggingHandle = True;
		}, False);
	
		resizeHandle[$addEvtListener]("dblclick", function (evt) {
			evt.preventDefault();
			if (previousHeight && outContainerStyle.height === "100%") {
				outContainerStyle.height = previousHeight;
				previousHeight = False;
			} else {
				previousHeight = outContainerStyle.height;
				outContainerStyle.height = "100%";
			}
			onResize();
			output.focus();
		}, False);
		
		(async.puts = function ([message], callback) {
			var out = output[$appendChild](createElement($div)),
			outStyle = out[$style];
			outStyle.borderBottomWidth = "1px";
			outStyle.borderBottomStyle = "solid";
			outStyle.borderBottomColor = "lightgray";
			outStyle.whiteSpace        = "pre-wrap";
			out[$appendChild](createTextNode("" + message));
			output.scrollTop           = output.scrollHeight;
			callback(True);
		})(args, callback);
	
		});
		
		doc[$addEvtListener]($scroll, function () {
			if (outContainerStyle) {
				outContainerStyle.bottom = -docElem.scrollTop + "px";
			}
			if (currentForm) {
				currentForm[$style].top = docElem.scrollTop + "px";
			}
		}, False);
		
		async.gets = function ([message], callback) {
			var controls      = createElement($div),
			    textArea      = controls[$appendChild](createElement("textarea")),
			    buttons       = controls[$appendChild](createElement($div)),
			    textAreaStyle = textArea[$style];
			
			buttons[$style].textAlign = "right";
			
			textAreaStyle.width  = "100%";
			textAreaStyle.resize = "vertical";
			
			var cancelButton = buttons[$appendChild](createElement($button));
			cancelButton[$appendChild](createTextNode("Cancel"));
			buttons[$appendChild](createTextNode(" "));
			var okButton = buttons[$appendChild](createElement($button));
			okButton[$appendChild](createTextNode("OK")),
			clickListener = function (evt) {
				cancelButton.removeEventListener($click, clickListener, False);
				okButton.removeEventListener($click, clickListener, False);
				callback(evt.target === okButton ? textArea.value : False);
				displayNextForm();
			};
			
			cancelButton[$addEvtListener]($click, clickListener, False);
			okButton[$addEvtListener]    ($click, clickListener, False);
			
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
				trueButton.removeEventListener($click, clickListener, False);
				falseButton.removeEventListener($click, clickListener, False);
				callback(evt.target === trueButton);
				displayNextForm();
			};
			
			falseButton[$appendChild](createTextNode(falseChoice || "Cancel"));
			trueButton[$appendChild](createTextNode(trueChoice || "OK"));
	
			falseButton[$addEvtListener]($click, clickListener, False);
			trueButton[$addEvtListener]($click, clickListener, False);
	
			if (currentForm) {
				formsQueue.push(message, buttons);
			} else {
				displayForm(message, buttons);
			}
		};
	}());
} else {

	var gets = async.gets = (function () {
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
	
	async.confirm = function ({
		0: message, 1: trueChoice, 2: falseChoice, length: argsLen
	}, callback) {
		trueChoice  = trueChoice  || "Yes";
		falseChoice = falseChoice || "No";
		var choicesNote = [" (",
			(argsLen > 1 &&
				(trueChoice[$toUpperCase]() !== "YES" ||
				 falseChoice[$toUpperCase]() !== "NO")
			? // at least one choice defined
				[
					   "[", trueChoice[0],  "]",  trueChoice.substr(1),
					" / [", falseChoice[0], "]", falseChoice.substr(1)
				].join("")
			:
				"Y/N"
			),
		")"].join("");
		
		gets(function (response) {
			callback(response &&
			         response[0][$toUpperCase]() === trueChoice[0][$toUpperCase]());
		}, [message + choicesNote]);
	};
}

return [async, {
	__noSuchMethod__: function(id, args) {
		return [async[id], args];
	}
}];

}(this, eval)),
_ = _ || async; // don't overwrite the underscore variable if it's already being used
Function.prototype.async = function () {
	return async(this);
};
