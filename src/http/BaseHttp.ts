import { IHttp } from '@/http/types'

export class BaseHttp implements IHttp {
  protected baseUrl: string = 'https://release.projectous.com/'
  protected headers: any = {
    'X-Requested-With': 'XMLHttpRequest',
    'Access-Control-Allow-Origin': '*'
  }
  public async fetch(url: string): Promise<any> {
    this.throwError()
  }
  public async get(url: string, id: number | string): Promise<any> {
    this.throwError()
  }
  public async post(url: string, data: any): Promise<any> {
    this.throwError()
  }
  public async put(url: string, id: number | string, data: any): Promise<any> {
    this.throwError()
  }
  public async delete(url: string, id: number | string): Promise<any> {
    this.throwError()
  }
  private throwError() {
    throw Error('Method is not implemented')
  }
}
