<template>
  <el-card shadow="never" class="ai-session-list">
    <template #header>
      <div class="header-row">
        <span>本地会话</span>
        <el-button type="primary" link icon="Plus" @click="$emit('create')">新建</el-button>
      </div>
    </template>

    <el-empty v-if="!sessions.length" description="暂无会话" />

    <div v-else class="session-items">
      <div
        v-for="item in sessions"
        :key="item.id"
        class="session-item"
        :class="{ active: item.id === activeSessionId }"
        @click="$emit('select', item.id)"
      >
        <div class="title">{{ item.title || '未命名会话' }}</div>
        <div class="meta-row">
          <span class="time">{{ formatTime(item.updatedAt) }}</span>
          <el-button
            type="danger"
            link
            icon="Delete"
            @click.stop="$emit('delete', item.id)"
          >
            删除
          </el-button>
        </div>
      </div>
    </div>
  </el-card>
</template>

<script setup>
const props = defineProps({
  sessions: {
    type: Array,
    default: () => []
  },
  activeSessionId: {
    type: String,
    default: ''
  }
})

defineEmits(['create', 'select', 'delete'])

function formatTime(timestamp) {
  if (!timestamp) return '-'
  const date = new Date(timestamp)
  const m = `${date.getMonth() + 1}`.padStart(2, '0')
  const d = `${date.getDate()}`.padStart(2, '0')
  const h = `${date.getHours()}`.padStart(2, '0')
  const min = `${date.getMinutes()}`.padStart(2, '0')
  return `${m}-${d} ${h}:${min}`
}
</script>

<style scoped>
.header-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.session-items {
  display: flex;
  flex-direction: column;
  gap: 8px;
  max-height: calc(100vh - 280px);
  overflow: auto;
}

.session-item {
  border: 1px solid var(--el-border-color-light);
  border-radius: 4px;
  padding: 10px;
  cursor: pointer;
}

.session-item.active {
  border-color: var(--el-color-primary);
  background: var(--el-color-primary-light-9);
}

.title {
  font-size: 14px;
  font-weight: 500;
  color: var(--el-text-color-primary);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.meta-row {
  margin-top: 6px;
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.time {
  color: var(--el-text-color-secondary);
  font-size: 12px;
}
</style>
