<template>
  <div class="app-container">
    <el-card>
      <el-form :model="queryParams" ref="queryRef" label-width="80px" class="filter-form">
        <el-form-item class="filter-item filter-item-full" :label="tr('盘库状态')" prop="orderStatus">
          <el-radio-group v-model="queryParams.orderStatus" @change="handleQuery">
            <el-radio-button
              :key="-2"
              :label="-2"
            >
              {{ tr('全部') }}
            </el-radio-button>
            <el-radio-button
              v-for="item in translatedCheckStatusOptions"
              :key="item.value"
              :label="item.value"
            >
              {{ item.label }}
            </el-radio-button>
          </el-radio-group>
        </el-form-item>
        <el-form-item class="filter-item" :label="tr('盘库单号')" prop="orderNo">
          <el-input
            v-model="queryParams.orderNo"
            :placeholder="tr('请输入盘库单号')"
            clearable
            @keyup.enter="handleQuery"
          />
        </el-form-item>
        <el-form-item class="filter-item filter-item-actions">
          <el-button type="primary" icon="Search" @click="handleQuery">{{ tr('搜索') }}</el-button>
          <el-button icon="Refresh" @click="resetQuery">{{ tr('重置') }}</el-button>
        </el-form-item>
      </el-form>
    </el-card>

    <el-card class="mt20">

      <el-row :gutter="10" class="mb8" type="flex" justify="space-between">
        <el-col :span="6"><span style="font-size: large">{{ tr('盘库单') }}</span></el-col>
        <el-col :span="1.5">
          <el-button
            type="primary"
            plain
            icon="Plus"
            @click="handleAdd"
            v-hasPermi="['wms:check:all']"
          >{{ tr('新增') }}</el-button>
        </el-col>
      </el-row>

      <el-table v-loading="loading" :data="checkOrderList" border class="mt20"
                :row-key="getRowKey"
                :empty-text="tr('暂无盘库单')"
                cell-class-name="vertical-top-cell"
      >
        <el-table-column :label="tr('单号')" align="left" prop="orderNo" />
        <el-table-column :label="tr('仓库')" align="left" width="200">
          <template #default="{ row }">
            <div>{{ useWmsStore().warehouseMap.get(row.warehouseId)?.warehouseName }}</div>
          </template>
        </el-table-column>
        <el-table-column :label="tr('盘库状态')" align="center" prop="orderStatus" width="120">
          <template #default="{ row }">
            <dict-tag :options="translatedCheckStatusOptions" :value="row.orderStatus" />
          </template>
        </el-table-column>
        <el-table-column :label="tr('盈亏数')" align="right">
          <template #default="{ row }">
            <el-statistic :value="Number(row.totalQuantity)" :precision="0"/>
          </template>
        </el-table-column>
        <el-table-column :label="tr('操作时间')" align="left" width="200">
          <template #default="{ row }">
            <div>{{ tr('创建：') }}{{ parseTime(row.createTime, '{mm}-{dd} {hh}:{ii}') }}</div>
            <div>{{ tr('更新：') }}{{ parseTime(row.updateTime, '{mm}-{dd} {hh}:{ii}') }}</div>
          </template>
        </el-table-column>
        <el-table-column :label="tr('操作人')" align="left">
          <template #default="{ row }">
            <div>{{ row.createBy }}</div>
            <div v-if="row.updateBy">{{ row.updateBy }}</div>
          </template>
        </el-table-column>

        <el-table-column :label="tr('备注')" prop="remark" />
        <el-table-column :label="tr('操作')" align="right" class-name="small-padding fixed-width" width="120">
          <template #default="scope">
            <div>
              <el-popover
                placement="left"
                :title="tr('提示')"
                :width="300"
                trigger="hover"
                :disabled="scope.row.orderStatus === 0"
                :content="'盘库单【' + scope.row.orderNo + '】已' + (scope.row.orderStatus === 1 ? '盘库完成' : '作废') + '，无法修改！' "
              >
                <template #reference>
                  <el-button link type="primary" @click="handleUpdate(scope.row)" v-hasPermi="['wms:check:all']" :disabled="[-1, 1].includes(scope.row.orderStatus)">{{ tr('修改') }}</el-button>
                </template>
              </el-popover>
              <el-button link type="primary" @click="handleGoDetail(scope.row)" v-hasPermi="['wms:check:all']">{{ tr('查看') }}</el-button>
            </div>
            <div class="mt10">
              <el-popover
                placement="left"
                :title="tr('提示')"
                :width="300"
                trigger="hover"
                :disabled="[-1, 0].includes(scope.row.orderStatus)"
                :content="'盘库单【' + scope.row.orderNo + '】已盘库完成，无法删除！' "
              >
                <template #reference>
                  <el-button link type="danger" @click="handleDelete(scope.row)" v-hasPermi="['wms:check:all']" :disabled="scope.row.orderStatus === 1">{{ tr('删除') }}</el-button>
                </template>
              </el-popover>
              <el-button link type="primary" @click="handlePrint(scope.row)" v-hasPermi="['wms:check:all']">{{ tr('打印') }}</el-button>
            </div>
          </template>
        </el-table-column>
      </el-table>

      <el-row>
        <pagination
          v-show="total>0"
          :total="total"
          v-model:page="queryParams.pageNum"
          v-model:limit="queryParams.pageSize"
          @pagination="getList"
        />
      </el-row>
    </el-card>
    <check-order-detail
      ref="checkOrderDetailRef"
      :model-value="watchDetailObj.show"
      :order-no="watchDetailObj.orderNo"
      @handle-cancel-click="watchDetailObj.show = false"
    />
  </div>
</template>

<script setup name="CheckOrder">
import {listCheckOrder, delCheckOrder, getCheckOrder} from "@/api/wms/checkOrder";
import {listByCheckOrderId} from "@/api/wms/checkOrderDetail";
import {computed, getCurrentInstance, reactive, ref, toRefs} from "vue";
import {useWmsStore} from "../../../../store/modules/wms";
import {ElMessageBox} from "element-plus";
import checkPanel from "@/components/PrintTemplate/check-panel";
import CheckOrderDetail from "@/views/wms/order/check/CheckOrderDetail.vue";
import useSettingsStore from '@/store/modules/settings'
import { translateByMap } from '@/locales/runtime-map'
const { proxy } = getCurrentInstance();
const {wms_check_status} = proxy.useDict("wms_check_status");
const settingsStore = useSettingsStore()
const checkOrderList = ref([]);
const open = ref(false);
const buttonLoading = ref(false);
const loading = ref(true);
const ids = ref([]);
const total = ref(0);
const title = ref("");
const data = reactive({
  queryParams: {
    pageNum: 1,
    pageSize: 10,
    orderNo: undefined,
    orderStatus: -2,
  },
});
const watchDetailObj = ref({
  show: false,
  orderNo: null
})
const checkOrderDetailRef = ref(null)
const { queryParams } = toRefs(data);
const tr = (text) => translateByMap(text, settingsStore.language || 'zh-cn')
const translatedCheckStatusOptions = computed(() => (wms_check_status.value || []).map(it => ({ ...it, label: tr(it.label) })))

/** 查询入库单列表 */
function getList() {
  loading.value = true;
  const query = {...queryParams.value}
  query.orderNo = query.orderNo?.trim() || undefined
  if (query.orderStatus === -2) {
    query.orderStatus = null
  }
  listCheckOrder(query).then(response => {
    checkOrderList.value = response.rows;
    total.value = response.total;
    loading.value = false;
  });
}

/** 搜索按钮操作 */
function handleQuery() {
  queryParams.value.pageNum = 1;
  getList();
}

/** 重置按钮操作 */
function resetQuery() {
  proxy.resetForm("queryRef");
  handleQuery();
}

/** 新增按钮操作 */
function handleAdd() {
  proxy.$router.push({ path: "/checkOrderEdit" });
}

/** 删除按钮操作 */
function handleDelete(row) {
  const _ids = row.id || ids.value;
  proxy.$modal.confirm('确认删除【盘库单【' + row.orderNo + '】吗？').then(function() {
    loading.value = true;
    return delCheckOrder(_ids);
  }).then(() => {
    proxy.$modal.msgSuccess("删除成功");
  }).finally(() => {
    loading.value = false;
    getList();
  });
}

function handleUpdate(row) {
  proxy.$router.push({ path: "/checkOrderEdit",  query: { id: row.id } });
}

function handleGoDetail(row) {
  watchDetailObj.value.orderNo = row.orderNo
  checkOrderDetailRef.value.setCheckOrderId(row.id)
  watchDetailObj.value.show = true
  checkOrderDetailRef.value.handleQuery()
}

/** 导出按钮操作 */
async function handlePrint(row) {
  const res = await getCheckOrder(row.id)
  const checkOrder = res.data
  let table = []
  if (checkOrder.details?.length) {
    table = checkOrder.details.map(detail => {
      return {
        itemName: detail.item.itemName,
        skuCode: detail.itemSku.skuCode,
        quantity: Number(detail.quantity).toFixed(0),
        profitAndLoss: Number(detail.checkQuantity - detail.quantity).toFixed(0),
        checkQuantity: Number(detail.checkQuantity).toFixed(0)
      }
    })
  }
  const printData = {
    orderNo: checkOrder.orderNo,
    orderStatus: tr(proxy.selectDictLabel(wms_check_status.value, checkOrder.orderStatus)),
    warehouseName: useWmsStore().warehouseMap.get(checkOrder.warehouseId)?.warehouseName,
    totalQuantity: Number(checkOrder.totalQuantity).toFixed(0),
    createBy: checkOrder.createBy,
    createTime: proxy.parseTime(checkOrder.createTime, '{mm}-{dd} {hh}:{ii}'),
    updateBy: checkOrder.updateBy,
    updateTime: proxy.parseTime(checkOrder.updateTime, '{mm}-{dd} {hh}:{ii}'),
    remark: checkOrder.remark,
    table
  }
  let printTemplate = new proxy.$hiprint.PrintTemplate({template: checkPanel})
  printTemplate.print(printData, {}, {
    styleHandler: () => {
      let css = '<link href="https://cyl-press.oss-cn-shenzhen.aliyuncs.com/print-lock.css" media="print" rel="stylesheet">';
      return css
    }
  })
}

function getRowKey(row) {
  return row.id
}
getList();
</script>
<style lang="scss">
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
