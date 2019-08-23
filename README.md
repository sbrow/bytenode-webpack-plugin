# Bytenode Webpack Plugin

This plugin makes it easy to use protect your source code with [Bytenode](https://github.com/OsamaAbbas/bytenode) by replacing your entry point with a script that can import bytecode.

In short, it turns this:

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

# Setup

Install the plugin:

```bash
$ npm install bytenode-webpack-plugin
```

Then simply add `BytenodePlugin` to your configuration, passing the name of the entrypoint to shim and the new file name to the `entries` field.

## Example

To shim entrypoint "`index.js`" as "`main.js`", here's a basic config file:

```js
module.exports = {
  mode: "production",
  entry: {
    index: "src/index.js",
  },
  output: {
    dir: "app",
    filename: "[name].js",
  },
  plugins: [new BytenodePlugin({ entries: { index: "main" } })],
};
```

You can then compile `main.js` to bytecode using the bytenode cli.

```bash
$ bytenode app/main.js && rm ./app/main.js
```
