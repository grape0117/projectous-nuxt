import {Module, MutationTree, ActionTree, GetterTree} from 'vuex'
import Vue from 'vue'
import { IRootState } from '@/store/types'
import { IModuleState } from './types'
import { ITask } from './types'
import { actions } from './actions'
import { getters } from './getters'

const state = {
    displayed_tasks_plus0: [],
    displayed_tasks_plus1: [],
    displayed_tasks_plus2: [],
    displayed_tasks_plus3: [],
    displayed_tasks_plus4: [],
    displayed_tasks_plus5: [],
    displayed_tasks_plus6: [],
    completed_tasks: [],
    hold_tasks: [],
    active_tasks: [],
    when_possible_tasks: [],
    this_week_tasks: [],
    today_tasks: [],
    tasks: [],
    tasks_by_project: [],
    lookup: {}
}

const mutations: MutationTree<IModuleState> = {
    load(state, tasks: ITask[]) {
        //add or update tasks
        tasks.forEach((value, key) => {
            if (!state.lookup[tasks[key].id]) {
                state.tasks.push(value);
            } else {
                state.tasks[state.lookup[tasks[key].id]] = value;
            }
        });

        //reset lookup
        state.lookup = [];
        state.tasks.forEach((task, key) => {
            state.lookup[task.id] = key;
        })
    },
    create: function(state, task){
        state.tasks.push(task);
        state.tasks.forEach((task, key) => {
            state.lookup[task.id] = key;
        })
    },
    upsert(state, task){
        let property:string|number
        let key:number

        key = state.lookup[task.id];
        if(key){
            for(property in task) {
                if (task.hasOwnProperty(property)) {
                    state.tasks[key][property] = task[property];
                }
            }
        } else {
            state.tasks.push(task);
            state.lookup[task.id] = state.tasks.findIndex((row) => {
                return row.id == task.id;
            });
        }
    },
    updateTaskAttribute(state, {task: ITask, attribute: string, value}) {
        state.tasks[state.lookup[task.id]][attribute] = value
    },
    delete(state, object){
        Vue.delete(state.tasks, state.lookup[object.id]);
        state.tasks.forEach((task, key) => {
            state.lookup[task.id] = key;
        })
    },
}

const actions: ActionTree<IModuleState, IRootState> = {
    saveTask: function (context, task) {
        ajax('/task/save/ajax', task, function (response) {
            //return;
            //alert('updating task')
            context.dispatch('updateTask', JSON.parse(JSON.stringify(response.task)));
            context.dispatch('settings/closeModal', {modal: 'task', object: response.task, pop: true, push: false}, {root: true});
            context.commit('settings/setCheckActionStack', true, {root: true});
        });
    },
}

const getters: GetterTree<IModuleState, IRootState> = {
    getTaskById: (state, getters) => (id) => {
        let task: ITask
        if(task = state.tasks[state.lookup[id]]){
            return task;
        } else if (id) {
            return state.tasks.find(task => task.id === id);
        }
    },
    projectTasks: (state, getters, rootState, rootGetters) => (project_id) => {
        if(!project_id){
            return [];
        }
        let project = rootGetters['projects/getProjectById'](project_id);
        if(!project){
            return [];
        }
        var tasks = [];
        var task_ids = [];
        var next_task_id = project.first_task_id;
        var task;

        while(next_task_id){
            task = getters['getTaskById'](next_task_id);
            if(!task || task_ids.indexOf(task.id) != -1){
                break;
            }
            tasks.push(task);
            task_ids.push(task.id);
            next_task_id = task.next_task_id;
        }

        var inAWeek = new Date();
        inAWeek.setDate(inAWeek.getDate() + 7);
        return tasks.sort(function(a,b){
            a.numeric_priority = a.priority == 'today' ? 1 : 0;
            b.numeric_priority = a.priority == 'today' ? 1 : 0;
            a.numeric_priority = new Date(a.due_date) < inAWeek ? 2 : a.numeric_priority;
            b.numeric_priority = new Date(a.due_date) < inAWeek ? 2 : b.numeric_priority;

            if(a.numeric_priority < b.numeric_priority) return -1;
            if(a.numeric_priority > b.numeric_priority) return 1;
            return 0;
        });
    },
    userTasks: (state, getters, rootState, rootGetters) => (user_id) => {
        if(!user_id){
            return getters['all_tasks'];
        }

        let userProjects: number[]

        return getters['all_tasks'].filter((task: ITask) => {
            let userMatch = false;
            if(task.project_id) {
                if(userProjects.indexOf(task.project_id) !== -1){
                    return true;
                }
                let project = rootGetters['projects/getProjectById'](task.project_id);
                if (project) {
                    project.users.forEach((user) => {
                        if (user.id == user_id) {
                            userProjects.push(task.project_id)
                            userMatch = true;
                            return false;
                        }
                    });
                }
            }
            task.users.forEach((user, index) => {
                if (user.id == user_id) {
                    userMatch = true;
                    return false;
                }
            });
            return userMatch;
        })
    },
    taskProjectName: (state, getters, rootState, rootGetters) => (task_id) => {
        let task = getters['getTaskById'](task_id)
        if(task.project_id) {
            let project = rootGetters['projects/getProjectById'](task.project_id)
            if (project) {
                return project.name;
            }
        }
        return ''
    },
    taskClientName: (state, getters, rootState, rootGetters) => (task_id) => {
        let task = getters['getTaskById'](task_id)
        if(task.project_id) {
            let project = rootGetters['projects/getProjectById'](task.project_id);
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

export const tasks: Module<IModuleState, IRootState> = {
  namespaced: true,
    state,
    mutations,

    actions: {
        uploadFile: function(){

            ajax({
                url: '/task/id/upload',
                data: formData,
                type: 'POST',
                contentType: false, // NEEDED, DON'T OMIT THIS (requires jQuery 1.6+)
                processData: false, // NEEDED, DON'T OMIT THIS
                // ... Other options like success and etc
            });
        },
        moveTask: function(context, task){
            ajax('/task/moveTask', task, function(response){
                //TODO: process moved tasks
            });
        },

        updateTask: function(context, task){
            console.log('updateTask');
            var index = context.state.tasks.findIndex(function (search) {
                if(search) //Things break hard without this after deleting a timer
                    return search.id == task.id;
            });

            console.log('trying to update')
            if (index !== -1) {
                //If project_id changed and
                if(context.state.tasks[index].project_id != task.project_id){
                    //Going from one project to another project:
                    if(context.state.tasks[index].project_id){
                        context.commit('moveTasksDown', context.state.tasks[index].project_id);
                        task.order = 1;
                    }
                    context.commit('moveTasksUp', task.project_id);
                }
                console.log('updating task with index '+index);
                console.log(task);
                Vue.set(context.state.tasks, index, task);
            }
        },

        createTask: function (context, task) {
            var self = this;
            ajax('task/add', task, function (response) {
                if(response.task.project_id) {
                    //context.commit('moveTasksUp', response.task.project_id);
                }
                if(response.project && response.project.id) {
                    context.commit('projects/updateProject', response.project, {root: true});
                }
                context.state.tasks.push(response.task);
                context.commit('updateLookup');
                //store.setTaskKeys(self.tasks);
            });
        },
        createLastTask: function(context, task){
            var self = this;
            ajax('task/createLastTask', task, function (response) {
                context.state.tasks.push(response.task);
                context.commit('updateLookup');
            });
        },
        editTask: function (context, task) {
            context.commit('settings/setCurrentEditTask', task, {root: true});
            $('#task-modal').modal({});
            context.commit('settings/setCheckActionStack', true, {root: true});
        },
        setTaskAttribute: function (context, {attribute, value, task_id}) {
            let self = this;
            let task = context.getters['getTaskById'](task_id);
            context.commit('updateTaskAttribute',{task, attribute, value})
            ajax('task/' + attribute + '/ajax/' + task_id, {value: value}, function (response) {
                alert('update')
                //context.commit('update', JSON.parse(JSON.stringify(response.task)));
            })
        },

        startTaskTimer: function (context, task) {
            var self = this;
            task.current_company_id = context.rootState.settings.current_company.id;

            ajax('/timer/start-project-timer', task, function (response) {
                response.timers.forEach(function(timer){
                    context.commit('timers/upsertTimer', timer, {root: true});
                });
                context.commit('timers/upsertTimer', response.timer, {root: true});

            });
        },

        createTaskFromEnter({context, task}: {context: any, task: ITask}){
            console.log(task);
            ajax('/task/createFromEnter', task, function(response: any){
                context.state.tasks.push(response.task);
                context.commit('updateLookup');
                //TODO: move to create Task
                context.state.tasks[context.state.lookup[task.from_id]].next_task_id = response.task.id;
                Vue.nextTick(function(){
                    //alert('tick');
                    $('.task-'+response.task.id).focus();
                })
            })
        },

        saveTaskTitle: function(context, {id, title}){
            ajax('/task/saveTaskTitle', {id: id, title: title}, function(response: any){
                context.state.tasks.find(function(task){
                    if(task.id == id){
                        task.title = title;
                    }
                })
            })
        },

    },
    getters
}


