export interface IModuleState {
  tasks: ITask[]
  lookup: any
  displayed_tasks_plus0: ITask[]
  displayed_tasks_plus1: ITask[]
  displayed_tasks_plus2: ITask[]
  displayed_tasks_plus3: ITask[]
  displayed_tasks_plus4: ITask[]
  displayed_tasks_plus5: ITask[]
  displayed_tasks_plus6: ITask[]
  completed_tasks: ITask[]
  hold_tasks: ITask[]
  active_tasks: ITask[]
  when_possible_tasks: ITask[]
  this_week_tasks: ITask[]
  today_tasks: ITask[]
  tasks_by_project: ITask[]
}

export interface ITask {
  id: string
  sort_order: number
  title: string
  company_id: string | null
  project_id: string | null
  detail: string
  note: string | null
  status: string | null // enum('reviewed','turned-in','completed','closed','open') NOT NULL DEFAULT 'open',
  priority: string //` enum('today','this week','when possible','active','hold') NOT NULL DEFAULT 'active',
  priority_set_at: string | null
  order: string | null
  previous_task_id: number | null
  next_task_id: number | null
  parent_task_id: number | null
  child_task_id: number | null
  created_by_company_user_id: number | null
  due_date: string | null
  estimate: number | null
  original_due_date: Date | null
  completed_at: string | null
  created_at: string | null
  updated_at: string | null
  deleted_at: string | null
}
