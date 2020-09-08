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
  //  save(): any
}

export class TaskMessage implements ITaskMessage {
  id?: string
  task_id: string = ''
  company_user_id: number | null = null
  message: string | null = ''
  created_at: string | null = ''
  // save() {
  //   //window._actions[module + '/CASCADE_DELETE']
  // }
}
