<template>
  <aside class="conversation-list">
    <h2>Messages</h2>
    <input type="text" placeholder="Search Conversation" class="search" />

    <div
      v-for="c in conversations"
      :key="c.id"
      :class="['conversation-item', { active: c.id === activeId }]"
      @click="$emit('select', c)"
    >
      <div class="avatar">{{ c.name.charAt(0) }}</div>
      <div class="details">
        <strong>{{ c.name }}</strong>
        <p>{{ c.lastMessage }}</p>
      </div>
    </div>
  </aside>
</template>

<script>
export default {
  name: 'ConversationList',
  props: {
    conversations: Array,
    activeId: Number
  }
}
</script>

<style scoped>
.conversation-list {
  background: #e6fff1;
  padding: 1rem;
  overflow-y: auto;
}
h2 {
  color: #385716;
  margin-top: -0.3rem;
}
.search {
  width: 90%;
  padding: 0.5rem;
  border: 1px solid #1b9536;
  border-radius: 4px;
  margin: 1rem 0;
}
.conversation-item {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 0.8rem;
  cursor: pointer;
  border-radius: 4px;
}
.conversation-item.active {
  background: #F7FFBD;
  color: white;
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
}
.details strong {
  color: #385716;
  font-size: large;
}
.details p {
  margin: 0;
  font-size: 0.9rem;
  color: #505050;
}
</style>
