<template>
  <div>
    <Navbar />
    <div class="messages-layout">
      <!-- LEFT COLUMN -->
      <ConversationList
        :conversations="conversations"
        :activeId="activeConversation?.id"
        @select="setActiveConversation"
      />

      <!-- CENTER COLUMN -->
      <ChatWindow
        :conversation="activeConversation"
        @send="handleSendMessage"
      />

      <!-- RIGHT COLUMN -->
      <UserDetails
        v-if="activeConversation"
        :user="activeConversation"
      />
    </div>
  </div>
</template>

<script>
import Navbar from '../components/Navbar.vue'
import ConversationList from '../components/message/ConversationList.vue'
import ChatWindow from '../components/message/ChatWindow.vue'
import UserDetails from '../components/message/UserDetails.vue'
import conversationsData from '../assets/mock-conversation.json'

export default {
  name: 'Messages',
  components: {
    Navbar,
    ConversationList,
    ChatWindow,
    UserDetails
  },
  data() {
    return {
      conversations: [],
      activeConversation: null
    }
  },
  mounted() {
    this.conversations = conversationsData
    this.activeConversation = this.conversations[0]
  },
  methods: {
    setActiveConversation(convo) {
      this.activeConversation = convo
    },
    handleSendMessage(message) {
      this.activeConversation.messages.push({
        sender: "me",
        text: message,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      })
      this.activeConversation.lastMessage = message
    }
  }
}
</script>

<style scoped>
.messages-layout {
  display: grid;
  grid-template-columns: 300px 1fr 250px;
  grid-template-rows: 1fr;
  height: calc(100vh - 60px);
}

</style>
