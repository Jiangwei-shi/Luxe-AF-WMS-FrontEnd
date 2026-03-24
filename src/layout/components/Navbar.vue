<template>
  <div class="navbar">
    <hamburger id="hamburger-container" :is-active="appStore.sidebar.opened" class="hamburger-container" @toggleClick="toggleSideBar" />
    <breadcrumb id="breadcrumb-container" class="breadcrumb-container" v-if="!settingsStore.topNav" />
    <top-nav id="topmenu-container" class="topmenu-container" v-if="settingsStore.topNav" />

    <div class="right-menu">
      <el-button class="lang-switch-btn" type="primary" @click="toggleLanguage">
        {{ languageButtonText }}
      </el-button>
      <div class="avatar-container">
        <el-dropdown @command="handleCommand" class="right-menu-item hover-effect" trigger="click">
          <div class="avatar-wrapper">
            <img :src="userStore.avatar" class="user-avatar" />
            <el-icon><caret-bottom /></el-icon>
          </div>
          <template #dropdown>
            <el-dropdown-menu>
              <router-link to="/user/profile">
                <el-dropdown-item>{{ $t('navbar.profile') }}</el-dropdown-item>
              </router-link>
              <el-dropdown-item divided command="logout">
                <span>{{ $t('navbar.logout') }}</span>
              </el-dropdown-item>
            </el-dropdown-menu>
          </template>
        </el-dropdown>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed, ref, watch } from 'vue'
import { ElMessageBox } from 'element-plus'
import Breadcrumb from '@/components/Breadcrumb'
import TopNav from '@/components/TopNav'
import Hamburger from '@/components/Hamburger'
import Screenfull from '@/components/Screenfull'
import SizeSelect from '@/components/SizeSelect'
import HeaderSearch from '@/components/HeaderSearch'
import RuoYiGit from '@/components/RuoYi/Git'
import RuoYiDoc from '@/components/RuoYi/Doc'
import useAppStore from '@/store/modules/app'
import useUserStore from '@/store/modules/user'
import useSettingsStore from '@/store/modules/settings'
import { useI18n } from 'vue-i18n'
import { useRoute } from 'vue-router'
import { getRouteTitle } from '@/utils/routeTitle'

const appStore = useAppStore()
const userStore = useUserStore()
const settingsStore = useSettingsStore()
const { locale, t } = useI18n()
const route = useRoute()

function normalizeLanguage(lang) {
  const value = String(lang || '').toLowerCase().replace('_', '-')
  if (value.startsWith('en')) return 'en'
  if (value.startsWith('zh')) return 'zh-cn'
  return 'zh-cn'
}

const language = ref(normalizeLanguage(settingsStore.language || locale.value))
const languageButtonText = computed(() => (language.value === 'en' ? 'English' : '中文'))

function applyLanguage(nextRaw) {
  if (!nextRaw) return
  const next = normalizeLanguage(nextRaw)
  // Local state drives immediate button rendering.
  language.value = next
  if (locale.value !== next) {
    locale.value = next
  }
  if (settingsStore.language !== next) {
    settingsStore.setLanguage(next)
  }
  if (route.meta && route.meta.title) {
    settingsStore.setTitle(getRouteTitle(route.meta, next))
  }
}

function toggleLanguage() {
  const next = language.value === 'en' ? 'zh-cn' : 'en'
  applyLanguage(next)
}

watch(
  () => settingsStore.language,
  (lang) => {
    const next = normalizeLanguage(lang)
    if (next !== language.value) {
      language.value = next
    }
  },
  { immediate: true }
)

watch(
  () => locale.value,
  (lang) => {
    const next = normalizeLanguage(lang)
    if (next !== language.value) {
      language.value = next
    }
  }
)

function toggleSideBar() {
  appStore.toggleSideBar()
}

function handleCommand(command) {
  switch (command) {
    case "setLayout":
      setLayout();
      break;
    case "logout":
      logout();
      break;
    default:
      break;
  }
}

function logout() {
  ElMessageBox.confirm(t('navbar.logoutConfirmContent'), t('navbar.logoutConfirmTitle'), {
    confirmButtonText: t('navbar.logoutConfirmOk'),
    cancelButtonText: t('navbar.logoutConfirmCancel'),
    type: 'warning'
  }).then(() => {
    userStore.logOut().then(() => {
      location.href = import.meta.env.VITE_APP_CONTEXT_PATH + 'index';
    })
  }).catch(() => { });
}

const emits = defineEmits(['setLayout'])
function setLayout() {
  emits('setLayout');
}
</script>

<style lang='scss' scoped>
.navbar {
  height: 50px;
  overflow: hidden;
  position: relative;
  background: #F8F9FD;

  .hamburger-container {
    line-height: 46px;
    height: 100%;
    float: left;
    cursor: pointer;
    transition: background 0.3s;
    -webkit-tap-highlight-color: transparent;

    &:hover {
      background: rgba(0, 0, 0, 0.025);
    }
  }

  .breadcrumb-container {
    float: left;
  }

  .topmenu-container {
    position: absolute;
    left: 50px;
  }

  .errLog-container {
    display: inline-block;
    vertical-align: top;
  }

  .right-menu {
    float: right;
    height: 100%;
    line-height: normal;
    display: flex;
    align-items: center;

    &:focus {
      outline: none;
    }

    .right-menu-item {
      display: inline-block;
      padding: 0 8px;
      height: 100%;
      font-size: 18px;
      color: #5a5e66;
      vertical-align: text-bottom;

      &.hover-effect {
        cursor: pointer;
        transition: background 0.3s;

        &:hover {
          background: rgba(0, 0, 0, 0.025);
        }
      }
    }

    .lang-switch-btn {
      margin: 0 16px 0 0;
      flex-shrink: 0;
      min-width: 108px;
      height: 30px;
      border-radius: 6px;
      padding: 0 12px;
      font-size: 13px;
      font-weight: 500;
      line-height: 1;
      background: #409eff;
      border-color: #409eff;
    }

    .avatar-container {
      margin-right: 32px;
      display: flex;
      align-items: center;

      .avatar-wrapper {
        margin-top: 0;
        position: relative;

        .user-avatar {
          cursor: pointer;
          width: 40px;
          height: 40px;
          border-radius: 10px;
        }

        i {
          cursor: pointer;
          position: absolute;
          right: -20px;
          top: 25px;
          font-size: 12px;
        }
      }
    }
  }
}
</style>
