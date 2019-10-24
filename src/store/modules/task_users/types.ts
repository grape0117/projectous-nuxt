export interface IModuleState {
  task_users: ITaskUser[]
  lookup: any
}

export interface ITaskUser {
  id: number
  task_id: number
  uuid: string
  next_work_day: string
}
