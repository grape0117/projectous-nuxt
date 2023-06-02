<template>
  <div class="container mx-auto py-8 px-4">
    <h2 class="text-xl text-gray-500 uppercase font-light mb-4">
      Video recorder
    </h2>

    <video src="" autplay class="video-feedback bg-black w-full h-auto mb-4"></video>

    <div class="flex flex-wrap -mx-4 mb-8">
      <button @click="startRecording" class="start-recording mx-4 flex-1 bg-gradient-to-br from-purple-500 to to-pink-500 p-4 uppercase text-lg font-bold transition-all duration-300 hover:opacity-90 disabled:opacity-50">
        Record Screen
      </button>
      <input type="checkbox" checked v-model="include_audio" /> Include Audio?
      <button @click="stopRecording" class="stop-recording mx-4 flex-1 bg-gradient-to-br from-purple-500 to to-pink-500 p-4 uppercase text-lg font-bold transition-all duration-300 hover:opacity-90 disabled:opacity-50">
        Stop Recording
      </button>
    </div>

    <div class="recorded-video-wrap hidden">
      <h2 class="text-xl text-gray-500 uppercase font-light mb-4">
        Recorded video
      </h2>

      <video class="recorded-video bg-black w-full h-auto mb-8" :src="downloadUrl"></video>
      <div class="flex flex-wrap -mx-4">
        <a download="video.mp4" :href="downloadUrl" class="download-video text-center mx-4 flex-1 bg-gradient-to-br from-purple-500 to to-pink-500 p-4 uppercase text-lg font-bold transition-all duration-300 hover:opacity-90 disabled:opacity-50">
          Download
        </a>
      </div>
      <div class="flex flex-wrap -mx-4">
        <button @click="saveVideo" class="download-video text-center mx-4 flex-1 bg-gradient-to-br from-purple-500 to to-pink-500 p-4 uppercase text-lg font-bold transition-all duration-300 hover:opacity-90 disabled:opacity-50">
          Save to Task
        </button>
      </div>
    </div>
  </div>
</template>

<script>
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
      include_audio: true
    }
  },
  methods: {
    saveVideo() {
      const data = new FormData()
      let fileName = `video.mp4`
      let file = new File([new Blob(this.chunks, { type: 'video/mp4' })], fileName)
      data.append('file', file, file.name)
      this.$http().postImage('/upload', data)
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

        console.log('Recording started')
      } else {
        console.warn('No stream available.')
      }
    },

    stopRecording() {
      this.recorder.stop()
    },

    handleDataAvailable(e) {
      this.chunks.push(e.data)
    },

    handleStop(e) {
      const blob = new Blob(this.chunks, { type: 'video/mp4' })
      this.chunks = []

      this.downloadUrl = URL.createObjectURL(blob)

      // this.recordedVideo.src = URL.createObjectURL(blob);

      const recordedVideo = document.getElementsByClassName('recorded-video')[0]
      recordedVideo.load()
      recordedVideo.onloadeddata = function() {
        const rc = document.querySelector('.recorded-video-wrap')
        rc.classList.remove('hidden')
        rc.scrollIntoView({ behavior: 'smooth', block: 'start' })

        recordedVideo.play()
      }

      this.stream.getTracks().forEach(track => track.stop())
      this.audio.getTracks().forEach(track => track.stop())

      console.log('Recording stopped')
    }
  }
}
</script>

<style></style>
