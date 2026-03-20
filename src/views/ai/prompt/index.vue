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

    <el-table v-loading="loading" :data="promptList">
      <el-table-column prop="id" label="ID" width="80" />
      <el-table-column prop="templateCode" label="模板编码" min-width="140" />
      <el-table-column prop="templateName" label="模板名称" min-width="160" />
      <el-table-column prop="sceneCode" label="sceneCode" width="140" />
      <el-table-column prop="styleCode" label="styleCode" width="140" />
      <el-table-column prop="personaCode" label="personaCode" width="160" />
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

    <el-empty v-if="!loading && !promptList.length && !errorMessage" description="暂无 Prompt 模板" />
    <el-alert v-if="errorMessage" :title="errorMessage" type="error" :closable="false" class="mt8" />

    <el-dialog :title="title" v-model="open" width="780px" append-to-body>
      <el-form ref="formRef" :model="form" :rules="rules" label-width="120px">
        <el-row :gutter="12">
          <el-col :span="12">
            <el-form-item label="模板编码" prop="templateCode">
              <el-input v-model.trim="form.templateCode" placeholder="请输入模板编码" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="模板名称" prop="templateName">
              <el-input v-model.trim="form.templateName" placeholder="请输入模板名称" />
            </el-form-item>
          </el-col>
        </el-row>
        <el-row :gutter="12">
          <el-col :span="8">
            <el-form-item label="sceneCode">
              <el-input v-model.trim="form.sceneCode" />
            </el-form-item>
          </el-col>
          <el-col :span="8">
            <el-form-item label="styleCode">
              <el-input v-model.trim="form.styleCode" />
            </el-form-item>
          </el-col>
          <el-col :span="8">
            <el-form-item label="personaCode">
              <el-input v-model.trim="form.personaCode" />
            </el-form-item>
          </el-col>
        </el-row>
        <el-form-item label="System Prompt">
          <el-input v-model="form.systemPrompt" type="textarea" :rows="4" />
        </el-form-item>
        <el-form-item label="User Prompt">
          <el-input v-model="form.userPromptTemplate" type="textarea" :rows="4" />
        </el-form-item>
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

<script setup name="AiPromptManage">
import { listAiPrompts, saveAiPrompt } from '@/api/ai'

const { proxy } = getCurrentInstance()
const promptList = ref([])
const loading = ref(false)
const submitLoading = ref(false)
const errorMessage = ref('')
const open = ref(false)
const title = ref('')

const data = reactive({
  form: {},
  rules: {
    templateCode: [{ required: true, message: '模板编码不能为空', trigger: 'blur' }],
    templateName: [{ required: true, message: '模板名称不能为空', trigger: 'blur' }]
  }
})

const { form, rules } = toRefs(data)

function reset() {
  form.value = {
    id: undefined,
    templateCode: '',
    templateName: '',
    sceneCode: '',
    styleCode: '',
    personaCode: '',
    systemPrompt: '',
    userPromptTemplate: '',
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
    const response = await listAiPrompts()
    promptList.value = response?.data || []
  } catch (error) {
    promptList.value = []
    errorMessage.value = error?.message || '加载 Prompt 模板失败'
  } finally {
    loading.value = false
  }
}

function handleAdd() {
  reset()
  open.value = true
  title.value = '新增 Prompt 模板'
}

function handleEdit(row) {
  reset()
  form.value = {
    ...form.value,
    ...row
  }
  open.value = true
  title.value = '编辑 Prompt 模板'
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
      const response = await saveAiPrompt(form.value)
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
