export interface IListsState {
  lists: IList[]
}

export interface IList {
  name: string
  tasks: IUserTask[]
}

export interface IUserTask {
  id: number
  task_id: number
}
