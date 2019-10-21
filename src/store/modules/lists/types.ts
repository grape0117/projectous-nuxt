import { ITask } from '../tasks/types'

export interface IListsState {
  lists: IList[]
  allTasks: ITask[]
}

export interface IList {
  name: string
  tasks: ITask[]
}
