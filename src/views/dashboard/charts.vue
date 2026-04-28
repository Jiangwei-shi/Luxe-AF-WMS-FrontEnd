<template>
  <div class="dashboard-page">
    <div class="kpi-grid">
      <el-card v-for="card in kpiCards" :key="card.title" shadow="never" class="kpi-card">
        <div class="kpi-content">
          <div class="kpi-icon" :class="card.iconClass">
            <component :is="card.icon" />
          </div>
          <div class="kpi-main">
            <div class="kpi-title">{{ card.title }}</div>
            <div class="kpi-value-row">
              <span class="kpi-value">{{ card.value }}</span>
              <span class="kpi-unit" v-if="card.unit">{{ card.unit }}</span>
              <el-tag v-if="card.tag" size="small" type="danger" effect="light">{{ card.tag }}</el-tag>
            </div>
            <div v-if="card.subText" class="kpi-sub">{{ card.subText }}</div>
          </div>
        </div>
      </el-card>
    </div>

    <div class="panel-grid">
      <el-card shadow="never" class="panel-card">
        <template #header>
          <div class="panel-header">
            <span>Brand 库存占比分析</span>
            <el-icon><InfoFilled /></el-icon>
          </div>
        </template>
        <div class="panel-subtitle">全部仓库内不同 Brand 的库存占比及具体数量</div>
        <div class="panel-content two-col">
          <div ref="brandPieRef" class="chart-box small"></div>
          <div class="brand-table">
            <div class="brand-head">
              <span>Brand</span><span>数量（件）</span><span>占比</span>
            </div>
            <div v-for="row in brandRows" :key="row.name" class="brand-row">
              <span class="brand-name">
                <i class="dot" :style="{ backgroundColor: row.color }"></i>{{ row.name }}
              </span>
              <span>{{ row.value }}</span>
              <span>{{ row.rate }}%</span>
            </div>
            <div class="top-brand">Top Brand: <b>CHANEL</b></div>
          </div>
        </div>
      </el-card>

      <el-card shadow="never" class="panel-card">
        <template #header>
          <div class="panel-header"><span>库存周转天数分布</span></div>
        </template>
        <div class="panel-subtitle">按周转周期分组，突出高周转与滞销库存</div>
        <div class="turnover-rows">
          <div v-for="row in turnoverRows" :key="row.label" class="turnover-row">
            <span class="t-label">{{ row.label }}</span>
            <div class="t-bar-wrap">
              <div class="t-bar" :style="{ width: row.width + '%', background: row.color }"></div>
            </div>
            <span class="t-value">{{ row.value }}件</span>
            <span class="t-rate">{{ row.rate }}%</span>
            <el-tag size="small" :type="row.tagType" effect="light">{{ row.tag }}</el-tag>
          </div>
        </div>
        <div class="panel-warning">滞销库存预警：15天以上库存占比偏高</div>
      </el-card>

      <el-card shadow="never" class="panel-card">
        <template #header>
          <div class="panel-header">
            <span>货物价值区间分布</span>
            <el-icon><InfoFilled /></el-icon>
          </div>
        </template>
        <div class="panel-subtitle">展示库存货物按价值区间的数量与占比</div>
        <div ref="valueBarRef" class="chart-box medium"></div>
        <div class="panel-footnote">高价值库存（5001以上）占比 23%</div>
      </el-card>

      <el-card shadow="never" class="panel-card">
        <template #header>
          <div class="panel-header">
            <span>毛利润对比分析</span>
            <el-icon><InfoFilled /></el-icon>
          </div>
        </template>
        <div class="compare-toolbar">
          <div class="toolbar-item">时间段A：2026-03-01 至 2026-03-31</div>
          <div class="toolbar-item">时间段B：2026-04-01 至 2026-04-30</div>
          <el-radio-group v-model="period" size="small">
            <el-radio-button label="1个月" />
            <el-radio-button label="季度" />
            <el-radio-button label="半年" />
            <el-radio-button label="一年" />
          </el-radio-group>
        </div>
        <div class="chart-mode-row">
          <el-radio-group v-model="compareMode" size="small">
            <el-radio-button label="aligned">按周期第N天对比</el-radio-button>
            <el-radio-button label="realDate">按真实日期展示</el-radio-button>
          </el-radio-group>
        </div>
        <div class="compare-kpis">
          <div class="mini-kpi">
            <div>时间段A毛利润</div>
            <b>￥{{ formatNumber(compareSummary.aTotal) }}</b>
          </div>
          <div class="mini-kpi">
            <div>时间段B毛利润</div>
            <b class="positive">￥{{ formatNumber(compareSummary.bTotal) }}</b>
          </div>
          <div class="mini-kpi">
            <div>差值</div>
            <b class="warning">{{ compareSummary.diff >= 0 ? '+' : '-' }}￥{{ formatNumber(Math.abs(compareSummary.diff)) }}</b>
          </div>
          <div class="mini-kpi">
            <div>增幅</div>
            <b :class="compareSummary.growth >= 0 ? 'positive' : 'warning'">
              {{ compareSummary.growth >= 0 ? '+' : '' }}{{ compareSummary.growth.toFixed(1) }}%
            </b>
          </div>
          <div class="trend-box">
            <el-icon><TrendCharts /></el-icon>
            <span>{{ compareSummary.diff >= 0 ? '当前趋势向好' : '当前趋势承压' }}</span>
          </div>
        </div>
        <div ref="profitLineRef" class="chart-box medium"></div>
        <div v-if="compareMode === 'aligned' && hasDifferentRangeLength" class="chart-tip warning">
          两个时间段天数不一致，当前图表已按较短周期对齐比较。
        </div>
        <div v-if="compareMode === 'realDate'" class="chart-tip info">
          当前为按真实日期展示（非对齐比较模式），用于观察趋势，不用于同日严格对比。
        </div>
      </el-card>
    </div>
  </div>
</template>

<script setup>
import * as echarts from 'echarts'
import { Box, Coin, TrendCharts, WarningFilled, InfoFilled } from '@element-plus/icons-vue'
import { computed, nextTick, onBeforeUnmount, onMounted, ref, watch } from 'vue'

const period = ref('1个月')
const compareMode = ref('aligned')
const brandPieRef = ref(null)
const valueBarRef = ref(null)
const profitLineRef = ref(null)
let brandPieChart = null
let valueBarChart = null
let profitLineChart = null

const kpiCards = [
  { title: '当前库存总量', value: '1,248', unit: '件', icon: Box, iconClass: 'blue' },
  { title: '库存总价值', value: '¥3,860,000', icon: Coin, iconClass: 'purple' },
  { title: '本月毛利润', value: '¥152,400', subText: '+18.5%', icon: TrendCharts, iconClass: 'green' },
  { title: '15天以上库存占比', value: '29%', tag: '预警', icon: WarningFilled, iconClass: 'red' }
]

const brandRows = [
  { name: 'CHANEL', value: 320, rate: 26, color: '#2f75ff' },
  { name: 'LOUIS VUITTON', value: 260, rate: 21, color: '#17c2d1' },
  { name: 'HERMES', value: 180, rate: 15, color: '#41cc84' },
  { name: 'GUCCI', value: 160, rate: 13, color: '#f3c347' },
  { name: 'DIOR', value: 140, rate: 11, color: '#8d71ee' },
  { name: '其他', value: 188, rate: 14, color: '#a6adbb' }
]

const turnoverRows = [
  { label: '1-7天', value: 420, rate: 38, width: 100, color: '#24c08a', tag: '健康', tagType: 'success' },
  { label: '8-14天', value: 360, rate: 33, width: 86, color: '#f5ac2e', tag: '提醒', tagType: 'warning' },
  { label: '15天以上', value: 320, rate: 29, width: 76, color: '#ef5454', tag: '预警', tagType: 'danger' }
]

const periodA = {
  label: '时间段A',
  startDate: '2026-03-01',
  endDate: '2026-03-31',
  values: [
    9000, 12000, 11000, 14000, 13000, 18000, 16500, 20000, 18500, 22000,
    21000, 24000, 23800, 25000, 13800, 22000, 21000, 23200, 24500, 26000,
    25500, 26800, 27400, 28200, 28800, 29700, 30500, 31200, 32000, 32900, 33500
  ]
}

const periodB = {
  label: '时间段B',
  startDate: '2026-04-01',
  endDate: '2026-04-30',
  values: [
    11000, 10500, 15000, 14500, 17000, 25000, 23000, 27500, 26000, 29000,
    32000, 30000, 34000, 33200, 28900, 31800, 32500, 33800, 35200, 36000,
    37200, 36600, 37800, 39000, 40200, 41500, 42200, 43800, 44600, 45800
  ]
}

const alignedDayTicks = [1, 5, 10, 15, 20, 25, 30]

const minCompareLength = computed(() => Math.min(periodA.values.length, periodB.values.length))
const hasDifferentRangeLength = computed(() => periodA.values.length !== periodB.values.length)

const compareSummary = computed(() => {
  const aTotal = periodA.values.reduce((sum, n) => sum + n, 0)
  const bTotal = periodB.values.reduce((sum, n) => sum + n, 0)
  const diff = bTotal - aTotal
  const growth = aTotal ? (diff / aTotal) * 100 : 0
  return { aTotal, bTotal, diff, growth }
})

const formatNumber = (num) => Number(num || 0).toLocaleString('en-US')

const dateAt = (startDate, dayIndex) => {
  const dt = new Date(startDate)
  dt.setDate(dt.getDate() + dayIndex - 1)
  const y = dt.getFullYear()
  const m = `${dt.getMonth() + 1}`.padStart(2, '0')
  const d = `${dt.getDate()}`.padStart(2, '0')
  return `${y}-${m}-${d}`
}

const handleResize = () => {
  brandPieChart?.resize()
  valueBarChart?.resize()
  profitLineChart?.resize()
}

const initBrandPie = () => {
  if (!brandPieRef.value) return
  brandPieChart = echarts.init(brandPieRef.value)
  brandPieChart.setOption({
    tooltip: { trigger: 'item', formatter: '{b}<br/>{c}件 ({d}%)' },
    graphic: [
      { type: 'text', left: 'center', top: '42%', style: { text: '总库存', fill: '#8b95a7', fontSize: 12 } },
      { type: 'text', left: 'center', top: '50%', style: { text: '1,248', fill: '#101828', fontSize: 26, fontWeight: 700 } },
      { type: 'text', left: 'center', top: '63%', style: { text: '件', fill: '#8b95a7', fontSize: 12 } }
    ],
    series: [{
      type: 'pie',
      radius: ['55%', '74%'],
      center: ['40%', '56%'],
      label: { formatter: '{d}%' },
      data: brandRows.map((item) => ({ value: item.value, name: item.name, itemStyle: { color: item.color } }))
    }]
  })
}

const initValueBar = () => {
  if (!valueBarRef.value) return
  valueBarChart = echarts.init(valueBarRef.value)
  valueBarChart.setOption({
    grid: { top: 20, left: 40, right: 20, bottom: 28 },
    xAxis: {
      type: 'category',
      data: ['0-500', '501-1000', '1001-2000', '2001-5000', '5001-10000', '10000以上'],
      axisTick: { show: false }
    },
    yAxis: { type: 'value', name: '数量（件）' },
    series: [{
      type: 'bar',
      barWidth: 24,
      data: [
        { value: 140, itemStyle: { color: '#4b9cff' } },
        { value: 220, itemStyle: { color: '#5aa6ff' } },
        { value: 310, itemStyle: { color: '#66afff' } },
        { value: 290, itemStyle: { color: '#4e9cff' } },
        { value: 180, itemStyle: { color: '#8d71ee' } },
        { value: 108, itemStyle: { color: '#7f62e4' } }
      ],
      label: { show: true, position: 'top', color: '#344054' }
    }]
  })
}

const initProfitLine = () => {
  if (!profitLineRef.value) return
  profitLineChart = echarts.init(profitLineRef.value)
  setProfitLineOptions()
}

const setProfitLineOptions = () => {
  if (!profitLineChart) return

  const isAligned = compareMode.value === 'aligned'
  const xData = isAligned
    ? Array.from({ length: minCompareLength.value }, (_, i) => i + 1)
    : Array.from(
      { length: Math.max(periodA.values.length, periodB.values.length) },
      (_, i) => dateAt(periodA.startDate, i + 1)
    )

  const seriesAData = isAligned
    ? periodA.values.slice(0, minCompareLength.value)
    : periodA.values

  const seriesBData = isAligned
    ? periodB.values.slice(0, minCompareLength.value)
    : [...periodB.values, ...Array(Math.max(0, xData.length - periodB.values.length)).fill(null)]

  profitLineChart.setOption({
    tooltip: {
      trigger: 'axis',
      formatter: (params) => {
        if (!params?.length) return ''
        const aPoint = params.find((item) => item.seriesName === periodA.label)
        const bPoint = params.find((item) => item.seriesName === periodB.label)
        const xIndex = params[0].dataIndex + 1

        if (isAligned) {
          const aValue = Number(aPoint?.data ?? 0)
          const bValue = Number(bPoint?.data ?? 0)
          const diff = bValue - aValue
          const growth = aValue ? (diff / aValue) * 100 : 0
          return [
            `第${xIndex}天`,
            `${periodA.label}：${dateAt(periodA.startDate, xIndex)}，毛利润 ￥${formatNumber(aValue)}`,
            `${periodB.label}：${dateAt(periodB.startDate, xIndex)}，毛利润 ￥${formatNumber(bValue)}`,
            `差值：${diff >= 0 ? '+' : '-'}￥${formatNumber(Math.abs(diff))}`,
            `增长：${growth >= 0 ? '+' : ''}${growth.toFixed(1)}%`
          ].join('<br/>')
        }

        const aDate = dateAt(periodA.startDate, xIndex)
        const bDate = xIndex <= periodB.values.length ? dateAt(periodB.startDate, xIndex) : '无数据'
        return [
          `真实日期：${params[0].axisValue}`,
          `${periodA.label}（${aDate}）：￥${aPoint?.data != null ? formatNumber(aPoint.data) : '-'}`,
          `${periodB.label}（${bDate}）：￥${bPoint?.data != null ? formatNumber(bPoint.data) : '-'}`
        ].join('<br/>')
      }
    },
    legend: { bottom: 0, data: [periodA.label, periodB.label] },
    grid: { top: 20, left: 45, right: 20, bottom: 32 },
    xAxis: {
      type: 'category',
      data: xData,
      axisTick: { show: false },
      axisLabel: {
        formatter: (value) => {
          if (!isAligned) return value.slice(5)
          const day = Number(value)
          return alignedDayTicks.includes(day) ? `第${day}天` : ''
        }
      },
      name: isAligned ? '周期对齐坐标' : '真实日期'
    },
    yAxis: { type: 'value', name: '毛利润（¥）' },
    series: [
      {
        name: periodA.label,
        type: 'line',
        smooth: true,
        symbol: 'circle',
        symbolSize: 6,
        itemStyle: { color: '#2f75ff' },
        data: seriesAData
      },
      {
        name: periodB.label,
        type: 'line',
        smooth: true,
        symbol: 'circle',
        symbolSize: 6,
        itemStyle: { color: '#2dbf8e' },
        data: seriesBData
      }
    ]
  })
}

onMounted(() => {
  nextTick(() => {
    initBrandPie()
    initValueBar()
    initProfitLine()
    window.addEventListener('resize', handleResize)
  })
})

onBeforeUnmount(() => {
  window.removeEventListener('resize', handleResize)
  brandPieChart?.dispose()
  valueBarChart?.dispose()
  profitLineChart?.dispose()
  brandPieChart = null
  valueBarChart = null
  profitLineChart = null
})

watch(compareMode, () => {
  setProfitLineOptions()
})
</script>

<style scoped lang="scss">
.dashboard-page {
  padding: 12px;
  background: #f5f7fb;
  min-height: calc(100vh - 84px);
}

.kpi-grid {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 12px;
  margin-bottom: 12px;
}

.kpi-card {
  border-radius: 10px;
  border: 1px solid #e8edf5;
}

.kpi-content {
  display: flex;
  align-items: center;
  gap: 14px;
}

.kpi-icon {
  width: 48px;
  height: 48px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 24px;
}

.kpi-icon.blue { background: #eaf3ff; color: #2f75ff; }
.kpi-icon.purple { background: #efe9ff; color: #7f62e4; }
.kpi-icon.green { background: #e8f8ef; color: #2dbf8e; }
.kpi-icon.red { background: #fff1ef; color: #ef5454; }

.kpi-title {
  font-size: 13px;
  color: #667085;
  margin-bottom: 6px;
}

.kpi-value-row {
  display: flex;
  align-items: baseline;
  gap: 8px;
}

.kpi-value {
  font-size: 34px;
  font-weight: 700;
  color: #101828;
  line-height: 1;
}

.kpi-unit {
  color: #667085;
  font-size: 14px;
}

.kpi-sub {
  margin-top: 6px;
  color: #2dbf8e;
  font-size: 14px;
  font-weight: 600;
}

.panel-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 12px;
}

.panel-card {
  border-radius: 10px;
  border: 1px solid #e8edf5;
}

.panel-header {
  display: flex;
  align-items: center;
  gap: 6px;
  font-weight: 700;
  color: #1d2939;
}

.panel-subtitle {
  color: #98a2b3;
  font-size: 12px;
  margin-bottom: 10px;
}

.panel-content.two-col {
  display: grid;
  grid-template-columns: 42% 58%;
  gap: 8px;
}

.chart-box.small {
  height: 235px;
}

.chart-box.medium {
  height: 260px;
}

.brand-table {
  font-size: 13px;
}

.brand-head,
.brand-row {
  display: grid;
  grid-template-columns: 1.5fr 1fr 0.8fr;
  align-items: center;
  padding: 6px 0;
}

.brand-head {
  color: #667085;
  border-bottom: 1px solid #eef2f7;
}

.brand-row {
  color: #344054;
}

.brand-name {
  display: flex;
  align-items: center;
  gap: 6px;
}

.dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  display: inline-block;
}

.top-brand {
  margin-top: 10px;
  background: #eef4ff;
  color: #2f75ff;
  border-radius: 8px;
  padding: 8px 10px;
  font-size: 13px;
}

.turnover-rows {
  display: flex;
  flex-direction: column;
  gap: 14px;
  margin-top: 8px;
}

.turnover-row {
  display: grid;
  grid-template-columns: 56px minmax(0, 1fr) 60px 50px 56px;
  gap: 8px;
  align-items: center;
}

.t-label { color: #344054; }
.t-value { color: #344054; font-weight: 600; }
.t-rate { color: #667085; }

.t-bar-wrap {
  height: 16px;
  border-radius: 10px;
  background: #f2f4f7;
  overflow: hidden;
}

.t-bar {
  height: 100%;
  border-radius: 10px;
}

.panel-warning {
  margin-top: 14px;
  background: #fff3f0;
  color: #d94841;
  border: 1px solid #ffd9d3;
  border-radius: 8px;
  padding: 8px 10px;
  font-size: 13px;
}

.panel-footnote {
  margin-top: 10px;
  background: #f1ebff;
  color: #7f62e4;
  border-radius: 8px;
  padding: 8px 10px;
  font-size: 13px;
}

.compare-toolbar {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-wrap: wrap;
  margin-bottom: 8px;
}

.toolbar-item {
  border: 1px solid #e4e7ed;
  border-radius: 6px;
  padding: 6px 10px;
  font-size: 12px;
  color: #475467;
  background: #fff;
}

.compare-kpis {
  display: grid;
  grid-template-columns: repeat(5, minmax(0, 1fr));
  gap: 8px;
  margin-bottom: 6px;
}

.chart-mode-row {
  display: flex;
  justify-content: flex-end;
  margin-bottom: 8px;
}

.chart-tip {
  margin-top: 8px;
  padding: 8px 10px;
  border-radius: 8px;
  font-size: 12px;
}

.chart-tip.warning {
  color: #b54708;
  background: #fffaeb;
  border: 1px solid #fedf89;
}

.chart-tip.info {
  color: #175cd3;
  background: #eff8ff;
  border: 1px solid #b2ddff;
}

.mini-kpi {
  border: 1px solid #eaecf0;
  border-radius: 8px;
  background: #fafbfd;
  padding: 8px 10px;
  font-size: 12px;
  color: #667085;
}

.mini-kpi b {
  display: block;
  font-size: 24px;
  color: #344054;
  margin-top: 4px;
}

.mini-kpi b.positive { color: #12b76a; }
.mini-kpi b.warning { color: #f79009; }

.trend-box {
  border: 1px dashed #b2f1d5;
  border-radius: 8px;
  background: #edfff5;
  color: #12b76a;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  font-size: 13px;
  font-weight: 600;
}

@media (max-width: 1400px) {
  .kpi-grid,
  .panel-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}

@media (max-width: 900px) {
  .kpi-grid,
  .panel-grid,
  .compare-kpis,
  .panel-content.two-col {
    grid-template-columns: 1fr;
  }
}
</style>
