<template>
   <div class="app-container logininfor-page" :class="{ 'is-en': isEn }">
      <el-form :model="queryParams" ref="queryRef" :inline="true" v-show="showSearch" :label-width="isEn ? '120px' : '68px'" class="filter-form">
         <el-form-item :label="tr('登录地址')" prop="ipaddr">
            <el-input
               v-model="queryParams.ipaddr"
               :placeholder="tr('请输入登录地址')"
               clearable
               style="width: 240px;"
               @keyup.enter="handleQuery"
            />
         </el-form-item>
         <el-form-item :label="tr('用户名称')" prop="userName">
            <el-input
               v-model="queryParams.userName"
               :placeholder="tr('请输入') + tr('用户名称')"
               clearable
               style="width: 240px;"
               @keyup.enter="handleQuery"
            />
         </el-form-item>
         <el-form-item :label="tr('状态')" prop="status">
            <el-select
               v-model="queryParams.status"
               :placeholder="tr('登录状态')"
               clearable
               style="width: 240px"
            >
               <el-option
                  v-for="dict in sys_common_status"
                  :key="dict.value"
                  :label="dict.label"
                  :value="dict.value"
               />
            </el-select>
         </el-form-item>
         <el-form-item :label="tr('登录时间')" class="filter-item-time">
            <el-date-picker
               v-model="dateRange"
               value-format="YYYY-MM-DD HH:mm:ss"
               type="daterange"
               range-separator="-"
               :start-placeholder="tr('开始日期')"
               :end-placeholder="tr('结束日期')"
               :default-time="[new Date(2000, 1, 1, 0, 0, 0), new Date(2000, 1, 1, 23, 59, 59)]"
            ></el-date-picker>
         </el-form-item>
         <el-form-item>
            <el-button type="primary" icon="Search" class="action-btn" @click="handleQuery">{{ tr('搜索') }}</el-button>
            <el-button icon="Refresh" class="action-btn" @click="resetQuery">{{ tr('重置') }}</el-button>
         </el-form-item>
      </el-form>

      <el-row :gutter="10" class="mb8">
         <el-col :span="1.5">
            <el-button
               type="danger"
               plain
               icon="Delete"
               :disabled="multiple"
               @click="handleDelete"
               v-hasPermi="['monitor:logininfor:remove']"
               class="action-btn"
            >{{ tr('删除') }}</el-button>
         </el-col>
         <el-col :span="1.5">
            <el-button
               type="danger"
               plain
               icon="Delete"
               @click="handleClean"
               v-hasPermi="['monitor:logininfor:remove']"
               class="action-btn"
            >{{ tr('清空') }}</el-button>
         </el-col>
         <el-col :span="1.5">
            <el-button
               type="primary"
               plain
               icon="Unlock"
               :disabled="single"
               @click="handleUnlock"
               v-hasPermi="['monitor:logininfor:unlock']"
               class="action-btn"
            >{{ tr('解锁') }}</el-button>
         </el-col>
         <el-col :span="1.5">
            <el-button
               type="warning"
               plain
               icon="Download"
               @click="handleExport"
               v-hasPermi="['monitor:logininfor:export']"
               class="action-btn"
            >{{ tr('导出') }}</el-button>
         </el-col>
         <right-toolbar v-model:showSearch="showSearch" @queryTable="getList"></right-toolbar>
      </el-row>

      <el-table ref="logininforRef" v-loading="loading" :data="logininforList" @selection-change="handleSelectionChange" :default-sort="defaultSort" @sort-change="handleSortChange">
         <el-table-column type="selection" width="55" align="center" />
         <el-table-column :label="tr('访问编号')" align="center" prop="infoId" />
         <el-table-column :label="tr('用户名称')" align="center" prop="userName" :show-overflow-tooltip="true" sortable="custom" :sort-orders="['descending', 'ascending']" />
         <el-table-column :label="tr('地址')" align="center" prop="ipaddr" :show-overflow-tooltip="true" />
         <el-table-column :label="tr('登录地点')" align="center" prop="loginLocation" :show-overflow-tooltip="true" />
         <el-table-column :label="tr('操作系统')" align="center" prop="os" :show-overflow-tooltip="true" />
         <el-table-column :label="tr('浏览器')" align="center" prop="browser" :show-overflow-tooltip="true" />
         <el-table-column :label="tr('登录状态')" align="center" prop="status">
            <template #default="scope">
               <dict-tag :options="sys_common_status" :value="scope.row.status" />
            </template>
         </el-table-column>
         <el-table-column :label="tr('描述')" align="center" prop="msg" :show-overflow-tooltip="true" />
         <el-table-column :label="tr('访问时间')" align="center" prop="loginTime" sortable="custom" :sort-orders="['descending', 'ascending']" width="180">
            <template #default="scope">
               <span>{{ parseTime(scope.row.loginTime) }}</span>
            </template>
         </el-table-column>
      </el-table>

      <pagination
         v-show="total > 0"
         :total="total"
         v-model:page="queryParams.pageNum"
         v-model:limit="queryParams.pageSize"
         @pagination="getList"
      />
   </div>
</template>

<script setup name="Logininfor">
import { list, delLogininfor, cleanLogininfor, unlockLogininfor } from "@/api/monitor/logininfor";
import useSettingsStore from "@/store/modules/settings";
import { translateByMap } from '@/locales/runtime-map'

const { proxy } = getCurrentInstance();
const { sys_common_status } = proxy.useDict("sys_common_status");
const settingsStore = useSettingsStore()
const isEn = computed(() => settingsStore.language === 'en')
const tr = (text) => translateByMap(text, settingsStore.language || 'zh-cn')

const logininforList = ref([]);
const loading = ref(true);
const showSearch = ref(true);
const ids = ref([]);
const single = ref(true);
const multiple = ref(true);
const selectName = ref("");
const total = ref(0);
const dateRange = ref([]);
const defaultSort = ref({ prop: "loginTime", order: "descending" });

// 查询参数
const queryParams = ref({
  pageNum: 1,
  pageSize: 10,
  ipaddr: undefined,
  userName: undefined,
  status: undefined,
  orderByColumn: undefined,
  isAsc: undefined
});

/** 查询登录日志列表 */
function getList() {
  loading.value = true;
  list(proxy.addDateRange(queryParams.value, dateRange.value)).then(response => {
    logininforList.value = response.rows;
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
  dateRange.value = [];
  proxy.resetForm("queryRef");
  queryParams.value.pageNum = 1;
  proxy.$refs["logininforRef"].sort(defaultSort.value.prop, defaultSort.value.order);
}
/** 多选框选中数据 */
function handleSelectionChange(selection) {
  ids.value = selection.map(item => item.infoId);
  multiple.value = !selection.length;
  single.value = selection.length != 1;
  selectName.value = selection.map(item => item.userName);
}
/** 排序触发事件 */
function handleSortChange(column, prop, order) {
  queryParams.value.orderByColumn = column.prop;
  queryParams.value.isAsc = column.order;
  getList();
}
/** 删除按钮操作 */
function handleDelete(row) {
  const infoIds = row.infoId || ids.value;
  proxy.$modal.confirm((isEn.value ? 'Confirm delete visit ID ' : '是否确认删除访问编号为"') + infoIds + (isEn.value ? '?' : '"的数据项?')).then(function () {
    return delLogininfor(infoIds);
  }).then(() => {
    getList();
    proxy.$modal.msgSuccess(tr("删除成功"));
  }).catch(() => {});
}
/** 清空按钮操作 */
function handleClean() {
  proxy.$modal.confirm(isEn.value ? "Confirm clear all login logs?" : "是否确认清空所有登录日志数据项?").then(function () {
    return cleanLogininfor();
  }).then(() => {
    getList();
    proxy.$modal.msgSuccess(tr("清空成功"));
  }).catch(() => {});
}
/** 解锁按钮操作 */
function handleUnlock() {
  const username = selectName.value;
  proxy.$modal.confirm((isEn.value ? 'Confirm unlock user "' : '是否确认解锁用户"') + username + (isEn.value ? '"?' : '"数据项?')).then(function () {
    return unlockLogininfor(username);
  }).then(() => {
    proxy.$modal.msgSuccess((isEn.value ? "User " : "用户") + username + (isEn.value ? " unlocked successfully" : "解锁成功"));
  }).catch(() => {});
}
/** 导出按钮操作 */
function handleExport() {
  proxy.download("monitor/logininfor/export", {
    ...queryParams.value,
  }, `config_${new Date().getTime()}.xlsx`);
}

getList();
</script>
<style scoped>
.logininfor-page.is-en .el-form-item__label { white-space: nowrap; }
.logininfor-page .action-btn { min-width: 96px; }
.logininfor-page.is-en .action-btn { min-width: 110px; }
.filter-form {
  display: flex;
  flex-wrap: wrap;
  column-gap: 12px;
}
.filter-item-time {
  width: 360px;
}
@media (max-width: 1400px) {
  .filter-item-time {
    width: 100%;
  }
}
</style>
