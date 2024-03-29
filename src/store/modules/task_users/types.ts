export interface IModuleState {
  task_users: ITaskUser[]
  lookup: any
  lookup_by_task_id: any
}

export interface ITaskUser {
  id?: string
  task_id: number
  company_user_id: number | null
  next_work_day: string | null
  user_task_list_id: number | null
  role: string
  sort_order: number | null
  user_rate: string
  work_day_position: number | null
  temp?: boolean
  step: string | null
  notes: string | null
}
