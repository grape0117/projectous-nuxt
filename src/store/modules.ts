import { namespace } from 'vuex-class'

interface Module {
  [key: string]: object
}

const requireModule = require.context('./modules/', true, /index\.ts$/)
const modules: Module = {}
const namespaces: any = {}

requireModule.keys().forEach((fileName) => {
  if (fileName.indexOf('store.ts') !== -1) {
    const moduleName = fileName.split('/')[1]
    modules[moduleName] = requireModule(fileName)[moduleName]
    namespaces[moduleName] = namespace(moduleName)
  }
})
export { modules, namespaces }
