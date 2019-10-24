const company_user_id = 1
const UUID = () => {
  const date = new Date()
  return (
    date.getUTCFullYear() +
    '-' +
    date.getUTCMonth() +
    1 +
    '-' +
    date.getDate() +
    ' ' +
    date.getUTCHours() +
    ':' +
    date.getUTCMinutes() +
    ':' +
    date.getUTCSeconds() +
    ':' +
    date.getMilliseconds() +
    ' ' +
    Math.random()
  )
}
export const actions = {
  async createUserTask({ dispatch, commit }, { list, sort_order }) {
    //@Mikhail: how do I both use TS with optional properties but also use TS to help avoid errors? Just use ignore with a note?
    const newTask = {
      id: UUID(),
      title: 'title'
    }
    const new_task = dispatch('task/CREATE', newTask)
    const new_task_user = dispatch('task_user/CREATE', {
      task: new_task,
      list,
      sort_order
    })
    //@ts-ignore
    const { task_user, task } = await this._vm
      .$http()
      .post('users/' + company_user_id + '/tasks', {
        list: list,
        sort_order: sort_order
      })
    commit('tasks/UPDATE', task)
    commit('task_users/UPDATE', task_user)
  }
}
//# sourceMappingURL=actions.js.map
