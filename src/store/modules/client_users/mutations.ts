import { MutationTree } from 'vuex'
import Vue from 'vue'
import { IModuleState, IClientUser } from './types'

export const mutations: MutationTree<IModuleState> = {
  LOOKUP(state: IModuleState, client_users: any) {
    console.log('LOOKUP client_users', client_users)
  }
}
