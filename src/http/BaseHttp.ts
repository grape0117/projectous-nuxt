import { IHttp } from '@/http/types'

export class BaseHttp implements IHttp {
  protected baseUrl: string = 'https://api.projectous.com/api'
  protected headers: any = {
    Authorization: 'Bearer ' + '123456789012345678901234567890qwertyuiop'
  }
  protected offlineMode: boolean = false
  protected offlineNotifyUserMessage: string = 'You are offline, try later'
  constructor() {
    if (!window.navigator.onLine) this.setOfflineMode()
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
  protected noSlashEndError() {
    return new Error('URL string must end with slash')
  }
  protected notifyUser(message: string) {
    // @stephane later we can add notification for user
    console.log(message)
  }
  private throwError() {
    throw Error('Method is not implemented')
  }
  private setOfflineMode() {
    this.offlineMode = true
  }
}
