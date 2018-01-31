async.js
========


**async.js** is an async/await intrinsics library that aims to make it so you don't have to mess with callbacks
when making applications in [JavaScript 1.7][1] or higher. It introduces three new
globals, `async`, `_` (underscore), and `to`. If the underscore variable is already being
used, it is not overwritten. async.js also introduces an `async` method inherited by all
functions which is equivalent to passing the function to `async`.


Examples
--------

Please note that user interaction with the page is not blocked during the course of any
of these examples.


### A `node.next(eventType)` method

The `node.next(eventType)` method would pause a function until the specified event is
fired on the node that `next` was called on and would return the captured event object.

    var listenForNextEventDispatch = function ([node, eventType], callback) {
        var listener = function (event) {
            node.removeEventListener(eventType, listener, false);
            callback(event);
        };
        node.addEventListener(eventType, listener, false);
    };
    Node.prototype.next = function (eventType) {
        return [listenForNextEventDispatch, [this, eventType]];
    };

You could now then the following in an asynced function to handle the next click event
on the document.

    var clickEvent = yield document.next("click");
    // handle click event here


### Asking the user for their impressions of async.js

The following code does not use any obtrusive and annoying functions like prompt or
alert yet still can utilize execution-blocking features.

    yield to.request("feedback", "POST", (
        yield to.prompt("What are your impressions of async.js?")
    ));
    yield to.inform("Thanks for your feedback!");
    // do more stuff here

As opposed to the following, which is functionally equivalent to the previous code but
doesn't use async.js's blocking features.

    async.prompt(
        ["What are your impressions of async.js?"],
        function (response) {
            async.request(
                ["feedback", "POST", response],
                function () {
                    async.inform(
                        ["Thanks for your feedback!"],
                        function () {
                            // do more stuff here
                        }
                    );
                }
            );
        }
    );

That's a lot of callbacks, all of which are implied when you use async.js.


### Creating an async.js module for `thatFunctionThatUsesCallbacks`

    async.yourMethodName = function ([aParameterThatFunctionUses], callback) {
	    thatFunctionThatUsesCallbacks(aParameterThatFunctionUses, callback);
    };

You could then use `yield to.yourMethodName(aParameterThatFunctionUses)` and immediately
start writing code that depends on `thatFunctionThatUsesCallbacks` function after the
statement.


Usage
-----

First of all, when including async.js in a document, make sure to use the media type,
`application/javascript;version=1.7`.

To make use of the features of async.js, you must use an asynced function,
which can be created by passing a function to either `async` or `_` or calling the
function's `async` method. For example, an asynced function might look like the following.

    var myFunction = _(function () {
        // do stuff here
    });

Once you have an asynced function, you can use special blocking asynchronous methods with
the following statement syntax.

    yield functionCallDescriptorGenerator(arg1, ..., argN)

If the method returns a value you can use the statement just like a value as long as it's
not in a comma-separated list of statements (like parameters for a function) without
encapsulating the expression with parenthesis. For example, you would use the following
syntax.

    var foo = bar((yield functionCallDescriptorGenerator()), "baz");

A function call descriptor generator (FCDG) is a function that returns an array including
a function and the arguments to be passed to the function, in that order. async.js by
default implements a catch-all general FCDG which is accessible by calling any method on
the `to` function. You could make your own FCDG that uses a completely different syntax
if you wish to do so. The following is an example usage of the `to` function
catch-all general FCDG.

    to.yourMethod("foobar", 123)

Which returns the following to async.js.

    [async.yourMethod, ["foobar", 123]]

async.js handles this and does the apropriate call
(`async.yourMethod("foobar", 123)`). The execution of the function which called the
FCDG is paused until the method finishes.

The `to` function can also be used to create FCDs for functions that are not
async.js-aware and use the last argument passed to them as a callback. All you have to do
is pass the function to the `to` function followed by any arguments you wish to call it
with.

    var multiply = function (a, b, callback) {
        callback(a * b)
    },
    product = yield to(multiply, 5, 5); // product is now 25

Due to it being impossible to propagate errors up to an asynced function, null is returned
instead of an error being thrown. When implementing your own async.js methods, only return
null if an error occured or an undesireable condition has been met.


Standard Library
----------------

The following is the standard library of methods that async.js has by default.
Please note that you are able to redefine any of them to change their functionality.


### sleep(seconds : float) : bool | null

Waits for the amount of seconds specified and then returns.


### import(script1 : str, ..., scriptN : str) : bool | null

Loads every parameter passed to it as a script in global context.


### request(URL : str, method : str, data : str) : XMLHttpRequest | null

Returns an [XMLHttpRequest][2] of the completed request.


### prompt(message : str) : str | null

The message is displayed to the user and when they decide to respond, this
method returns the string inputted by the user. The string may contain line breaks so
don't assume they won't in your code.


### confirm(message : str [, trueChoiceName : str] [, falseChoiceName : str]) : bool

The message is displayed to the user and both choice names for their corresponding values.
If no choice names are specified, the default of "OK" for `true` and "Cancel" for `false`
will be used. In a JavaScript shell, the default choices will be "Y/N". This
returns the boolean value corresponding to the choice the user chooses.

### inform(message : str) : bool | null

The message is displayed to the user in a way that will get their attention.


Minification
------------

Only minify async.js using Dean Edward's [Packer 3.1 or higher][3]. Previous versions of
Packer incorrectly modify the syntax of JavaScript 1.7 code.


![Tracking image](https://in.getclicky.com/212712ns.gif)


  [1]: https://developer.mozilla.org/en/New_in_javascript_1.7
  [2]: http://en.wikipedia.org/wiki/XMLHttpRequest
  [3]: http://base2.googlecode.com/svn/trunk/src/apps/packer/packer.html
