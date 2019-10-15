import {Module, MutationTree, ActionTree, GetterTree} from 'vuex'
import Vue from 'vue'
import { IRootState } from '@/store/types'
import { IModuleState } from './types'
import { IProject } from './types'

const state = {
    projects: IProject[]
    lookup: {}
}

const mutations: MutationTree<IModuleState> = {
    load(state, projects: IProject[]) {
        //add or update projects
        projects.forEach((value, key) => {
            if (!state.lookup[projects[key].id]) {
                state.projects.push(value);
            } else {
                state.projects[state.lookup[projects[key].id]] = value;
            }
        });

        //reset lookup
        state.lookup = [];
        state.projects.forEach((project, key) => {
            state.lookup[project.id] = key;
        })
    },
    create: function(state, project){
        state.projects.push(project);
        state.projects.forEach((project, key) => {
            state.lookup[project.id] = key;
        })
    },
    upsert(state, project){
        let property:string|number
        let key:number

        key = state.lookup[project.id];
        if(key){
            for(property in project) {
                if (project.hasOwnProperty(property)) {
                    state.projects[key][property] = project[property];
                }
            }
        } else {
            state.projects.push(project);
            state.lookup[project.id] = state.projects.findIndex((row) => {
                return row.id == project.id;
            });
        }
    },
    updateAttribute(state, {project: IProject, attribute: string, value}) {
        state.projects[state.lookup[project.id]][attribute] = value
    },
    delete(state, object){
        Vue.delete(state.projects, state.lookup[object.id]);
        state.projects.forEach((project, key) => {
            state.lookup[project.id] = key;
        })
    },
}

const actions: ActionTree<IModuleState, IRootState> = {
    saveproject: function (context, project) {
        ajax('/project/save/ajax', project, function (response) {
            //return;
            //alert('updating project')
            context.dispatch('updateproject', JSON.parse(JSON.stringify(response.project)));
            context.dispatch('settings/closeModal', {modal: 'project', object: response.project, pop: true, push: false}, {root: true});
            context.commit('settings/setCheckActionStack', true, {root: true});
        });
    },
}

const getters: GetterTree<IModuleState, IRootState> = {
    getById: (state, getters) => (id) => {
        let project: IProject
        if(project = state.projects[state.lookup[id]]){
            return project;
        } else if (id) {
            return state.projects.find(project => project.id === id);
        }
    },
    userprojects: (state, getters, rootState, rootGetters) => (user_id) => {
        if(!user_id){
            return getters['all_projects'];
        }

        let userProjects: number[]

        return getters['all_projects'].filter((project: Iproject) => {
            let userMatch = false;
            if(project.project_id) {
                if(userProjects.indexOf(project.project_id) !== -1){
                    return true;
                }
                let project = rootGetters['projects/getProjectById'](project.project_id);
                if (project) {
                    project.users.forEach((user) => {
                        if (user.id == user_id) {
                            userProjects.push(project.project_id)
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
        })
    },
    projectProjectName: (state, getters, rootState, rootGetters) => (project_id) => {
        let project = getters['getprojectById'](project_id)
        if(project.project_id) {
            let project = rootGetters['projects/getProjectById'](project.project_id)
            if (project) {
                return project.name;
            }
        }
        return ''
    },
    projectClientName: (state, getters, rootState, rootGetters) => (project_id) => {
        let project = getters['getprojectById'](project_id)
        if(project.project_id) {
            let project = rootGetters['projects/getProjectById'](project.project_id);
            if (!project) {
                return '';
            } else if(project.client_id){
                let client = rootGetters['clients/getClientById'](project.client_id)
                if(client) {
                    return client.name
                }
            }
        }
        return '';
    },
}

export const projects: Module<IModuleState, IRootState> = {
  namespaced: true,
    state,
    mutations,

    actions: {
        uploadFile: function(){

            ajax({
                url: '/project/id/upload',
                data: formData,
                type: 'POST',
                contentType: false, // NEEDED, DON'T OMIT THIS (requires jQuery 1.6+)
                processData: false, // NEEDED, DON'T OMIT THIS
                // ... Other options like success and etc
            });
        },
        moveproject: function(context, project){
            ajax('/project/moveproject', project, function(response){
                //TODO: process moved projects
            });
        },

        updateproject: function(context, project){
            console.log('updateproject');
            var index = context.state.projects.findIndex(function (search) {
                if(search) //Things break hard without this after deleting a timer
                    return search.id == project.id;
            });

            console.log('trying to update')
            if (index !== -1) {
                //If project_id changed and
                if(context.state.projects[index].project_id != project.project_id){
                    //Going from one project to another project:
                    if(context.state.projects[index].project_id){
                        context.commit('moveprojectsDown', context.state.projects[index].project_id);
                        project.order = 1;
                    }
                    context.commit('moveprojectsUp', project.project_id);
                }
                console.log('updating project with index '+index);
                console.log(project);
                Vue.set(context.state.projects, index, project);
            }
        },

        createproject: function (context, project) {
            var self = this;
            ajax('project/add', project, function (response) {
                if(response.project.project_id) {
                    //context.commit('moveprojectsUp', response.project.project_id);
                }
                if(response.project && response.project.id) {
                    context.commit('projects/updateProject', response.project, {root: true});
                }
                context.state.projects.push(response.project);
                context.commit('updateLookup');
                //store.setprojectKeys(self.projects);
            });
        },
        createLastproject: function(context, project){
            var self = this;
            ajax('project/createLastproject', project, function (response) {
                context.state.projects.push(response.project);
                context.commit('updateLookup');
            });
        },
        editproject: function (context, project) {
            context.commit('settings/setCurrentEditproject', project, {root: true});
            $('#project-modal').modal({});
            context.commit('settings/setCheckActionStack', true, {root: true});
        },
        setprojectAttribute: function (context, {attribute, value, project_id}) {
            let self = this;
            let project = context.getters['getprojectById'](project_id);
            context.commit('updateprojectAttribute',{project, attribute, value})
            ajax('project/' + attribute + '/ajax/' + project_id, {value: value}, function (response) {
                alert('update')
                //context.commit('update', JSON.parse(JSON.stringify(response.project)));
            })
        },

        startprojectTimer: function (context, project) {
            var self = this;
            project.current_company_id = context.rootState.settings.current_company.id;

            ajax('/timer/start-project-timer', project, function (response) {
                response.timers.forEach(function(timer){
                    context.commit('timers/upsertTimer', timer, {root: true});
                });
                context.commit('timers/upsertTimer', response.timer, {root: true});

            });
        },

        createprojectFromEnter({context, project}: {context: any, project: Iproject}){
            console.log(project);
            ajax('/project/createFromEnter', project, function(response: any){
                context.state.projects.push(response.project);
                context.commit('updateLookup');
                //TODO: move to create project
                context.state.projects[context.state.lookup[project.from_id]].next_project_id = response.project.id;
                Vue.nextTick(function(){
                    //alert('tick');
                    $('.project-'+response.project.id).focus();
                })
            })
        },

        saveprojectTitle: function(context, {id, title}){
            ajax('/project/saveprojectTitle', {id: id, title: title}, function(response: any){
                context.state.projects.find(function(project){
                    if(project.id == id){
                        project.title = title;
                    }
                })
            })
        },

    },
    getters
}


