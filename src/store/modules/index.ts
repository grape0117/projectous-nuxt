interface Module {
  [key: string]: object
}

const requireModule = require.context('.', true, /\.ts$/)
const index: Module = {}

requireModule.keys().forEach(fileName => {
  if (fileName === './index.ts') return
  if (fileName.indexOf('index.ts') !== -1) {
    const moduleName = fileName.split('/')[1]
    index[moduleName] = requireModule(fileName)[moduleName]
  }
})

export default index
