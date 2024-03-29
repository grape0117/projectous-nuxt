<template>
  <b-list-group-item class="message-panel_inner-message" :style="is_me ? 'float: right;' : ''">
    <b-avatar v-if="!is_me" class="mr-1 mb-4 avatar" :text="user_name" v-b-tooltip.hover :title="message.user.name" size="25px" style="width: 25px;" />
    <div>
      <div class="message-wrapper">
        <div class="message-container d-flex" v-on:mouseover="showDownloadBtn = true" v-on:mouseleave="showDownloadBtn = false">
          <div v-if="message.thumbnail" style="position: relative; display: flex; flex-direction: column; flex-grow: 0; flex-shrink: 0; overflow: hidden; align-items: center; justify-content: center; app-region: no-drag; background-color: transparent; border-color: transparent; text-align: left; border-width: 0px; width: 299.995px; height: 259.938px; border-radius: 0px 10px 10px; padding: 0px; cursor: pointer; border-style: solid;">
            <img v-if="!image_loaded" src="@/assets/img/no-image.png" width="300" height="260" alt="thumbnail" style="position: absolute;" />
            <img :src="'https://projectous-chat-bucket.sfo3.digitaloceanspaces.com/' + message.thumbnail" width="300" height="260" alt="thumbnail" @load="imgLoaded" />
          </div>
          <div v-else-if="isVideo()" style="position: relative; display: flex; flex-direction: column; flex-grow: 0; flex-shrink: 0; overflow: hidden; align-items: center; justify-content: center; app-region: no-drag; background-color: transparent; border-color: transparent; text-align: left; border-width: 0px; width: 350px; border-radius: 0px 10px 10px; padding: 0px; cursor: pointer; border-style: solid;">
            <video width="100%" height="auto" controls>
              <source :src="`https://projectous-chat-bucket.sfo3.digitaloceanspaces.com/${message.filePath}`" type="video/mp4" />
              Your browser does not support the video tag.
            </video>
          </div>

          <img v-else-if="!message.thumbnail && message.isFile" src="@/assets/img/attach-file.png" width="30" height="34" alt="thumbnail" style="margin-top: 3px; margin-left: 5px;" />
          <div class="download-bg" v-if="message.isFile && showDownloadBtn && !isVideo()">
            <i class="icon-download" @click="downloadFile(message)" />
            <i v-if="message.thumbnail" class="icon-open_in_new" @click="openImage()" />
          </div>
          <pre v-if="!message.thumbnail && !isVideo()" class="msg-content" style="color: white;">{{ message.message }}</pre>
        </div>
        <div class="message-actions" v-if="current_company_user_id == message.company_user_id">
          <i class="icon-more_vert" @click="open_actions = !open_actions" />
          <div class="message-actions-options" v-if="open_actions">
            <i class="icon-edit" @click="editMessage(message)" />
            <i class="icon-delete" @click="deleteMessage(message)" />
            <!-- <i class="icon-message" @click="showThread(message)" /> -->
            <i v-if="message.isFile" class="icon-download" @click="downloadFile(message)" />
          </div>
        </div>
        <!-- <div class="message-actions" v-else>
          <i class="icon-more_vert" @click="open_actions = !open_actions" />
          <div class="message-actions-options">
            <i class="icon-message" @click="showThread(message)" />
            <i v-if="message.isFile" class="icon-download" @click="downloadFile(message)" />
          </div>
        </div> -->
      </div>
      <span class="message-dateTime">{{ formatTime(message.created_at) }}</span>
    </div>
  </b-list-group-item>
</template>

<script>
import moment from 'moment'
import { abbrName } from '@/utils/util-functions'
import { writeFileSync } from 'fs'
import { EventBus } from '@/components/event-bus'

export default {
  name: 'task-message-item',
  data() {
    return {
      open_actions: false,
      image_loaded: false,
      showDownloadBtn: false
    }
  },
  props: ['message', 'is_me'],
  // watch(() => props.image, (image) => {
  //       isLoaded.value = false;

  //       const img = new Image();
  //       img.onload = () => isLoaded.value = true;
  //       img.src = message.thumbnail;
  //   }, { immediate: true })
  computed: {
    user_name() {
      return abbrName(this.message.user.name)
    },
    current_company_user_id() {
      return this.$store.state.settings.current_company_user_id
    }
  },
  methods: {
    isVideo() {
      if (this.message.message == 'video.mp4' && this.message.isFile) {
        return true
      }
      return false
    },
    openImage() {
      var image = new Image()
      image.src = 'https://projectous-chat-bucket.sfo3.digitaloceanspaces.com/' + this.message.filePath
      var w = window.open('', '_blank')
      w.document.write(image.outerHTML)
      w.document.close()
    },
    imgLoaded() {
      this.image_loaded = true
    },
    forceFileDownload(response, title) {
      const url = window.URL.createObjectURL(new Blob([response]))
      const link = document.createElement('a')
      link.href = url
      link.setAttribute('download', title)
      document.body.appendChild(link)
      link.click()
    },
    downloadFile(message) {
      this.$http()
        .post2('/download', { file_key: message.filePath })
        .then(response => {
          this.forceFileDownload(response, message.text)
        })
    },
    getUserNameWithCompanyUserId(company_user_id) {
      let company_user = this.$store.state.company_users.company_users[this.$store.state.company_users.lookup[company_user_id]]
      if (company_user) return company_user.name
      else return ''
    },
    formatTime(datetime) {
      return moment(datetime).format('hh:mm A')
    },
    editMessage(message) {
      this.open_actions = false
      this.$emit('edit-message', message)
    },
    deleteMessage(message) {
      this.open_actions = false
      if (message.isFile && message.text == 'video.mp4') {
        const really = confirm('Are you sure want to delete this video?')
        if (really) {
          this.$emit('delete-message', message)
        }
      } else {
        this.$emit('delete-message', message)
      }
    }
    // showThread(message) {
    //   EventBus.$emit('show-thread', message)
    // }
  }
}
</script>

<style lang="scss" scoped>
.msg-content {
  padding: 8px 12px;
  background-color: gray;
  // border: solid 1px grey;
  border-radius: 4px;
  margin-top: 5px;
  margin-bottom: 0;
  white-space: pre-wrap;
  word-break: break-word;
}

.message-panel_inner-message {
  display: flex;
  align-items: flex-end;
  background-color: rgba($color: #000000, $alpha: 0) !important;
  border: 0 !important;
  padding: 0px 10px 5px 10px;
  max-width: 90%;
  .b-avatar-text,
  .avatar {
    min-width: 25px !important;
  }

  .message-dateTime {
    font-size: 12px;
  }
}

.message-panel_inner .message-panel_inner-message:hover .message-actions {
  visibility: visible;
}
.message-panel_inner .message-actions {
  visibility: visible;
}
.message-wrapper {
  // border: 1px solid red;
  display: flex;
  justify-content: space-between;
  // position: relative;

  .message-container {
    background-color: gray;
    position: relative;
    .download-bg {
      position: absolute;
      top: 0;
      height: 100%;
      width: 100%;
      background-color: rgba(0, 0, 0, 0.7);
      display: flex;
      align-items: center;
      justify-content: center;
      .icon-open_in_new,
      .icon-download {
        font-size: 31px;
      }
      .icon-open_in_new:hover,
      .icon-download:hover {
        cursor: pointer;
        color: white;
      }
    }
  }

  .message-actions {
    visibility: visible;
    padding-top: 5px;
    // border: 1px solid red;
    position: relative;

    i {
      cursor: pointer;
      font-size: 24px;
    }

    .message-actions-options {
      // border: 1px solid red;
      position: absolute;
      display: flex;
      top: -28px;
      right: 22px;
      background-color: rgba($color: #2b2929, $alpha: 1);
      box-shadow: 0px 0px 16px -6px white;
      border-radius: 4px;
      padding: 3px;

      :not(:last-child) {
        margin-right: 8px;
      }
    }
  }
}
</style>
