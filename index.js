const fastGlob = require('fast-glob')

const NAME = 'import-pattern'

const id = (modIndex, importIndex) => `m${modIndex}i${importIndex}`

const createListImports = (names) => {
  if (names == null) {
    return (modIndex) => '* as ' + id(modIndex, 0)
  }
  return (modIndex) =>
    '{ ' +
    names
      .map((name, importIndex) => name + ' as ' + id(modIndex, importIndex))
      .join(', ') +
    ' }'
}

const addImports = (lines, ids, names) => {
  const listImports = createListImports(names)
  ids.forEach((id, modIndex) => {
    lines.push(
      'import ' + listImports(modIndex) + ' from ' + JSON.stringify(id) + ';'
    )
  })
}

const createListExports = (names) => {
  if (names == null) {
    return (modIndex) => id(modIndex, 0)
  }
  return (modIndex) =>
    '{ ' +
    names
      .map((name, importIndex) => name + ': ' + id(modIndex, importIndex))
      .join(', ') +
    ' }'
}

const addExports = (lines, ids, names) => {
  const listExports = createListExports(names)
  lines.push(
    'export const modules = [' +
      ids.map((_, modIndex) => listExports(modIndex)).join(', ') +
      '];'
  )
  lines.push('export const paths = ' + JSON.stringify(ids) + ';')
  lines.push(
    'export const entries = paths.map((path, i) => [path, modules[i]]);'
  )
}

const parseImportPath = (path, separator) => {
  const [glob, namesStr] = path.split(separator)
  return [glob, namesStr?.split(',')]
}

const generateCode = (ids, names) => {
  const lines = []
  addImports(lines, ids, names)
  addExports(lines, ids, names)
  return lines.join('\n')
}

const createResolution = (path, resolveDir) => ({
  namespace: NAME,
  path,
  pluginData: { resolveDir }
})

const importPatternPlugin = ({ separator = '#' } = {}) => {
  return {
    name: NAME,
    setup (build) {
      build.onResolve({ filter: /\*/ }, ({ path, resolveDir }) =>
        createResolution(path, resolveDir)
      )
      build.onLoad(
        { filter: /.*/, namespace: NAME },
        async ({ path, pluginData: { resolveDir } }) => {
          const [glob, names] = parseImportPath(path, separator)
          const ids = await fastGlob(glob, { cwd: resolveDir })
          const contents = generateCode(ids, names)
          return { contents, resolveDir }
        }
      )
    }
  }
}

module.exports = {
  importPatternPlugin,
  createResolution
}
