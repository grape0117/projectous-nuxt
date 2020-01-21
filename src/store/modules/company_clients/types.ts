export interface IModuleState {
  company_clients: ICompanyClient[]
  lookup: any
}

export interface ICompanyClient {
  id?: number
  visibility: string
  status: string
  parent_company_client_id?: number | null
  company_id?: number | null
  client_company_id?: number
  name: string
  acronym: string
  legal_name: string
  representative_name: string
  default_representative_user_id: number
  owner_id: number
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
  invoice_max_interval_days: number
  invoice_max_amount: number
  email: string
  accounting_email: string
}
