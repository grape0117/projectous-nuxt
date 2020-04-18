export interface IModuleState {
  project_users: IProjectUser[]
  lookup: any
}

export interface IProjectUser {
  id?: string
  project_id: number
  company_user_id: number | null
  role: string
  user_rate: string
}
