<template>
  <div class="mx-auto py-8 d-flex flex-column">
    <h2 class="text-xl text-gray-500 uppercase font-light mx-auto mb-4" style="color: #996300">
      Screen recorder
    </h2>
    <div class="d-flex justify-content-between">
      <video src="" autplay class="video-feedback bg-black w-full h-auto rounded border border-warning w-48 mw-48 mx-auto mb-4" style="max-width: 48%;"></video>
      <video class="recorded-video bg-black h-auto mx-auto mb-4 border rounded border-warning w-48 mw-48" :src="downloadUrl" style="max-width: 48%;"></video>
    </div>

    <div class="flex flex-wrap -mx-4 mb-8 form-inline m-auto">
      <b-form-checkbox v-if="!isStarted" v-model="include_audio" name="check-button" switch variant="warning" class="text-white">
        Include Audio?
      </b-form-checkbox>
      <button @click="startRecording" v-if="!isStarted" class="start-recording mx-4 flex-1 bg-gradient-to-br from-purple-500 to to-pink-500 p-4 uppercase text-lg font-bold transition-all duration-300 hover:opacity-90 disabled:opacity-50 d-flex" style="font-size: 22px; border-radius: 50px;">
        <span
          style="color: red;
                      width: 40px;
                      height: 40px;
                      border: 12px solid;
                      border-radius: 50%;"
        ></span
        >&nbsp;&nbsp; Start Screen
      </button>

      <button @click="stopRecording" v-if="isStarted" class="start-recording mx-4 flex-1 bg-gradient-to-br from-purple-500 to to-pink-500 p-4 uppercase text-lg font-bold transition-all duration-300 hover:opacity-90 disabled:opacity-50 d-flex" style="font-size: 22px; border-radius: 50px;">
        <span
          style=" background-color: red;
                      width: 40px;
                      height: 40px;
                     "
        ></span
        >&nbsp;&nbsp; Stop Recording
      </button>
    </div>
  </div>
</template>

<script>
import { EventBus } from '@/components/event-bus'

export default {
  data() {
    return {
      stream: null,
      audio: null,
      mixedStream: null,
      chunks: [],
      recorder: null,
      startButton: null,
      stopButton: null,
      downloadUrl: null,
      recordedVideo: null,
      include_audio: true,
      isStarted: false
    }
  },
  // clear_screen
  mounted() {
    this.hideLoading()
    EventBus.$on('clear_screen', count => {
      this.chunks = []
      this.stream = null
      this.audio = null
      this.mixedStream = null
      this.recorder = null
      this.startButton = null
      this.stopButton = null
      this.downloadUrl = null
      this.recordedVideo = null
      this.include_audio = null
      this.isStarted = null
      this.hideLoading()
    })
  },
  methods: {
    async saveVideo() {
      this.showLoading()
      const data = new FormData()
      let fileName = `video.mp4`
      const stream_video = new Blob(this.chunks, { type: 'video/mp4' })
      // let file = new File([stream_video], fileName)

      data.append('files', stream_video, 'video.mp4')
      // console.log("files", file)
      const res = await this.$http().postImage('/upload', data)
      // console.log(res[0]['file_path'])
      EventBus.$emit('stopRecord', res[0]['file_path'])
      this.hideLoading()
    },
    async setupStream() {
      try {
        this.stream = await navigator.mediaDevices.getDisplayMedia({
          video: true
        })
        if (this.include_audio) {
          this.audio = await navigator.mediaDevices.getUserMedia({
            audio: {
              echoCancellation: true,
              noiseSuppression: true,
              sampleRate: 44100
            }
          })
        }
        this.setupVideoFeedback()
      } catch (err) {
        console.error(err)
      }
    },

    setupVideoFeedback() {
      if (this.stream) {
        const video = document.querySelector('.video-feedback')
        video.srcObject = this.stream
        video.play()
      } else {
        console.warn('No stream available')
      }
    },

    async startRecording() {
      this.chunks = []
      await this.setupStream()

      if (this.stream) {
        if (this.audio) {
          this.mixedStream = new MediaStream([...this.stream.getTracks(), ...this.audio.getTracks()])
        } else {
          this.mixedStream = new MediaStream([...this.stream.getTracks()])
        }
        this.recorder = new MediaRecorder(this.mixedStream)
        this.recorder.ondataavailable = this.handleDataAvailable
        this.recorder.onstop = this.handleStop
        this.recorder.start(1000)
        this.isStarted = true
        console.log('Recording started')
      } else {
        console.warn('No stream available.')
      }
    },

    stopRecording() {
      this.recorder.stop()
      this.isStarted = false
    },

    handleDataAvailable(e) {
      this.chunks.push(e.data)
    },
    showLoading() {
      const loadingElement = document.getElementsByClassName('block-spinner-bar')
      loadingElement[0].style.display = 'flex'
    },
    hideLoading() {
      const loadingElement = document.getElementsByClassName('block-spinner-bar')
      loadingElement[0].style.display = 'none'
    },
    handleStop(e) {
      const blob = new Blob(this.chunks, { type: 'video/mp4' })
      // this.chunks = []

      this.downloadUrl = URL.createObjectURL(blob)
      // const link = document.getElementById('video-download');
      // link.href = this.downloadUrl;
      // link.download = 'test.mp4'
      // link.click()
      // this.recordedVideo.src = URL.createObjectURL(blob);

      const recordedVideo = document.getElementsByClassName('recorded-video')[0]
      recordedVideo.load()
      recordedVideo.onloadeddata = function() {
        // const rc = document.querySelector('.recorded-video-wrap')
        // rc.classList.remove('hidden')
        // rc.scrollIntoView({ behavior: 'smooth', block: 'start' })

        recordedVideo.play()
      }

      this.stream.getTracks().forEach(track => track.stop())
      this.audio.getTracks().forEach(track => track.stop())

      console.log('Recording stopped')
      this.saveVideo()
    }
  }
}
</script>

<style></style>
