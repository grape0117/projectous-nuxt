import { IHttp } from './types'
import { BaseHttp } from '@/http/BaseHttp'
import { FetchHttp } from '@/http/FetchHttp'
import { AxiosHttp } from '@/http/AxiosHttp'

export class Http extends BaseHttp implements IHttp {
  private provider: any = new AxiosHttp()
  public async fetch(url: string): Promise<any> {
    return await this.provider.fetch(url)
  }
  public async get(url: string, id: number | string) {
    return await this.provider.get(url, id)
  }
  public async post(url: string, data: any) {
    return await this.provider.post(url, data)
  }
  public async post2(url: string, data: any) {
    return await this.provider.post2(url, data)
  }
  public async put(url: string, id: number | string, data: any) {
    return await this.provider.put(url, id, data)
  }
  public async patch(url: string, id: number | string, data: any) {
    return await this.provider.patch(url, id, data)
  }
  public async delete(url: string, id: number | string) {
    return await this.provider.delete(url, id)
  }
}
