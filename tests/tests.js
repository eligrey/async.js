"use strict";

module("std lib");

asyncTest("to() FCDG", _(function () {
	expect(1);
	var multiply = function (a, b, callback) {
		callback(a * b);
	};
	equals((yield to(multiply, 2, 2)), 4, "working FCD");
	start();
}));

asyncTest("request", _(function () {
	expect(1);
	var req = yield to.request("request-test");
	ok(req !== null && req.responseText.indexOf("foobar") !== -1, "request success");
	start();
}));

asyncTest("import", _(function () {
	expect(1);
	ok((yield to.import("import-test.js")) !== null && async.importTestPassed, "importing a script");
	start();
}));

asyncTest("prompt", _(function () {
	expect(1);
	ok((yield to.prompt("Enter something or don't. It doesn't really matter.")) !== null, "getting input");
	start();
}));

asyncTest("confirm", _(function () {
	expect(1);
	ok((yield to.confirm('Pass this test?', "Yes", "No")), "confirmed passing test");
	start();
}));

asyncTest("inform", _(function () {
	expect(1);
	ok((yield to.inform("This is a test of the inform method. I hope you feel informed.")) !== null, "user has been informed");
	start();
}));

asyncTest("sleep", _(function () {
	expect(1);
	var startT = new Date,
	slept = yield to.sleep(1);
	endT = new Date;
	ok(endT - startT > 500 && slept !== null, "slept long enough");
	start();
}));
