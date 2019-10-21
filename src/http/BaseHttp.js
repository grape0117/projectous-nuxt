export class BaseHttp {
  constructor() {
    this.baseUrl = 'https://release.projectous.com/'
  }
  async fetch(url) {
    this.throwError()
  }
  async get(url, id) {
    this.throwError()
  }
  async post(url, data) {
    this.throwError()
  }
  async put(url, id, data) {
    this.throwError()
  }
  async delete(url, id) {
    this.throwError()
  }
  throwError() {
    throw Error('Method is not implemented')
  }
}
//# sourceMappingURL=BaseHttp.js.map
