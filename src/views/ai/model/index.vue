<template>
  <div class="app-container">
    <el-row :gutter="10" class="mb8">
      <el-col :span="1.5">
        <el-button type="primary" plain icon="Plus" @click="handleAdd">新增</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button icon="Refresh" @click="getList">刷新</el-button>
      </el-col>
    </el-row>

    <el-table v-loading="loading" :data="modelList">
      <el-table-column prop="id" label="ID" width="80" />
      <el-table-column prop="configName" label="配置名称" min-width="160" />
      <el-table-column prop="provider" label="Provider" width="120" />
      <el-table-column prop="modelName" label="模型名" min-width="180" />
      <el-table-column prop="temperature" label="Temperature" width="120" />
      <el-table-column prop="maxTokens" label="MaxTokens" width="120" />
      <el-table-column prop="topP" label="TopP" width="100" />
      <el-table-column label="启用" width="80">
        <template #default="scope">
          <el-tag :type="scope.row.enabled === 1 ? 'success' : 'info'">
            {{ scope.row.enabled === 1 ? '是' : '否' }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column label="默认" width="80">
        <template #default="scope">
          <el-tag :type="scope.row.isDefault === 1 ? 'success' : 'info'">
            {{ scope.row.isDefault === 1 ? '是' : '否' }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column prop="remark" label="备注" min-width="180" show-overflow-tooltip />
      <el-table-column label="操作" width="120" fixed="right">
        <template #default="scope">
          <el-button link type="primary" icon="Edit" @click="handleEdit(scope.row)">编辑</el-button>
        </template>
      </el-table-column>
    </el-table>

    <el-empty v-if="!loading && !modelList.length && !errorMessage" description="暂无模型配置" />
    <el-alert v-if="errorMessage" :title="errorMessage" type="error" :closable="false" class="mt8" />

    <el-dialog :title="title" v-model="open" width="720px" append-to-body>
      <el-form ref="formRef" :model="form" :rules="rules" label-width="110px">
        <el-row :gutter="12">
          <el-col :span="12">
            <el-form-item label="配置名称" prop="configName">
              <el-input v-model.trim="form.configName" placeholder="请输入配置名称" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="Provider" prop="provider">
              <el-input v-model.trim="form.provider" placeholder="请输入 Provider" />
            </el-form-item>
          </el-col>
        </el-row>
        <el-row :gutter="12">
          <el-col :span="12">
            <el-form-item label="Base URL">
              <el-input v-model.trim="form.baseUrl" placeholder="可选" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="模型名" prop="modelName">
              <el-input v-model.trim="form.modelName" placeholder="请输入模型名" />
            </el-form-item>
          </el-col>
        </el-row>
        <el-form-item label="API Key">
          <el-input v-model.trim="form.apiKey" type="password" show-password placeholder="编辑时可覆盖" />
        </el-form-item>
        <el-row :gutter="12">
          <el-col :span="8">
            <el-form-item label="Temperature">
              <el-input-number v-model="form.temperature" :min="0" :max="2" :step="0.1" :precision="1" />
            </el-form-item>
          </el-col>
          <el-col :span="8">
            <el-form-item label="MaxTokens">
              <el-input-number v-model="form.maxTokens" :min="1" :step="128" />
            </el-form-item>
          </el-col>
          <el-col :span="8">
            <el-form-item label="TopP">
              <el-input-number v-model="form.topP" :min="0" :max="1" :step="0.1" :precision="1" />
            </el-form-item>
          </el-col>
        </el-row>
        <el-row :gutter="12">
          <el-col :span="8">
            <el-form-item label="启用">
              <el-switch v-model="form.enabled" :active-value="1" :inactive-value="0" />
            </el-form-item>
          </el-col>
          <el-col :span="8">
            <el-form-item label="默认">
              <el-switch v-model="form.isDefault" :active-value="1" :inactive-value="0" />
            </el-form-item>
          </el-col>
        </el-row>
        <el-form-item label="备注">
          <el-input v-model.trim="form.remark" type="textarea" :rows="2" />
        </el-form-item>
      </el-form>
      <template #footer>
        <div class="dialog-footer">
          <el-button type="primary" :loading="submitLoading" @click="submitForm">保 存</el-button>
          <el-button @click="cancel">取 消</el-button>
        </div>
      </template>
    </el-dialog>
  </div>
</template>

<script setup name="AiModelManage">
import { listAiModels, saveAiModel } from '@/api/ai'

const { proxy } = getCurrentInstance()
const modelList = ref([])
const loading = ref(false)
const submitLoading = ref(false)
const errorMessage = ref('')
const open = ref(false)
const title = ref('')

const data = reactive({
  form: {},
  rules: {
    configName: [{ required: true, message: '配置名称不能为空', trigger: 'blur' }],
    provider: [{ required: true, message: 'Provider 不能为空', trigger: 'blur' }],
    modelName: [{ required: true, message: '模型名不能为空', trigger: 'blur' }]
  }
})

const { form, rules } = toRefs(data)

function reset() {
  form.value = {
    id: undefined,
    configName: '',
    provider: '',
    baseUrl: '',
    apiKey: '',
    modelName: '',
    temperature: 0.7,
    maxTokens: 2048,
    topP: 1,
    enabled: 1,
    isDefault: 0,
    remark: ''
  }
  proxy.resetForm('formRef')
}

async function getList() {
  loading.value = true
  errorMessage.value = ''
  try {
    const response = await listAiModels()
    modelList.value = response?.data || []
  } catch (error) {
    modelList.value = []
    errorMessage.value = error?.message || '加载模型配置失败'
  } finally {
    loading.value = false
  }
}

function handleAdd() {
  reset()
  open.value = true
  title.value = '新增模型配置'
}

function handleEdit(row) {
  reset()
  form.value = {
    ...form.value,
    ...row
  }
  open.value = true
  title.value = '编辑模型配置'
}

function cancel() {
  open.value = false
  reset()
}

function submitForm() {
  proxy.$refs.formRef.validate(async valid => {
    if (!valid) return
    submitLoading.value = true
    try {
      const response = await saveAiModel(form.value)
      if (response?.code === 200) {
        proxy.$modal.msgSuccess('保存成功')
      }
      open.value = false
      await getList()
    } catch (error) {
      const detailMessage = error?.response?.data?.detailMessage
      errorMessage.value = detailMessage || error?.message || '保存失败'
    } finally {
      submitLoading.value = false
    }
  })
}

onMounted(() => {
  getList()
})
</script>
