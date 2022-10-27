const test = require('ava')
const esbuild = require('esbuild')
const temp = require('temp')
const fs = require('fs/promises')
const { importPatternPlugin } = require('./')

temp.track()

for (const name of ['default', 'named']) {
  test(name, async (t) => {
    const outfile = temp.path()
    await esbuild.build({
      entryPoints: [`fixtures/${name}.js`],
      outfile,
      bundle: true,
      plugins: [importPatternPlugin()]
    })
    t.snapshot(await fs.readFile(outfile, 'utf8'))
  })
}
