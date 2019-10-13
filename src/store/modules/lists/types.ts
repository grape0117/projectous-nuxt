import { ITask } from '../tasks/types'

export interface IListsState {
  lists: IList[]
}

export interface IList {
  name: string,
  tasks: ITask[]
}
