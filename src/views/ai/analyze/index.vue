<template>
  <div class="app-container">
    <el-card shadow="never" class="mb8">
      <template #header>
        <span>分析条件</span>
      </template>
      <el-form label-width="88px">
        <el-form-item label="分析问题">
          <el-input
            v-model.trim="question"
            type="textarea"
            :rows="3"
            placeholder="请输入要分析的业务问题"
          />
        </el-form-item>
        <el-form-item label="参数面板">
          <param-panel v-model="params" :disabled="loading" />
        </el-form-item>
        <el-form-item>
          <el-button type="primary" :loading="loading" @click="handleAnalyze">生成分析</el-button>
          <el-button :disabled="loading" @click="handleReset">重置</el-button>
        </el-form-item>
      </el-form>

      <el-alert
        title="当前仅支持非流式返回，结果会在接口完成后一次性展示。"
        type="info"
        :closable="false"
      />
    </el-card>

    <el-card shadow="never">
      <template #header>
        <span>分析报告</span>
      </template>
      <state-block :status="status" :error-message="errorMessage" @retry="handleAnalyze" />

      <template v-if="status === 'success' && report">
        <permission-tip :permission-limited="!!report.permissionLimited" />

        <el-descriptions border :column="1" class="mb8">
          <el-descriptions-item label="AI 分析结论">
            <div class="answer">{{ report.answer || '-' }}</div>
          </el-descriptions-item>
          <el-descriptions-item label="总体进度">
            {{ report.summary?.overallProgress || '-' }}
          </el-descriptions-item>
          <el-descriptions-item label="关键指标">
            <el-tag
              v-for="(metric, index) in report.summary?.keyMetrics || []"
              :key="index"
              class="mr8 mb8"
            >
              {{ metric }}
            </el-tag>
            <span v-if="!(report.summary?.keyMetrics || []).length">-</span>
          </el-descriptions-item>
          <el-descriptions-item label="亮点摘要">
            <ul v-if="(report.summary?.highlights || []).length">
              <li v-for="(item, index) in report.summary?.highlights || []" :key="index">{{ item }}</li>
            </ul>
            <span v-else>-</span>
          </el-descriptions-item>
          <el-descriptions-item label="改进建议">
            <ul v-if="(report.suggestions || []).length">
              <li v-for="(item, index) in report.suggestions || []" :key="index">{{ item }}</li>
            </ul>
            <span v-else>-</span>
          </el-descriptions-item>
          <el-descriptions-item label="风险提示">
            <ul v-if="(report.riskTips || []).length">
              <li v-for="(item, index) in report.riskTips || []" :key="index">{{ item }}</li>
            </ul>
            <span v-else>-</span>
          </el-descriptions-item>
          <el-descriptions-item label="模型信息">
            模型：{{ report.usedModel || '-' }}，模板：{{ report.usedPromptTemplate || '-' }}
          </el-descriptions-item>
        </el-descriptions>

        <el-divider>图表数据（chartData）</el-divider>
        <pre class="chart-data">{{ JSON.stringify(report.chartData || {}, null, 2) }}</pre>
      </template>
    </el-card>
  </div>
</template>

<script setup name="AiAnalyzeProgress">
import { analyzeProgress } from '@/api/ai'
import ParamPanel from '@/components/Ai/ParamPanel.vue'
import StateBlock from '@/components/Ai/StateBlock.vue'
import PermissionTip from '@/components/Ai/PermissionTip.vue'

const question = ref('')
const params = ref({
  sceneCode: '',
  styleCode: '',
  personaCode: ''
})
const loading = ref(false)
const status = ref('empty')
const errorMessage = ref('')
const report = ref(null)

function buildPayload() {
  return {
    question: question.value.trim(),
    sceneCode: params.value.sceneCode || undefined,
    styleCode: params.value.styleCode || undefined,
    personaCode: params.value.personaCode || undefined
  }
}

async function handleAnalyze() {
  if (!question.value?.trim()) {
    return
  }
  loading.value = true
  errorMessage.value = ''
  status.value = 'loading'
  try {
    const response = await analyzeProgress(buildPayload())
    report.value = response?.data || null
    status.value = report.value ? 'success' : 'empty'
  } catch (error) {
    status.value = 'error'
    errorMessage.value = error?.message || '分析失败，请稍后重试'
    report.value = null
  } finally {
    loading.value = false
  }
}

function handleReset() {
  question.value = ''
  params.value = {
    sceneCode: '',
    styleCode: '',
    personaCode: ''
  }
  report.value = null
  errorMessage.value = ''
  status.value = 'empty'
}
</script>

<style scoped>
.answer {
  white-space: pre-wrap;
  line-height: 1.7;
}

.chart-data {
  margin: 0;
  background: var(--el-fill-color-light);
  border-radius: 4px;
  padding: 12px;
  max-height: 380px;
  overflow: auto;
}
</style>
