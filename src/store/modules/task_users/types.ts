export interface IModuleState {
  task_users: ITaskUser[]
  lookup: any
}

export interface ITaskUser {
  id?: number
  task_id: number
  company_user_id: number | null
  uuid: string | null
  next_work_day: string | null,
  user_task_list_id: number | null
  role: string
  sort_order: number | null
  task_uuid: string | null
  user_rate: string
  work_day_position: number | null,
  temp?: boolean
}
