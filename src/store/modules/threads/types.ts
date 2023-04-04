export interface IModuleState {
  threads: Thread[]
}

export interface IThread {
  id?: string
  task_id: string
  title: string | null
  status: string | null
  user: object | null
  responsibility_company_user_id: number | null
}

export class Thread implements IThread {
  public id?: string
  public task_id: string = ''
  public title: string = ''
  public status: string = ''
  public user: object | null = {}
  public responsibility_company_user_id: number | null = 0

  // save() {
  //   //window._actions[module + '/CASCADE_DELETE']
  // }
}
