export interface IListsState {
  generalLists: IList[]
  lists: IList[]
}

export interface IList {
  id: number | string
  company_user_id?: number
  title: string
  group: string
}
