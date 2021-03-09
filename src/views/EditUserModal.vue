<template>
  <b-modal id="user-modal" @ok="saveUser" class="modal fade" role="dialog">
    <div class="modal-dialog" role="document">
      <div class="modal-content">
        <div class="modal-header">
          <button type="button" class="close" data-dismiss="modal" aria-label="Close">
            <span aria-hidden="true">&times;</span>
          </button>
          <h4 class="modal-title">Edit User</h4>
        </div>
        <div class="modal-body">
          <form id="edit-user-form" class="form-horizontal">
            <div class="form-group">
              <label class="control-label col-sm-4" for="userName">Name: </label>
              <div class="col-sm-8">
                <input id="userName" class="form-control" type="text" name="name" placeholder="Name" v-model="user.name" />
              </div>
            </div>
            <div class="form-group">
              <label class="control-label col-sm-4" for="userEmail">Email: </label>
              <div class="col-sm-8">
                <input id="userEmail" class="form-control" type="text" name="email" placeholder="Email" v-model="user.email" />
              </div>
            </div>
            <div class="form-group">
              <label class="control-label col-sm-4" for="userRole">Role: </label>
              <div class="col-sm-8">
                <select class="form-control" id="userRole" name="role" v-model="user.user_role">
                  <option value="user">User</option>
                  <option value="admin">Admin</option>
                </select>
              </div>
            </div>
            <div class="form-group">
              <b-form-radio-group v-model="user.status" :options="status_options" class="mb-3 ml-3" value-field="item" text-field="name"></b-form-radio-group>
            </div>
            <div class="form-group">
              <label class="control-label col-sm-4" for="userAliases">Aliases: </label>
              <div class="col-sm-8">
                <input id="userAliases" class="form-control" type="text" name="aliases" placeholder="Aliases" v-model="user.aliases" />
              </div>
            </div>
            <div class="form-group">
              <label class="control-label col-sm-4" for="defaultUserRate">Default User Rate: </label>
              <div class="col-sm-8">
                <input id="defaultUserRate" class="form-control" type="text" name="defaultUserRate" placeholder="Default User Rate" v-model="user.default_user_rate" />
              </div>
            </div>
            <div class="form-group">
              <label class="control-label col-sm-4" for="userAddress">Address: </label>
              <div class="col-sm-8">
                <input id="userAddress" class="form-control" type="text" name="address" placeholder="Address" v-model="user.address" />
              </div>
            </div>
            <div class="form-group">
              <label class="control-label col-sm-4" for="userPhone">Phone: </label>
              <div class="col-sm-8">
                <input id="userPhone" class="form-control" type="text" name="phone" placeholder="Phone" v-model="user.phone" />
              </div>
            </div>
            <div class="form-group" :style="'background: ' + user.color">
              <label class="control-label col-sm-4" for="userPhone">Color: </label>
              <div class="col-sm-8">
                <select id="color" class="form-control" type="text" name="color" placeholder="Phone" v-model="user.color">
                  <option v-for="color in colors" :style="'background-color: ' + color + ';'">{{ color }}</option>
                </select>
              </div>
            </div>
            <div class="form-group">
              <label class="control-label col-sm-4" for="userTimeZone">TimeZone: </label>
              <div class="col-sm-8">
                <input id="userTimeZone" class="form-control" type="text" name="timeZone" placeholder="TimeZone" v-model="user.timezone" />
              </div>
            </div>
          </form>
        </div>
        <div class="modal-footer">
          <button type="button" class="btn btn-default" data-dismiss="modal">Close</button>
          <button type="button" class="btn btn-primary" v-on:click="saveUser()" v-if="isAdmin">Save</button>
          <button type="button" class="btn btn-primary" v-on:click="makeInactive()" v-if="isAdmin">Make Inactive</button>
          <button type="button" class="btn btn-primary" v-on:click="removeUser()" v-if="isAdmin && false">Remove from Company</button>
        </div>
      </div>
      <!-- /.modal-content -->
    </div>
    <!-- /.modal-dialog -->
  </b-modal>
  <!-- /.modal -->
</template>

<script>
export default {
  name: 'edit-user-modal',
  computed: {
    isAdmin: function() {
      return this.$store.getters['settings/isAdmin']
    },
    user: function() {
      return this.$store.getters['settings/getCurrentEditCompanyUser']
    }
  },
  data() {
    return {
      status_options: [
        { item: 'active', name: 'Active' },
        { item: 'inactive', name: 'Inactive' }
      ],
      colors: [
        'lightsalmon',
        'salmon',
        'darksalmon',
        'lightcoral',
        'indianred',
        'crimson',
        'firebrick',
        'red',
        'darkred',
        'coral',
        'tomato',
        'orangered',
        'gold',
        'orange',
        'darkorange',
        'lightyellow',
        'lemonchiffon',
        'lightgoldenrodyellow',
        'papayawhip',
        'moccasin',
        'peachpuff',
        'palegoldenrod',
        'khaki',
        'darkkhaki',
        'yellow',
        'lawngreen',
        'chartreuse',
        'limegreen',
        'lime',
        'forestgreen',
        'green',
        'darkgreen',
        'greenyellow',
        'yellowgreen',
        'springgreen',
        'mediumspringgreen',
        'lightgreen',
        'palegreen',
        'darkseagreen',
        'mediumseagreen',
        'seagreen',
        'olive',
        'darkolivegreen',
        'olivedrab',
        'lightcyan',
        'cyan',
        'aqua',
        'aquamarine',
        'mediumaquamarine',
        'paleturquoise',
        'turquoise',
        'mediumturquoise',
        'darkturquoise',
        'lightseagreen',
        'cadetblue',
        'darkcyan',
        'teal',
        'powderblue',
        'lightblue',
        'lightskyblue',
        'skyblue',
        'deepskyblue',
        'lightsteelblue',
        'dodgerblue',
        'cornflowerblue',
        'steelblue',
        'royalblue',
        'blue',
        'mediumblue',
        'darkblue',
        'navy',
        'midnightblue',
        'mediumslateblue',
        'slateblue',
        'darkslateblue',
        'lavender',
        'thistle',
        'plum',
        'violet',
        'orchid',
        'fuchsia',
        'magenta',
        'mediumorchid',
        'mediumpurple',
        'blueviolet',
        'darkviolet',
        'darkorchid',
        'darkmagenta',
        'purple',
        'indigo',
        'pink',
        'lightpink',
        'hotpink',
        'deeppink',
        'palevioletred',
        'mediumvioletred',
        'white',
        'snow',
        'honeydew',
        'mintcream',
        'azure',
        'aliceblue',
        'ghostwhite',
        'whitesmoke',
        'seashell',
        'beige',
        'oldlace',
        'floralwhite',
        'ivory',
        'antiquewhite',
        'linen',
        'lavenderblush',
        'mistyrose',
        'gainsboro',
        'lightgray',
        'silver',
        'darkgray',
        'gray',
        'dimgray',
        'lightslategray',
        'slategray',
        'darkslategray',
        'black',
        'cornsilk',
        'blanchedalmond',
        'bisque',
        'navajowhite',
        'wheat',
        'burlywood',
        'tan',
        'rosybrown',
        'sandybrown',
        'goldenrod',
        'peru',
        'chocolate',
        'saddlebrown',
        'sienna',
        'brown',
        'maroon'
      ]
    }
  },
  methods: {
    makeInactive: function() {
      this.$bvModal.hide('edit-user-modal')
      self.$store.dispatch('company_users/update_attribute', {
        id: this.user.id,
        attribute: 'status',
        value: 'inactive'
      })
    },
    removeUser: function() {
      alert('remove') //TODO: only remove people that don't have data...?
      return
      this.$bvModal.hide('edit-user-modal')
      self.$store.dispatch('company_users/delete', self.user.id)
    },
    saveUser: function() {
      this.$bvModal.hide('edit-user-modal')
      this.$store.dispatch('UPSERT', { module: 'company_users', entity: this.user })
    }
  }
}
</script>
<style>
#color option,
#color optgroup,
#color {
  -webkit-appearance: none;
}
</style>
