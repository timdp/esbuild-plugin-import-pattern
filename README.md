# esbuild-plugin-import-pattern

[![npm](https://img.shields.io/npm/v/esbuild-plugin-import-pattern.svg)](https://www.npmjs.com/package/esbuild-plugin-import-pattern) [![JavaScript Standard Style](https://img.shields.io/badge/code%20style-standard-brightgreen.svg)](https://standardjs.com)

[esbuild](https://esbuild.github.io/) plugin that imports modules based on
wildcard patterns.

Attempts to improve upon the ergonomics of
[esbuild-plugin-import-glob](https://www.npmjs.com/package/esbuild-plugin-import-glob).

## Installation

Install the dependency:

```bash
npm install esbuild-plugin-import-pattern --save-dev
```

Configure esbuild:

```js
const esbuild = require('esbuild')
const { importPatternPlugin } = require('esbuild-plugin-import-pattern')

esbuild.build({
  ...
  bundle: true,
  plugins: [importPatternPlugin()]
})
```

## Usage

Import something using a wildcard pattern:

```js
import { entries } from './files/*.js'

console.log(entries)
```

This will produce an array of tuples, each containing the path to an imported
file and its exports:

```js
[
  ['./files/one.js', {  // Source:
    default: 'one'      //   export default 'one'
  }],
  ['./files/two.js', {  // Source:
    default: 2,         //   export default 2
    noun: 'two'         //   export const noun = 'two'
  }],
  ...
]
```

If you're only interested in the exports, import `modules` instead of `entries`.
Similarly, you can choose to import `paths`.

## Tips

If you want to look modules up by their path, you can feed `entries` directly
into `Object.fromEntries(entries)` or `new Map(entries)`.

To use multiple imports in the same module, be sure to rename them using the
`as` keyword:

```js
import { entries as cats } from './cats/*.js'
import { entries as dogs } from './dogs/*.js'
```

Other than `*`, you can also use any pattern supported by
[fast-glob](https://www.npmjs.com/package/fast-glob). However, the pattern needs
to contain at least one `*` character.

## Selecting Named Imports

By default, each matching import will expose all of its exports. Currently, this
makes esbuild produce some unnecessary code. If bundle size is a concern, you
will want to avoid this.

As long as all imports export the same name(s), you can tell the plugin to _only_
import those. You do this by appending a hash symbol to the pattern, followed by
the names, separated by commas.

For example, to only get the default exports from `files/*.js`, you would write:

```js
import { modules } from './files/*.js#default'

console.log('Default exports:', modules.map((module) => module.default))
```

Note that omitting `#default` will not change the behavior of this script.
However, the generated bundle will be bigger.

## Author

[Tim De Pauw](https://tmdpw.eu)

## License

MIT
