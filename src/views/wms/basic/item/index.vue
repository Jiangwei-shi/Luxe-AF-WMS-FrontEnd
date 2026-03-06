<template>
  <div class="app-container">
    <el-card>
      <el-form :model="queryParams" ref="queryFormRef" label-width="88px" class="query-form">
        <el-row :gutter="16">
          <el-col :xs="24" :sm="12" :md="8" :lg="6">
            <el-form-item label="商品名称" prop="itemName">
              <div class="item-name-with-tag">
                <el-input v-model="queryParams.itemName" placeholder="请输入商品名称" clearable @keyup.enter="handleQuery" class="item-name-input"/>
                <el-button type="primary" link title="预处理标签" @click="openNameTagDrawer('query')" class="name-tag-btn">
                  <el-icon><Ticket /></el-icon><span class="name-tag-btn-text">标签</span>
                </el-button>
              </div>
            </el-form-item>
          </el-col>
          <el-col :xs="24" :sm="12" :md="8" :lg="6">
            <el-form-item label="SKU" prop="skuCode">
              <el-input v-model="queryParams.skuCode" placeholder="请输入SKU编码" clearable @keyup.enter="handleQuery" style="width: 100%"/>
            </el-form-item>
          </el-col>
          <el-col :xs="24" :sm="12" :md="8" :lg="6">
            <el-form-item label="商品品牌" prop="itemBrand">
              <el-select v-model="queryParams.itemBrand" clearable filterable style="width: 100%">
                <el-option v-for="item in useWmsStore().itemBrandList" :key="item.id" :label="item.brandName" :value="item.id"/>
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :xs="24" :sm="12" :md="8" :lg="6">
            <el-form-item label="成色" prop="itemCondition">
              <el-select v-model="queryParams.itemCondition" placeholder="请选择成色" clearable style="width: 100%">
                <el-option v-for="item in ITEM_CONDITION_OPTIONS" :key="item" :label="item" :value="item"/>
              </el-select>
            </el-form-item>
          </el-col>
        </el-row>
        <el-row :gutter="16">
          <el-col :xs="24" :sm="12" :md="8" :lg="6">
            <el-form-item label="年份" prop="year">
              <el-input-number v-model="queryParams.year" :min="0" :max="9999" :controls="false" style="width: 100%" @keyup.enter.native="handleQuery"/>
            </el-form-item>
          </el-col>
          <el-col :xs="24" :sm="12" :md="8" :lg="6">
            <el-form-item label="鉴定机构" prop="authAgency">
              <el-select v-model="queryParams.authAgency" placeholder="请选择鉴定机构" clearable style="width: 100%">
                <el-option v-for="item in AUTH_AGENCY_OPTIONS" :key="item" :label="item" :value="item"/>
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :xs="24" :sm="12" :md="8" :lg="6">
            <el-form-item label="数量" prop="defaultQty">
              <el-input-number v-model="queryParams.defaultQty" :min="0" :controls="false" style="width: 100%" @keyup.enter.native="handleQuery"/>
            </el-form-item>
          </el-col>
          <el-col :xs="24" :sm="12" :md="8" :lg="6">
            <el-form-item label="已护理" prop="cared">
              <el-switch v-model="queryParams.cared" active-text="是" inactive-text="否" :active-value="true" :inactive-value="false"/>
            </el-form-item>
          </el-col>
        </el-row>
        <el-row :gutter="16">
          <el-col :xs="24" :sm="24" :md="12" :lg="12">
            <el-form-item label="寄售信息" prop="consignInfo">
              <el-input v-model="queryParams.consignInfo" placeholder="请输入寄售信息关键字" clearable @keyup.enter="handleQuery" style="width: 100%"/>
            </el-form-item>
          </el-col>
          <el-col :xs="24" :sm="24" :md="12" :lg="12">
            <el-form-item label="创建时间" prop="createTimeRange">
              <el-date-picker
                v-model="queryParams.createTimeRange"
                type="datetimerange"
                range-separator="至"
                value-format="YYYY-MM-DD HH:mm:ss"
                format="YYYY-MM-DD HH:mm:ss"
                :default-time="defaultTime"
                start-placeholder="开始时间"
                end-placeholder="结束时间"
                style="width: 100%"
              />
            </el-form-item>
          </el-col>
        </el-row>
        <el-row :gutter="16">
          <el-col :xs="24" :sm="12" :md="8" :lg="6">
            <el-form-item label="销售价" prop="sellingPriceMin">
              <el-input-number v-model="queryParams.sellingPriceMin" :min="0" :precision="2" :controls="false" placeholder="最低" style="width: 100%"/>
            </el-form-item>
          </el-col>
          <el-col :xs="24" :sm="12" :md="8" :lg="6">
            <el-form-item label="至" prop="sellingPriceMax" label-width="32px">
              <el-input-number v-model="queryParams.sellingPriceMax" :min="0" :precision="2" :controls="false" placeholder="最高" style="width: 100%"/>
            </el-form-item>
          </el-col>
          <el-col :xs="24" :sm="12" :md="8" :lg="6">
            <el-form-item label=" " label-width="0">
              <el-button type="primary" icon="Search" @click="handleQuery">搜索</el-button>
              <el-button icon="Refresh" @click="resetQuery">重置</el-button>
            </el-form-item>
          </el-col>
        </el-row>
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
            <!-- 1.商品名称 2.商品分类 -->
            <el-row :gutter="24">
              <el-col :span="12">
                <el-form-item label="商品名称" prop="itemName">
                  <div class="item-name-with-tag">
                    <el-input v-model="form.itemName" placeholder="请输入名称" class="item-name-input"/>
                    <el-button type="primary" link title="预处理标签" @click="openNameTagDrawer" class="name-tag-btn">
                      <el-icon><Ticket /></el-icon><span class="name-tag-btn-text">标签</span>
                    </el-button>
                  </div>
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
              <el-col :span="2">
                <el-button link icon="Plus" type="primary" style="height: 32px!important;line-height: 32px!important;"
                           @click="handleAddType(true)">新增分类
                </el-button>
              </el-col>
            </el-row>
            <!-- 3.SKU编码 4.商品品牌 -->
            <el-row :gutter="24">
              <el-col :span="12">
                <el-form-item label="SKU编码" prop="skuCode">
                  <el-input v-model="form.skuCode" placeholder="请输入SKU编码"/>
                </el-form-item>
              </el-col>
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
            </el-row>
            <!-- 5.成色 6.年份 -->
            <el-row :gutter="24">
              <el-col :span="12">
                <el-form-item label="成色" prop="itemCondition">
                  <el-select v-model="form.itemCondition" placeholder="请选择成色" clearable style="width: 100%">
                    <el-option v-for="item in ITEM_CONDITION_OPTIONS" :key="item" :label="item" :value="item"/>
                  </el-select>
                </el-form-item>
              </el-col>
              <el-col :span="12">
                <el-form-item label="年份" prop="year">
                  <el-input-number v-model="form.year" :min="0" :max="9999" :controls="false" style="width: 100%" />
                </el-form-item>
              </el-col>
            </el-row>
            <!-- 7.成本价 8.销售价 -->
            <el-row :gutter="24">
              <el-col :span="12">
                <el-form-item label="成本价">
                  <el-input-number v-model="form.costPrice" :min="0" :precision="2" :controls="false" style="width: 100%"/>
                </el-form-item>
              </el-col>
              <el-col :span="12">
                <el-form-item label="销售价">
                  <el-input-number v-model="form.sellingPrice" :min="0" :precision="2" :controls="false" style="width: 100%"/>
                </el-form-item>
              </el-col>
            </el-row>
            <!-- 9.鉴定机构 10.数量 -->
            <el-row :gutter="24">
              <el-col :span="12">
                <el-form-item label="鉴定机构" prop="authAgency">
                  <el-select v-model="form.authAgency" placeholder="请选择鉴定机构" clearable style="width: 100%">
                    <el-option v-for="item in AUTH_AGENCY_OPTIONS" :key="item" :label="item" :value="item"/>
                  </el-select>
                </el-form-item>
              </el-col>
              <el-col :span="12">
                <el-form-item label="数量">
                  <el-input-number v-model="form.defaultQty" :min="0" :controls="false" style="width: 100%" />
                </el-form-item>
              </el-col>
            </el-row>
            <!-- 11.材质 12.瑕疵 -->
            <el-row :gutter="24">
              <el-col :span="12">
                <el-form-item label="材质" prop="material">
                  <el-input v-model="form.material" placeholder="请输入材质" />
                </el-form-item>
              </el-col>
              <el-col :span="12">
                <el-form-item label="瑕疵" prop="defect">
                  <el-input v-model="form.defect" placeholder="请输入瑕疵描述" />
                </el-form-item>
              </el-col>
            </el-row>
            <!-- 是否已护理 -->
            <el-row :gutter="24">
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
            <!-- 配件（多行，下方可点 tag 快速填入） -->
            <el-row :gutter="24">
              <el-col :span="24">
                <el-form-item label="配件" prop="accessories">
                  <el-input
                    v-model="form.accessories"
                    type="textarea"
                    :rows="2"
                    placeholder="请输入配件信息，或点击下方标签快速填入"
                  />
                  <div class="accessory-tags mt8">
                    <el-tag
                      v-for="tag in ACCESSORY_TAG_OPTIONS"
                      :key="tag"
                      class="accessory-tag"
                      type="info"
                      effect="plain"
                      @click="appendAccessoryTag(tag)"
                    >
                      {{ tag }}
                    </el-tag>
                  </div>
                </el-form-item>
              </el-col>
            </el-row>
            <!-- 寄售信息 -->
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
            <!-- 12.备注 -->
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
            <!-- 13.商品图片 -->
            <el-row :gutter="24">
              <el-col :span="24">
                <el-form-item label="商品图片" prop="imageList">
                  <div class="item-image-upload">
                    <!-- 已上传图片列表（编辑时来自接口，新增时为空） -->
                    <div class="image-list" v-if="form.id && form.imageList && form.imageList.length">
                      <div
                        class="image-item"
                        v-for="(img, idx) in form.imageList"
                        :key="img.id || idx"
                        draggable="true"
                        @dragstart="onImageDragStart('uploaded', idx)"
                        @dragover.prevent
                        @drop="onImageDrop('uploaded', idx)"
                      >
                        <el-image
                          :src="img.url"
                          :preview-src-list="uploadedImagePreviewList"
                          :initial-index="idx"
                          preview-teleported
                          fit="cover"
                          class="thumb"
                        />
                        <span v-if="img.isMain" class="main-tag">主图</span>
                        <el-button type="danger" link class="btn-remove" icon="Delete" @click="removeItemImage(idx)" />
                      </div>
                    </div>
                    <!-- 新增时待上传的图片预览 -->
                    <div class="image-list" v-if="!form.id && pendingImageFiles.length">
                      <div
                        class="image-item"
                        v-for="(item, idx) in pendingImageFiles"
                        :key="idx"
                        draggable="true"
                        @dragstart="onImageDragStart('pending', idx)"
                        @dragover.prevent
                        @drop="onImageDrop('pending', idx)"
                      >
                        <el-image
                          :src="item.url"
                          :preview-src-list="pendingImagePreviewList"
                          :initial-index="idx"
                          preview-teleported
                          fit="cover"
                          class="thumb"
                        />
                        <el-button type="danger" link class="btn-remove" icon="Delete" @click="removePendingImage(idx)" />
                      </div>
                    </div>
                    <el-upload
                      ref="itemImageUploadRef"
                      v-show="(form.id ? (form.imageList?.length || 0) : pendingImageFiles.length) < IMAGE_LIMIT"
                      class="upload-inline"
                      list-type="picture-card"
                      :auto-upload="!!form.id"
                      :limit="IMAGE_LIMIT"
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
                  <div class="el-upload__tip" v-if="true">
                    请上传大小不超过 20MB 的图片，格式 png/jpg/jpeg，最多 {{ IMAGE_LIMIT }} 张。支持拖拽调整顺序，点击图片预览原图
                  </div>
                </el-form-item>
              </el-col>
            </el-row>
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
    <!-- 商品名称预处理标签抽屉 -->
    <el-drawer v-model="nameTagDrawerVisible" title="商品名称预处理标签" size="360px" append-to-body>
      <div class="name-tag-drawer">
        <div class="name-tag-add">
          <el-input v-model="newNameTag" placeholder="输入新标签后回车或点击新增" clearable @keyup.enter="addNameTag"/>
          <el-button type="primary" @click="addNameTag">新增</el-button>
        </div>
        <p class="name-tag-tip">点击标签可追加到商品名称末尾</p>
        <div class="name-tag-list">
          <el-tag
            v-for="(tag, idx) in nameTagList"
            :key="idx"
            class="name-tag-item"
            closable
            @close="removeNameTag(idx)"
            @click="insertNameTag(tag)"
          >
            {{ tag }}
          </el-tag>
          <span v-if="!nameTagList.length" class="name-tag-empty">暂无标签，请上方新增</span>
        </div>
      </div>
    </el-drawer>
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
import { Plus, Delete, Ticket } from '@element-plus/icons-vue';
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
/** 创建时间选择器默认时间：当天 00:00:00 - 23:59:59（参考库存记录） */
const defaultTime = reactive([new Date(0, 0, 0, 0, 0, 0), new Date(0, 0, 0, 23, 59, 59)])
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
/** 商品名称预处理标签：抽屉显隐、标签列表（持久化到 localStorage）、新标签输入 */
const NAME_TAG_STORAGE_KEY = 'wms_item_name_tags'
const nameTagDrawerVisible = ref(false)
const nameTagList = ref(JSON.parse(localStorage.getItem(NAME_TAG_STORAGE_KEY) || '[]'))
const newNameTag = ref('')

/** 'form' = 新增/编辑表单内的商品名称，'query' = 筛选条件中的商品名称 */
const nameTagInsertTarget = ref('form')
const openNameTagDrawer = (context = 'form') => {
  nameTagInsertTarget.value = context
  nameTagDrawerVisible.value = true
}
const saveNameTags = () => { try { localStorage.setItem(NAME_TAG_STORAGE_KEY, JSON.stringify(nameTagList.value)) } catch (_) {} }
const addNameTag = () => {
  const tag = (newNameTag.value || '').trim()
  if (!tag) return
  if (nameTagList.value.includes(tag)) { newNameTag.value = ''; return }
  nameTagList.value.push(tag)
  saveNameTags()
  newNameTag.value = ''
}
const removeNameTag = (index) => {
  nameTagList.value.splice(index, 1)
  saveNameTags()
}
const insertNameTag = (tag) => {
  if (nameTagInsertTarget.value === 'query') {
    const cur = queryParams.value.itemName || ''
    queryParams.value.itemName = cur ? cur + ' ' + tag : tag
  } else {
    const cur = form.value.itemName || ''
    form.value.itemName = cur ? cur + ' ' + tag : tag
  }
  nameTagDrawerVisible.value = false
}

/** 鉴定机构固定选项（仅可选，不可手输） */
const AUTH_AGENCY_OPTIONS = ['Entrupy', 'Real Authentication', 'Legitmark', 'CheckCheck', 'N/A']
/** 成色固定选项 */
const ITEM_CONDITION_OPTIONS = ['S', 'A', 'B', 'C', 'D']
/** 配件常用选项（可点击快速填入，也可自行输入） */
const ACCESSORY_TAG_OPTIONS = ['Dustbag', 'Box', 'ID card', 'Lock & Key', 'Strap', 'Receipt']

/** 点击配件 tag 时追加到输入框（已包含则不重复添加） */
const appendAccessoryTag = (tag) => {
  const val = form.value.accessories || ''
  const parts = val.split(/[,，、\n]+/).map(s => s.trim()).filter(Boolean)
  if (parts.includes(tag)) return
  form.value.accessories = parts.length ? parts.concat(tag).join(', ') : tag
}
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
  defaultQty: 1,
  material: undefined,
  defect: undefined,
  accessories: undefined,
  remark: undefined,
  imageList: [], // 商品图片列表（编辑时由接口返回，项为 { id, url, isMain, sort }）
  skuCode: undefined, // SKU编码（与规格表第一行同步，主表校验与提示）
  costPrice: null,   // 成本价（与规格表第一行同步）
  sellingPrice: null, // 销售价（与规格表第一行同步）
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
    skuCode: undefined,         // SKU编码
    itemBrand: undefined,       // 品牌
    itemCategory: undefined,    // 分类
    itemCondition: undefined,   // 成色
    year: undefined,            // 年份
    cared: undefined,           // 是否已护理
    defaultQty: undefined,      // 默认数量
    authAgency: undefined,      // 鉴定机构
    consignInfo: undefined,     // 寄售信息
    createTimeRange: undefined, // 创建时间区间 [开始, 结束]
    sellingPriceMin: undefined, // 销售价下限(元)
    sellingPriceMax: undefined, // 销售价上限(元)
  },
  rules: {
    itemName: [
      {required: true, message: "名称不能为空", trigger: "blur"}
    ],
    itemCategory: [
      {required: true, message: "分类不能为空", trigger: "blur"}
    ],
    itemBrand: [
      {required: true, message: "品牌不能为空", trigger: "change"}
    ],
    itemCondition: [
      {required: true, message: "成色不能为空", trigger: "blur"}
    ],
    year: [
      {required: true, message: "年份不能为空", trigger: "blur"}
    ],
    skuCode: [
      {required: true, message: "SKU编码不能为空", trigger: "blur"}
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
  const query = { ...queryParams.value };
  if (query.createTimeRange && query.createTimeRange.length === 2) {
    query.startTime = query.createTimeRange[0];
    query.endTime = query.createTimeRange[1];
  }
  loading.value = true;
  const res = await listItemSkuPage(query);
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
const itemImageUploadRef = ref(null)

// 商品图片（方案B）：新增时暂存的待上传文件 { file, url }
const pendingImageFiles = ref([])
const IMAGE_LIMIT = 10
const IMAGE_SIZE_MB = 20
const imageDragState = reactive({ type: '', fromIndex: -1 })
const uploadedImagePreviewList = computed(() => (form.value.imageList || []).map(it => it.url).filter(Boolean))
const pendingImagePreviewList = computed(() => pendingImageFiles.value.map(it => it.url).filter(Boolean))

function normalizeUploadedImageMeta() {
  if (!Array.isArray(form.value.imageList)) return
  form.value.imageList.forEach((img, idx) => {
    img.sort = idx
    img.isMain = idx === 0 ? 1 : 0
  })
}

/** 构造提交给后端的图片排序数据（按当前前端顺序） */
function buildImageListPayload() {
  const list = Array.isArray(form.value.imageList) ? form.value.imageList : []
  return list.map((img, idx) => ({
    id: img.id,
    itemId: img.itemId ?? form.value.id,
    ossId: img.ossId,
    thumbOssId: img.thumbOssId,
    isMain: idx === 0 ? 1 : 0,
    sort: idx,
    status: img.status ?? 1
  }))
}

function onImageDragStart(type, fromIndex) {
  imageDragState.type = type
  imageDragState.fromIndex = fromIndex
}

function onImageDrop(type, toIndex) {
  if (imageDragState.type !== type) return
  const fromIndex = imageDragState.fromIndex
  if (fromIndex < 0 || fromIndex === toIndex) return
  if (type === 'uploaded') {
    const list = form.value.imageList || []
    if (!list.length) return
    const [moved] = list.splice(fromIndex, 1)
    list.splice(toIndex, 0, moved)
    normalizeUploadedImageMeta()
  } else {
    const list = pendingImageFiles.value
    if (!list.length) return
    const [moved] = list.splice(fromIndex, 1)
    list.splice(toIndex, 0, moved)
  }
  imageDragState.type = ''
  imageDragState.fromIndex = -1
}

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
    normalizeUploadedImageMeta()
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
    normalizeUploadedImageMeta()
    form.value.skuCode = skuForm.itemSkuList[0]?.skuCode ?? ''
    form.value.costPrice = skuForm.itemSkuList[0]?.costPrice ?? null
    form.value.sellingPrice = skuForm.itemSkuList[0]?.sellingPrice ?? null
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
  // 先校验商品主表（含商品名称、分类、品牌、成色、年份、SKU编码等）
  try {
    await itemFormRef.value.validate();
  } catch {
    return;
  }

  // 将主表填的 SKU 编码同步到规格行，再提交
  if (skuForm.itemSkuList && skuForm.itemSkuList.length) {
    skuForm.itemSkuList[0].skuCode = form.value.skuCode;
    skuForm.itemSkuList[0].costPrice = form.value.costPrice;
    skuForm.itemSkuList[0].sellingPrice = form.value.sellingPrice;
  }
  form.value.sku = skuForm.itemSkuList;

  if (!skuForm.itemSkuList || skuForm.itemSkuList.length === 0) {
    proxy?.$modal.msgError("至少包含一个商品规格");
    return;
  }

  buttonLoading.value = true;
  try {
    // 先保存商品，拿到 itemId（新增时后端返回 Long 类型 itemId）
    let itemId = form.value.id;
    if (itemId) {
      normalizeUploadedImageMeta()
      const payload = {
        ...form.value,
        imageList: buildImageListPayload()
      }
      await updateItem(payload);
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

.mt8 { margin-top: 8px; }
.accessory-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}
.accessory-tag {
  cursor: pointer;
}
.accessory-tag:hover {
  opacity: 0.85;
}

.item-name-with-tag {
  display: flex;
  align-items: center;
  gap: 8px;
  width: 100%;
}
.item-name-with-tag .item-name-input { flex: 1; }
.item-name-with-tag .name-tag-btn {
  flex-shrink: 0;
  padding: 0 8px;
}
.item-name-with-tag .name-tag-btn-text { margin-left: 4px; }

.name-tag-drawer .name-tag-add {
  display: flex;
  gap: 8px;
  margin-bottom: 12px;
}
.name-tag-drawer .name-tag-add .el-input { flex: 1; }
.name-tag-drawer .name-tag-tip {
  font-size: 12px; color: #909399; margin-bottom: 12px;
}
.name-tag-drawer .name-tag-list {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}
.name-tag-drawer .name-tag-item {
  cursor: pointer;
}
.name-tag-drawer .name-tag-item:hover { opacity: 0.85; }
.name-tag-drawer .name-tag-empty {
  font-size: 13px; color: #909399;
}

</style>
