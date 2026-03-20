<template>
  <div class="msg-list">
    <div
      v-for="item in messages"
      :key="item.id"
      class="msg-item"
      :class="item.role"
    >
      <div class="msg-header">
        <span>{{ item.role === 'user' ? '你' : 'AI' }}</span>
        <span class="msg-time">{{ formatTime(item.createdAt) }}</span>
      </div>

      <ai-permission-tip :permission-limited="!!item.permissionLimited" />

      <div class="msg-content">{{ item.content }}</div>

      <div v-if="item.meta" class="meta">
        <span>模型：{{ item.meta.usedModel || '-' }}</span>
        <span>模板：{{ item.meta.usedPromptTemplate || '-' }}</span>
      </div>

      <div v-if="item.role === 'assistant'" class="actions">
        <el-button link type="primary" @click="$emit('copy', item.content)">复制</el-button>
        <el-button link type="primary" @click="$emit('resend', item)">重新发送</el-button>
      </div>
    </div>
  </div>
</template>

<script setup>
import AiPermissionTip from './PermissionTip.vue'

defineProps({
  messages: {
    type: Array,
    default: () => []
  }
})

defineEmits(['copy', 'resend'])

function formatTime(timestamp) {
  if (!timestamp) return '-'
  const date = new Date(timestamp)
  const h = `${date.getHours()}`.padStart(2, '0')
  const m = `${date.getMinutes()}`.padStart(2, '0')
  const s = `${date.getSeconds()}`.padStart(2, '0')
  return `${h}:${m}:${s}`
}
</script>

<style scoped>
.msg-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.msg-item {
  border: 1px solid var(--el-border-color-light);
  border-radius: 4px;
  padding: 12px;
}

.msg-item.user {
  background: var(--el-fill-color-light);
}

.msg-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  font-weight: 600;
}

.msg-time {
  color: var(--el-text-color-secondary);
  font-size: 12px;
}

.msg-content {
  margin-top: 8px;
  white-space: pre-wrap;
  line-height: 1.7;
}

.meta {
  margin-top: 8px;
  color: var(--el-text-color-secondary);
  font-size: 12px;
  display: flex;
  gap: 16px;
}

.actions {
  margin-top: 8px;
}
</style>
