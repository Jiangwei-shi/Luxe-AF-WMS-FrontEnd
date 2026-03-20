<template>
  <el-form :model="innerValue" inline label-width="68px">
    <el-form-item label="场景">
      <el-input
        v-model.trim="innerValue.sceneCode"
        :disabled="disabled"
        clearable
        placeholder="例如：wms.progress"
        style="width: 220px"
      />
    </el-form-item>
    <el-form-item label="风格">
      <el-input
        v-model.trim="innerValue.styleCode"
        :disabled="disabled"
        clearable
        placeholder="例如：concise"
        style="width: 220px"
      />
    </el-form-item>
    <el-form-item label="人设">
      <el-input
        v-model.trim="innerValue.personaCode"
        :disabled="disabled"
        clearable
        placeholder="例如：ops_manager"
        style="width: 220px"
      />
    </el-form-item>
    <el-form-item>
      <el-button :disabled="disabled" @click="handleReset">清空参数</el-button>
    </el-form-item>
  </el-form>
</template>

<script setup>
import { reactive, watch } from 'vue'

const props = defineProps({
  modelValue: {
    type: Object,
    default: () => ({
      sceneCode: '',
      styleCode: '',
      personaCode: ''
    })
  },
  disabled: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits(['update:modelValue', 'reset'])

const innerValue = reactive({
  sceneCode: '',
  styleCode: '',
  personaCode: ''
})

watch(
  () => props.modelValue,
  value => {
    innerValue.sceneCode = value?.sceneCode || ''
    innerValue.styleCode = value?.styleCode || ''
    innerValue.personaCode = value?.personaCode || ''
  },
  { immediate: true, deep: true }
)

watch(
  innerValue,
  value => {
    emit('update:modelValue', { ...value })
  },
  { deep: true }
)

function handleReset() {
  innerValue.sceneCode = ''
  innerValue.styleCode = ''
  innerValue.personaCode = ''
  emit('reset')
}
</script>
