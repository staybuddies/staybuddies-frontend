<!-- src/components/ConversationList.vue -->
<template>
  <aside class="cl-list">
    <div class="cl-head">
      <h3 class="cl-title">Chats</h3>
      <button class="cl-reload" @click="$emit('reload')" title="Reload">
        ⟳
      </button>
    </div>

    <div class="cl-container">
      <div v-if="loading" class="cl-state">Loading…</div>
      <div v-else-if="error" class="cl-state cl-error">{{ error }}</div>
      <div v-else-if="!conversations.length" class="cl-state">
        No conversations yet
      </div>

      <ul v-else class="cl-items">
        <li
          v-for="c in conversations"
          :key="c.id"
          :class="['cl-item', { 'is-active': c.id === activeId }]"
          @click="$emit('select', c.id)"
        >
          <div class="cl-row">
            <div class="cl-name">{{ c.otherName }}</div>
            <div class="cl-time">
              {{ c.lastTime ? formatTime(c.lastTime) : "" }}
            </div>
          </div>

          <div class="cl-preview">
            <span class="cl-last">{{
              c.lastMessage || "Start chatting…"
            }}</span>
            <span v-if="c.unread" class="cl-badge">{{ c.unread }}</span>
          </div>
        </li>
      </ul>
    </div>
  </aside>
</template>

<script setup>
defineProps({
  conversations: { type: Array, default: () => [] },
  activeId: { type: Number, default: null },
  loading: { type: Boolean, default: false },
  error: { type: String, default: "" },
});

function formatTime(t) {
  try {
    return new Date(t).toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return "";
  }
}
</script>

<style scoped>
/* Component-local tokens (NO :root — keeps them from leaking) */
.cl-list {
  --brand: #1b9536;
  --brand-600: #0f7a33;
  --text: #0c4a23;
  --muted: #666;
  --bd: #f1f3f4;
  --hover: #f3f6f4;
  --active: #e9f7ee;

  /* sizing */
  --column-w: 300px; /* tweak if you want */
  --head-h: 44px; /* header height used for padding offset */
}

/* container */
.cl-list {
  position: relative;
  width: var(--column-w);
  max-width: 100%;
}

/* sticky header INSIDE the list column (no fixed/left math) */
.cl-head {
  position: sticky;
  top: 0; /* parent page should already sit below navbar */
  z-index: 1;
  display: flex;
  align-items: center;
  justify-content: space-between;
  height: var(--head-h);
  padding: 0 8px;
  background: #fff;
  border-bottom: 1px solid var(--bd);
}
.cl-title {
  margin: 0;
  font-size: 1rem;
  color: var(--text);
  font-weight: 800;
}
.cl-reload {
  border: 1px solid var(--brand);
  background: #fff;
  color: var(--brand);
  border-radius: 6px;
  padding: 0.25rem 0.5rem;
  cursor: pointer;
}

/* content area (adds padding so first item isn’t under sticky head) */
.cl-container {
  padding-top: calc(var(--head-h));
}

/* states */
.cl-state {
  color: var(--muted);
  padding: 0.5rem 0.5rem;
}
.cl-error {
  color: #c92a2a;
}

/* list & items */
.cl-items {
  list-style: none;
  margin: 0;
  padding: 0;
}
.cl-item {
  padding: 0.6rem 0.5rem;
  border-radius: 8px;
  cursor: pointer;
}
.cl-item:hover {
  background: var(--hover);
}
.cl-item.is-active {
  background: var(--active);
}

.cl-row {
  display: flex;
  justify-content: space-between;
  gap: 8px;
}
.cl-name {
  font-weight: 800;
  color: var(--text);
  min-width: 0;
}
.cl-time {
  color: var(--muted);
  font-size: 0.85rem;
  white-space: nowrap;
}

.cl-preview {
  display: flex;
  gap: 0.5rem;
  align-items: center;
  color: #555;
  font-size: 0.92rem;
  margin-top: 2px;
}
.cl-last {
  flex: 1;
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.cl-badge {
  background: var(--brand);
  color: #fff;
  border-radius: 999px;
  padding: 0 0.45rem;
  font-size: 0.75rem;
  font-weight: 800;
  line-height: 20px;
  min-width: 20px;
  text-align: center;
}
</style>
