import Vue from 'vue';
import Vuex from 'vuex';
import modules from './modules/index';
Vue.use(Vuex);
const store = {
    state: {
        version: '0.1.0'
    },
    modules
};
export default new Vuex.Store(store);
//# sourceMappingURL=index.js.map