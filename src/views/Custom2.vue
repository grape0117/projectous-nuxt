<template>
  <div>
    <select v-model="selectedCompanyUser">
      <option
        v-for="(companyUser, i) in sortedCompanyUsers"
        :value="companyUser"
        :id="companyUser.id"
        :key="`${companyUser.id}-${i}`"
      >
        {{ companyUser.name }}
      </option>
    </select>
    <hr />
    <b-container fluid>
      <b-row>
        <b-col cols="3">
          <pj-draggable
            :data="tasksUsers"
            :lists="lists"
            @create="createTaskUser"
            @update="updateTaskUser"
            @taskTimerToggled="onTaskTimerToggled"
          />
        </b-col>
        <b-col cols="3">
          <div class="text-center">
            Projects
          </div>
          <div v-for="(projects, clientId) in projectsByClientId">
            <!--            Todo: change client id to client name-->
            {{ clientName(clientId) }}
            <ul>
              <li
                v-for="{ name, id } in projects"
                @click="selectedProjectId = id"
                class="project-item__name"
              >
                {{ name }}
              </li>
            </ul>
          </div>
        </b-col>
        <b-col v-if="selectedProjectId" cols="6">
          <pj-draggable
            :data="selectedProjectTasksForStatusesColumns"
            :lists="taskPerStatusLists"
            :verticalAlignment="false"
            @create="createTask"
            @update="updateTask"
          />
        </b-col>
      </b-row>
    </b-container>
    <TaskDetails v-if="taskDetailsDisplayed" :taskId="editedTaskId" />
  </div>
</template>
<script>
import { cloneDeep, groupBy } from 'lodash'
import { formatDateToYYYY_MM_DD } from '@/utils/dateFunctions'
import TaskDetails from '@/components/draggable/TaskDetails.vue'


const taskStatuses = ['open', 'in progress', 'closed']

/*    interface ITaskTimerToggle {
        taskId: number | string
        timerId: number | string | null
    }*/

export default {


    data: () => {
        return {
            selectedCompanyUser: null
            selectedProjectId: null,
            editedTaskTimerId: null,
            editedTaskId: null
        }
    },
    components: {
        TaskDetails
    },

    computed: {
        lists: () => {
            return this.selectedCompanyUser ? [] : this.getUserLists(this.selectedCompanyUser.id)
        },
        tasksUsers: () => {
            if (!this.selectedCompanyUser) return []
            return this.sortedByDays(this.selectedCompanyUser.id)
        },
        sortedCompanyUsers: () => {
            return this.companyUsers.sort(
                (
                    { name: nameA },
                    { name: nameB }
                ) => {
                    if (nameA.toLowerCase() > nameB.toLowerCase()) return 1
                    if (nameA.toLowerCase() < nameB.toLowerCase()) return -1
                    return 0
                }
            )
        },
        projectsByClientId: () => {
            const projects = this.getUserProjects(null)
            const listOfProjectsToDisplay = projects
                .filter(project => project.status === 'open')
                .sort((a, b) => a.client_id - b.client_id)
            return groupBy(listOfProjectsToDisplay, 'client_id')
        },
        taskDetailsDisplayed: () => {
            return this.editedTaskId && this.editedTaskTimerId
        },
        selectedProjectTasksForStatusesColumns: () => {
            const projectTasks = this.getTaskByProjectId(this.selectedProjectId)
            return projectTasks.map(({ id, title, status }) => ({
                id,
                title,
                status,
                listId: status
            }))
        },
        taskPerStatusLists: () =>{
            return taskStatuses.map(status => ({
                title: status,
                id: status,
                group: status
            }))
        }

    },
    watch: {
        selectedCompanyUser: {
            if (value) {
                this.$router.push({ query: { user: value.id } }).catch(e => {})
            }
        }  ,
        sortedCompanyUsers: {
            const query = this.$route.query.user
            if (query) {
                const user = users.find(({ id }) => id === +query)
                if (user && !this.selectedCompanyUser) this.selectedCompanyUser = user
            }
        }
    },
    methods: {
        createTask: (title) => {
            this.$store.dispatch('createTaskVuex',{ title, project_id: this.selectedProjectId })
        },
        updateTask: (task) => {
            const taskCopy = cloneDeep(this.getTaskById(task.id)) //TODO remove cloneDeep
            taskCopy.status = task.listId
            taskCopy.sort_order = task.sort_order
            this.$store.dispatch('updateTaskVuex', taskCopy)
        },
        createTaskUser: ({ title, listId }) => {
            let next_work_day = null
            let user_task_list_id = null
            if (listId === 'Past') {
                const date = new Date()
                next_work_day = formatDateToYYYY_MM_DD(
                    new Date(date.setMonth(date.getMonth() - 1))
                )
                //If listId is a date, return that I think
            } else if (!!Date.parse(listId) && isNaN(listId)) {
                next_work_day = formatDateToYYYY_MM_DD(listId)
                //If listId is a number, this is a user-created list
            } else if (Number.isInteger(Number(listId))) {
                //Only user-created lists have a listId set on task_user object
                user_task_list_id = listId
            }
            const task = { title }
            const { id } = this.$store.dispatch('createTaskVuex', task)
            const taskUser = {
                task_id: id,
                next_work_day,
                company_user_id: this.selectedCompanyUser.id,
                user_task_list_id
            }
            this.$store.dispatch('createTaskUserVuex', taskUser)
        },
        updateTaskUser: ({ id, task_id, title, listId, sort_order }) => {
            const taskUser = cloneDeep(this.getTaskUserById(id))
            let newNextWorkDay = null
            if (listId === 'Past') {
                const date = new Date()
                newNextWorkDay = formatDateToYYYY_MM_DD(
                    new Date(date.setMonth(date.getMonth() - 1))
                )
                //If listId is a date, return that I think
            } else if (!!Date.parse(listId) && isNaN(listId)) {
                newNextWorkDay = formatDateToYYYY_MM_DD(listId)
                //If listId is a number, this is a user-created list
            } else if (Number.isInteger(Number(listId))) {
                //Only user-created lists have a listId set on task_user object
                taskUser.user_task_list_id = listId
                //TODO: set next_word_day to null?
            }
            taskUser.next_work_day = newNextWorkDay
            taskUser.sort_order = sort_order
            this.$store.dispatch('updateTaskUserVuex', taskUser) //TODO move to single dispatch
            const task = cloneDeep(this.getTaskById(task_id))
            if (task.title !== title) {
                task.title = title
                this.dispatch('updateTaskVuex', task)
            }
        },
        onTaskTimerToggled: (payload) => {
            const { taskId, timerId } = payload
            this.editedTaskId = taskId
            this.editedTaskTimerId = timerId
        }
    },
}
</script>
<style>
.project-item__name {
  cursor: pointer;
}

.project-item__name:hover {
  color: blue;
}
</style>
