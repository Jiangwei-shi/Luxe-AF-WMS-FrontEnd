<template>
  <el-drawer :model-value="show" title="商品选择" @close="handleCancelClick" :size="size" :close-on-click-modal="false" append-to-body>
        <el-form :inline="true" label-width="68px">
          <el-row :gutter="20">
            <el-col :span="8">
              <el-form-item label="商品名称">
                <el-input v-model="query.itemName" clearable placeholder="商品名称"></el-input>
              </el-form-item>
            </el-col>
            <el-col :span="8">
              <el-form-item label="SKU">
                <el-input class="w200" v-model="query.skuCode" clearable placeholder="SKU查询" @keyup.enter="handleSkuEnter"></el-input>
              </el-form-item>
            </el-col>
            <el-col :span="8">
              <el-button type="primary" @click="loadAll">查询</el-button>
            </el-col>
          </el-row>
        </el-form>
            <el-table :data="list" @selection-change="handleSelectionChange" border :row-key="getRowKey" empty-text="暂无商品" v-loading="loading" ref="skuSelectFormRef" cell-class-name="my-cell">
              <el-table-column type="selection" width="55" :reserve-selection="true" v-if="!singleSelect" :selectable="judgeSelectable"/>
              <el-table-column label="商品信息" prop="itemId">
                <template #default="{ row }">
                  <div>{{ row.item.itemName }}</div>
                  <div v-if="row.item.itemBrand">品牌：{{ useWmsStore().itemBrandMap.get(row.item.itemBrand).brandName }}</div>
                </template>
              </el-table-column>
              <el-table-column label="规格信息">
                <template #default="{ row }">
                  <div>{{ row.itemSku.skuName }}</div>
                  <div v-if="row.itemSku.skuCode">编号：{{ row.itemSku.skuCode }}</div>
                </template>
              </el-table-column>
              <el-table-column label="价格(元)" width="160" align="left">
                <template #default="{ row }">
                  <div v-if="row.itemSku.costPrice" class="flex-space-between">
                    <span>成本价：</span>
                    <div>{{ (row.itemSku.costPrice || row.itemSku.costPrice === 0) ? row.itemSku.costPrice : '' }}</div>
                  </div>
                  <div v-if="row.itemSku.sellingPrice" class="flex-space-between">
                    <span>销售价：</span>
                    <div>{{ (row.itemSku.sellingPrice || row.itemSku.sellingPrice === 0) ? row.itemSku.sellingPrice : '' }}</div>
                  </div>
                </template>
              </el-table-column>
              <el-table-column label="操作" width="100" v-if="singleSelect" align="right">
                <template #default="{ row }">
                  <el-button link type="primary" @click="handleChooseSku(row)">选择</el-button>
                </template>
              </el-table-column>
            </el-table>
    <el-row>
      <pagination v-show="total > 0" :total="total" :page-sizes="[5, 10, 20, 50]" v-model:limit="pageReq.size" v-model:page="pageReq.page"
                  @pagination="getList" class="mr10"/>
    </el-row>
    <template v-slot:footer>
      <div style="width: 100%;display: flex;justify-content: space-between">
        <span>
          <el-button @click="goCreateItem" icon="Plus">创建商品</el-button>
          <el-button @click="loadAll" icon="Refresh">刷新</el-button>
        </span>
        <span>
          <el-button @click="handleCancelClick">取消</el-button>
          <el-button type="primary" @click="handleOkClick" v-if="!singleSelect">确认</el-button>
      </span>
      </div>
    </template>
  </el-drawer>
</template>
<script setup lang="ts" name="SkuSelect">
/* eslint-disable */
// @ts-nocheck
import {computed, getCurrentInstance, onMounted, reactive, ref, watch} from 'vue';
import { ElMessage } from "element-plus";
import {listItemSkuPage} from "@/api/wms/itemSku";
import {useRouter} from "vue-router";
import {useWmsStore} from '@/store/modules/wms'

const { proxy } = getCurrentInstance()

const router = useRouter()
const loading = ref(false)
const deptOptions = ref([]);
const query = reactive({
  itemName: '',
  skuCode: ''
});
const selectItemSkuVoCheck = ref([])
const skuSelectFormRef = ref(null)
const total = ref(0);
const pageReq = reactive({
  page: 1,
  size: 10,
});
const list = ref([]);
const rightList = ref([]);
const rightListKeySet = computed(() => {
  const set = new Set();
  rightList.value.forEach((it) => set.add(it.id));
  return set
});

const loadAll = () => {
  pageReq.page = 1
  getList()
};

/** SKU 输入框回车：仅当通过 SKU 查询且唯一结果时直接加入并关闭 */
async function handleSkuEnter() {
  const skuCode = query.skuCode?.trim()
  if (!skuCode) return
  loading.value = true
  try {
    const res = await listItemSkuPage({
      ...query,
      pageNum: 1,
      pageSize: 2
    })
    const rows = res.rows || []
    if (rows.length === 1) {
      const row = rows[0]
      const normalized = { ...row, id: row.skuId }
      emit('handleOkClick', [normalized])
      emit('handleCancelClick')
    } else if (rows.length === 0) {
      ElMessage.warning('未找到该SKU')
    } else {
      loadAll()
    }
  } finally {
    loading.value = false
  }
}
const getRowKey = (row: any) => {
  return row.id;
}
const getList = () => {
  const data = {
    ...query,
    pageNum: pageReq.page,
    pageSize: pageReq.size
  }
  loading.value = true
  listItemSkuPage(data).then((res) => {
    const content = [...res.rows];
    list.value = content.map((it) => ({...it, id: it.skuId, checked: false}));
    total.value = res.total;
  }).then(() => toggleSelection()).finally(() => loading.value = false);
}
const goCreateItem = () => {
  // 跳转到商品管理页面，并自动打开“新增商品”抽屉
  const data = router.resolve({ path: '/basic/item', query: { openDrawer: true } })
  window.open(data.href, '_blank')
}
// 定义props
const props = defineProps({
  modelValue: {
    type: Boolean,
    default: false
  },
  size: {
    type: String,
    default: '30%'
  },
  singleSelect:{
    type: Boolean,
    default: false
  },
  selectedSku: {
    type: Array,
    default: []
  }
})

const show = computed(() => {
  return props.modelValue;
})

// 每次打开抽屉时清空查询条件并重新拉取，便于看到全部商品
watch(show, (visible) => {
  if (visible) {
    query.itemName = ''
    query.skuCode = ''
    pageReq.page = 1
    getList()
  }
})

// 定义事件
const emit = defineEmits<{
  (e: 'handleCancelClick')
  (e: 'handleOkClick', value)
  (e: 'handleSingleOkClick', value)
}>()

function handleCancelClick() {
  emit('handleCancelClick');
  clearQuantity()
}

function handleChooseSku(row) {
  emit('handleSingleOkClick', row);
}

function handleOkClick() {
  emit('handleOkClick', selectItemSkuVoCheck.value);
  clearQuantity()
}
/** 多选框选中数据 */
const handleSelectionChange = (selection) => {
  selectItemSkuVoCheck.value = selection
}

const toggleSelection = () => {
  props.selectedSku.forEach(selected => {
    const index = list.value.findIndex(it => selected.id=== it.id)
    if (index !== -1) {
      skuSelectFormRef.value.toggleRowSelection(list.value[index], true)
    }
  })
}

const judgeSelectable = (row) => {
  if (props.selectedSku.find(selected => selected.id === row.id)) {
    return false;
  }
  return true
}


function clearQuantity() {
  skuSelectFormRef.value.clearSelection()
}

defineExpose({
  getList
})
</script>
<style lang="scss">
.el-table .my-cell {
  vertical-align: top
}
</style>

