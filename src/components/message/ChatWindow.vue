<template>
  <main class="chat-window" v-if="conversation">
    <div class="chat-header">
      <div class="avatar">{{ conversation.name.charAt(0) }}</div>
      <div>
        <strong>{{ conversation.name }}</strong>
        <p>online</p>
      </div>
      <div class="icons">
        <span>⋮</span>
      </div>
    </div>

    <div class="messages">
      <div
        v-for="(msg, index) in conversation.messages"
        :key="index"
        :class="['message', msg.sender === 'me' ? 'me' : 'them']"
      >
        <div class="bubble">{{ msg.text }}</div>
        <span v-if="msg.time" class="time">{{ msg.time }}</span>
      </div>
    </div>

    <div class="input-area">
      <input v-model="newMessage" placeholder="Type..." />
      <button @click="send">Send</button>
    </div>
  </main>
  <main class="empty-chat" v-else>
    Select a conversation to start chatting.
  </main>
</template>

<script>
export default {
  name: "ChatWindow",
  props: {
    conversation: Object
  },
  data() {
    return {
      newMessage: ""
    }
  },
  methods: {
    send() {
      if (this.newMessage.trim()) {
        this.$emit("send", this.newMessage)
        this.newMessage = ""
      }
    }
  }
}
</script>

<style scoped>
.chat-window {
  display: flex;
  width: 100%;
  flex-direction: column;
  height: 100%;
  background: #faffd6;
}
.chat-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem;
  background: white;
  border-bottom: 1px solid #ddd;
}
.avatar {
  background: #d4ff87;
  width: 40px;
  height: 40px;
  border-radius: 50%;
  color: #1b9536;
  display: flex;
  justify-content: center;
  align-items: center;
  font-weight: bold;
  margin-right: 1rem;
}
.chat-header strong {
  color: #385716;
}
.chat-header p {
  margin: 0;
  font-size: 0.8rem;
}
.icons span {
  margin-left: 1rem;
  cursor: pointer;
}
.messages {
  flex: 1;
  padding: 1rem;
  overflow-y: auto;
}
.message {
  margin-bottom: 1rem;
  max-width: 60%;
}
.message.them {
  align-self: flex-start;
} 
.message.me {
  align-self: flex-end;
}
.bubble {
  background: white;
  padding: 0.6rem;
  border-radius: 8px;
}
.message.me .bubble {
  background: #1b9536;
  color: white;
}
.time {
  font-size: 0.7rem;
  color: #555;
  margin-top: 0.2rem;
  display: block;
}
.input-area {
  display: flex;
  border-top: 1px solid #ddd;
  padding: 1rem;
  background: white;
}
.input-area input {
  flex: 1;
  padding: 0.6rem;
  border: 1px solid #1b9536;
  border-radius: 4px;
  margin-right: 0.5rem;
}
.input-area button {
  background: #1b9536;
  color: white;
  border: none;
  padding: 0.6rem 1.2rem;
  border-radius: 4px;
  cursor: pointer;
}
.empty-chat {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100%;
  color: #666;
}
</style>

