<template>
  <el-alert
    v-if="permissionLimited"
    title="结果受权限约束：仅基于当前账号可访问数据生成，可能不包含全局信息。"
    type="warning"
    :closable="false"
    class="mb8"
  />
</template>

<script setup>
defineProps({
  permissionLimited: {
    type: Boolean,
    default: false
  }
})
</script>
