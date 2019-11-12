export interface IModuleState {
  task_users: ITaskUser[]
  lookup: any
  tasks_by_user: any
}

export interface ITaskUser {
  id: number
  task_id: number
  company_user_id: number
  uuid: string
  next_work_day: string
}
