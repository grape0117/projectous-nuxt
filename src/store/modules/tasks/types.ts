export interface ITasksState {
  tasks: ITask[]
  additionalTasks: ITask[]
}

export interface ITask {
  id: string
  uuid: string | null
  sort_order: string | null
  title: string
}
