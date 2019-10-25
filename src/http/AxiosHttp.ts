import axios from 'axios'
import { BaseHttp } from '@/http/BaseHttp'
import { IHttp } from './types'

export class AxiosHttp extends BaseHttp implements IHttp {
  public async fetch(url: string): Promise<any> {
    alert('fetch')
    const { data } = await axios.get(`${this.baseUrl}${url}`, {
      headers: {
        Authorization: 'bearer ' + '123456789012345678901234567890qwertyuiop',
        'Content-Type': 'text/plain'
      }
    })
    return data
  }
  public async get(url: string, id: number | string) {
    alert('get')
    const { data } = await axios.get(`${this.baseUrl}${url}`, {
      params: { id },
      headers: this.headers
    })
    return data
  }
  public async post(url: string, data: any) {
    const { data: response } = await axios.post(
      `${this.baseUrl}${url}`,
      { data },
      {
        headers: this.headers
      }
    )
    return response
  }
  public async put(url: string, id: number | string, data: any) {
    return await axios.put(
      `${this.baseUrl}${url}/${id}`,
      { data },
      {
        headers: this.headers
      }
    )
  }
  public async delete(url: string, id: number | string) {
    return await axios.delete(`${this.baseUrl}${url}/${id}`, {
      headers: this.headers
    })
  }
}
