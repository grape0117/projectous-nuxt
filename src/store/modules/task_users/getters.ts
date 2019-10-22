import { GetterTree } from 'vuex'
import { IRootState } from '@/store/types'
import { IModuleState } from './types'

const company_user_id: any = 1;

export const getters: GetterTree<IModuleState, IRootState> = {
    getById: (state, getters) => (id:any) => {
        return state.task_users[state.lookup[id]]
    },
    getMyTasks: (state, getters) => (company_user_id: any) => {
        state.task_users.filter(function(task_user){
            return task_user === company_user_id
        })
    }
}
