import { ICompanyUser } from '@/store/modules/company_users/types'

export interface IModuleState {
  projects: IProject[]
  selectedProjectId: string | number | null
  pinnedProjects: number[]
  lookup: any
}

export interface IProject {
  id: number
  users: ICompanyUser[]
  first_task_id: number
  owner_company_id: number
  company_client_id: number
  client_id: number
  due_at: string
  parent_project_id: number
  name: string
  acronym: string
  default_client_rate: number
  status: string
  default_user_rate: number
  estimate: number
  description: string
  created_at: string
  updated_at: string
  deleted_at: string
  url: string
  completed_at: string
  is_open_tasked: boolean
}