<template>
  <div v-else class="show-task">
    <div class="left-section">
      <div class="task-detail-top-buttons">
        <button @click="saveTask()">Close (ESC)</button>
        <b-button class="action-button" variant="outline-success" @click="completeTask()">
          <span>Complete</span>
        </b-button>
        <b-button class="action-button" variant="outline-danger" @click="deleteTask">
          <span>Delete</span>
        </b-button>
      </div>
      <b-tabs content-class="mt-3" style="margin-top: 10px;">
        <b-tab title="Details" active>
          <b-form-group label="Task">
            <b-form-textarea type="text" v-model="show_task.title" placeholder="Task Title" rows="2" max-rows="4"> </b-form-textarea>
          </b-form-group>
          <b-form-group label="Resources">
            <div @click="onSelectResource(resource)" v-for="(resource, resourceIndex) in getResources" :key="resourceIndex" :href="resource.href">
              <div class="resource-title">
                <span>{{ resource.name }}</span>
              </div>
              <div class="resource-action" style="float: right">
                <a href="#" @click="onDeleteResource(resource)">delete</a>
              </div>
            </div>
            <b-button style="float: right" variant="primary" @click="onAddNewResource()">Add new</b-button>
            <b-input-group>
              <b-form-input placeholder="Label" type="text" id="add-resource-name"></b-form-input>
              <b-form-input placeholder="https://" type="text" id="add-resource-href"></b-form-input>
              <b-input-group-append>
                <b-button variant="primary" @click="addResource()">
                  <span v-if="!isEditResource">Add</span>
                  <span v-else>Update</span>
                </b-button>
              </b-input-group-append>
            </b-input-group>
          </b-form-group>
          <div class="form-section">
            Project:
            <select id="timer-modal-project-id" class="form-control select2-select" name="project_id" v-on:change="isCreateProject()" v-model="show_task.project_id"
              >{{
                show_task.project_id
              }}
              <option value="" selected>***** Select Project *****</option>
              <option value="create">Create New Project </option>
              <optgroup :label="client.name" v-bind:client="client" v-for="client in clients" :key="client.id">
                <option v-for="project in openprojects(client)" :key="project.id" v-bind:client="client" :value="project.id"> {{ client_name(project.client_company_id) }} - {{ project.name }} </option>
              </optgroup>
            </select>
          </div>
          <input type="file" @change="Images_onFileChanged" /><button @click="Images_onUpload">Upload!</button>

          <div class="form-section">
            Assigned to:
            <select id="task-user" class="form-control select2-select" name="task_user" v-on:change="switchAssignedUser">
              <option value="" selected>***** Select User *****</option>
              <option v-for="company_user in company_users" :key="company_user.id" v-bind:company_user="company_user" :value="company_user.id"> {{ company_user.name }} </option>
            </select>
          </div>

          <div class="form-group">
            <label class="control-label col-sm-4">Task Type: </label>
            <div class="col-sm-8">
              <select class="form-control select2-select" name="project_id" :value="show_task.settings && show_task.settings.task_type ? show_task.settings.task_type : ''" @input="e => (task['settings']['task_type'] = e.target.value)">
                <option value="">***** Select Task Type *****</option>
                <option>Habit</option>
                <option>Appointment</option>
                <option>Recurring</option>
                <option>Meeting</option>
              </select>
            </div>
          </div>

          <div class="form-group">
            <label class="control-label col-sm-4" for="taskDueDate">Due Date: </label>
            <div class="col-sm-8">
              <input id="taskDueDate" class="form-control" type="date" name="due_at" placeholder="Due Date" v-model="show_task.due_date" />
            </div>
          </div>

          <div class="form-group">
            <label class="control-label col-sm-4" for="taskEditEstimate">Estimate: </label>
            <div class="col-sm-8">
              <input id="taskEditEstimate" class="form-control" type="text" name="estimate" placeholder="Estimate" v-model="show_task.estimate" />
            </div>
          </div>

          <div class="form-group">
            <label class="control-label col-sm-4" for="taskEditEstimate">Status: </label>
            <div class="col-sm-8">
              <select class="form-control" v-model="show_task.status">
                <option value="open">Open</option>
                <option value="turned-in">Turned-In</option>
                <option value="reviewed">Reviewed</option>
                <option value="completed">Completed</option>
                <option value="closed">Closed</option>
              </select>
            </div>
          </div>

          <div class="row without-margin">
            <p style="max-width: 100%; margin-bottom: 5px; font-weight: 700;">
              Users:
            </p>
          </div>

          <edit-task-modal-user v-for="user in active_users" :key="user.id" @toggle="toggleUser" v-bind:task_user="task_user(user)" v-bind:user="user" v-bind:task="show_task" />
        </b-tab>
        <b-tab title="Chat">
          <task-message v-bind:task_id="show_task.id"> </task-message>
        </b-tab>
      </b-tabs>
    </div>
    <div class="center-section">
      <draggable class="tab">
        <button class="tablinks" :class="{ active: resource.name === selected_tab }" v-for="(resource, resourceIndex) in getResources" :key="resourceIndex" @click="openTab(resource.name)">
          {{ resource.name }}
        </button>
      </draggable>
      <div v-for="(resource, resourceIndex) in getResources" :key="resourceIndex" :id="resource.name">
        <div v-if="resource.name === selected_tab" class="d-flex justify-content-between align-items-center">
          <label class="docs-path" style="white-space: nowrap; overflow: hidden;">{{ resource.href }}</label>
          <div style="float: right; display: inline-block; margin-bottom: 8px; margin-top: 5px;" v-if="resource.href != ''">
            <b-button @click="copyURL(resource.href)" style="margin-right: 10px;">Copy URL</b-button>
            <b-button @click="openURL(resource.href)">Open in a new tab</b-button>
          </div>
        </div>
        <iframe v-if="resource.name === selected_tab" :src="resource.href" style="height: calc(100vh - 155px); width: 100%;"></iframe>
      </div>
    </div>
  </div>
</template>

<script></script>

<style></style>
