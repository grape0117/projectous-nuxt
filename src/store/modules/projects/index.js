import Vue from 'vue';
const state = {
    projects: [],
    lookup: {}
};
const mutations = {
    load(state, projects) {
        projects.forEach((value, key) => {
            if (!state.lookup[projects[key].id]) {
                state.projects.push(value);
            }
            else {
                state.projects[state.lookup[projects[key].id]] = value;
            }
        });
        //@Mikhail: you said there was a faster or better way to do this? reset lookup
        state.lookup = [];
        state.projects.forEach((project, key) => {
            state.lookup[project.id] = key;
        });
    },
    create: function (state, project) {
        state.projects.push(project);
        //@Mikhail is there a faster way to find the index? Can I search from the bottom of the array first?
        state.projects.forEach((project, key) => {
            state.lookup[project.id] = key;
        });
    },
    upsert(state, project) {
        let property;
        let key;
        key = state.lookup[project.id];
        if (key) {
            for (property in project) {
                if (project.hasOwnProperty(property)) {
                    state.projects[key][property] = project[property];
                }
            }
        }
        else {
            this.commit('projects/create', project);
        }
    },
    updateAttribute(state, { project_id: number, attribute: string, value }) {
        state.projects[state.lookup[project.id]][attribute] = value;
    },
    delete(state, object) {
        Vue.delete(state.projects, state.lookup[object.id]);
        state.projects.forEach((project, key) => {
            state.lookup[project.id] = key;
        });
    },
};
const actions = {
    add(context, project) {
        const { project } = await this._vm.$http().fetch('/projects/add', project);
        //@Mikhail error handling
        if (project && response.project.id) {
            context.commit('upsert', project);
        }
    },
    save(context, project) {
        const { project } = await this._vm.$http().post('/projects/save', project); //@Mikhail I always get confused with singular plural
        context.dispatch('update', project);
        //context.dispatch('settings/closeModal', { modal: 'project', object: project, pop: true, push: false }, { root: true });
        //context.commit('settings/setCheckActionStack', true, { root: true });
    },
    updateAttribue(context, { attrinute, value, project_id }) {
        const { project } = await this._vm.$http().put('/projects/' + project_id + 'updateAttribute', { attribute, value });
        context.commit('updateAttribute', { project_id, attribute, value });
    },
    setprojectAttribute: function (context, { attribute, value, project_id }) {
        let self = this;
        let project = context.getters['getprojectById'](project_id);
        context.commit('updateprojectAttribute', { project, attribute, value });
        ajax('project/' + attribute + '/ajax/' + project_id, { value: value }, function (response) {
            alert('update');
            //context.commit('update', JSON.parse(JSON.stringify(response.project)));
        });
    },
};
const getters = {
    getById: (state, getters) => (id) => {
        let project;
        if (project = state.projects[state.lookup[id]]) {
            return project;
        }
        else if (id) {
            return state.projects.find(project => project.id === id);
        }
    },
    userprojects: (state, getters, rootState, rootGetters) => (user_id) => {
        if (!user_id) {
            return getters['all_projects'];
        }
        let userProjects;
        return getters['all_projects'].filter((project) => {
            let userMatch = false;
            if (project.project_id) {
                if (userProjects.indexOf(project.project_id) !== -1) {
                    return true;
                }
                let project = rootGetters['projects/getProjectById'](project.project_id);
                if (project) {
                    project.users.forEach((user) => {
                        if (user.id == user_id) {
                            userProjects.push(project.project_id);
                            userMatch = true;
                            return false;
                        }
                    });
                }
            }
            project.users.forEach((user, index) => {
                if (user.id == user_id) {
                    userMatch = true;
                    return false;
                }
            });
            return userMatch;
        });
    },
    projectProjectName: (state, getters, rootState, rootGetters) => (project_id) => {
        let project = getters['getprojectById'](project_id);
        if (project.project_id) {
            let project = rootGetters['projects/getProjectById'](project.project_id);
            if (project) {
                return project.name;
            }
        }
        return '';
    },
    projectClientName: (state, getters, rootState, rootGetters) => (project_id) => {
        let project = getters['getprojectById'](project_id);
        if (project.project_id) {
            let project = rootGetters['projects/getProjectById'](project.project_id);
            if (!project) {
                return '';
            }
            else if (project.client_id) {
                let client = rootGetters['clients/getClientById'](project.client_id);
                if (client) {
                    return client.name;
                }
            }
        }
        return '';
    },
};
export const projects = {
    namespaced: true,
    state,
    mutations,
    actions: {
        uploadFile: function () {
            ajax({
                url: '/project/id/upload',
                data: formData,
                type: 'POST',
                contentType: false,
                processData: false,
            });
        },
        moveproject: function (context, project) {
            ajax('/project/moveproject', project, function (response) {
                //TODO: process moved projects
            });
        },
        updateproject: function (context, project) {
            console.log('updateproject');
            var index = context.state.projects.findIndex(function (search) {
                if (search) //Things break hard without this after deleting a timer
                    return search.id == project.id;
            });
            console.log('trying to update');
            if (index !== -1) {
                //If project_id changed and
                if (context.state.projects[index].project_id != project.project_id) {
                    //Going from one project to another project:
                    if (context.state.projects[index].project_id) {
                        context.commit('moveprojectsDown', context.state.projects[index].project_id);
                        project.order = 1;
                    }
                    context.commit('moveprojectsUp', project.project_id);
                }
                console.log('updating project with index ' + index);
                console.log(project);
                Vue.set(context.state.projects, index, project);
            }
        },
        editproject: function (context, project) {
            context.commit('settings/setCurrentEditproject', project, { root: true });
            $('#project-modal').modal({});
            context.commit('settings/setCheckActionStack', true, { root: true });
        },
        startprojectTimer: function (context, project) {
            var self = this;
            project.current_company_id = context.rootState.settings.current_company.id;
            ajax('/timer/start-project-timer', project, function (response) {
                response.timers.forEach(function (timer) {
                    context.commit('timers/upsertTimer', timer, { root: true });
                });
                context.commit('timers/upsertTimer', response.timer, { root: true });
            });
        },
        createprojectFromEnter({ context, project }) {
            console.log(project);
            ajax('/project/createFromEnter', project, function (response) {
                context.state.projects.push(response.project);
                context.commit('updateLookup');
                //TODO: move to create project
                context.state.projects[context.state.lookup[project.from_id]].next_project_id = response.project.id;
                Vue.nextTick(function () {
                    //alert('tick');
                    $('.project-' + response.project.id).focus();
                });
            });
        },
        saveprojectTitle: function (context, { id, title }) {
            ajax('/project/saveprojectTitle', { id: id, title: title }, function (response) {
                context.state.projects.find(function (project) {
                    if (project.id == id) {
                        project.title = title;
                    }
                });
            });
        },
    },
    getters
};
//# sourceMappingURL=index.js.map