export interface IListsState {
  generalLists: IList[]
  userLists: IList[]
}

export interface IList {
  id: number | string
  userId?: number
  title: string
  group: string
}
