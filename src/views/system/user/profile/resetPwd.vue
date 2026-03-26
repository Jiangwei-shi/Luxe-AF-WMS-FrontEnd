<template>
   <el-form ref="pwdRef" :model="user" :rules="rules" :label-width="isEn ? '150px' : '80px'">
      <el-form-item :label="tr('旧密码')" prop="oldPassword">
         <el-input v-model="user.oldPassword" :placeholder="tr('请输入') + tr('旧密码')" type="password" show-password />
      </el-form-item>
      <el-form-item :label="tr('新密码')" prop="newPassword">
         <el-input v-model="user.newPassword" :placeholder="tr('请输入') + tr('新密码')" type="password" show-password />
      </el-form-item>
      <el-form-item :label="tr('确认密码')" prop="confirmPassword">
         <el-input v-model="user.confirmPassword" :placeholder="tr('请确认新密码')" type="password" show-password/>
      </el-form-item>
      <el-form-item>
      <el-button type="primary" class="action-btn" @click="submit">{{ tr('保存') }}</el-button>
      <el-button type="danger" class="action-btn" @click="close">{{ tr('关闭') }}</el-button>
      </el-form-item>
   </el-form>
</template>

<script setup>
import { updateUserPwd } from "@/api/system/user";
import useSettingsStore from "@/store/modules/settings";
import { translateByMap } from "@/locales/runtime-map";

const { proxy } = getCurrentInstance();
const settingsStore = useSettingsStore()
const isEn = computed(() => (settingsStore.language || 'zh-cn') === 'en')
const tr = (text) => translateByMap(text, settingsStore.language || 'zh-cn')

const user = reactive({
  oldPassword: undefined,
  newPassword: undefined,
  confirmPassword: undefined
});

const equalToPassword = (rule, value, callback) => {
  if (user.newPassword !== value) {
    callback(new Error(tr("两次输入的密码不一致")));
  } else {
    callback();
  }
};
const rules = ref({
  oldPassword: [{ required: true, message: tr("旧密码") + tr("不能为空"), trigger: "blur" }],
  newPassword: [{ required: true, message: tr("新密码") + tr("不能为空"), trigger: "blur" }, { min: 6, max: 20, message: tr("长度在 6 到 20 个字符"), trigger: "blur" }],
  confirmPassword: [{ required: true, message: tr("确认密码") + tr("不能为空"), trigger: "blur" }, { required: true, validator: equalToPassword, trigger: "blur" }]
});

/** 提交按钮 */
function submit() {
  proxy.$refs.pwdRef.validate(valid => {
    if (valid) {
      updateUserPwd(user.oldPassword, user.newPassword).then(response => {
        proxy.$modal.msgSuccess(tr("修改成功"));
      });
    }
  });
};
/** 关闭按钮 */
function close() {
  proxy.$tab.closePage();
};
</script>

<style scoped>
.action-btn { min-width: 96px; }
.el-form-item__label { white-space: nowrap; }
</style>
