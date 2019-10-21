import { BaseHttp } from '@/http/BaseHttp'
import { FetchHttp } from '@/http/FetchHttp'
export class Http extends BaseHttp {
  constructor() {
    super(...arguments)
    this.provider = new FetchHttp()
  }
  async fetch(url) {
    return await this.provider.fetch(url)
  }
  async get(url, id) {
    return await this.provider.get(url, id)
  }
  async post(url, data) {
    return await this.provider.post(url, data)
  }
  async put(url, id, data) {
    return await this.provider.put(url, id, data)
  }
  async delete(url, id) {
    return await this.provider.delete(url, id)
  }
}
//# sourceMappingURL=Http.js.map
