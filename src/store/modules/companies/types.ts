export interface IModuleState {
  companies: ICompany[]
  lookup: {}
}

export interface ICompany {
  id: string
  name: string
  acronym: string
  legal_name: string
  representative_name: string
  default_representative_user_id: string
  owner_id: string
  default_user_rate: number
  default_client_rate: number
  address1: string
  address2: string
  city: string
  state: string
  zip: string
  country: string
  phone: string
  tax_id: string
  created_at: string
  updated_at: string
  deleted_at: string
  gdrive_user: any
}
