export interface IModuleState {
  threads: Thread[]
}

export interface IThread {
  id?: string
  task_id: string
  title: string | null
  status: string | null
  user: object | null
}

export class Thread implements IThread {
  public id?: string
  public task_id: string = ''
  public title: string = ''
  public status: string = ''
  public user: object | null = {}

  // save() {
  //   //window._actions[module + '/CASCADE_DELETE']
  // }
}
