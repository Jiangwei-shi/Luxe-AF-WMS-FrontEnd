<template>
  <div>
    <div v-if="status === 'loading'" class="state-wrap">
      <el-skeleton :rows="4" animated />
    </div>

    <el-empty v-else-if="status === 'empty'" description="暂无数据" />

    <el-result
      v-else-if="status === 'error'"
      icon="error"
      title="请求失败"
      :sub-title="errorMessage || '请稍后重试'"
    >
      <template #extra>
        <el-button type="primary" @click="$emit('retry')">重试</el-button>
      </template>
    </el-result>
  </div>
</template>

<script setup>
defineProps({
  status: {
    type: String,
    default: 'empty'
  },
  errorMessage: {
    type: String,
    default: ''
  }
})

defineEmits(['retry'])
</script>

<style scoped>
.state-wrap {
  padding: 8px;
}
</style>
