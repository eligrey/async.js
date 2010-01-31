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

asyncTest("gets", _(function () {
	expect(1);
	ok((yield to.gets("Enter something.")) !== null, "getting input");
	start();
}));

asyncTest("puts and confirm", _(function () {
	expect(1);
	yield to.puts("Hello, world!");
	ok((yield to.confirm('Do you see the text, "Hello, world!" at the bottom of the page?', "Yes", "No")), "confirmation of recieving message");
	start();
}));

asyncTest("inform", _(function () {
	expect(1);
	ok((yield to.inform("This is a test of the inform method. I hope you feel informed.")) !== null, "informing");
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
