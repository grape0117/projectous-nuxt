import { ITaskUser } from '../task_users/types'

export interface IListsState {
  user_tasks_list: IList[]
}

export interface IList {
  id: number | string
  title: string
  group: string
}
