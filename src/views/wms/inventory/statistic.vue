<template>
  <div class="app-container">
    <el-card>
      <el-form :model="queryParams" ref="queryRef" label-width="90px" class="filter-form">
        <el-form-item class="filter-item filter-item-full" label="维度 " prop="itemId">
          <el-radio-group v-model="queryType" size="default" @change="handleSortTypeChange">
            <el-radio-button label="warehouse">仓库</el-radio-button>
            <el-radio-button label="item">商品</el-radio-button>
          </el-radio-group>
        </el-form-item>
        <el-form-item class="filter-item" label="仓库" prop="warehouseId">
          <el-select style="width: 100%" v-model="queryParams.warehouseId" placeholder="请选择仓库"
                     filterable clearable>
            <el-option v-for="item in useWmsStore().warehouseList" :key="item.id" :label="item.warehouseName"
                       :value="item.id"/>
          </el-select>
        </el-form-item>
        <el-form-item class="filter-item" label="商品名称" prop="itemName">
          <el-input v-model="queryParams.itemName" clearable placeholder="商品名称"></el-input>
        </el-form-item>
        <el-form-item class="filter-item" label="SKU编号" prop="skuCode">
          <el-input v-model="queryParams.skuCode" clearable placeholder="SKU编号"></el-input>
        </el-form-item>
        <el-form-item class="filter-item filter-item-actions">
          <el-button type="primary" icon="Search" @click="handleQuery">搜索</el-button>
          <el-button icon="Refresh" @click="resetQuery">重置</el-button>
        </el-form-item>
      </el-form>
    </el-card>
    <el-card class="mt20">
      <div class="mb8 flex-space-between">
        <div style="font-size: large">库存统计</div>
        <el-checkbox v-model="filterable" label="过滤掉库存为0的商品" size="large" @change="handleChangeFilterZero"/>
      </div>
      <el-table :data="inventoryList" border :span-method="spanMethod"
                cell-class-name="vertical-top-cell" v-loading="loading" empty-text="暂无库存">
        <template v-if="queryType == 'warehouse'">
          <el-table-column label="仓库" prop="warehouseId">
            <template #default="{ row }">
              <div>{{ useWmsStore().warehouseMap.get(row.warehouseId)?.warehouseName }}</div>
            </template>
          </el-table-column>
          <el-table-column label="商品名称" prop="warehouseIdAndItemId">
            <template #default="{ row }">
              <div>{{ row.item.itemName }}</div>
            </template>
          </el-table-column>
          <el-table-column label="SKU编号" :prop="skuId">
            <template #default="{ row }">
              <div v-if="row.itemSku?.skuCode">{{ row.itemSku.skuCode }}</div>
              <div v-else>-</div>
            </template>
          </el-table-column>
        </template>
        <template v-else>
          <el-table-column label="商品名称" prop="itemId">
            <template #default="{ row }">
              <div>{{ row.item.itemName }}</div>
            </template>
          </el-table-column>
          <el-table-column label="SKU编号" prop="skuId">
            <template #default="{ row }">
              <div v-if="row.itemSku?.skuCode">{{ row.itemSku.skuCode }}</div>
              <div v-else>-</div>
            </template>
          </el-table-column>
          <el-table-column label="仓库" prop="skuIdAndWarehouseId">
            <template #default="{row}">
              <div>{{ useWmsStore().warehouseMap.get(row.warehouseId)?.warehouseName }}</div>
            </template>
          </el-table-column>
        </template>
        <el-table-column label="库存" prop="quantity" align="right">
          <template #default="{ row }">
            <el-statistic :value="Number(row.quantity)" :precision="0"/>
          </template>
        </el-table-column>
      </el-table>

      <el-row>
        <pagination v-show="total>0" :total="total" v-model:page="queryParams.pageNum"
                    v-model:limit="queryParams.pageSize" @pagination="getList"/>
      </el-row>
    </el-card>
  </div>
</template>

<script setup name="Inventory">
import {
  listInventoryBoard
} from '@/api/wms/inventory';
import {computed, getCurrentInstance, onMounted, ref} from 'vue';
import {ElForm} from 'element-plus';
import {getRowspanMethod} from "@/utils/getRowSpanMethod";
import {useWmsStore} from '@/store/modules/wms'

const {proxy} = getCurrentInstance();
const spanMethod = computed(() => getRowspanMethod(inventoryList.value, rowSpanArray.value))

const inventoryList = ref([]);
const buttonLoading = ref(false);
const loading = ref(true);
const showSearch = ref(true);
const ids = ref([]);
const single = ref(true);
const multiple = ref(true);
const total = ref(0);
const rowSpanArray = ref(['warehouseId', 'warehouseIdAndItemId', 'warehouseIdAndSkuId'])

const filterable = ref(false)
const queryType = ref("warehouse")
const queryParams = ref({
  pageNum: 1,
  pageSize: 10,
  skuId: undefined,
  warehouseId: undefined,
  itemName: undefined,
  skuCode: undefined,
  minQuantity: undefined
})

/** 查询库存列表 */
const getList = async () => {
  let query = {...queryParams.value}
  if (filterable.value) {
    query.minQuantity = 1
  } else {
    query.minQuantity = undefined
  }
  loading.value = true;
  const res = await listInventoryBoard(query,queryType.value);
  inventoryList.value = res.rows;
  inventoryList.value.forEach(it => {
    if (queryType.value == "warehouse") {
      it.warehouseIdAndItemId = it.warehouseId + '-' + it.item.id
    } else if (queryType.value == "item") {
      it.itemId = it.item.id
      it.skuIdAndWarehouseId = it.skuId + '-' + it.warehouseId
    }
  })
  total.value = res.total;
  loading.value = false;
}

/** 搜索按钮操作 */
const handleQuery = () => {
  queryParams.value.pageNum = 1;
  getList();
}

/** 重置按钮操作 */
const resetQuery = () => {
  proxy.resetForm("queryRef");
  handleQuery();
}
const calcSubtotal = (row) => {
  const tempList = inventoryList.value.filter(it => it.itemId === row.itemId)
  let sum = 0
  tempList.forEach(it => {
    sum += Number(it.quantity)
  })
  return sum
}

const handleSortTypeChange = (e) => {
  if (e === "warehouse") {
    rowSpanArray.value = ['warehouseId', 'warehouseIdAndItemId']
  }  else if (e === "item") {
    rowSpanArray.value = ['itemId', 'skuId','skuIdAndWarehouseId']
  }
  queryParams.value.pageNum = 1;
  getList()
}

const handleChangeFilterZero = (e) => {
  queryParams.value.pageNum = 1;
  getList()
}

onMounted(() => {
  getList();
});
</script>
<style>
.filter-form {
  display: flex;
  flex-wrap: wrap;
  column-gap: 16px;
}

.filter-item {
  width: calc(25% - 12px);
  margin-right: 0;
}

.filter-item-full {
  width: 100%;
}

.filter-item-actions {
  width: 100%;
}

@media (max-width: 1600px) {
  .filter-item {
    width: calc(33.33% - 11px);
  }
}

@media (max-width: 1200px) {
  .filter-item {
    width: calc(50% - 8px);
  }
}

@media (max-width: 768px) {
  .filter-item,
  .filter-item-actions {
    width: 100%;
  }
}

.el-statistic__content {
  font-size: 14px;
}
.el-table .vertical-top-cell {
  vertical-align: top
}
</style>
