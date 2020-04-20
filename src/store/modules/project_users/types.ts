export interface IModuleState {
  project_users: IProjectUser[]
  lookup: any
}

export interface IProjectUser {
  id?: string
  project_id: string
  company_user_id: number | string | null
  role: string
  user_rate: string
}
