<template id="timer-fifteen-template">
  <div :class="'carousel-item item' + isActive()">
    <div class="buttonRow">
      <div class="row btn-group" data-toggle="buttons">
        <div class="col-3" @click="doStuff(type, hour, 0)">
          <label
            v-if="isAvailable(hour, '0')"
            :class="'btn btn-primary' + isActiveTime(hour, 0)"
          >
            <input type="radio" name="options" autocomplete="off" />{{
              hour
            }}:00
          </label>
          <label v-else="" class="btn btn-default">
            <input type="radio" name="options" autocomplete="off" />{{
              hour
            }}:00
          </label>
        </div>
        <div class="col-3" @click="doStuff(type, hour, 15)">
          <label
            v-if="isAvailable(hour, '15')"
            :class="'btn btn-primary' + isActiveTime(hour, 15)"
          >
            <input type="radio" name="options" autocomplete="off" />{{
              hour
            }}:15
          </label>
          <label v-else="" class="btn btn-default">
            <input type="radio" name="options" autocomplete="off" />{{
              hour
            }}:15
          </label>
        </div>
        <div class="col-3" @click="doStuff(type, hour, 30)">
          <label
            v-if="isAvailable(hour, '30')"
            :class="'btn btn-primary' + isActiveTime(hour, 30)"
          >
            <input type="radio" name="options" autocomplete="off" />{{
              hour
            }}:30
          </label>
          <label v-else="" class="btn btn-default">
            <input type="radio" name="options" autocomplete="off" />{{
              hour
            }}:30
          </label>
        </div>
        <div class="col-3" @click="doStuff(type, hour, 45)">
          <label
            v-if="isAvailable(hour, '45')"
            :class="'btn btn-primary' + isActiveTime(hour, 45)"
          >
            <input type="radio" name="options" autocomplete="off" />{{
              hour
            }}:45
          </label>
          <label v-else="" class="btn btn-default">
            <input type="radio" name="options" autocomplete="off" />{{
              hour
            }}:45
          </label>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'timer-fifteen-template',
  methods: {
    isActive: function() {
      var startHour = this.startTime().get('hour')
      if (this.type == 'start') {
        return this.hour == startHour ? ' active' : ''
      } else {
        var endHour = this.endTime().get('hour')
        /*if(endHour < startHour){ //Next day: uh oh
                        alert('duration goes into tomorrow')
                    } else if(this.timer.duration > 86400){ //Next day: uh oh
                        alert('duration is longer than 1 day')
                    } else {*/
        return this.hour == endHour ? ' active' : ''
        //}
      }
    },
    startTime: function() {
      return this.timer.report_at ? moment(this.timer.report_at) : moment()
    },
    endTime: function() {
      return this.timer.report_at
        ? moment(this.timer.report_at).add(this.timer.duration, 'seconds')
        : moment()
    },
    isActiveTime: function(hour, minute) {
      if (!this.isActive()) {
        return ''
      }
      if (!this.timer.report_at) {
        return ''
      }
      if (this.type == 'start') {
        return hour == this.startTime().get('hour') &&
          minute == this.startTime().get('minute')
          ? ' active'
          : ''
      } else {
        return hour == this.endTime().get('hour') &&
          minute == this.endTime().get('minute')
          ? ' active'
          : ''
      }
    },
    doStuff: function(type, hour, minute) {
      console.log('doing stuff ' + type + ' ' + hour + ' - ' + minute)
      if (type == 'start') {
        this.$emit('setstarttime', { hour: hour, minute: minute })
        //this.doStartStuff(hour * 60 + minute);
      } else {
        this.$emit('setendtime', { hour: hour, minute: minute })
        //this.doEndStuff(hour * 60 + minute);
      }
    },
    calculateReportAt: function() {
      var date = ''
      var time = ''
      //this.report_at = moment(date + time);
    },
    isAvailable: function(hour, minute) {
      //console.log(this.type+' availability check')
      return true //TODO: right now having this in place breaks the slider if you choose a start time past an end time for example
      if (this.type == 'start') {
        //Block out times later than compareto
        //console.log(this.compareto);
        if (this.compareto) {
          //console.log(hour + ' * 60 + ' + minute + ' >= ' + this.compareto);
          if (hour * 3600 + minute * 60 >= this.compareto) {
            return false
          }
        }
      } else {
        //type == 'end'
        //Block out times earlier than compareto
        //console.log(this.compareto);
        if (hour * 3600 + minute * 60 <= this.compareto) {
          return false
        }
      }
      return true
    }
  }
}
</script>
