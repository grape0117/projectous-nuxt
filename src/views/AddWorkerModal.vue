<template>
  <b-modal id="add-worker-modal" class="modal fade" role="dialog">
    <div class="modal-dialog" role="document">
      <div class="modal-content">
        <div class="modal-header">
          <button type="button" class="close" data-dismiss="modal" aria-label="Close">
            <span aria-hidden="true">&times;</span>
          </button>
          <h4 class="modal-title">Add Worker</h4>
        </div>
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
        <div class="modal-footer">
          <button type="button" class="btn btn-default" data-dismiss="modal">
            Close
          </button>
          <button type="button" class="btn btn-primary" v-on:click="addWorker()">
            Add Worker
          </button>
        </div>
      </div>
      <!-- /.modal-content -->
    </div>
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
