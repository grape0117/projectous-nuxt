export interface IModuleState {
  timers: ITimer[]
  lookup: any
}

export interface ITimer {
  id: any
  new_client_rate: any
  client_rate: any
  new_user_rate: any
  user_rate: any
  company_user_id: any
  user_id: any
  project_id: any
  parent_id: any
  company_client_id: any
  task_id: any
  report_at: any
  duration: any
  invoice_duration: any
  notes: any
  materials: any
  invoice_notes: any
  admin_notes: any
  restarted_at: any
  is_client_rate_manual: any
  invoiced_rate: any
  is_user_rate_manual: any
  paid_rate: any
  invoice_id: any
  status: any
  is_billable: any
  status_changed_at: any
  is_locked: any
  is_paid: any
  change_type: any
  comped: any
  submitted_at: any
  confirmed_at: any
  confirmed_by: any
  exported_at: any
  created_at: any
  updated_at: any
  deleted_at: any
}
