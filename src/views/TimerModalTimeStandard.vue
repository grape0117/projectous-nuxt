<template id="timer-modal-time-standard-template">
  <div class="form-group" v-if="status != 'running'">
    <label class="control-label col-sm-4" for="timerDuration">Duration: </label>
    <div class="col-sm-6">
      <div id="timerDuration" class="form-control-static">
        <input
          name="duration_hours"
          id="duration_hours"
          placeholder="00"
          style="display:inline; width: 15%;"
          :value="hours"
        />:<input
          name="duration_minutes"
          id="duration_minutes"
          style="display:inline; width: 15%;"
          placeholder="00"
          :value="minutes"
        />:<input
          name="duration_seconds"
          id="duration_seconds"
          style="display:inline; width: 15%;"
          placeholder="00"
          :value="seconds"
        />
        (hours : minutes : seconds)
      </div>
    </div>
    <!--<div class="col-sm-2">
            <button v-if="timer.status == 'running'" class="btn btn-default" style="float: right;"><i class="glyphicon glyphicon-stop"></i></button>
            <button v-else class="btn btn-default" style="float: right;"><i class="glyphicon glyphicon-play"></i></button>
        </div>-->
  </div>
</template>

<script>
export default {
  name: 'timer-modal-time-standard',
  props: ['status', 'hours', 'minutes', 'seconds']
}
</script>
