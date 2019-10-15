import { BaseHttp } from '@/http/BaseHttp'
import { IHttp } from './types'

export class FetchHttp extends BaseHttp implements IHttp {
  public async fetch(url: string): Promise<any> {
    const response = await fetch(`${this.baseUrl}${url}`)
    return await response.json()
  }
  public async get(url: string, id: number | string) {
    const response = await fetch(`${this.baseUrl}${url}/${id}`)
    return await response.json()
  }
  public async post(url: string, data: any) {
    const response = await fetch(`${this.baseUrl}${url}`, {
      method: 'POST',
      body: JSON.stringify(data),
      headers: {
        'Content-Type': 'application/json'
      }
    })
    return await response.json()
  }
  public async put(url: string, id: number | string, data: any) {
    const response = await fetch(`${this.baseUrl}${url}/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
      headers: {
        'Content-Type': 'application/json'
      }
    })
    return await response.json()
  }
  public async delete(url: string, id: number | string) {
    const response = await fetch(`${this.baseUrl}${url}/${id}`, {
      method: 'DELETE'
    })
    return await response.json()
  }
}
