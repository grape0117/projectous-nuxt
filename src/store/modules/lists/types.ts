import { ITaskUser } from '../task_users/types'

export interface IListsState {
  lists: IList[]
}

export interface IList {
  name: string
  tasks: ITaskUser[]
}
