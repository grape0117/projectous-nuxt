// @ts-ignore
import { MutationTree } from 'vuex'
import { IModuleState, ITask } from './types'
import Vue from 'vue'
import { IRootState } from '@/store/types'

export const mutations: MutationTree<IModuleState> = {
  CASCADE_DELETE(state: IModuleState, entity) {
    // @ts-ignore
    this.commit('task_users/deleteByTaskId', entity.id) //TODO: handle here?
  },
  deleteByProjectId(state: IModuleState, project_id) {
    state.tasks.forEach(task => {
      if (task.project_id === project_id) {
        // @ts-ignore
        this.commit('DELETE', { module: 'task', entity: task }, { root: true })
      }
    })
  },
  removeTempTasks(state: IModuleState) {
    state.tasks = state.tasks.filter(({ temp }) => !temp)
  },
  updateTasksSortOrders(state: IModuleState, ids: number[]) {
    ids.forEach((id, index) => {
      //TODO: clear out all but UPDATE_ATTRIBUTE
      //const task = state.tasks[state.lookup[id]]
      console.log(index + ' updateTasksSortOrders: updating sort order for task')
      //if (task) {
      // @ts-ignore
      this.commit('UPDATE_ATTRIBUTE', { module: 'tasks', id, attribute: 'sort_order', value: index })
      //task.sort_order = index
      //} //Project?
    })
  },
  /*uuid_to_id(state: IModuleState, { uuid, id }) {
    state.tasks[state.lookup[uuid]].id = id
    state.lookup[id] = state.lookup[uuid]

    //TODO: do we need to delete from lookup? Doesn't seem to matter
  }*/
  updateTask(state: IModuleState, task) {
    console.log('here', task)
    // this.commit('UPDATE_ATTRIBUTE', task)
  }
}
