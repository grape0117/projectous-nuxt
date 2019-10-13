export interface IListsState {
  lists: IList[],
  allTasks: ITask[]
}

export interface IList {
  name: string,
  tasks: ITask[]
}

export interface ITask {
  id: string
  uuid: string | null
  sort_order: string | null
  title: string
}
