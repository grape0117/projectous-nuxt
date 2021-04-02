import { IProject } from '@/store/modules/projects/types'
import { ICompanyUser } from '@/store/modules/company_users/types'
import { ITask } from '@/store/modules/tasks/types'

export interface IModuleState {
  modal_stack: string[]
  modules: []
  bvModal: any
  check_modal_stack: boolean
  current_company_user_id: string
  current_company_user: {}
  current_company_id: string
  current_running_timer: {}
  current_user_id: number
  current_project: {}
  current_company: {} // TODO ICompany
  current_module_settings: {}
  current_edit_project: IProject
  current_edit_company_user: ICompanyUser
  current_edit_client: { id: null }
  current_edit_task: ITask
  current_edit_timer: any // TODO
  current_edit_timer_status: EditTimerStatus | null
  current_edit_task_type: {} // TODO
  insance_id: string
  last_seen_at: string
  notes: string
  timer_watch: number
}

enum EditTimerStatus {
  add,
  edit
}
