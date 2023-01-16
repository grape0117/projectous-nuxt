export interface IModuleState {
  pending_invites: IPendingInvite[]
  lookup: {}
}

export interface IPendingInvite {
  id: string
  token: string
  invited_by_company_user_id: string
  user_id: string
  company_id: string
  expires_at: string
  name: string
  email: string
  user_role: string
  created_at: string
  updated_at: string
  deleted_at: string
}
