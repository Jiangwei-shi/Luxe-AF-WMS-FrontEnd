<template>
  <div class="app-container inventory-statistic-page">
    <el-card>
      <el-form
        :model="queryParams"
        ref="queryRef"
        label-width="90px"
        class="statistic-query-form mt12"
        @submit.prevent="handleQuery"
      >
        <!-- 维度切换单独占一行 -->
        <el-row :gutter="16">
          <el-col :span="24">
            <el-form-item :label="tr('维度')" prop="itemId">
              <el-radio-group v-model="queryType" size="default" @change="handleSortTypeChange">
                <el-radio-button label="warehouse">{{ tr('仓库') }}</el-radio-button>
                <el-radio-button label="item">{{ tr('商品') }}</el-radio-button>
              </el-radio-group>
            </el-form-item>
          </el-col>
        </el-row>
        <el-row :gutter="16">
          <el-col :xs="24" :sm="12" :md="6" :lg="6">
            <el-form-item :label="tr('仓库')" prop="warehouseId">
              <el-select style="width: 100%" v-model="queryParams.warehouseId" :placeholder="tr('请选择仓库')"
                         filterable clearable>
                <el-option v-for="item in useWmsStore().warehouseList" :key="item.id" :label="item.warehouseName"
                           :value="item.id"/>
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :xs="24" :sm="12" :md="6" :lg="6">
            <el-form-item :label="tr('商品名称')" prop="itemName">
              <el-input v-model="queryParams.itemName" clearable :placeholder="tr('商品名称')"></el-input>
            </el-form-item>
          </el-col>
          <el-col :xs="24" :sm="12" :md="6" :lg="6">
            <el-form-item :label="tr('SKU编号')" prop="skuCode">
              <el-input v-model="queryParams.skuCode" clearable :placeholder="tr('SKU编号')"></el-input>
            </el-form-item>
          </el-col>
          <el-col :xs="24" :sm="12" :md="6" :lg="6">
            <el-form-item label=" ">
              <el-button type="primary" icon="Search" class="action-btn" native-type="submit">{{ tr('搜索') }}</el-button>
              <el-button icon="Refresh" class="action-btn" native-type="button" @click="resetQuery">{{ tr('重置') }}</el-button>
            </el-form-item>
          </el-col>
        </el-row>
      </el-form>
    </el-card>

    <el-card class="mt20">
      <el-row :gutter="10" class="mb8" type="flex" justify="space-between">
        <el-col :span="12">
          <span class="page-title">{{ tr('库存统计') }}</span>
        </el-col>
        <el-col :span="12" style="text-align: right">
          <el-checkbox v-model="filterable" :label="tr('过滤掉库存为0的商品')" size="large" @change="handleChangeFilterZero"/>
        </el-col>
      </el-row>

      <el-table
        ref="tableRef"
        :data="inventoryList"
        border
        :span-method="spanMethod"
        cell-class-name="vertical-top-cell"
        v-loading="loading"
        :empty-text="tr('暂无库存')"
        class="statistic-table"
        @sort-change="handleColumnSortChange"
      >
        <!-- ========== 仓库维度列 ========== -->
        <template v-if="queryType === 'warehouse'">
          <el-table-column :label="tr('仓库')" prop="warehouseGroupKey" min-width="240" align="center" show-overflow-tooltip>
            <template #default="{ row }">
              <div>{{ getWarehouseName(row) }}</div>
              <div>{{ tr('仓库商品总数') }}：{{ getWarehouseSummaryQuantity(row) }}</div>
              <div>{{ tr('仓库商品总价') }}：{{ formatMoney(getWarehouseSummaryAmount(row)) }}</div>
            </template>
          </el-table-column>
          <el-table-column :label="tr('商品名称')" prop="warehouseItemGroupKey" min-width="120" align="center" show-overflow-tooltip>
            <template #default="{ row }">{{ getItemName(row) }}</template>
          </el-table-column>
          <el-table-column :label="tr('商品图片')" width="110" align="center">
            <template #default="{ row }">
              <el-image
                v-if="getItemImage(row)"
                :src="getItemImage(row)"
                fit="cover"
                class="item-main-image"
                :preview-src-list="[getItemImage(row)]"
                preview-teleported
              >
                <template #error>
                  <div class="image-empty">{{ tr('暂无图片') }}</div>
                </template>
              </el-image>
              <div v-else class="image-empty">{{ tr('暂无图片') }}</div>
            </template>
          </el-table-column>
          <el-table-column :label="tr('SKU编号')" prop="skuCode" min-width="120" align="center" show-overflow-tooltip>
            <template #default="{ row }">
              {{ getSkuCode(row) }}
            </template>
          </el-table-column>
        </template>

        <!-- ========== 商品维度列 ========== -->
        <template v-else>
          <el-table-column :label="tr('商品名称')" prop="itemGroupKey" min-width="120" align="center" show-overflow-tooltip>
            <template #default="{ row }">{{ getItemName(row) }}</template>
          </el-table-column>
          <el-table-column :label="tr('商品图片')" width="110" align="center">
            <template #default="{ row }">
              <el-image
                v-if="getItemImage(row)"
                :src="getItemImage(row)"
                fit="cover"
                class="item-main-image"
                :preview-src-list="[getItemImage(row)]"
                preview-teleported
              >
                <template #error>
                  <div class="image-empty">{{ tr('暂无图片') }}</div>
                </template>
              </el-image>
              <div v-else class="image-empty">{{ tr('暂无图片') }}</div>
            </template>
          </el-table-column>
          <el-table-column :label="tr('SKU编号')" prop="skuGroupKey" min-width="120" align="center" show-overflow-tooltip>
            <template #default="{ row }">
              {{ getSkuCode(row) }}
            </template>
          </el-table-column>
          <el-table-column :label="tr('仓库')" prop="skuWarehouseGroupKey" min-width="80" align="center" show-overflow-tooltip>
            <template #default="{ row }">
              {{ getWarehouseName(row) }}
            </template>
          </el-table-column>
        </template>

        <!-- ========== 库存数量 ========== -->
        <el-table-column :label="tr('库存数量')" prop="quantity" width="90" align="center">
          <template #default="{ row }">
            {{ Number(row.quantity) }}
          </template>
        </el-table-column>

        <!-- ========== 新增列：入库时间 ========== -->
        <el-table-column :label="tr('入库时间')" prop="receiptTime" width="168" align="center" sortable="custom">
          <template #default="{ row }">
            {{ formatTime(row.receiptTime) }}
          </template>
        </el-table-column>

        <!-- ========== 新增列：出库时间 ========== -->
        <el-table-column :label="tr('出库时间')" prop="shipmentTime" width="168" align="center" sortable="custom">
          <template #default="{ row }">
            <!-- 有出库历史但库存未清零时 shipmentTime 为 null，属于业务规则，显示 -- -->
            {{ formatTime(row.shipmentTime) }}
          </template>
        </el-table-column>

        <!-- ========== 新增列：周转天数 ========== -->
        <el-table-column :label="tr('周转天数')" prop="turnoverDays" width="125" align="center" sortable="custom">
          <template #default="{ row }">
            <span v-if="row.turnoverDays != null">{{ row.turnoverDays }}</span>
            <span v-else>--</span>
          </template>
        </el-table-column>

        <!-- ========== 新增列：平均成本价 ========== -->
        <el-table-column :label="tr('平均成本价')" prop="avgReceiptCost" width="135" align="center" sortable="custom">
          <template #default="{ row }">
            {{ formatMoney(row.avgReceiptCost) }}
          </template>
        </el-table-column>

        <!-- ========== 新增列：平均销售价 ========== -->
        <el-table-column :label="tr('平均销售价')" prop="avgShipmentPrice" width="135" align="center" sortable="custom">
          <template #default="{ row }">
            <!-- 有出库历史但库存未清零时 avgShipmentPrice 正常显示；无出库时为 null，显示 -- -->
            {{ formatMoney(row.avgShipmentPrice) }}
          </template>
        </el-table-column>

        <!-- ========== 新增列：利润 ========== -->
        <el-table-column :label="tr('利润')" prop="totalProfit" width="110" align="center" sortable="custom">
          <template #default="{ row }">
            <!--
              totalProfit 语义：
              - 无出库时后端返回 0，显示 0.00
              - 有出库时显示历史累计利润
              - null 显示 --（兜底）
            -->
            {{ formatProfit(row.totalProfit) }}
          </template>
        </el-table-column>
      </el-table>

      <el-row>
        <pagination v-show="total > 0" :total="total" v-model:page="queryParams.pageNum"
                    v-model:limit="queryParams.pageSize" @pagination="getList"/>
      </el-row>
    </el-card>
  </div>
</template>

<script setup name="Inventory">
import { listInventoryBoard } from '@/api/wms/inventory'
import { computed, getCurrentInstance, onMounted, ref } from 'vue'
import { getRowspanMethod } from '@/utils/getRowSpanMethod'
import { useWmsStore } from '@/store/modules/wms'
import useSettingsStore from '@/store/modules/settings'
import { translateByMap } from '@/locales/runtime-map'

const { proxy } = getCurrentInstance()
const settingsStore = useSettingsStore()
const spanMethod = computed(() => getRowspanMethod(inventoryList.value, rowSpanArray.value))

const inventoryList = ref([])
const loading = ref(true)
const total = ref(0)
const tableRef = ref(null)
const rowSpanArray = ref(['warehouseGroupKey', 'warehouseItemGroupKey'])
const warehouseSummaryMap = ref(new Map())

const filterable = ref(false)
const queryType = ref('warehouse')
const queryParams = ref({
  pageNum: 1,
  pageSize: 10,
  skuId: undefined,
  warehouseId: undefined,
  itemName: undefined,
  skuCode: undefined,
  minQuantity: undefined,
  orderByColumn: undefined,
  isAsc: undefined
})

// ───────────── 格式化工具函数 ─────────────

/**
 * 金额格式化：null/undefined → '--'，否则保留两位小数
 */
function formatMoney(v) {
  if (v === null || v === undefined) return '--'
  const n = Number(v)
  if (!Number.isFinite(n)) return '--'
  return n.toFixed(2)
}

/**
 * 利润格式化：null → '--'，0 → '0.00'，其余保留两位小数
 * totalProfit 无出库时后端返回 0，不应显示 '--'
 */
function formatProfit(v) {
  if (v === null || v === undefined) return '--'
  const n = Number(v)
  if (!Number.isFinite(n)) return '--'
  return n.toFixed(2)
}

/**
 * 获取仓库聚合后的总数量
 */
function getWarehouseSummaryQuantity(row) {
  return warehouseSummaryMap.value.get(getWarehouseGroupKey(row))?.quantity ?? 0
}

/**
 * 获取仓库聚合后的总价（quantity * avgReceiptCost）
 */
function getWarehouseSummaryAmount(row) {
  return warehouseSummaryMap.value.get(getWarehouseGroupKey(row))?.amount ?? 0
}

function getWarehouseGroupKey(row) {
  return String(row?.warehouseName ?? '')
}

function getWarehouseName(row) {
  return row?.warehouseName || '-'
}

function getItemName(row) {
  return row?.itemName || '-'
}

function getItemImage(row) {
  return row?.itemImage || ''
}

function getSkuCode(row) {
  return row?.skuCode || '-'
}

/**
 * 按当前筛选条件拉取全部分页数据并做仓库聚合
 */
const fetchWarehouseSummaryMap = async (query, type) => {
  const pageSize = 200
  const baseQuery = { ...query, pageNum: 1, pageSize }
  const summaryMap = new Map()
  const collectRows = (rows = []) => {
    rows.forEach(it => {
      const warehouseKey = getWarehouseGroupKey(it)
      if (!warehouseKey) return
      const quantity = Number(it.quantity) || 0
      const avgReceiptCost = Number(it.avgReceiptCost)
      const amount = Number.isFinite(avgReceiptCost) ? (avgReceiptCost * quantity) : 0
      const current = summaryMap.get(warehouseKey) || { quantity: 0, amount: 0 }
      current.quantity += quantity
      current.amount += amount
      summaryMap.set(warehouseKey, current)
    })
  }

  const firstRes = await listInventoryBoard(baseQuery, type)
  collectRows(firstRes.rows || [])

  const totalRows = Number(firstRes.total) || 0
  const totalPages = Math.ceil(totalRows / pageSize)
  for (let pageNum = 2; pageNum <= totalPages; pageNum++) {
    const pageRes = await listInventoryBoard({ ...baseQuery, pageNum }, type)
    collectRows(pageRes.rows || [])
  }
  return summaryMap
}

/**
 * 时间格式化：null/undefined → '--'，否则格式化为 yyyy-MM-dd HH:mm:ss
 * shipmentTime 为 null 可能是"有出库历史但库存未清零"的业务规则，统一显示 '--'
 */
function formatTime(t) {
  if (t === null || t === undefined) return '--'
  const result = proxy.parseTime(t)
  return result || '--'
}

// ───────────── 数据获取 ─────────────

const getList = async () => {
  const query = { ...queryParams.value }
  if (filterable.value) {
    query.minQuantity = 1
  } else {
    query.minQuantity = undefined
  }

  loading.value = true
  try {
    if (queryType.value === 'warehouse') {
      warehouseSummaryMap.value = await fetchWarehouseSummaryMap(query, queryType.value)
    } else {
      warehouseSummaryMap.value = new Map()
    }

    const res = await listInventoryBoard(query, queryType.value)
    let rows = res.rows || []
    if (filterable.value) {
      rows = rows.filter(it => Number(it.quantity) !== 0)
    }

    rows.forEach(it => {
      const warehouseKey = getWarehouseGroupKey(it)
      const itemKey = String(it.itemName ?? '')
      const skuKey = String(it.skuCode ?? '')

      it.warehouseGroupKey = warehouseKey
      it.itemGroupKey = itemKey
      it.skuGroupKey = skuKey
      it.warehouseItemGroupKey = `${warehouseKey}-${itemKey}`
      it.skuWarehouseGroupKey = `${skuKey}-${warehouseKey}`
    })

    inventoryList.value = rows
    total.value = res.total ?? 0
  } finally {
    loading.value = false
  }
}

const handleQuery = () => {
  queryParams.value.pageNum = 1
  getList()
}

const resetQuery = () => {
  queryParams.value.orderByColumn = undefined
  queryParams.value.isAsc = undefined
  proxy.resetForm('queryRef')
  tableRef.value?.clearSort?.()
  handleQuery()
}

const handleColumnSortChange = ({ prop, order }) => {
  queryParams.value.orderByColumn = prop || undefined
  queryParams.value.isAsc = order === 'ascending' ? 'ascending' : order === 'descending' ? 'descending' : undefined
  queryParams.value.pageNum = 1
  getList()
}

const handleSortTypeChange = (e) => {
  if (e === 'warehouse') {
    rowSpanArray.value = ['warehouseGroupKey', 'warehouseItemGroupKey']
  } else if (e === 'item') {
    rowSpanArray.value = ['itemGroupKey', 'skuGroupKey', 'skuWarehouseGroupKey']
  }
  queryParams.value.pageNum = 1
  getList()
}

const handleChangeFilterZero = () => {
  queryParams.value.pageNum = 1
  getList()
}

const tr = (text) => translateByMap(text, settingsStore.language || 'zh-cn')

onMounted(() => {
  useWmsStore().getWarehouseList()
  getList()
})
</script>

<style scoped lang="scss">
.page-title {
  font-size: large;
}

.mt12 {
  margin-top: 12px;
}

.statistic-query-form :deep(.el-form-item) {
  margin-bottom: 18px;
}

.inventory-statistic-page .action-btn {
  min-width: 88px;
}

.statistic-table {
  width: 100%;
}

:deep(.vertical-top-cell) {
  vertical-align: top;
}

.item-main-image {
  width: 72px;
  height: 72px;
  border-radius: 6px;
  display: inline-block;
}

.image-empty {
  width: 72px;
  height: 72px;
  border-radius: 6px;
  border: 1px dashed var(--el-border-color, #dcdfe6);
  display: inline-flex;
  align-items: center;
  justify-content: center;
  color: var(--el-text-color-secondary, #909399);
  font-size: 12px;
}

</style>
