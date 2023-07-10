export interface IModuleState {
  shared_project_users: IProjectUser[]
  lookup: any
  lookup_by_project_id: any
  lookup_by_company_user_id: any
}

export interface IProjectUser {
  id?: string
  project_id: string
  company_user_id: number | string | null
  role: string
  default_user_rate: string | null
}
