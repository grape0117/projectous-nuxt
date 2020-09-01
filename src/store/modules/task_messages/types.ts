export interface IModuleState {
  task_messages: ITaskMessages[]
  lookup: any
  lookup_by_task_id: any
}

export interface ITaskMessages {
  id?: string
  task_id: number
  company_user_id: number | null
  message: string | null
  created_at: string | null
}
