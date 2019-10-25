import { ITaskUser } from '../task_users/types'

export interface IListsState {
  lists: IList[]
}

export interface IList {
  id: string //TODO: id: string -- we want to be able to pass the list identifier to the backend without translation
  name: string
  tasks: ITaskUser[]
}
