export interface IListsState {
  lists: IList[]
  allTasks: ITask[]
}

export interface IList {
  name: string
  tasks: ITask[]
}

export interface ITask {
  due_date?: string
  id?: number
  uuid?: string | null
  sort_order?: string | null
  title?: string
  task_id?: number
}

export interface IUserTask {
  task_id: number
}
