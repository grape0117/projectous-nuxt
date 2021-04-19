<template>
  <b-modal id="client-modal" class="modal fade" tabindex="-1" role="dialog" title="Add/Edit Client" @ok="saveClient">
    <div v-if="client.history !== 'null'">
      <div v-for="(event, eventIndex) in typeof client.history === 'string' ? JSON.parse(client.history) : client.history" :key="eventIndex">{{ event.message }} | {{ event.timestamp }}</div>
    </div>

    <form id="editClientForm" class="form-horizontal">
      <div class="form-group">
        <label class="col-sm-3 control-label" for="inputClientName" @blur="updateClient('name')" style="white-space: nowrap">Client Name: </label>
        <div class="col-sm-9">
          <input id="inputClientName" class="form-control" type="text" name="name" v-model="client.name" />
        </div>
      </div>
      <div class="form-group">
        <label class="col-sm-3 control-label" for="companyAcronymInput">Acronym:</label>
        <div class="col-sm-9">
          <input id="companyAcronymInput" class="form-control" type="text" size="5" name="acronym" v-model="client.acronym" />
        </div>
      </div>
      <div class="form-group">
        <label class="control-label col-sm-3" for="companyClientSelect">Status: </label>
        <div class="col-sm-9">
          <select class="form-control" id="client-modal-client-id" name="status" v-model="client.status">
            <option value="lead">Lead</option>
            <option value="new">New</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
            <option value="archived">Archived</option>
          </select>
        </div>
      </div>
      <div class="form-group">
        <label class="col-sm-3 control-label" for="companyAcronymInput">Client Rate:</label>
        <div class="col-sm-9">
          <input class="form-control" type="text" name="default_client_rate" v-model="client.default_client_rate" />
        </div>
      </div>
      <div class="form-group">
        <label class="col-sm-3 control-label" for="address1">Address 1: </label>
        <div class="col-sm-9">
          <input id="address1" class="form-control" type="text" name="address1" v-model="client.address1" />
        </div>
      </div>
      <div class="form-group">
        <label class="col-sm-3 control-label" for="address2">Address 2: </label>
        <div class="col-sm-9">
          <input id="address2" class="form-control" type="text" name="address2" v-model="client.address2" />
        </div>
      </div>
      <div class="form-group">
        <label class="col-sm-3 control-label" for="city">City: </label>
        <div class="col-sm-9">
          <input id="city" class="form-control" type="text" name="city" v-model="client.city" />
        </div>
      </div>
      <div class="form-group">
        <label class="col-sm-3 control-label" for="state">State: </label>
        <div class="col-sm-9">
          <input id="state" class="form-control" type="text" name="state" v-model="client.state" />
        </div>
      </div>
      <div class="form-group">
        <label class="col-sm-3 control-label" for="zip">Zip: </label>
        <div class="col-sm-9">
          <input id="zip" class="form-control" type="text" name="zip" v-model="client.zip" />
        </div>
      </div>
      <div class="form-group">
        <label class="col-sm-3 control-label" for="phone">Phone: </label>
        <div class="col-sm-9">
          <input id="phone" class="form-control" type="text" name="phone" v-model="client.phone" />
        </div>
      </div>
      <div class="form-group">
        <label class="col-sm-3 control-label" for="color">Color: </label>
        <div class="col-sm-9">
          <select id="color" class="form-control" type="text" name="color" placeholder="Phone" :style="{ 'background-color': client.color }" v-model="client.color">
            <option v-for="color in colors" :key="color" :style="'background-color: ' + color + ';'">{{ color }}</option>
          </select>
        </div>
      </div>
      <client-modal-user :key="user.id" @change="updateHistory" v-bind:client="client" v-for="user in active_users" v-bind:client_user="clientUser(client.id, user.id)" v-bind:user="user"> </client-modal-user>
    </form>
  </b-modal>
</template>

<script>
import EditClientModalUser from './EditClientUserModal.vue'

export default {
  name: 'client-modal',
  components: {
    'client-modal-user': EditClientModalUser
  },
  data() {
    return {
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
  computed: {
    client: function() {
      return this.$store.state.settings.current_edit_client
    },
    active_users: function() {
      return this.$store.getters['company_users/getActive']
    }
  },
  mounted: function() {
    let self = this
    /* $('#client-modal').on('hidden.bs.modal', function() {
      self.$store.dispatch('settings/closedModal')
    })*/
  },
  methods: {
    updateClient(property) {
      this.updateHistory({ message: '' })
    },
    updateHistory({ message }) {
      console.log('message', message, typeof this.client.history)
      console.log('This is client user')
      let history = this.client.history
      if (history === 'null') {
        history = []
      }
      history.push({ message, timestamp: new Date() })
      console.log(history)
      this.client.history = history
      this.$store.dispatch('UPDATE_ATTRIBUTE', { module: 'clients', id: this.client.id, attribute: 'history', value: history })
    },
    clientUser(client_id, company_user_id) {
      return this.$store.getters['client_users/getByClientIdAndCompanyUserId']({ client_id, company_user_id })
    },
    saveClient: async function() {
      //TODO: change Save button to Saving...
      if (!this.client.status) {
        this.client.status = 'new'
      }

      this.$store.dispatch('UPSERT', { module: 'clients', entity: this.client })
    }
  }
}
</script>
