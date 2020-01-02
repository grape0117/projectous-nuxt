import axios from 'axios'
import { BaseHttp } from '@/http/BaseHttp'
import { IHttp } from './types'

export class AxiosHttp extends BaseHttp implements IHttp {
  public async fetch(url: string): Promise<any> {
    if (this.offlineMode) {
      this.notifyUser(this.offlineNotifyUserMessage)
      return
    }
    try {
      const { data } = await axios.get(`${this.baseUrl}${url}`, {
        headers: {
          Authorization: 'Bearer ' + '123456789012345678901234567890qwertyuiop',
          'Content-Type': 'text/plain'
        }
      })
      return data
    } catch (e) {
      console.log(e)
    }
  }
  public async get(url: string, id: number | string) {
    if (this.offlineMode) {
      this.notifyUser(this.offlineNotifyUserMessage)
      return
    }
    try {
      const { data } = await axios.get(`${this.baseUrl}${url}`, {
        params: { id },
        headers: {
          Authorization: 'Bearer ' + '123456789012345678901234567890qwertyuiop',
          'Content-Type': 'text/plain'
        }
      })
      return data
    } catch (e) {
      console.log(e)
    }
  }
  public async post(url: string, data: any) {
    if (this.offlineMode) {
      this.notifyUser(this.offlineNotifyUserMessage)
      return
    }
    try {
      const { data: response } = await axios.post(
        `${this.baseUrl}${url}`,
        { data },
        {
          headers: {
            Authorization: 'Bearer ' + '123456789012345678901234567890qwertyuiop',
            'Content-Type': 'text/plain'
          }
        }
      )
      return response
    } catch (e) {
      console.log(e)
    }
  }
  public async put(url: string, id: number | string, data: any) {
    if (this.offlineMode) {
      this.notifyUser(this.offlineNotifyUserMessage)
      return
    }
    try {
      if (!url.endsWith('/')) {
        this.noSlashEndError()
        return
      }
      return await axios.put(
        `${this.baseUrl}${url}${id}`,
        { data },
        {
          headers: {
            Authorization: 'Bearer ' + '123456789012345678901234567890qwertyuiop',
            'Content-Type': 'text/plain'
          }
        }
      )
    } catch (e) {
      console.log(e)
    }
  }
  public async delete(url: string, id: number | string) {
    if (this.offlineMode) {
      this.notifyUser(this.offlineNotifyUserMessage)
      return
    }
    try {
      if (!url.endsWith('/')) {
        this.noSlashEndError()
        return
      }
      return await axios.delete(`${this.baseUrl}${url}${id}`, {
        headers: {
          Authorization: 'Bearer ' + '123456789012345678901234567890qwertyuiop',
          'Content-Type': 'text/plain'
        }
      })
    } catch (e) {
      console.log(e)
    }
  }
}
