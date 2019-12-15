import { BaseHttp } from '@/http/BaseHttp'
import { IHttp } from './types'

export class FetchHttp extends BaseHttp implements IHttp {
  public async fetch(url: string): Promise<any> {
    try {
      const response = await fetch(`${this.baseUrl}${url}`, {
        headers: this.headers
      })
      return await response.json()
    } catch (e) {
      console.log(e)
    }
  }
  public async get(url: string, id: number | string) {
    try {
      const response = await fetch(`${this.baseUrl}${url}/${id}`, {
        headers: this.headers
      })
      return await response.json()
    } catch (e) {
      console.log(e)
    }
  }
  public async post(url: string, data: any) {
    try {
      const response = await fetch(`${this.baseUrl}${url}`, {
        method: 'POST',
        body: JSON.stringify(data),
        headers: {
          ...this.headers,
          'Content-Type': 'application/json'
        }
      })
      return await response.json()
    } catch (e) {
      console.log(e)
    }
  }
  public async put(url: string, id: number | string, data: any) {
    try {
      if (!url.endsWith('/')) {
        this.noSlashEndError()
        return
      }
      const response = await fetch(`${this.baseUrl}${url}${id}`, {
        method: 'PUT',
        body: JSON.stringify(data),
        headers: {
          ...this.headers,
          'Content-Type': 'application/json'
        }
      })
      return await response.json()
    } catch (e) {
      console.log(e)
    }
  }
  public async delete(url: string, id: number | string) {
    try {
      if (!url.endsWith('/')) {
        this.noSlashEndError()
        return
      }
      const response = await fetch(`${this.baseUrl}${url}${id}`, {
        method: 'DELETE',
        headers: this.headers
      })
      return await response.json()
    } catch (e) {
      console.log(e)
    }
  }
}
