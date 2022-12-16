import { io } from 'socket.io-client'

class SocketioService {
  socket
  constructor() {}

  setupSocketConnection() {
    this.socket = io(process.env.VUE_APP_WEB_SOCKET_SERVER_URL, {
      auth: {
        token: 'abc'
      }
    })
  }

  sendMessage(channel, content) {
    this.socket.emit(channel, content)
  }
  socketListener(channel, cb) {
    this.socket.on(channel, cb)
  }

  disconnect() {
    if (this.socket) {
      this.socket.disconnect()
    }
  }
}

export default new SocketioService()
