# bytenode-webpack-plugin

This plugin makes it easier to use [Bytenode](https://github.com/OsamaAbbas/bytenode) to protect your source code by shimming out your entry points.

It turns this:

```js
// index.js
function hello() {
  console.log("Hello, world!");
}

module.exports = hello;
```

Into this:

```js
// index.js
require("bytenode");
require("./main");
```

```js
// main.js
function hello() {
  console.log("Hello, world!");
}

module.exports = hello;
```

You can then turn `main.js` into bytecode using:

```bash
$ bytnode main.js
```

And you're done!
