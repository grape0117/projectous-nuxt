export interface ITasksState {
  tasks: ITask[]
}

export interface ITask {
  id: string
  uuid: string | null
  sort_order: string | null
}
