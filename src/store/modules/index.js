const requireModule = require.context('.', true, /\.ts$/);
const index = {};
requireModule.keys().forEach(fileName => {
    if (fileName === './index.ts')
        return;
    if (fileName.indexOf('index.ts') !== -1) {
        const moduleName = fileName.split('/')[1];
        index[moduleName] = requireModule(fileName)[moduleName];
    }
});
export default index;
//# sourceMappingURL=index.js.map