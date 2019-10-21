import axios from 'axios'
import { BaseHttp } from '@/http/BaseHttp'
export class AxiosHttp extends BaseHttp {
  async fetch(url) {
    const { data } = await axios.get(`${this.baseUrl}${url}`)
    return data
  }
  async get(url, id) {
    const { data } = await axios.get(`${this.baseUrl}${url}`, {
      params: { id }
    })
    return data
  }
  async post(url, data) {
    const { data: response } = await axios.post(`${this.baseUrl}${url}`, {
      data
    })
    return response
  }
  async put(url, id, data) {
    return await axios.put(`${this.baseUrl}${url}/${id}`, { data })
  }
  async delete(url, id) {
    return await axios.delete(`${this.baseUrl}${url}/${id}`)
  }
}
//# sourceMappingURL=AxiosHttp.js.map
