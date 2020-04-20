export interface IModuleState {
  company_users: ICompanyUser[]
  lookup: {}
}

export interface ICompanyUser {
  id: string
  parent_company_user_id: string
  name: string
  fullname: string
  company_id: string
  user_id: string
  partner_company_id: string
  status: string
  user_type: string
  user_role: string
  aliases: string
  default_user_rate: number
  default_multiplier: number
  address: string
  phone: string
  timezone: string
  email: string
  last_seen_at: string
  created_at: string
  updated_at: string
  deleted_at: string
  image_url: string
  color: string
}
