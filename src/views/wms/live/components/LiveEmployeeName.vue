<template><span>{{ name }} <el-tag v-if="Number(status) >= 2" size="small" type="info">{{ employeeStatusLabel(status) }}</el-tag></span></template>
<script setup>
import { employeeStatusLabel } from '../shared'
defineProps({ name: String, status: [Number, String] })
</script>
