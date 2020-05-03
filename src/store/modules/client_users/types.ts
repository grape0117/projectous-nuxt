export interface IModuleState {
  client_users: IClientUser[]
  lookup: any
}

export interface IClientUser {
  id?: string
  client_id: string
  company_user_id: number | string | null
  role: string //default_role
  default_user_rate: number | null
  user_rate: string
}
