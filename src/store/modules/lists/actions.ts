import { ActionTree } from 'vuex'
import { IListsState } from '../lists/types'
import { IRootState } from '@/store/types'
import { ADD_NEW_LIST } from '@/store/modules/lists/mutations-types'

export const actions: ActionTree<IListsState, IRootState> = {}
