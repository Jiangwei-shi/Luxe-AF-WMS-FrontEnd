<template>
  <div class="live-page">
    <div class="live-hero"><div><h2>薪酬结算</h2><p>按明确选择的开播、佣金及已确认调整结算，原单和快照永久保留</p></div></div>
    <el-alert title="历史待核实记录须先核对原付款依据。补录历史结算应确认当前明细金额与原结算凭据一致；导出不代表已结算。" type="warning" :closable="false" />
    <el-card class="live-filter" shadow="never">
      <el-form inline>
        <el-form-item label="主播"><LiveEmployeeSelect v-model="query.employeeId" :employees="options.employees" placeholder="请选择主播" @change="resetCandidates" /></el-form-item>
        <el-form-item label="业务/调整入账日期"><el-date-picker v-model="dateRange" type="daterange" value-format="YYYY-MM-DD" :format="LIVE_DATE_FORMAT" @change="resetCandidates" /></el-form-item>
        <el-form-item><el-button type="primary" :loading="loading" @click="loadCandidates">查询待结算明细</el-button></el-form-item>
      </el-form>
    </el-card>
    <el-card shadow="never" class="live-card">
      <div class="live-actions">
        <el-button v-hasPermi="['wms:live:settlement:confirm']" :disabled="!selection.length" @click="prepare('NORMAL')">结算所选明细</el-button>
        <el-button v-hasPermi="['wms:live:settlement:confirm']" :disabled="!selection.length" @click="prepare('OPEN')">核实为未结算</el-button>
        <el-button v-hasPermi="['wms:live:settlement:confirm']" :disabled="!selection.length" @click="prepare('HISTORICAL')">补录历史结算</el-button>
        <span>已选 {{ selection.length }} 条 · {{ money(selectedAmount) }}</span>
      </div>
      <el-table :data="candidates" v-loading="loading" row-key="key" @selection-change="selection = $event">
        <el-table-column type="selection" width="46" />
        <el-table-column prop="typeLabel" label="来源" width="90" />
        <el-table-column label="业务日期" width="125"><template #default="s">{{ displayDate(s.row.businessDate) }}</template></el-table-column>
        <el-table-column label="入账日期" width="125"><template #default="s">{{ displayDate(s.row.postingDate) }}</template></el-table-column>
        <el-table-column prop="accountLabel" label="平台/订单" min-width="180" />
        <el-table-column prop="description" label="说明" min-width="200" />
        <el-table-column label="状态" width="110"><template #default="s">{{ s.row.type === 'ADJUSTMENT' ? adjustmentStatusLabel(s.row.status) : settlementStatusLabel(s.row.status) }}</template></el-table-column>
        <el-table-column label="金额" width="130"><template #default="s">{{ money(s.row.amount) }}</template></el-table-column>
      </el-table>
    </el-card>
    <el-card class="live-card" shadow="never" style="margin-top:20px">
      <div class="live-actions"><h3>已确认结算批次</h3><el-button @click="loadBatches">刷新</el-button></div>
      <el-table :data="batches" v-loading="batchLoading">
        <el-table-column prop="employeeName" label="主播" min-width="120" />
        <el-table-column label="结算日期" width="125"><template #default="s">{{ displayDate(s.row.settlementDate) }}</template></el-table-column>
        <el-table-column label="范围" min-width="210"><template #default="s">{{ displayDate(s.row.periodStart) }} — {{ displayDate(s.row.periodEnd) }}</template></el-table-column>
        <el-table-column label="金额" width="120"><template #default="s">{{ money(s.row.totalAmount) }}</template></el-table-column>
        <el-table-column label="来源" width="105"><template #default="s">{{ s.row.historical ? '历史补录' : '正常结算' }}</template></el-table-column>
        <el-table-column label="支付登记" width="110"><template #default="s">{{ s.row.paid ? '已登记' : '未登记' }}</template></el-table-column>
        <el-table-column prop="confirmedBy" label="确认人" width="110" />
        <el-table-column label="操作" min-width="180"><template #default="s"><el-button link type="primary" @click="showBatch(s.row.id)">明细/导出</el-button><el-button v-hasPermi="['wms:live:settlement:confirm']" link :disabled="s.row.paid" @click="registerPayment(s.row)">登记支付</el-button></template></el-table-column>
      </el-table>
      <pagination v-show="batchTotal > 0" :total="batchTotal" v-model:page="batchQuery.pageNum" v-model:limit="batchQuery.pageSize" @pagination="loadBatches" />
    </el-card>
    <el-dialog v-model="review.open" :title="review.mode === 'OPEN' ? '核实历史明细为未结算' : review.mode === 'HISTORICAL' ? '补录历史结算' : '确认结算'" width="1050px" :close-on-click-modal="false" :close-on-press-escape="!review.saving" :show-close="!review.saving">
      <el-form label-width="100px">
        <el-form-item v-if="review.mode !== 'OPEN'" label="结算日期"><el-date-picker v-model="review.date" type="date" value-format="YYYY-MM-DD" :format="LIVE_DATE_FORMAT" @change="review.preview = null" /></el-form-item>
        <el-form-item label="核实依据/说明"><el-input v-model="review.remark" type="textarea" maxlength="1000" /></el-form-item>
      </el-form>
      <el-alert v-if="review.mode === 'HISTORICAL'" title="请核对下列原金额与线下结算凭据一致。确认后原记录锁定，后续费率变化单独生成调整。" type="warning" :closable="false" />
      <el-button :loading="review.loading" style="margin:12px 0" @click="refreshPreview">核对金额</el-button>
      <template v-if="review.preview">
        <el-table :data="flatten(review.preview)" max-height="340">
          <el-table-column prop="typeLabel" label="来源" width="90" /><el-table-column label="日期"><template #default="s">{{ displayDate(s.row.businessDate) }}</template></el-table-column><el-table-column prop="accountLabel" label="平台" /><el-table-column prop="description" label="说明" /><el-table-column label="金额"><template #default="s">{{ money(s.row.amount) }}</template></el-table-column>
        </el-table>
        <p>开播 {{ money(review.preview.streamAmount) }} ＋ 佣金 {{ money(review.preview.commissionAmount) }} ＋ 调整 {{ money(review.preview.adjustmentAmount) }} ＝ <strong>{{ money(review.preview.totalAmount) }}</strong></p>
      </template>
      <template #footer><el-button :disabled="review.saving" @click="review.open=false">取消</el-button><el-button type="primary" :disabled="!review.preview || !review.remark.trim()" :loading="review.saving" @click="submit">确认{{ review.mode === 'OPEN' ? '核实' : '结算' }}</el-button></template>
    </el-dialog>
    <el-dialog v-model="detail.open" title="结算快照" width="1100px">
      <template v-if="detail.batch">
        <p>{{ detail.batch.settlementNo }} · {{ detail.batch.employeeName }} · {{ displayDate(detail.batch.settlementDate) }} · {{ money(detail.batch.totalAmount) }}</p>
        <p>确认人：{{ detail.batch.confirmedBy }}；说明：{{ detail.batch.remark }}；支付凭据：{{ detail.batch.paymentReference || '未登记' }}</p>
        <el-table :data="detail.rows" max-height="480"><el-table-column prop="typeLabel" label="来源" width="90" /><el-table-column prop="id" label="原记录编号" min-width="180" /><el-table-column label="业务日期"><template #default="s">{{ displayDate(s.row.businessDate) }}</template></el-table-column><el-table-column prop="accountLabel" label="平台" /><el-table-column prop="description" label="说明" /><el-table-column label="金额"><template #default="s">{{ money(s.row.amount) }}</template></el-table-column></el-table>
      </template>
      <template #footer><el-button @click="exportBatch">导出本批次</el-button><el-button @click="detail.open=false">关闭</el-button></template>
    </el-dialog>
  </div>
</template>
<script setup>
import { computed, getCurrentInstance, onMounted, onActivated, reactive, ref } from 'vue'
import { getLiveOptions, previewSettlement, confirmSettlement, reconcileSettlementOpen, listSettlements, getSettlement, markSettlementPaid } from '@/api/wms/livePayroll'
import LiveEmployeeSelect from '../components/LiveEmployeeSelect.vue'
import { money, displayDate, isoDate, monthRange, LIVE_DATE_FORMAT, settlementStatusLabel, adjustmentStatusLabel, downloadCsv } from '../shared'
import { flattenSettlement, selectedSettlementIds } from './settlementDisplay'
const { proxy } = getCurrentInstance()
const query = reactive({ employeeId: null }), options = reactive({ employees: [] }), dateRange = ref(monthRange())
const loading = ref(false), batchLoading = ref(false), candidates = ref([]), selection = ref([]), batches = ref([]), batchTotal = ref(0)
const batchQuery = reactive({ pageNum: 1, pageSize: 20 })
const review = reactive({ open: false, mode: 'NORMAL', date: isoDate(), remark: '', loading: false, saving: false, preview: null, command: null })
const detail = reactive({ open: false, batch: null, rows: [] })
const selectedAmount = computed(() => selection.value.reduce((total, row) => total + Number(row.amount), 0))
const flatten = flattenSettlement
function scope() { return { employeeId: query.employeeId, startDate: dateRange.value?.[0], endDate: dateRange.value?.[1] } }
function resetCandidates() { candidates.value=[]; selection.value=[]; batchQuery.pageNum=1; loadBatches() }
async function loadOptions() { Object.assign(options, await getLiveOptions()) }
async function loadCandidates() {
  if (!query.employeeId || !dateRange.value?.length) { proxy.$modal.msgWarning('请选择主播和日期范围'); return }
  loading.value=true
  try { await loadOptions(); const { data } = await previewSettlement(scope()); candidates.value=flatten(data); selection.value=[] } finally { loading.value=false }
}
async function loadBatches() { batchLoading.value=true; try { const res=await listSettlements({ ...batchQuery, employeeId:query.employeeId }); batches.value=res.rows || []; batchTotal.value=res.total || 0 } finally { batchLoading.value=false } }
async function prepare(mode) {
  const required = mode === 'NORMAL' ? ['OPEN', 'CONFIRMED'] : ['UNKNOWN']
  if (!selection.value.length || selection.value.some(row => !required.includes(row.status))) { proxy.$modal.msgWarning(mode === 'NORMAL' ? '请选择未结算记录或待结算调整' : '请选择待核实历史记录'); return }
  Object.assign(review, { open:true, mode, date:isoDate(), remark:'', loading:false, saving:false, preview:null,
    command:{ ...scope(), ...selectedSettlementIds(selection.value), requestKey:crypto.randomUUID(), historical:mode === 'HISTORICAL' } })
  await refreshPreview()
}
async function refreshPreview() {
  review.loading=true; review.preview=null
  try {
    review.command.settlementDate = review.mode === 'OPEN' ? null : review.date
    const { data } = await previewSettlement(review.command)
    review.preview=data
  } finally { review.loading=false }
}
async function submit() {
  if (review.saving || !review.preview || !review.remark.trim()) return
  review.saving=true
  try {
    const command={ ...review.command, token:review.preview.token, remark:review.remark }
    await (review.mode === 'OPEN' ? reconcileSettlementOpen(command) : confirmSettlement(command))
    review.open=false
    proxy.$modal.msgSuccess(review.mode === 'OPEN' ? '已核实为未结算' : '结算批次已保存，原记录已锁定')
    await Promise.all([loadCandidates(), loadBatches()])
  } finally { review.saving=false }
}
async function showBatch(id) { const { data }=await getSettlement(id); detail.batch=data; detail.rows=flatten(JSON.parse(data.snapshotJson)); detail.open=true }
async function registerPayment(row) {
  const { value } = await proxy.$prompt('填写付款、补发或扣减凭据；此操作仅登记支付结果。', '登记支付', { inputValidator:value => !!String(value || '').trim() || '凭据不能为空' })
  await markSettlementPaid(row.id,value); await loadBatches()
}
function exportBatch() {
  if (!detail.batch) return
  downloadCsv(detail.batch.settlementNo + '.csv', [
    {key:'settlementNo',label:'结算批次'},{key:'employeeName',label:'主播'},{key:'typeLabel',label:'来源'},{key:'id',label:'原记录编号'},{key:'businessDate',label:'业务日期'},{key:'postingDate',label:'入账日期'},{key:'accountLabel',label:'平台'},{key:'description',label:'说明'},{key:'amount',label:'结算金额'}
  ], detail.rows.map(row => ({...row,settlementNo:detail.batch.settlementNo,employeeName:detail.batch.employeeName})))
}
onMounted(async()=>{ await loadOptions(); await loadBatches() })
onActivated(loadOptions)
</script>
<style scoped lang="scss">
@import '../live.scss';
.live-actions { margin-bottom: 14px; flex-wrap: wrap; }
:deep(.pagination-container) { position: static; margin-top:16px; }
</style>
