export interface IModuleState {
  task_messages: TaskMessage[]
  lookup: any
  lookup_by_task_id: any
  message_task_ids_by_updated_at: any
}

export interface ITaskMessage {
  id?: string
  task_id: string
  company_user_id: number | null
  message: string | null
  created_at: string | null
  is_file: Boolean | null
  file_path: string | null
  thumbnail: string | null
  user: object | null
  thread_id: number | null
  timestamp: number | null
  //  save(): any
}

export class TaskMessage implements ITaskMessage {
  public id?: string
  public task_id: string = ''
  public company_user_id: number | null = null
  public message: string | null = ''
  public created_at: string | null = ''
  public is_file: Boolean | null = false
  public file_path: string | null = ''
  public thumbnail: string | null = ''
  public user: object | null = {}
  public thread_id: number | null = 0
  public timestamp: number | null = 0
  // save() {
  //   //window._actions[module + '/CASCADE_DELETE']
  // }
}
