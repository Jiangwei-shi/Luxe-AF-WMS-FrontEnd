<template>
  <div class="app-container">
    <el-card>
      <el-form :model="queryParams" ref="queryFormRef" :inline="true" label-width="68px">
        <el-form-item label="商品名称" prop="itemName">
          <el-input v-model="queryParams.itemName" placeholder="请输入商品名称" clearable @keyup.enter="handleQuery"/>
        </el-form-item>
        <el-form-item label="商品品牌" prop="itemBrand">
          <el-select v-model="queryParams.itemBrand" clearable filterable>
            <el-option
              v-for="item in useWmsStore().itemBrandList"
              :key="item.id"
              :label="item.brandName"
              :value="item.id"
            ></el-option>
          </el-select>
        </el-form-item>
        <!-- 成色（文本） -->
        <el-form-item label="成色" prop="itemCondition">
          <el-input
            v-model="queryParams.itemCondition"
            placeholder="请输入成色，如：全新、九成新"
            clearable
            @keyup.enter="handleQuery"
          />
        </el-form-item>

        <!-- 年份（数字输入） -->
        <el-form-item label="年份" prop="year">
          <el-input-number
            v-model="queryParams.year"
            :min="0"
            :max="9999"
            :controls="false"
            style="width: 120px"
            @keyup.enter.native="handleQuery"
          />
        </el-form-item>

        <!-- 是否已护理（开关） -->
        <el-form-item label="已护理" prop="cared">
          <el-switch
            v-model="queryParams.cared"
            active-text="是"
            inactive-text="否"
            :active-value="true"
            :inactive-value="false"
          />
        </el-form-item>

        <!-- 默认数量（数字输入） -->
        <el-form-item label="默认数量" prop="defaultQty">
          <el-input-number
            v-model="queryParams.defaultQty"
            :min="0"
            :controls="false"
            style="width: 120px"
            @keyup.enter.native="handleQuery"
          />
        </el-form-item>

        <!-- 鉴定机构（文本） -->
        <el-form-item label="鉴定机构" prop="authAgency">
          <el-input
            v-model="queryParams.authAgency"
            placeholder="请输入鉴定机构"
            clearable
            @keyup.enter="handleQuery"
          />
        </el-form-item>

        <!-- 寄售信息（多行文本） -->
        <el-form-item label="寄售信息" prop="consignInfo">
          <el-input
            v-model="queryParams.consignInfo"
            type="textarea"
            :rows="1"
            placeholder="请输入寄售信息关键字"
            @keyup.enter="handleQuery"
          />
        </el-form-item>

        <el-form-item>
          <el-button type="primary" icon="Search" @click="handleQuery">搜索</el-button>
          <el-button icon="Refresh" @click="resetQuery">重置</el-button>
        </el-form-item>
      </el-form>
    </el-card>
    <el-card class="mt20">
      <div style="display: flex;align-items: start">
        <div>
          <div style="display: flex;align-items: center;justify-content: space-between">
            <span style="font-size: 18px;line-height: 18px">商品分类</span>
            <el-button class="mr10" style="font-size:12px;line-height: 14px" plain
                     @click="handleAddType(false)"
                     type="primary" icon="Plus">新增分类
            </el-button>
          </div>
          <el-tree
            :data="itemCategoryTreeOptionsList"
            :props="{ value: 'id', label: 'label', children: 'children' }"
            value-key="id"
            style="width: 400px;"
            class="mr10 mt10"
            @nodeClick="handleQueryType"
            :default-expand-all="true"
            :highlight-current="true"
            node-key="label"
            current-node-key="全部"
            draggable
            :allow-drop="collapse"
            @node-drop="handleNodeDrop"
            :expand-on-click-node="false"
          >
            <template #default="{ node, data }">
            <span class="custom-tree-node">
              <span>{{ node.label }}</span>
              <span>
                <el-button type="primary" @click.stop="append(data)" link
                         v-if="data.label !== '全部' && node.level < 2" icon="Plus" style="font-size: 12px">新增子分类</el-button>
                <el-button type="primary" @click.stop="remove(node, data)" link
                         v-if="data.label !== '全部'" icon="Delete" style="font-size: 12px">删除</el-button>
                <el-button type="primary" icon="Edit" @click.stop="edit(node, data)" link
                         v-if="data.label !== '全部'" style="font-size: 12px">修改</el-button>
              </span>
            </span>
            </template>
          </el-tree>
        </div>
        <div style="width: 100%;position: relative">
          <div style="display: flex;align-items: start;justify-content: space-between">
            <span class="mr10" style="font-size: 18px;">商品列表</span>
            <el-button type="primary" plain icon="Plus" @click="handleAdd" class="mb10">新增商品</el-button>
          </div>
          <el-table :data="itemList" @selection-change="handleSelectionChange" :span-method="spanMethod" border empty-text="暂无商品" v-loading="loading" cell-class-name="my-cell">
            <el-table-column label="商品信息" prop="itemId">
              <template #default="{ row }">
                <div>{{ row.item.itemName }}</div>
                <div v-if="row.item.itemBrand">
                  {{ row.item.itemBrand ? ('品牌：' + useWmsStore().itemBrandMap.get(row.item.itemBrand)?.brandName) : '' }}
                </div>
                <div v-if="row.item.itemCategory">
                  {{ row.item.itemCategory ? ('分类：' + useWmsStore().itemCategoryMap.get(row.item.itemCategory)?.categoryName) : '' }}
                </div>
                <div v-if="row.item.itemCondition">
                  成色：{{ row.item.itemCondition }}
                </div>
                <div v-if="row.item.year || row.item.year === 0">
                  年份：{{ row.item.year }}
                </div>
                <div v-if="row.item.cared !== null && row.item.cared !== undefined">
                  护理：{{ row.item.cared ? '已护理' : '未护理' }}
                </div>
              </template>
            </el-table-column>
            <el-table-column label="规格信息" prop="skuName" align="left">
              <template #default="{ row }">
                <div v-if="row.itemSku.skuCode">SKU编码：{{ row.itemSku.skuCode }}</div>
              </template>
            </el-table-column>
            <el-table-column label="金额(元)" width="160" align="left">
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
            <el-table-column label="操作" align="right" prop="itemId" width="200">
              <template #default="scope">
                <el-button link type="primary" @click="handleDelete(scope.row)" icon="Delete">删除</el-button>
                <el-button link type="primary" @click="handleUpdate(scope.row)" icon="Edit">修改</el-button>
              </template>
            </el-table-column>
          </el-table>
          <pagination v-show="total>0" :total="total" v-model:page="queryParams.pageNum"
                      v-model:limit="queryParams.pageSize" @pagination="getList"/>
        </div>
      </div>
    </el-card>
    <!-- 添加或修改物料对话框 -->
    <el-drawer :title="dialog.title" v-model="dialog.visible" size="80%" append-to-body :close-on-click-modal="false">
      <div v-loading="skuLoading">
        <el-card>
          <el-form ref="itemFormRef" :model="form" :rules="rules" label-width="108px">
            <el-row :gutter="24">
              <el-col :span="12">
                <el-form-item label="商品名称" prop="itemName">
                  <el-input v-model="form.itemName" placeholder="请输入名称"/>
                </el-form-item>
              </el-col>
              <el-col :span="10">
                <el-form-item label="商品分类" prop="itemCategory">
                  <el-tree-select
                    ref="treeRef"
                    v-model="form.itemCategory"
                    :data="itemCategoryTreeSelectList"
                    :props="{ value: 'id', label: 'label', children: 'children' }"
                    value-key="id"
                    placeholder="请选择分类"
                    check-strictly
                    style="width: 100%!important;"
                  />
                </el-form-item>
              </el-col>
              <el-col :span="1">
                <el-button link icon="Plus" type="primary" style="height: 32px!important;line-height: 32px!important;"
                           @click="handleAddType(true)">新增分类
                </el-button>
              </el-col>
            </el-row>
            <el-row :gutter="24">
              <el-col :span="12">
                <el-form-item label="商品品牌" prop="itemBrand">
                  <el-select v-model="form.itemBrand" clearable filterable style="width: 100%!important;">
                    <el-option
                      v-for="item in useWmsStore().itemBrandList"
                      :key="item.id"
                      :label="item.brandName"
                      :value="item.id"
                    ></el-option>
                  </el-select>
                </el-form-item>
              </el-col>
              <el-col :span="12">
                <el-form-item label="成色" prop="itemCondition">
                  <el-input v-model="form.itemCondition" placeholder="请输入成色（如：全新、九成新等）" />
                </el-form-item>
              </el-col>
            </el-row>
            <el-row :gutter="24">
              <el-col :span="12">
                <el-form-item label="年份">
                  <el-input-number v-model="form.year" :min="0" :max="9999" :controls="false" style="width: 100%" />
                </el-form-item>
              </el-col>
              <el-col :span="12">
                <el-form-item label="是否已护理">
                  <el-switch
                    v-model="form.cared"
                    active-text="已护理"
                    inactive-text="未护理"
                  />
                </el-form-item>
              </el-col>
            </el-row>
            <el-row :gutter="24">
              <el-col :span="12">
                <el-form-item label="默认数量">
                  <el-input-number v-model="form.defaultQty" :min="0" :controls="false" style="width: 100%" />
                </el-form-item>
              </el-col>
              <el-col :span="12">
                <el-form-item label="鉴定机构">
                  <el-input v-model="form.authAgency" placeholder="请输入鉴定机构名称" />
                </el-form-item>
              </el-col>
            </el-row>
            <el-row :gutter="24">
              <el-col :span="24">
                <el-form-item label="寄售信息">
                  <el-input
                    v-model="form.consignInfo"
                    type="textarea"
                    :rows="2"
                    placeholder="请输入寄售信息（如寄售渠道、周期、分成等）"
                  />
                </el-form-item>
              </el-col>
            </el-row>
            <el-row :gutter="24">
              <el-col :span="24">
                <el-form-item label="备注" prop="remark">
                  <el-input
                    v-model="form.remark"
                    type="textarea"
                    :rows="2"
                    placeholder="请输入备注信息"
                  />
                </el-form-item>
              </el-col>
            </el-row>
            <!-- 商品图片：方案B，使用 /item/{itemId}/image/upload 接口 -->
            <el-row :gutter="24">
              <el-col :span="24">
                <el-form-item label="商品图片" prop="imageList">
                  <div class="item-image-upload">
                    <!-- 已上传图片列表（编辑时来自接口，新增时为空） -->
                    <div class="image-list" v-if="form.id && form.imageList && form.imageList.length">
                      <div class="image-item" v-for="(img, idx) in form.imageList" :key="img.id || idx">
                        <el-image :src="img.url" fit="cover" class="thumb" />
                        <span v-if="img.isMain" class="main-tag">主图</span>
                        <el-button type="danger" link class="btn-remove" icon="Delete" @click="removeItemImage(idx)" />
                      </div>
                    </div>
                    <!-- 新增时待上传的图片预览 -->
                    <div class="image-list" v-if="!form.id && pendingImageFiles.length">
                      <div class="image-item" v-for="(item, idx) in pendingImageFiles" :key="idx">
                        <el-image :src="item.url" fit="cover" class="thumb" />
                        <el-button type="danger" link class="btn-remove" icon="Delete" @click="removePendingImage(idx)" />
                      </div>
                    </div>
                    <el-upload
                      ref="itemImageUploadRef"
                      v-show="(form.id ? (form.imageList?.length || 0) : pendingImageFiles.length) < 8"
                      class="upload-inline"
                      list-type="picture-card"
                      :auto-upload="!!form.id"
                      :limit="8"
                      :on-exceed="handleImageExceed"
                      :before-upload="(file) => beforeImageUpload(file)"
                      :http-request="form.id ? customUpload : undefined"
                      :on-change="!form.id ? onPendingImageChange : undefined"
                      :show-file-list="false"
                      accept="image/*"
                    >
                      <el-icon class="avatar-uploader-icon"><Plus /></el-icon>
                    </el-upload>
                  </div>
                  <div class="el-upload__tip" v-if="true">请上传大小不超过 20MB 的图片，格式 png/jpg/jpeg，最多 8 张</div>
                </el-form-item>
              </el-col>
            </el-row>
          </el-form>
        </el-card>
        <el-card class="mt20">
          <template #header>
            <div class="card-header">
              <span>规格</span>
            </div>
          </template>
          <el-form :model="skuForm" :rules="skuRules" ref="skuFormRef" :show-message="false">
            <el-table :data="skuForm.itemSkuList" border cell-class-name="my-cell">
              <el-table-column label="SKU编码" prop="skuCode">
                <template #default="scope">
                  <el-form-item :prop="'itemSkuList.' + scope.$index + '.skuCode'" :rules="skuRules.skuCode"
                                style="margin-bottom: 0!important;">
                    <el-input v-model="scope.row.skuCode" placeholder="请输入SKU编码"/>
                  </el-form-item>
                </template>
              </el-table-column>
              <el-table-column label="成本价/销售价(元)" width="240">
                <template #default="scope">
                  <div class="flex-center">
                    <span class="mr5">成本价</span>
                    <el-input-number :controls="false" :min="0" :precision="2" v-model="scope.row.costPrice"/>
                  </div>
                  <div class="flex-center mt5">
                    <span class="mr5">销售价</span>
                    <el-input-number :controls="false" :min="0" :precision="2" v-model="scope.row.sellingPrice"/>
                  </div>
                </template>
              </el-table-column>
              <el-table-column label="操作" class-name="small-padding fixed-width" width="80" align="right">
                <template #default="scope">
                  <el-button link icon="Delete" type="primary" @click="handleDeleteItemSku(scope.row, scope.$index)">删除</el-button>
                </template>
              </el-table-column>
              <template #append v-if="skuForm.itemSkuList.length">
                <div style="padding: 6px 2px 6px 2px;text-align: center;">
                  <el-button text class="add-btn" icon="Plus" type="primary" @click="onAppendBtnClick">添加商品规格
                  </el-button>
                </div>
              </template>
              <template #empty>
                <div style="padding: 2px 2px 6px 2px;text-align: center;width: 100%!important;">
                  <el-button text class="add-btn" icon="Plus" type="primary" @click="onAppendBtnClick">添加商品规格
                  </el-button>
                </div>
              </template>
            </el-table>
          </el-form>
        </el-card>
      </div>

      <template #footer>
        <div class="dialog-footer">
          <el-button :loading="buttonLoading" type="primary" @click="submitForm">确 定</el-button>
          <el-button @click="cancel">取 消</el-button>
        </div>
      </template>
    </el-drawer>
    <!-- 添加或修改物料类型对话框 -->
    <el-dialog :title="categoryDialog.title" v-model="categoryDialog.visible" width="500px" append-to-body
               :close-on-click-modal="false">
      <el-form ref="itemCategoryFormRef" :model="categoryForm" :rules="typeRules" label-width="128px" @submit.native.prevent>
        <el-form-item label="上级分类" prop="parentId">
          <el-tree-select
            v-model="categoryForm.parentId"
            :data="itemCategoryTreeSelectList"
            :props="{ value: 'id', label: 'label', children: 'children' }"
            value-key="id"
            placeholder="上级分类"
            check-strictly
            style="width: 100%!important;"
            clearable
          />
        </el-form-item>
        <el-form-item label="商品分类名称" prop="categoryName">
          <el-input v-model="categoryForm.categoryName" placeholder="请输入商品分类名称" @keyup.enter="submitCategoryForm"/>
        </el-form-item>
      </el-form>
      <template #footer>
        <div class="dialog-footer">
          <el-button :loading="buttonLoading" type="primary" @click="submitCategoryForm">确 定</el-button>
          <el-button @click="cancelType">取 消</el-button>
        </div>
      </template>
      <div id="qrcode"></div>
    </el-dialog>
    <div id="outSkuIdBox" style="display: none">
      <img :src="qrcode"/>
      <canvas ref="barcode"></canvas>
    </div>
  </div>
</template>

<script setup name="Item">
import { getItem, delItem, addItem, updateItem, uploadItemImage, deleteItemImage } from '@/api/wms/item';
import { computed, getCurrentInstance, nextTick, onMounted, reactive, ref, toRefs } from 'vue';
import { ElForm, ElTree, ElTreeSelect } from 'element-plus';
import { Plus, Delete } from '@element-plus/icons-vue';
import {
  updateItemCategory,
  addItemCategory,
  delItemCategory,
  updateOrderNum
} from "@/api/wms/itemCategory";
import {getRowspanMethod} from "@/utils/getRowSpanMethod";
import {listItemSkuPage, delItemSku, listItemSku} from "@/api/wms/itemSku";
import {useRoute} from "vue-router";
import Qrcode from 'qrcode'
import JSBarcode from 'jsbarcode'
import {useWmsStore} from '@/store/modules/wms'

const barcode = ref(null)
const route = useRoute()
const {proxy} = getCurrentInstance();
const itemList = ref([]);
const itemCategoryTreeSelectList = computed(() => useWmsStore().itemCategoryTreeList);
const itemCategoryTreeOptionsList = computed(() => {
  let data = [...itemCategoryTreeSelectList.value];
  data.unshift({
    id: -1,
    label: '全部',
    children: []
  });
  return data;
});
const buttonLoading = ref(false);
const loading = ref(true);
const showSearch = ref(true);
const ids = ref([]);
const single = ref(true);
const multiple = ref(true);
const total = ref(0);
const skuLoading = ref(false)
const queryFormRef = ref(ElForm);
const itemFormRef = ref(ElForm);
const itemCategoryFormRef = ref(ElForm);
const spanMethod = computed(() => getRowspanMethod(itemList.value, rowSpanArray.value))
const rowSpanArray = ref(['itemId'])
const qrcode = ref(null)
const append = (data) => {
  // resetType();
  categoryForm.value.categoryName = undefined;
  categoryForm.value.parentId = data.id;
  categoryDialog.visible = true;
}

const remove = async (node, data) => {
  const ids = data.id
  await proxy?.$modal.confirm('确认删除分类【' + data.label + '】吗？');
  await delItemCategory(ids);
  proxy?.$modal.msgSuccess("删除成功");
  useWmsStore().getItemCategoryList();
  useWmsStore().getItemCategoryTreeList();
}
const edit = (node, data) => {
  if (node.level > 1) {
    categoryForm.value.parentId = node.parent.data.id
  }
  categoryForm.value.id = data.id;
  // resetType();
  categoryForm.value.categoryName = data.label;
  categoryDialog.title = "修改商品分类";
  categoryDialog.visible = true;
}
const dialog = reactive({
  visible: false,
  title: ''
});
const categoryDialog = reactive({
  visible: false,
  title: ''
});
const showParent = ref(false)
const initFormData = {
  id: undefined,
  itemName: undefined,
  itemCategory: undefined,
  itemBrand: undefined,
  itemCondition: undefined,
  year: undefined,
  cared: false,
  authAgency: undefined,
  consignInfo: undefined,
  defaultQty: undefined,
  remark: undefined,
  imageList: [], // 商品图片列表（编辑时由接口返回，项为 { id, url, isMain, sort }）
}
const initCategoryFormData = {
  id: undefined,
  parentId: undefined,
  ancestors: undefined,
  categoryName: undefined,
  orderNum: 0,
  status: undefined,
}
const data = reactive({
  form: {...initFormData},
  queryParams: {
    pageNum: 1,
    pageSize: 10,
    itemName: undefined,
    itemBrand: undefined,       // 品牌
    itemCategory: undefined,    // 分类
    itemCondition: undefined,   // 成色
    year: undefined,            // 年份
    cared: undefined,           // 是否已护理
    defaultQty: undefined,      // 默认数量
    authAgency: undefined,      // 鉴定机构
    consignInfo: undefined,     // 寄售信息
  },
  rules: {
    itemName: [
      {required: true, message: "名称不能为空", trigger: "blur"}
    ],
    itemCategory: [
      {required: true, message: "分类不能为空", trigger: "blur"}
    ],
  }
});
const categoryData = reactive({
  form: {...initCategoryFormData},
  queryParams: {
    pageNum: 1,
    pageSize: 1000,
    parentId: undefined,
    categoryName: undefined,
    orderNum: undefined,
    status: undefined,
  },
  rules: {
    id: [
      {required: true, message: "商品分类id不能为空", trigger: "blur"}
    ],
    // parentId: [
    //   {required: true, message: "父物料类型id不能为空", trigger: "blur"}
    // ],
    categoryName: [
      {required: true, message: "商品分类名称不能为空", trigger: "blur"}
    ],
    status: [
      {required: true, message: "商品分类状态不能为空", trigger: "change"}
    ],
  }
});
const {queryParams, form, rules} = toRefs(data);

const {queryParams: typeQueryParams, form: categoryForm, rules: typeRules} = toRefs(categoryData);
const currentType = ref()
/** 查询物料列表 */
const getList = async () => {
  loading.value = true;
  const res = await listItemSkuPage(queryParams.value);
  const content = [...res.rows];
  itemList.value = content.map((it) => ({...it, id: it.skuId,itemId: it?.item?.id}));
  total.value = res.total;
  loading.value = false;
}
const handleAddType = (show) => {
  categoryDialog.title = "新增商品分类";
  showParent.value = show
  categoryDialog.visible = true;
  if (show) {
    categoryForm.value.parentId = undefined
  }
  nextTick(() => {
    categoryForm.value.categoryName = undefined;
  });
}
const skuForm = reactive({
  itemSkuList: []
})
const skuFormRef = ref(ElForm)
const itemImageUploadRef = ref(null)
const skuRules = {
  skuCode: [{required: true, message: 'SKU编码不能为空', trigger: 'blur'}]
}

// 商品图片（方案B）：新增时暂存的待上传文件 { file, url }
const pendingImageFiles = ref([])
const IMAGE_LIMIT = 8
const IMAGE_SIZE_MB = 20

function beforeImageUpload(file) {
  const isImage = /^image\/(jpeg|jpg|png|gif|webp)/i.test(file.type)
  if (!isImage) {
    proxy?.$modal.msgError('只能上传 jpg/jpeg/png/gif/webp 格式图片')
    return false
  }
  const isLt = file.size / 1024 / 1024 < IMAGE_SIZE_MB
  if (!isLt) {
    proxy?.$modal.msgError(`图片大小不能超过 ${IMAGE_SIZE_MB}MB`)
    return false
  }
  return true
}

function handleImageExceed() {
  proxy?.$modal.msgError(`最多上传 ${IMAGE_LIMIT} 张图片`)
}

/** 编辑时：自定义上传，走 /item/{itemId}/image/upload */
async function customUpload(options) {
  const { file } = options
  if (!beforeImageUpload(file)) return
  if (!form.value.id) return
  proxy?.$modal.loading('正在上传图片…')
  try {
    const sort = (form.value.imageList?.length ?? 0)
    const res = await uploadItemImage(form.value.id, file, !(form.value.imageList?.length), sort)
    proxy?.$modal.closeLoading()
    if (res.code === 200 && res.data) {
      if (!Array.isArray(form.value.imageList)) form.value.imageList = []
      form.value.imageList.push(res.data)
      proxy?.$modal.msgSuccess('上传成功')
      nextTick(() => itemImageUploadRef.value?.clearFiles?.())
    } else {
      proxy?.$modal.msgError(res.msg || '上传失败')
    }
  } catch (e) {
    proxy?.$modal.closeLoading()
    proxy?.$modal.msgError('上传失败')
  }
}

/** 新增时：选择文件仅加入待上传列表，不发请求 */
function onPendingImageChange(uploadFile) {
  const file = uploadFile.raw
  if (!file || !beforeImageUpload(file)) return
  if (pendingImageFiles.value.length >= IMAGE_LIMIT) {
    handleImageExceed()
    return
  }
  const url = URL.createObjectURL(file)
  pendingImageFiles.value.push({ file, url })
}

function removePendingImage(index) {
  const item = pendingImageFiles.value[index]
  if (item?.url) URL.revokeObjectURL(item.url)
  pendingImageFiles.value.splice(index, 1)
}

/** 删除已上传的商品图片：调用后端删除接口并从列表中移除 */
async function removeItemImage(index) {
  const list = form.value.imageList
  if (!list || !list[index]) return
  const img = list[index]
  const imageId = img.id
  if (imageId == null) {
    list.splice(index, 1)
    return
  }
  await proxy?.$modal.confirm('确认删除该图片吗？')
  try {
    await deleteItemImage(imageId)
    list.splice(index, 1)
    proxy?.$modal.msgSuccess('删除成功')
  } catch (e) {
    proxy?.$modal.msgError(e?.message || '删除失败')
  }
}
// sku 管理
const resetItemSkuList = () => {
  skuForm.itemSkuList = []
  skuForm.itemSkuList.push({
    id: '',
    itemId: '',
    skuCode: '',
    costPrice: null,
    sellingPrice: null,
  })
}

const onAppendBtnClick = () => {
  skuForm.itemSkuList.push({
    id: '',
    itemId: '',
    skuCode: '',
    costPrice: null,
    sellingPrice: null,
  })
}
const handleDeleteItemSku = async (row, index) => {
  if (!row.id) {
    skuForm.itemSkuList.splice(index, 1);
    return
  }
  if (skuForm.itemSkuList.length === 1) {
    return proxy?.$modal.msgError("至少包含一个商品规格");
  }
  await proxy?.$modal.confirm('确认删除规格【' + (row.skuCode || row.id) + '】吗？');
  loading.value = true;
  await delItemSku(row.id).finally(()=> loading.value = false);
  proxy?.$modal.msgSuccess("删除成功");
  const res = await getItem(row.itemId);
  skuForm.itemSkuList = res.data.sku
  form.value = res.data
}
const collapse = (draggingNode, dropNode, type) => {
  //注掉的是同级拖拽
  if (draggingNode.data.label !== '全部' && draggingNode.level === dropNode.level && draggingNode.parent.id == dropNode.parent.id) {
    if (dropNode.data.label === '全部') {
      return type === 'next';
    } else {
      return type === 'prev' || type === 'next'
    }
  } else {
    // 不同级进行处理
    return false
  }
}
const handleNodeDrop = async (draggingNode, dropNode, dropType, ev) => {
  if (dropNode.level === 1) {
    await updateOrderNum(dropNode.parent.data.filter(it => it.id !== -1));
  } else {
    await updateOrderNum(dropNode.parent.data.children);
  }
}
/** 取消按钮 */
const cancel = () => {
  reset();
  dialog.visible = false;
}
const cancelType = () => {
  resetType();
  categoryDialog.visible = false;
}
/** 表单重置 */
const reset = () => {
  pendingImageFiles.value.forEach((item) => {
    if (item?.url) URL.revokeObjectURL(item.url)
  })
  pendingImageFiles.value = []
  itemImageUploadRef.value?.clearFiles?.()
  form.value = {...initFormData};
  itemFormRef.value?.resetFields();
}

/** 表单重置 */
const resetType = () => {
  categoryForm.value = {...initCategoryFormData};
  itemCategoryFormRef.value.resetFields();
}
/** 搜索按钮操作 */
const handleQuery = () => {
  queryParams.value.pageNum = 1;
  getList();
}

/** 重置按钮操作 */
const resetQuery = () => {
  queryFormRef.value.resetFields();
  handleQuery();
}

/** 多选框选中数据 */
const handleSelectionChange = (selection) => {
  ids.value = selection.map(item => item.id);
  single.value = selection.length != 1;
  multiple.value = !selection.length;
}

/** 新增按钮操作 */
const handleAdd = () => {
  resetItemSkuList()
  dialog.visible = true;
  dialog.title = "新增商品";
  nextTick(async () => {
    reset();
  });
}
/** 修改按钮操作 */
const handleUpdate = (row) => {
  resetItemSkuList()
  skuLoading.value = true
  dialog.visible = true;
  dialog.title = "修改商品";
  nextTick(async () => {
    reset();
    const _id = row?.itemId || ids.value[0]
    const [skuRes, itemRes] = await Promise.all([
      listItemSku({ itemId: _id }),
      getItem(_id)
    ])
    Object.assign(skuForm.itemSkuList, skuRes.data)
    const itemData = itemRes.data || {}
    form.value = { ...form.value, ...row.item, ...itemData, imageList: itemData.imageList || itemData.images || [] }
    skuLoading.value = false
  });
}
const handleQueryType = (node, data) => {
  queryParams.value.pageNum = 1
  if (data.data.label === '全部') {
    queryParams.value.itemCategory = '';
    currentType.value = '';
    getList();
  } else {
    queryParams.value.itemCategory = data.data.id;
    currentType.value = data.data.id;
    getList();
  }
}
/** 提交按钮 */
const submitForm = async () => {
  // 将规格挂到 form 上，一起提交给后端
  form.value.sku = skuForm.itemSkuList;

  // 先校验商品主表
  try {
    await itemFormRef.value.validate();
  } catch {
    return;
  }

  // 再校验规格表
  let flag = true;
  if (!skuForm.itemSkuList || skuForm.itemSkuList.length === 0) {
    proxy?.$modal.msgError("至少包含一个商品规格");
    flag = false;
  }
  try {
    await skuFormRef.value.validate();
  } catch {
    flag = false;
  }
  if (!flag) return;

  buttonLoading.value = true;
  try {
    // 先保存商品，拿到 itemId（新增时后端返回 Long 类型 itemId）
    let itemId = form.value.id;
    if (itemId) {
      await updateItem(form.value);
    } else {
      const payload = { ...form.value };
      delete payload.imageList;
      const res = await addItem(payload);
      itemId = res?.data?.id ?? res?.data?.itemId ?? res?.data;
      if (!itemId) {
        throw new Error('新增商品返回的ID为空');
      }
    }

    // 如果有待上传图片，则利用返回的 itemId 调用原有图片上传接口
    if (itemId && pendingImageFiles.value.length) {
      proxy?.$modal.loading('正在上传商品图片…');
      try {
        for (let i = 0; i < pendingImageFiles.value.length; i++) {
          const { file } = pendingImageFiles.value[i];
          await uploadItemImage(itemId, file, i === 0, i);
        }
      } catch (e) {
        proxy?.$modal.msgWarning('商品已保存，但部分图片上传失败，可在修改中重新上传');
      } finally {
        proxy?.$modal.closeLoading();
      }
    }

    proxy?.$modal.msgSuccess('修改成功');
    dialog.visible = false;
    pendingImageFiles.value = [];
    await getList();
  } catch (err) {
    proxy?.$modal.msgError(err?.message || err?.msg || '操作失败');
  } finally {
    buttonLoading.value = false;
  }
}
const submitCategoryForm = () => {
  itemCategoryFormRef.value.validate(async (valid) => {
    if (valid) {
      buttonLoading.value = true;
      if (categoryForm.value.id) {
        await updateItemCategory(categoryForm.value).finally(() => buttonLoading.value = false);
      } else {
        await addItemCategory(categoryForm.value).finally(() => buttonLoading.value = false);
      }
      proxy?.$modal.msgSuccess(categoryForm.value.id ? '修改成功' : '新增成功');
      categoryDialog.visible = false;
      useWmsStore().getItemCategoryList();
      useWmsStore().getItemCategoryTreeList();
    }
  });
}
/** 删除按钮操作 */
const handleDelete = async (row) => {
  const _ids = row?.itemId || ids.value;
  await proxy?.$modal.confirm('确认删除商品【' + row?.item.itemName + '】吗？');
  loading.value = true;
  await delItem(_ids).finally(()=> loading.value = false);
  proxy?.$modal.msgSuccess("删除成功");
  await getList();
}
const treeRef = ref(null)
/** 导出按钮操作 */
const handleExport = () => {
  proxy?.download('wms/item/export', {
    ...queryParams.value
  }, `item_${new Date().getTime()}.xlsx`)
}
/** 下载条形码 */
const downloadBarcode = (row) => {
  JSBarcode(barcode.value, row.barcode, {
    format: "CODE128",
    displayValue: true
  })
  const canvas = barcode.value
  //创建a标签
  let a = document.createElement('a')
  //设置下载文件的名字
  a.download = row.barcode
  a.href = canvas.toDataURL("image/png")
  a.click()
}
/** 下载二维码 */
const downloadQrcode = async (row) => {
  qrcode.value = await Qrcode.toDataURL(row.barcode)
  //创建a标签
  let a = document.createElement('a')
  //获取二维码的url并赋值为a.href
  a.href = qrcode.value
  //设置下载文件的名字
  a.download = row.barcode
  //点击事件，相当于下载
  a.click()
  //提示信息
  // this.$message.warn('下载中，请稍后...')
}
onMounted(() => {
  nextTick(()=>{
    getList();
    if (route.query.openDrawer) {
      handleAdd()
    }
  })
});
</script>
<style>
.custom-tree-node {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: space-between;
  font-size: 14px;
  padding-right: 8px;
}

.el-tree-node__content {
  display: flex;
  align-items: center;
  height: 35px;
  cursor: pointer;
}

.el-table .my-cell {
  vertical-align: top
}

.el-table__empty-text {
  width: 100%;
}

.item-image-upload {
  display: flex;
  flex-wrap: wrap;
  align-items: flex-start;
  gap: 8px;
}
.item-image-upload .image-list {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}
.item-image-upload .image-item {
  position: relative;
  width: 100px;
  height: 100px;
  border: 1px solid #dcdfe6;
  border-radius: 6px;
  overflow: hidden;
}
.item-image-upload .image-item .thumb {
  width: 100%;
  height: 100%;
  display: block;
}
.item-image-upload .image-item .main-tag {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  background: rgba(64, 158, 255, 0.9);
  color: #fff;
  font-size: 12px;
  text-align: center;
  padding: 2px 0;
}
.item-image-upload .image-item .btn-remove {
  position: absolute;
  top: 2px;
  right: 2px;
  padding: 2px;
  min-height: 0;
  background: rgba(0,0,0,0.5);
  color: #fff;
  border-radius: 4px;
}
.item-image-upload .upload-inline :deep(.el-upload--picture-card) {
  width: 100px;
  height: 100px;
  line-height: 100px;
}

</style>
