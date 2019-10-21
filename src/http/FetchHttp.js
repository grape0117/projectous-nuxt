import { BaseHttp } from '@/http/BaseHttp'
export class FetchHttp extends BaseHttp {
  async fetch(url) {
    const response = await fetch(`${this.baseUrl}${url}`)
    return await response.json()
  }
  async get(url, id) {
    const response = await fetch(`${this.baseUrl}${url}/${id}`)
    return await response.json()
  }
  async post(url, data) {
    const response = await fetch(`${this.baseUrl}${url}`, {
      method: 'POST',
      body: JSON.stringify(data),
      headers: {
        'Content-Type': 'application/json'
      }
    })
    return await response.json()
  }
  async put(url, id, data) {
    const response = await fetch(`${this.baseUrl}${url}/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
      headers: {
        'Content-Type': 'application/json'
      }
    })
    return await response.json()
  }
  async delete(url, id) {
    const response = await fetch(`${this.baseUrl}${url}/${id}`, {
      method: 'DELETE'
    })
    return await response.json()
  }
}
//# sourceMappingURL=FetchHttp.js.map
