export const actions = {
  async add({ commit }, project) {
    //@Mikhail I want to queue requests that fail
    // @ts-ignore
    const response = await this._vm.$http().fetch('/projects/add', project)
    //@Mikhail should I commit twice? Once before request and once after in case backend changes some of the data? Or should all updates come via websocket connection?
    commit('upsert', response.project)
  },
  async save({ commit, dispatch }, project) {
    // @ts-ignore
    const response = await this._vm.$http().post('/projects/save', project) //@Mikhail I always get confused with singular plural
    dispatch('update', response.project)
    //context.dispatch('settings/closeModal', { modal: 'project', object: project, pop: true, push: false }, { root: true });
    //context.commit('settings/setCheckActionStack', true, { root: true });
  },
  async updateAttribue({ commit }, { attribute, value, project_id }) {
    // @ts-ignore
    const response = await this._vm
      .$http()
      .put('/projects/' + project_id + 'updateAttribute', { attribute, value })
    commit('updateAttribute', { project_id, attribute, value }) //@Mikhail should I get values from response?
  },
  async delete() {}
}
//# sourceMappingURL=actions.js.map
