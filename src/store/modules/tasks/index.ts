import { Module } from 'vuex'
import Vue from 'vue'
import { IRootState } from '@/store/types'
import { IModuleState } from './types'
import { ITask } from './types'
import { actions } from './actions'
import { getters } from './getters'
import { mutations } from './mutations'
//import { EventBus } from '../event-bus';

const state = {
  tasks: []

}
export const tasks: Module<IModuleState, IRootState> = {
  namespaced: true,
    state: {
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
    },
    mutations: {
        load: function (state, tasks) {
            Vue.set(state, 'tasks', []);
            tasks.forEach(function (value: any, key: number) {
                if (!state.lookup[tasks[key].id]) {
                    state.tasks.push(value);
                } else {
                    state.tasks[state.lookup[tasks[key].id]] = value;
                }
            });

            state.lookup = [];
            state.tasks.forEach(function (task, key) {
                state.lookup[task.id] = key;
            })
            //EventBus.$emit('refresh')
        },
        /*task_user_delete: function(state, object){
            var table = 'tasks';

            console.log('deleting')
            var key = state.lookup[object.task_id];
            console.log(key);
            var found = state[table][key].users.findIndex(function(user){
                console.log(user);
                console.log(user.id);
                console.log(object);
                console.log(object.company_user_id);
                return user.id == object.company_user_id;
            })
            console.log(found);
            if(found){
                console.log('found')
                console.log(state[table][key].users)
                console.log(state[table][key].users[found]);
                delete state[table][key].users[found];
                console.log(state[table][key].users)
            } else {
                console.log('task user '+ object.id +' not found');
            }
        },*/
        /*task_user_upsert: function(state, object){
            var table = 'tasks';

            var key = state.lookup[object.task_id];
            var found = state[table][key].users.findIndex(function(user){
                return user.id == object.id;
            })
            if(found){
                //Loop through properties
                for(var property in object) {
                    if (object.hasOwnProperty(property)) {
                        state[table][key].users[found][property] = object[property];
                    }
                }
                console.log(state[table][key].users[found]);
            } else if(key) {
                console.log(state[table][key].users);
                state[table][key].users.push(object);
            } else {
                console.log('task not found to update task user');
            }
        },*/
        upsert_displayed_tasks: function(state, object){
            let day;
            let date_plus0 = getNextDate(0);
            let date_plus1 = getNextDate(1);
            let date_plus2 = getNextDate(2);
            let date_plus3 = getNextDate(3);
            let date_plus4 = getNextDate(4);
            let date_plus5 = getNextDate(5);
            let date_plus6 = getNextDate(6);
            if(!object.next_work_day){
                day = 0;
            }  else if(object.next_work_day == date_plus0){
                day = 0;
            }  else if(object.next_work_day == date_plus1){
                console.log(object);
                day = 1;
            }  else if(object.next_work_day == date_plus2){
                day = 2;
            }  else if(object.next_work_day == date_plus3){
                day = 3;
            }  else if(object.next_work_day == date_plus4){
                day = 4;
            }  else if(object.next_work_day == date_plus5){
                day = 5;
            }  else if(object.next_work_day == date_plus6){
                day = 6;
            } else if(object.next_work_day.replace('-','') < date_plus0.replace('-','')){
                day = 0;
            } else {
                return; //Scheduled in the future
            }

            var table = 'displayed_tasks_plus' + day;

            var key = state.lookup[object.id];
            if(key){
                //Loop through properties
                for(var property in object) {
                    if (object.hasOwnProperty(property)) {
                        console.log(state[table][key]);
                        state.tasks[key][property] = object[property];
                    }
                }
            } else {
                state.tasks.push(object);
                //TODO: I'm tempted to use state[table].length - 1, but maybe if elements are removed, they key won't match the length.
                state.lookup[object.id] = state.tasks.findIndex(function(item){
                    return item.id == object.id;
                });
            }
        },
        upsert: function(state, object){
            var table = 'tasks';

            var key = state.lookup[object.id];
            if(key){
                //Loop through properties
                for(var property in object) {
                    if (object.hasOwnProperty(property)) {
                        console.log(state[table][key]);
                        state[table][key][property] = object[property];
                    }
                }
            } else {
                state[table].push(object);
                //TODO: I'm tempted to use state[table].length - 1, but maybe if elements are removed, they key won't match the length.
                state.lookup[object.id] = state[table].findIndex(function(item){
                    return item.id == object.id;
                });
            }
////            EventBus.$emit('refresh')
        },
        update: function(state, task){
            //We only want to update what we're passed back. We can pass back partial objects if we want to.
            for (var key in task) {
                state.tasks[state.lookup[task.id]][key] = task[key];
            }
            //EventBus.$emit('refresh')
        },
        create: function(state, task){
            state.tasks.push(task);
            state.tasks.forEach(function (task, key) {
                state.lookup[task.id] = key;
            })
            //EventBus.$emit('refresh')
        },
        delete: function(state, task){
            Vue.delete(state.tasks, state.lookup[task.id]);
            state.tasks.forEach(function (task, key) {
                state.lookup[task.id] = key;
            })
        },
        updateLookup: function(state){
            state.lookup = [];
            state.tasks.forEach(function (task, key) {
                state.lookup[task.id] = key;
            })
        },
        updateTaskAttribute: function (state, {task, attribute, value}) {
            Vue.set(state.tasks[state.lookup[task.id]], attribute, value);
            //EventBus.$emit('refresh')
        },
        markForToday: function (state, task_id) {
            var taskKey = state.lookup[task_id];
            state.tasks[taskKey].for_today = 1;
            var today = new Date();
            state.tasks[taskKey].next_work_day = today.getFullYear()+'-'+(today.getMonth()+1)+'-'+today.getDate();
            //EventBus.$emit('refresh')
        },
        markNotForToday: function (state, task_id) {
            var taskKey = state.lookup[task_id];
            state.tasks[taskKey].for_today = 0;
            state.tasks[taskKey].next_work_day = null;
            //EventBus.$emit('refresh')
        },
        /*updateOrder: function(state, tasks){
            tasks.forEach(function (task, key) {
                state.tasks.find(function(row){
                    console.log(task.id+' - '+task.order);
                    return task.id == row.id;
                }).order = task.order;
            });
        },*/
        moveTasksUp: function(state, project_id){
            state.tasks.forEach(function(task, index) {
                if (task.project_id == project_id) {
                    state.tasks[index].order++;
                    console.log(state.tasks[index].id+' '+state.tasks[index].order);
                }
            });
            //EventBus.$emit('refresh')
        },
        moveTasksDown: function(state, project_id){
            state.tasks.forEach(function(task, index) {
                if (task.project_id == project_id) {
                    state.tasks[index].order--;
                    console.log(state.tasks[index].id+' '+state.tasks[index].order);
                }
            });
            //EventBus.$emit('refresh')
        },
        /*
        Going from `order` 10 to `order` 5 for example
         */

        /*setTaskId: function(state, task){
            //console.log(state.tasks);
            var index = state.tasks.findIndex(function(row){
                if(row.project_id != task.project_id){
                    return false;
                }
                if(row.order == task.order && !row.id){
                    //console.log(task.order);
                    //console.log(row);
                    return true;
                }
                return false;
            })
            //console.log(index);
            //labeledConsole('index', state.tasks[index]);
            for (var property in task) {
                if (task.hasOwnProperty(property)) {
                    console.log(property);
                    Vue.set(state.tasks[index], property, task[property]);
                }
            }
            //state.tasks[index] = task;
        }*/
    },
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
        updatePriorityTaskLists: function(context){
            let hold_tasks = [];
            let active_tasks = [];
            let when_possible_tasks = [];
            let this_week_tasks = [];
            let today_tasks = [];
            context.state.tasks.forEach(function(task){
                switch(task.priority){
                    case 'hold':
                        hold_tasks.push(task);
                        break;
                    case 'active':
                        active_tasks.push(task);
                        break;
                    case 'when possible':
                        when_possible_tasks.push(task);
                        break;
                    case 'this week':
                        this_week_tasks.push(task);
                        break;
                    case 'today':
                        today_tasks.push(task);
                        break;
                }
            })
            Vue.set(state, 'hold_tasks', hold_tasks);
            Vue.set(state, 'active_tasks', active_tasks);
            Vue.set(state, 'when_possible_tasks', when_possible_tasks);
            Vue.set(state, 'this_week_tasks', this_week_tasks);
            Vue.set(state, 'today_tasks', today_tasks);
            console.log('setting priority task lists');
        },
        /*        moveUp: function(context, {task, moveTo}){
                    if(!task.previous_task_id) {
                        return;
                    }

                    var beforeTask = context.state.tasks[state.lookup[task.previous_task_id]];

                    //Set first task for project
                    if(!beforeTask.previous_task_id){
                        context.rootState.projects.projects.find(function(project){
                            return project.id == task.project_id;
                        }).first_task_id = task.id;
                    }
                    beforeTask.previous_task_id = task.id;
                    beforeTask.next_task_id = task.next_task_id;

                    if(task.next_task_id) {
                        var afterTask = context.state.tasks[state.lookup[task.next_task_id]];
                        afterTask.previous_task_id = beforeTask.id;
                    }

                    task.previous_task_id = beforeTask.previous_task_id;
                    task.next_task_id = beforeTask.id;
                },*/
        /*
        Going from 5 -> 10
         */
        /*moveDown: function(state, {task, moveTo}){
            //TODO: adjust for visibility and role and skip over not visible tasks
            if(!task.next_task_id) {
                return;
            }

            var afterTask = context.state.tasks[state.lookup[task.previous_task_id]];

            afterTask.previous_task_id = task.previous_task_id;
            afterTask.next_task_id = task.id;

            if(task.previous_task_id) {
                var beforeTask = context.state.tasks[state.lookup[task.next_task_id]];
                beforeTask.next_task_id = afterTask.id;
            } else {
                context.rootState.projects.projects.find(function(project){
                    return project.id == task.project_id;
                }).first_task_id = afterTask.id;
            }

            task.previous_task_id = afterTask.id;
            task.next_task_id = afterTask.next_task_id;
        },*/
        moveAbove: function(context, {task_id, target_task_id}){
            var task = context.getters['getTaskById'](task_id);
            var below_drop = context.getters['getTaskById'](target_task_id);
            if(!below_drop) {
                alert('Something is wrong. Let Stéphane know.');
            }
            var above_drop = context.getters['getTaskById'](below_drop.previous_task_id);
            if(task.previous_task_id) {
                var previous_previous = context.getters['getTaskById'](task.previous_task_id);
            }
            if(task.next_task_id) {
                var previous_next = context.getters['getTaskById'](task.next_task_id);
            }
            /*console.log(above_drop.id+' => '+above_drop.next_task_id);
            console.log(below_drop.id+' => '+below_drop.previous_task_id);
            console.log('');
            console.log(task.previous_task_id+' => '+task.id);
            console.log(task.id+' => '+task.next_task_id);*/

            var message = '';
            if(above_drop) {
                message += above_drop.id+ ' => ';
            }
            message += task.id;
            if(below_drop) {
                message += ' => '+below_drop.id;
            }
            /*if(!confirm(message)){
                return;
            }*/


            //Remove task from previous place
            if(previous_previous) {
                context.commit('updateTaskAttribute', {
                    task: previous_previous,
                    attribute: 'next_task_id',
                    value: task.next_task_id
                });
            }
            if(previous_next) {
                context.commit('updateTaskAttribute', {
                    task: previous_next,
                    attribute: 'previous_task_id',
                    value: task.previous_task_id
                });
            }

            //Move into place
            context.commit('updateTaskAttribute', {task: task, attribute: 'next_task_id', value: below_drop.id});
            context.commit('updateTaskAttribute', {task: task, attribute: 'previous_task_id', value: below_drop.previous_task_id});

            //Adjust surrounding tasks
            if(above_drop) {
                context.commit('updateTaskAttribute', {task: above_drop, attribute: 'next_task_id', value: task.id});
            } else {
                context.dispatch('projects/updateFirstTask', task, {root: true});
            }
            context.commit('updateTaskAttribute', {task: below_drop, attribute: 'previous_task_id', value: task.id});

            /*console.log(above_drop.id+' => '+above_drop.next_task_id);
            console.log(below_drop.previous_task_id+' => '+below_drop.id);
            console.log('');
            console.log(task.previous_task_id+' => '+task.id);
            console.log(task.id+' => '+task.next_task_id);*/

            ajax('/task/moveAbove', {task_id: task.id, moveAbove: below_drop.id}, function(response){
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
        removeFromListAjax: function(context, task){
            ajax('/task/removeFromListAjax/'+task_id,{position: moveTo}, function(response) {

            });
        },
        removeFromList: function(context, task){
            let change = [];
            console.log('remove', 'task', task, 'task position', task.order, 'position', task.position);
            //if new position is up move from new to old +1
            context.state.tasks.forEach(function(item){
                if(item.project_id != task.project_id) {
                    return false;
                }
                if(item.priority != task.priority) {
                    return false;
                }
                if(item.status == 'closed' || item.status == 'completed'){
                    return false;
                }
                if(item.id == task.id){
                    context.dispatch('setTaskAttribute', {attribute: 'priority', value: task.priority, task_id: item.id});
                    context.dispatch('setTaskAttribute', {attribute: 'order', value: task.position, task_id: item.id});
                }


                // ===>2 means 2=>3,3=>4,4=>5 ...
                console.log(item.order+' >= '+task.position+' && '+item.order+' < '+task.order)
                if(item.order >= task.position){
                    change.push({task_id: item.id, order: item.order + 1});
                }
            })

            console.log(change);
            change.forEach(function(item){
                context.dispatch('setTaskAttribute', {attribute: 'order', value: item.order, task_id: item.task_id});
            })
        },
        moveToPositionInList: function(context, {'task': task, 'tasks': tasks}){

        },
        moveToListPosition: function (context, task) {
            let change = [];
            console.log('moveToListPosition', 'task', task, 'task position', task.order, 'position', task.position);
            //if new position is up move from new to old +1
            context.state.tasks.forEach(function (item) {
                if (item.project_id != task.project_id) {
                    return false;
                }
                if (item.priority != task.priority) {
                    return false;
                }
                if (item.status == 'closed' || item.status == 'completed') {
                    return false;
                }
                if (item.id == task.id) {
                    console.log('task matched')
                    context.dispatch('setTaskAttribute', {
                        attribute: 'priority',
                        value: task.priority,
                        task_id: item.id
                    });
                    context.dispatch('setTaskAttribute', {attribute: 'order', value: task.position, task_id: item.id});
                }


                // ===>2 means 2=>3,3=>4,4=>5 ...
                console.log(item.order + ' >= ' + task.position + ' && ' + item.order + ' < ' + task.order)
                if (item.order >= task.position) {
                    change.push({task_id: item.id, order: item.order + 1});
                }
            })

            console.log(change);
            change.forEach(function (item) {
                context.dispatch('setTaskAttribute', {attribute: 'order', value: item.order, task_id: item.task_id});
            })
        },
        moveToPosition: function(context, {task, position}){
            let change = [];
            console.log('moveToPosition', 'task', task, 'task position', task.order, 'position', position);
            //if new position is up move from new to old +1
            context.state.tasks.forEach(function(item){
                if(item.project_id != task.project_id) {
                    return false;
                }
                if(item.priority != task.priority) {
                    return false;
                }
                if(item.status == 'closed' || item.status == 'completed'){
                    return false;
                }
                if(item.id == task.id){
                    context.dispatch('setTaskAttribute', {attribute: 'order', value: position, task_id: item.id});
                }

                if(task.order < position) {
                    console.log('moving vertically down');
                    //2===>5 means 3=>2,4=>3,5=>4
                    console.log(item.id + ': ' + item.order + ' <= ' + position + ' && ' + item.order + ' > ' + task.order)
                    if (item.order <= position && item.order > task.order) {
                        console.log(item.project_id)
                        console.log(item.priority)
                        console.log(item.order)
                        change.push({task_id: item.id, order: item.order - 1});
                        //context.dispatch('setTaskAttribute', {attribute: 'order', value: item.order - 1, task_id: item.id});
                    }
                    //if new position is down move from old to new -1
                } else {
                    console.log('moving vertically up from '+task.order+' to '+position)
                    //5===>2 means 2=>3,3=>4,4=>5
                    console.log(item.order+' >= '+position+' && '+item.order+' < '+task.order)
                    if(item.order >= position && item.order < task.order){
                        console.log('moving')
                        change.push({task_id: item.id, order: item.order + 1});
                        //context.dispatch('setTaskAttribute', {attribute: 'order', value: item.order + 1, task_id: item.id});
                    }
                }
            })

            console.log(change);
            change.forEach(function(item){
                context.dispatch('setTaskAttribute', {attribute: 'order', value: item.order, task_id: item.task_id});
            })
        },
        /*moveTo: function(context, {task_id, moveTo}){
            var task = context.state.tasks.find(function(row){
                return row.id == task_id;
            })
            if(task.order > moveTo){
                console.log('moveUp');
                context.commit('moveUp', {task, moveTo});
            } else if(task.order < moveTo){
                console.log('moveDown');
                context.commit('moveDown', {task, moveTo});
            } else {
                console.log('Error: Trying to move to same position!');
            }

            ajax('/task/move/'+task_id,{position: moveTo}, function(response){
               //self.$store.commit('tasks/updateOrder', response.tasks);
            })

        },*/
        saveNote: function(context, task){
            ajax('task/saveNote', task, function(response){
                context.dispatch('updateTask', JSON.parse(JSON.stringify(response.task)));
            })
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
        /*getKey: function (context, object) {
            return this.getKeyById(object.id);
        },
        getKeyById: function (context, object_id) {
            return this.state.lookup[object_id];
        },
        getTaskTitle: function (context, task_id) {
            //TODO:
        },*/
        markForToday: function (context, task_id) {
            var self = this;
            ajax('task/for-today/ajax/' + task_id, {}, function () {
                context.commit('markForToday', task_id);
            });
        },
        markNotToday: function (context, task_id) {
            var self = this;
            ajax('task/not-today/ajax/' + task_id, {}, function () {
                context.commit('markNotForToday', task_id);

            });
        },
        turnIn: function (task_id, user_id) {
            ajax('task/turn-in', {task_id: task_id, user_id: user_id}, function (response) {
                //TODO:
            });
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
        saveTask: function (context, task) {
            labeledConsole('task', task);
            //context.dispatch('updateTask', task);
            ajax('/task/save/ajax', task, function (response) {
                //return;
                //alert('updating task')
                context.dispatch('updateTask', JSON.parse(JSON.stringify(response.task)));
                context.dispatch('settings/closeModal', {modal: 'task', object: response.task, pop: true, push: false}, {root: true});
                context.commit('settings/setCheckActionStack', true, {root: true});
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
        /*createPriorityTaskFromEnter: function(context, task){
            console.log(task);
            ajax('/task/createFromEnter', task, function(response){
                context.state.tasks.push(response.task);
                context.commit('updateLookup');
                //TODO: move to create Task
                context.state.tasks[context.state.lookup[task.from_id]].next_task_id = response.task.id;
                Vue.nextTick(function(){
                    //alert('tick');
                    $('.task-'+response.task.id).focus();
                })
            })
        },*/
        saveTaskTitle: function(context, {id, title}){
            ajax('/task/saveTaskTitle', {id: id, title: title}, function(response: any){
                context.state.tasks.find(function(task){
                    if(task.id == id){
                        task.title = title;
                    }
                })
            })
        },
        moveStatusForward: function(context, task_id){
            let task = context.getters['getTaskById'](task_id);
            switch(task.status){
                case 'open':
                    //if(context.getters['settings/isAdmin']){
                    context.dispatch('setTaskAttribute', {attribute: 'status', value: 'closed', task_id: task_id});
                    //} else {
                    //    context.dispatch('setTaskAttribute', {attribute: 'status', value: 'turned-in', task_id: task_id});
                    //}
                    break;
                case 'turned-in':
                    context.dispatch('setTaskAttribute', {attribute: 'status', value: 'closed', task_id: task_id});
                    break;
                case 'closed':
                    context.dispatch('setTaskAttribute', {attribute: 'status', value: 'open', task_id: task_id});
                    break;
            }
        },
    },
    getters: {
        topProjectTasks: (state, getters) => (project_id) => {
            //Get tasks in order
            return getters['project_tasks'](project_id).filter(function(task){

            }).sort(function(a,b){

            });
        },
        byPriority: (state) => (priority) => {
            return state.tasks.filter(function(task){
                return task.priority == priority;
            });
        },
        priorityHold: (state) => (priority) => {
            return state.tasks.filter(function(task){
                return task.priority == 'hold';
            });
        },
        priorityActive: (state) => (priority) => {
            return state.tasks.filter(function(task){
                return task.priority == 'active';
            });
        },
        priorityWhenPossible: (state) => (priority) => {
            return state.tasks.filter(function(task){
                return task.priority == 'when possible';
            });
        },
        priorityThisWeek: (state) => (priority) => {
            return state.tasks.filter(function(task){
                return task.priority == 'this week';
            });
        },
        priorityToday: (state) => (priority) => {
            return state.tasks.filter(function(task){
                return task.priority == 'today';
            });
        },

        getCompanyTasks: (state, getters, rootState, rootGetters) => {
            var project_ids = [];
            rootGetters['projects/open_mycompany_projects'].forEach(function(project){
                project_ids.push(project.id);
            })

            return state.tasks.filter(function(task){
                if(task.status == 'closed'){
                    return false;
                }
                return project_ids.indexOf(task.project_id) !== -1;
            })
        },
        getTaskById: (state, getters) => (id) => {
            var task;
            if(task = state.tasks[state.lookup[id]]){
                return task;
            } else if (id) {

                return state.tasks.find(task => task.id === id);
            }
        },
        admin_filtered_tasks: (state, getters, rootState, rootGetters) => (user_id) => {
            if(!user_id){
                return getters['all_tasks'];
            }
            var current_company_user = rootGetters['settings/current_company_user'];
            if(!current_company_user){
                return [];
            }
            return getters['all_tasks'].filter(function (task) {
                var userMatch = false;
                task.users.forEach(function (user, index) {
                    if (user.id == user_id && rootGetters['settings/current_company_user'].user_role == 'admin') {
                        userMatch = true;
                        return false;
                    }
                });
                return userMatch;
            })
        },
        project_tasks: (state, getters, rootState, rootGetters) => (project_id) => {
            var project = rootGetters['projects/getProjectById'](project_id);
            if(!project){
                return [];
            }
            var tasks = [];
            var task_ids = [];
            var next_task_id = project.first_task_id;
            var task;
            /*return state.tasks.filter(function(task){
                return task.project_id == project_id;
            })*/
            while(next_task_id){
                task = getters['getTaskById'](next_task_id);
                if(!task || task_ids.indexOf(task.id) != -1){
                    break;
                }
                tasks.push(task);
                task_ids.push(task.id);
                next_task_id = task.next_task_id;
            }
            //console.log(tasks);

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
        filtered_tasks: (state, getters, rootState, rootGetters) => (user_id) => {
            if(!user_id){
                return getters['all_tasks'];
            }
            return getters['all_tasks'].filter(function (task) {
                var userMatch = false;
                var project = rootGetters['projects/getProjectById'](task.project_id);
                if(project) {
                    project.users.forEach(function (user) {
                        if (user.id == user_id) {
                            userMatch = true;
                            return false;
                        }
                    });
                }
                task.users.forEach(function (user, index) {
                    if (user.id == user_id) {
                        userMatch = true;
                        return false;
                    }
                });
                return userMatch;
            })
        },
        tasks_due: (state, getters, rootState, rootGetters) => {
            var direction = -1; //TODO: how to trigger this
            var sort = 'due_date';
            var task_filter = '';
            console.log('getting tasks')
            return state.tasks.filter(function (task) {
                if (task.status == 'closed') {
                    return false;
                }
                if(!task.due_date){
                    return false;
                }
                let project = rootGetters['projects/getProjectById'](task.project_id);
                console.log(project);
                if(!project){
                    return false;
                }
                let client = rootGetters['company_clients/getCompanyClientByClientId'](project.client_id);
                if(client.status != 'active'){
                    return false;
                }
                if(project.status != 'open'){
                    return false;
                }

                return true;
            }).sort(function (a, b) {
                console.log('sorting')
                /*if (self.direction == 'asc') {
                 direction = -1;
                 } else {
                 direction = 1;
                 }*/
                if (sort == 'task') {
                    if (a.title.toLowerCase() < b.title.toLowerCase()) return -1 * direction;
                    if (a.title.toLowerCase() > b.title.toLowerCase()) return 1 * direction;
                    return 0;
                } else if (sort == 'project') {
                    var aProjectName = '';//a.project_id ? self.taskProjectName(a.project_id) : '';
                    var bProjectName = '';//b.project_id ? self.taskProjectName(b.project_id) : '';
                    if (aProjectName.toLowerCase() < bProjectName.toLowerCase()) return -1 * direction;
                    if (aProjectName.toLowerCase() > bProjectName.toLowerCase()) return 1 * direction;
                    return 0;
                } else if (sort == 'client') {
                    var aClientName = '';//a.project_id ? self.taskClientNameFromProject(a.project_id) : '';
                    var bClientName = '';//b.project_id ? self.taskClientNameFromProject(b.project_id) : '';
                    if (aClientName.toLowerCase() < bClientName.toLowerCase()) return -1 * direction;
                    if (aClientName.toLowerCase() > bClientName.toLowerCase()) return 1 * direction;
                    return 0;
                } else if (sort == 'priority') {
                    return b.for_today - a.for_today;
                } else if (sort == 'due_date') {
                    let result = (new Date(a.due_date) - new Date(b.due_date));
                    console.log(result, new Date(a.due_date), new Date(b.due_date))
                    return result;
                } else if (sort == 'created') {
                    return (new Date(b.created_at) - new Date(a.created_at)) * direction;
                } else if (sort == 'assigned') {
                    var aUserName = '';
                    $.each(a.users, function (index, user) {
                        aUserName = user.name;
                        return false;
                    });
                    var bUserName = '';
                    $.each(b.users, function (index, user) {
                        bUserName = user.name;
                        return false;
                    });
                    if (aUserName.toLowerCase() < bUserName.toLowerCase()) return -1 * direction;
                    if (aUserName.toLowerCase() > bUserName.toLowerCase()) return 1 * direction;
                    return 0;
                }
            });
        },
        all_tasks: (state, getters, rootState) => {
            var self = this;
            var direction = 1; //TODO: how to trigger this
            var sort = 'task';
            var task_filter = '';
            return state.tasks.filter(function (task) {
                if (task.status == 'closed') {
                    return false;
                }

                return true;
            }).sort(function (a, b) {
                /*if (self.direction == 'asc') {
                 direction = -1;
                 } else {
                 direction = 1;
                 }*/
                if (self.sort == 'task') {
                    if (a.title.toLowerCase() < b.title.toLowerCase()) return -1 * direction;
                    if (a.title.toLowerCase() > b.title.toLowerCase()) return 1 * direction;
                    return 0;
                } else if (self.sort == 'project') {
                    var aProjectName = '';//a.project_id ? self.taskProjectName(a.project_id) : '';
                    var bProjectName = '';//b.project_id ? self.taskProjectName(b.project_id) : '';
                    if (aProjectName.toLowerCase() < bProjectName.toLowerCase()) return -1 * direction;
                    if (aProjectName.toLowerCase() > bProjectName.toLowerCase()) return 1 * direction;
                    return 0;
                } else if (self.sort == 'client') {
                    var aClientName = '';//a.project_id ? self.taskClientNameFromProject(a.project_id) : '';
                    var bClientName = '';//b.project_id ? self.taskClientNameFromProject(b.project_id) : '';
                    if (aClientName.toLowerCase() < bClientName.toLowerCase()) return -1 * direction;
                    if (aClientName.toLowerCase() > bClientName.toLowerCase()) return 1 * direction;
                    return 0;
                } else if (self.sort == 'priority') {
                    return b.for_today - a.for_today;
                } else if (self.sort == 'due_date') {
                    return (new Date(b.due_date) - new Date(a.due_date)) * direction;
                } else if (self.sort == 'created') {
                    return (new Date(b.created_at) - new Date(a.created_at)) * direction;
                } else if (self.sort == 'assigned') {
                    var aUserName = '';
                    $.each(a.users, function (index, user) {
                        aUserName = user.name;
                        return false;
                    });
                    var bUserName = '';
                    $.each(b.users, function (index, user) {
                        bUserName = user.name;
                        return false;
                    });
                    if (aUserName.toLowerCase() < bUserName.toLowerCase()) return -1 * direction;
                    if (aUserName.toLowerCase() > bUserName.toLowerCase()) return 1 * direction;
                    return 0;
                }
            });
        },
        taskProjectName: (state, getters, rootState) => (project_id) => {
            var found = rootState.projects.projects.find(function (project) {
                return project_id == project.id;
            });
            if (found) {
                return found.name;
            }
        },
        taskProjectStarted: (state, getters, rootState) => (project_id) => {
            var project = rootState.projects.projects.find(function (project) {
                return project_id == project.id;
            });
            if (project) {
                return project.created_at;
            }
        },
        taskClientNameFromProject: (state, getters, rootState, rootGetters) => (project_id) => {
            if (!project_id) {
                return '';
            }

            var client = rootState.projects.projects.find(function (project) {
                return project_id == project.id;
            });

            if(!client){
                return '';
            }

            var client = rootGetters['company_clients/getCompanyClientByClientId'](client.client_id)

            if (client) {
                return client.name;
            }
        },
        isAssigned: (state, getters, rootState) => (task_users) => {
            labeledConsole('rootState', rootState);
            if (getters['settings/isAdmin']) {
                return true;
            }
            var assigned = false;
            task_users.forEach(function (task_user) {
                if (task_user.company_user_id == rootState.settings.current_company_user.id) {
                    assigned = true;
                    return false;
                }
            })
            return assigned;
        },

        filter_task_count: (state, getters) => (user_id) => {
            var user_tasks = getters['filtered_tasks'](user_id);
            return user_tasks ? user_tasks.length : 0;
        },

        filtered_tasks_today: (state, getters) => (user_id) => {
            return getters['filtered_tasks'](user_id).filter(function (task) {
                return task.for_today == 1;
            })
        },
        all_tasks_today: (state, getters) => {
            return getters['all_tasks'].filter(function (task) {
                return task.for_today == 1;
            })
        },
        forToday: (state) => (task) => {
            return task.for_today == 1 || task.next_work_day;
        },
        notToday: (state) => (task) => {
            return task.for_today != 1 && !task.next_word_day;
        },
        projecttasks: (state) => (project_id) => {
            return state.tasks.filter(function(task){
                return task.project_id == project_id;
            })
        },
        importantProjectTasks: (state, getters, rootState, rootGetters) => (project) => {
            project = rootGetters['projects/getProjectById'](project.id);
            console.log(project.first_task_id);
            var task_trigger = state.tasks;

            if(!project.first_task_id) {
                return [];
            }

            var first_task = getters['getTaskById'](project.first_task_id);
            if(!first_task){
                return [];
            }

            var tasks = getters['getNextTask'](first_task);
            /*                console.log(tasks);

                        if(!tasks.length){
                            tasks.push(first_task);
                        }
                        console.log(tasks);*/
            //console.log(tasks);

            tasks = tasks.filter(function(task){
                if(task.status != 'open'){
                    return false;
                }
                return (task.due_date || task.next_work_day);
            });

            //tasks.push(first_task);
            //console.log(tasks);
            return tasks;
        },
        getNextTask: (state, getters) => (task) => {
            var tasks = [];
            /*                if(typeof task == 'undefined' || task.status != 'open'){
                            return [];
                        }*/
            //if(task.due_date || task.next_work_day){
            tasks.push(task);
            //}

            if(task.next_task_id){
                var next_task = getters['getTaskById'](task.next_task_id);
                if(next_task) {
                    tasks = tasks.concat(getters['getNextTask'](next_task));
                }
            }

            return tasks;
        },
        updatePriorityTaskLists: function(state){
            let completed_tasks = [];
            let hold_tasks = [];
            let active_tasks = [];
            let when_possible_tasks = [];
            let this_week_tasks = [];
            let today_tasks = [];
            state.tasks.forEach(function(task){
                if(task.status == 'closed'){
                    completed_tasks.push(task);
                } else {
                    switch (task.priority) {
                        case 'hold':
                            hold_tasks.push(task);
                            break;
                        case 'active':
                            active_tasks.push(task);
                            break;
                        case 'when possible':
                            when_possible_tasks.push(task);
                            break;
                        case 'this week':
                            this_week_tasks.push(task);
                            break;
                        case 'today':
                            today_tasks.push(task);
                            break;
                    }
                }
            })
            Vue.set(state, 'completed_tasks', completed_tasks);
            Vue.set(state, 'hold_tasks', hold_tasks);
            Vue.set(state, 'active_tasks', active_tasks);
            Vue.set(state, 'when_possible_tasks', when_possible_tasks);
            Vue.set(state, 'this_week_tasks', this_week_tasks);
            Vue.set(state, 'today_tasks', today_tasks);
            console.log('setting priority task lists');
        },
    }
}

function getNextDate(days) {
    let nextDay = new Date();
    nextDay.setDate(nextDay.getDate() + days);

    let month = nextDay.getMonth() + 1;
    let day = nextDay.getDate();
    let year = nextDay.getFullYear();

    if (month < 10) {
        month = "0" + month
    }
    if (day < 10) {
        day = "0" + day
    }

    return year + '-' + month + '-' + day;
}

