<template>
  <div>
    <el-input
      v-model.trim="question"
      type="textarea"
      :rows="3"
      :placeholder="placeholder"
      :disabled="loading"
      @keyup.ctrl.enter="handleSend"
    />
    <div class="action-row">
      <div class="hint">快捷键：Ctrl + Enter 发送</div>
      <div class="buttons">
        <el-button type="primary" :loading="loading" @click="handleSend">发送</el-button>
        <el-button :disabled="loading" @click="$emit('resend')">重新发送上次问题</el-button>
        <el-tooltip content="当前后端未提供流式取消能力，仅预留交互位">
          <el-button :disabled="true" @click="$emit('stop')">停止生成</el-button>
        </el-tooltip>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'

const props = defineProps({
  loading: {
    type: Boolean,
    default: false
  },
  placeholder: {
    type: String,
    default: '请输入你的问题'
  }
})

const emit = defineEmits(['send', 'resend', 'stop'])
const question = ref('')

function handleSend() {
  if (!question.value) {
    return
  }
  emit('send', question.value)
  question.value = ''
}
</script>

<style scoped>
.action-row {
  margin-top: 8px;
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.hint {
  color: var(--el-text-color-secondary);
  font-size: 12px;
}

.buttons {
  display: flex;
  gap: 8px;
}
</style>
