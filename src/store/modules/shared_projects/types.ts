import { ICompanyUser } from '@/store/modules/company_users/types'

export interface IModuleState {
  shared_projects: IProject[]
  task_list: ITaskList[]
  selectedProjectId: string | number | null
  pinnedProjects: number[]
  lookup: any
  lookup_by_client_company_id: {}
}

export interface IProject {
  id: string
  users: ICompanyUser[]
  first_task_id: number
  owner_company_id: number
  client_id: number
  client_company_id: number
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
  project_url: string
  completed_at: string
  is_open_tasked: boolean
}

export interface ITaskList {
  task_list: []
  project_id: string
}
