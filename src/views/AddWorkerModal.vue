<template>
  <b-modal id="add-worker-modal" class="modal fade" role="dialog">
    <template #modal-title> Add Worker </template>
    <div class="modal-dialog" role="document">
      <div class="modal-content">
        <div class="modal-body">
          <form id="add-worker-form" class="form-horizontal">
            <div class="form-group">
              <label class="control-label col-sm-4" for="workerName">Name: </label>
              <div class="col-sm-8">
                <input id="workerName" class="form-control" type="text" name="name" placeholder="Name" v-model="name" />
              </div>
            </div>
            <div class="form-group">
              <label class="control-label col-sm-4" for="workerEmail">Email(Optional): </label>
              <div class="col-sm-8">
                <input id="workerEmail" class="form-control" type="text" name="email" placeholder="Email" v-model="email" />
              </div>
            </div>
            <div class="form-group">
              <label class="control-label col-sm-4" for="workerRole">Role: </label>
              <div class="col-sm-8">
                <input id="workerRole" class="form-control" type="text" name="role" placeholder="Role" v-model="user_role" disabled />
              </div>
            </div>
          </form>
        </div>
      </div>
      <!-- /.modal-content -->
    </div>
    <template #modal-footer>
      <b-button class="btn btn-default mt-3" @click="$bvModal.hide('add-worker-modal')">
        Close
      </b-button>
      <b-button class="mt-3" variant="primary" @click="addWorker()">
        Add Worker
      </b-button>
    </template>
    <!-- /.modal-dialog -->
  </b-modal>
  <!-- /.modal -->
</template>

<script>
import uuid from 'uuid'
export default {
  name: 'add-worker-modal',
  data() {
    return {
      name: '',
      user_role: 'worker',
      email: ''
    }
  },
  methods: {
    addWorker: function() {
      const token = uuid.v4()
      this.$http()
        .post('/add-worker', { name: this.name, user_role: this.user_role, email: this.email })
        .then(response => {
          //TODO: add to workers?
        })
    }
  }
}
</script>
