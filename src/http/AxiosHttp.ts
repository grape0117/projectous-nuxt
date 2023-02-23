import axios from 'axios'
import { BaseHttp } from '@/http/BaseHttp'
import { IHttp } from './types'
import Store from '@/store'

export class AxiosHttp extends BaseHttp implements IHttp {
  /*public async fetch(url: string): Promise<any> {
    if (this.offlineMode) {
      this.notifyUser(this.offlineNotifyUserMessage)
      return
    }
    try {
      const { data } = await axios.get(`${this.baseUrl}${url}`, {
        headers: {
          'Content-Type': 'text/plain'
        }
      })
      return data
    } catch (e) {
      console.log(e)
    }
  }*/

  public async get(url: string, id: number | string) {
    Store.state.totalActiveRequests++

    if (this.offlineMode) {
      this.notifyUser(this.offlineNotifyUserMessage)
      Store.state.totalActiveRequests--
      return
    }
    try {
      const { data } = await axios.get(`${this.baseUrl}${url}`, {
        params: { id },
        // @ts-ignore
        headers: this.headers
      })
      Store.state.totalActiveRequests--
      return data
    } catch (e) {
      Store.state.totalActiveRequests--
      return
    }
  }
  public async post(url: string, data: any) {
    Store.state.totalActiveRequests++
    if (this.offlineMode) {
      this.notifyUser(this.offlineNotifyUserMessage)
      Store.state.totalActiveRequests--
      return
    }
    try {
      const { data: response } = await axios.post(`${this.baseUrl}${url}`, data, {
        headers: this.headers
      })
      Store.state.totalActiveRequests--
      return response
    } catch (e) {
      Store.state.totalActiveRequests--
      return (Store.state.popAlert = true)
    }
  }
  public async post2(url: string, data: any) {
    Store.state.totalActiveRequests++
    if (this.offlineMode) {
      this.notifyUser(this.offlineNotifyUserMessage)
      Store.state.totalActiveRequests--
      return
    }
    try {
      const { data: response } = await axios.post(`${this.baseUrl2}${url}`, data, {
        headers: this.headers,
        responseType: 'blob'
      })
      Store.state.totalActiveRequests--
      return response
    } catch (e) {
      Store.state.totalActiveRequests--
      return (Store.state.popAlert = true)
    }
  }
  public async put(url: string, id: number | string, data: any) {
    Store.state.totalActiveRequests++
    if (this.offlineMode) {
      this.notifyUser(this.offlineNotifyUserMessage)
      Store.state.totalActiveRequests--
      return
    }
    try {
      if (!url.endsWith('/')) {
        this.noSlashEndError()
        Store.state.totalActiveRequests--
        return
      }
      const response = await axios.put(`${this.baseUrl}${url}${id}`, data, {
        headers: this.headers
      })
      Store.state.totalActiveRequests--
      return response.data
    } catch (e) {
      Store.state.totalActiveRequests--
      return (Store.state.popAlert = true)
    }
  }

  public async patch(url: string, id: number | string, data: any) {
    Store.state.totalActiveRequests++
    if (this.offlineMode) {
      this.notifyUser(this.offlineNotifyUserMessage)
      Store.state.totalActiveRequests--
      return
    }
    try {
      if (!url.endsWith('/')) {
        this.noSlashEndError()
        Store.state.totalActiveRequests--
        return
      }
      const response = await axios.patch(`${this.baseUrl}${url}${id}`, data, {
        headers: this.headers
      })
      Store.state.totalActiveRequests--
      return response.data
    } catch (e) {
      Store.state.totalActiveRequests--
      return (Store.state.popAlert = true)
    }
  }

  public async delete(url: string, id: number | string) {
    Store.state.totalActiveRequests++
    if (this.offlineMode) {
      this.notifyUser(this.offlineNotifyUserMessage)
      Store.state.totalActiveRequests--
      return
    }
    try {
      if (!url.endsWith('/')) {
        this.noSlashEndError()
        Store.state.totalActiveRequests--
        return
      }
      // Store.state.totalActiveRequests--
      const response = await axios.delete(`${this.baseUrl}${url}${id}`, {
        headers: this.headers
      })
      Store.state.totalActiveRequests--
      return response
    } catch (e) {
      Store.state.totalActiveRequests--
      return (Store.state.popAlert = true)
    }
  }
}
