export interface IListsState {
  generalLists: IList[]
  lists: IList[]
}

export interface IList {
  id: number | string
  userId?: number
  title: string
  group: string
}
