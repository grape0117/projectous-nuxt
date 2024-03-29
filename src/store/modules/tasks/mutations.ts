// @ts-ignore
import { MutationTree } from 'vuex'
import { IModuleState, ITask } from './types'
import Vue from 'vue'
import { IRootState } from '@/store/types'
import { getCookie } from '@/utils/util-functions'

export const mutations: MutationTree<IModuleState> = {
  CASCADE_DELETE(state: IModuleState, entity) {
    // @ts-ignore
    this.commit('task_users/deleteByTaskId', entity.id) //TODO: handle here?
  },
  DELETE(state: IModuleState, entity) {
    if (state.completed_tasks.length > 0) {
      // @ts-ignore
      state.completed_tasks = state.completed_tasks.filter(({ id }) => id !== entity.id)
    }
    if (state.hold_tasks.length > 0) {
      // @ts-ignore
      state.hold_tasks = state.hold_tasks.filter(({ id }) => id !== entity.id)
    }
    if (state.active_tasks.length > 0) {
      // @ts-ignore
      state.active_tasks = state.active_tasks.filter(({ id }) => id !== entity.id)
    }
    if (state.when_possible_tasks.length > 0) {
      // @ts-ignore
      state.when_possible_tasks = state.when_possible_tasks.filter(({ id }) => id !== entity.id)
    }
    if (state.this_week_tasks.length > 0) {
      // @ts-ignore
      state.this_week_tasks = state.this_week_tasks.filter(({ id }) => id !== entity.id)
    }
    if (state.today_tasks.length > 0) {
      // @ts-ignore
      state.today_tasks = state.today_tasks.filter(({ id }) => id !== entity.id)
    }
    if (state.my_tasks.length > 0) {
      // @ts-ignore
      state.my_tasks = state.my_tasks.filter(({ id }) => id !== entity.id)
    }
    if (state.past_due_tasks.length > 0) {
      // @ts-ignore
      state.past_due_tasks = state.past_due_tasks.filter(({ id }) => id !== entity.id)
    }
    if (state.others_tasks.length > 0) {
      // @ts-ignore
      state.others_tasks = state.others_tasks.filter(({ id }) => id !== entity.id)
    }
    if (state.all_tasks.length > 0) {
      // @ts-ignore
      state.all_tasks = state.all_tasks.filter(({ id }) => id !== entity.id)
    }
  },
  UPDATE(state: IModuleState, entity) {
    if (state.completed_tasks.length > 0) {
      // @ts-ignore
      state.completed_tasks = state.completed_tasks.map(task => (task.id == entity.id ? entity : task))
    }
    if (state.hold_tasks.length > 0) {
      // @ts-ignore
      state.hold_tasks = state.hold_tasks.map(task => (task.id == entity.id ? entity : task))
    }
    if (state.active_tasks.length > 0) {
      // @ts-ignore
      state.active_tasks = state.active_tasks.map(task => (task.id == entity.id ? entity : task))
    }
    if (state.when_possible_tasks.length > 0) {
      // @ts-ignore
      state.when_possible_tasks = state.when_possible_tasks.map(task => (task.id == entity.id ? entity : task))
    }
    if (state.this_week_tasks.length > 0) {
      // @ts-ignore
      state.this_week_tasks = state.this_week_tasks.map(task => (task.id == entity.id ? entity : task))
    }
    if (state.today_tasks.length > 0) {
      // @ts-ignore
      state.today_tasks = state.today_tasks.map(task => (task.id == entity.id ? entity : task))
    }
    if (state.my_tasks.length > 0) {
      // @ts-ignore
      state.my_tasks = state.my_tasks.map(task => (task.id == entity.id ? entity : task))
    }
    if (state.past_due_tasks.length > 0) {
      // @ts-ignore
      state.past_due_tasks = state.past_due_tasks.map(task => (task.id == entity.id ? entity : task))
    }
    if (state.others_tasks.length > 0) {
      // @ts-ignore
      state.others_tasks = state.others_tasks.map(task => (task.id == entity.id ? entity : task))
    }
    if (state.all_tasks.length > 0) {
      // @ts-ignore
      state.all_tasks = state.all_tasks.map(task => (task.id == entity.id ? entity : task))
    }
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
  addTodayTask(state: IModuleState, task: ITask) {
    state.today_tasks = [...state.today_tasks, task]
  },
  removeTodayTask(state: IModuleState, task_id) {
    state.today_tasks = state.today_tasks.filter(({ id }) => id !== task_id)
  },
  removeMyTask(state: IModuleState, task_id) {
    state.my_tasks = state.my_tasks.filter(({ id }) => id !== task_id)
  },
  updateTasksSortOrders(state: IModuleState, ids: number[]) {
    ids.forEach((id, index) => {
      //TODO: clear out all but UPDATE_ATTRIBUTE
      //const task = state.tasks[state.lookup[id]]
      //if (task) {
      // @ts-ignore
      this.commit('UPDATE_ATTRIBUTE', { module: 'tasks', id, attribute: 'sort_order', value: index })
      //task.sort_order = index
      //} //Project?
    })
  },
  addNewChat(state: IModuleState, chat) {
    state.chats = [chat, ...state.chats]
  },
  updateChats(state: IModuleState, chats) {
    state.chats = chats
  },
  updateMoreChats(state: IModuleState, chats) {
    state.chats = [...state.chats, ...chats]
  },
  updateLastMessage(state: IModuleState, lastMessage) {
    const user_id = getCookie('user_id')
    const chatIndex = state.chats.findIndex(({ thread_id }) => thread_id == lastMessage.thread_id)
    if (chatIndex >= 0) {
      let newChats = [...state.chats]
      // @ts-ignore
      if (Object.values(lastMessage.users_to_notify).indexOf(parseInt(user_id)) >= 0) {
        newChats[chatIndex] = { ...newChats[chatIndex], last_message: lastMessage.lastMessage, num_unread: newChats[chatIndex].num_unread + 1 }
      } else {
        newChats[chatIndex] = { ...newChats[chatIndex], last_message: lastMessage.lastMessage }
      }
      const updatedChat = { ...newChats[chatIndex] }
      newChats.splice(chatIndex, 1)
      newChats.unshift(updatedChat)
      state.chats = newChats
    }
  },
  readChat(state: IModuleState, threadId) {
    const chatIndex = state.chats.findIndex(({ thread_id }) => thread_id == threadId)
    if (chatIndex < 0) {
      return
    }
    let newChats = [...state.chats]
    newChats[chatIndex] = { ...newChats[chatIndex], num_unread: 0 }
    state.chats = newChats
  },
  /*,
  uuid_to_id(state: IModuleState, { uuid, id }) {
    state.tasks[state.lookup[uuid]].id = id
    state.lookup[id] = state.lookup[uuid]

    //TODO: do we need to delete from lookup? Doesn't seem to matter
  }*/
  updateTask(state: IModuleState, task) {
    console.log('here', task)
    // this.commit('UPDATE_ATTRIBUTE', task)
  }
}
