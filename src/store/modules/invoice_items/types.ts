export interface IModuleState {
  invoice_items: INVOICE_ITEMS[]
  lookup: any
  lookup_by_client_company_id: any
}

export interface INVOICE_ITEMS {
  id?: string
  description?: string
  date: string
  company_id: number
  client_id?: number
  project_id: number
  paid_amount: number
  invoice_amount: number
  invoice_id: number
  company_user_id: number
  created_at: string
  updated_at: string
  deleted_at?: string
}
