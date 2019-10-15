import axios from 'axios'
import { BaseHttp } from '@/http/BaseHttp'
import { IHttp } from './types'

export class AxiosHttp extends BaseHttp implements IHttp {
  public async fetch(url: string): Promise<any> {
    const { data } = await axios.get(`${this.baseUrl}${url}`)
    return data
  }
  public async get(url: string, id: number | string) {
    const { data } = await axios.get(`${this.baseUrl}${url}`, {
      params: { id }
    })
    return data
  }
  public async post(url: string, data: any) {
    const { data: response } = await axios.post(`${this.baseUrl}${url}`, {
      data
    })
    return response
  }
  public async put(url: string, id: number | string, data: any) {
    return await axios.put(`${this.baseUrl}${url}/${id}`, { data })
  }
  public async delete(url: string, id: number | string) {
    return await axios.delete(`${this.baseUrl}${url}/${id}`)
  }
}
