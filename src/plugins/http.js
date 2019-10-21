import Vue from 'vue'
import { Http } from '@/http/Http'
Vue.mixin({
  methods: {
    $http: () => new Http()
  }
})
//# sourceMappingURL=http.js.map
