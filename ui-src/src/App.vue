<template>
  <van-config-provider :theme="theme ? 'light' : 'dark'">
    <van-nav-bar title="Zerotier For KSU" safe-area-inset-top fixed>
      <template #left>
        <van-space>
          <van-icon size="1.2rem" @click="switchTheme" :name="iconName" />
        </van-space>
      </template>
      <template #right>
        <!-- <el-icon><icon-ep-sunny /></el-icon>
      <el-icon><icon-ep-moon /></el-icon> -->
        <!-- <v-icon name="bi-music-player" /> -->
        <van-space>
          <van-icon v-if="router.currentRoute.value.fullPath !== '/setting'" :name="add" size="1.2rem"
            @click="newAdd(undefined)" />
          <van-icon size="1.2rem" :name="lang" @click="localeShow = true" />
        </van-space>
      </template>
    </van-nav-bar>
    <!-- <div style="height: 5rem;"></div> -->
    <div style="height: 2.8rem;"></div>
    <router-view v-slot="{ Component }">
      <component ref="routerViewRef" :is="Component" :theme="theme" />
    </router-view>
    <div style="height: 0.1rem;padding-bottom:50px;"></div>
    <van-tabbar route safe-area-inset-bottom>
      <van-tabbar-item replace to="/" icon="home-o">{{ t('common.dash') }}</van-tabbar-item>
      <van-tabbar-item replace to="/peers" icon="friends-o">{{ t('common.peers') }}</van-tabbar-item>
      <van-tabbar-item replace to="/center">
        <template #icon>
          <svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" viewBox="0 0 36 36">
            <path fill="currentColor" d="M26.58 32h-18a1 1 0 1 0 0 2h18a1 1 0 0 0 0-2"
              class="clr-i-outline clr-i-outline-path-1" />
            <path fill="currentColor"
              d="M17.75 2a14 14 0 0 0-14 14c0 .45 0 .89.07 1.33A14 14 0 1 0 17.75 2m0 2a12 12 0 0 1 8.44 3.48v1A18.5 18.5 0 0 0 14 8.53a2.33 2.33 0 0 0-1.14-.61h-.25c-.12-.42-.23-.84-.32-1.27s-.14-.81-.19-1.22A11.9 11.9 0 0 1 17.75 4m-3 5.87a17 17 0 0 1 11.17.13a16.9 16.9 0 0 1-3.11 7a2.28 2.28 0 0 0-2.58.57c-.35-.2-.7-.4-1-.63a16 16 0 0 1-4.93-5.23a2.25 2.25 0 0 0 .47-1.77Zm-4-3.6c0 .21.06.43.1.64c.09.44.21.87.33 1.3a2.28 2.28 0 0 0-1.1 2.25a18.3 18.3 0 0 0-4.18 3.76a12 12 0 0 1 4.86-7.95Zm0 15.71a2.34 2.34 0 0 0-1.55 1.76h-.64a11.94 11.94 0 0 1-2.76-6.82l.11-.19a16.9 16.9 0 0 1 4.81-4.89a2.31 2.31 0 0 0 2.28.63a17.5 17.5 0 0 0 5.35 5.65c.41.27.83.52 1.25.76a2.3 2.3 0 0 0 .18 1.12a16.9 16.9 0 0 1-6.2 3.11A2.34 2.34 0 0 0 10.76 22Zm7 6a11.9 11.9 0 0 1-5.81-1.51l.28-.06a2.34 2.34 0 0 0 1.57-1.79a18.4 18.4 0 0 0 7-3.5a2.29 2.29 0 0 0 3-.62a17.4 17.4 0 0 0 4.32.56h.53A12 12 0 0 1 17.75 28Zm6.51-8.9a2.33 2.33 0 0 0-.33-1.19a18.4 18.4 0 0 0 3.39-7.37q.75.35 1.48.78a12 12 0 0 1 .42 8.2a16 16 0 0 1-4.95-.39Z"
              class="clr-i-outline clr-i-outline-path-2" />
            <path fill="none" d="M0 0h36v36H0z" />
          </svg>

        </template>
        {{ t('common.network') }}
      </van-tabbar-item>
      <van-tabbar-item replace to="/setting" icon="setting-o">{{ t('common.setting') }}</van-tabbar-item>
    </van-tabbar>
    <van-action-sheet v-model:show="localeShow" :actions="language" @select="switchLocale" close-on-click-action />

  </van-config-provider>
  <!-- <van-floating-bubble icon="replay" axis="xy" magnetic="x" @click="onClick" /> -->

</template>

<script setup>
// import { ref, watch } from 'vue';
// import { useRouter } from 'vue-router';
import { execCmd,isEmpty } from './tools'
import { vantLocales, useI18n, i18n } from './locales'; // 导入所有翻译信息
const { t, locale } = useI18n();

const router = useRouter()
const theme = ref();
const localeShow = ref(false);
const routerViewRef = ref()
const lang = "data:image/svg+xml;base64,PHN2ZyB0PSIxNzE3MTMyMzU2MTg3IiBjbGFzcz0iaWNvbiIgdmlld0JveD0iMCAwIDEwMjQgMTAyNCIgdmVyc2lvbj0iMS4xIiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHAtaWQ9IjkyMjAiIHdpZHRoPSIyMDAiIGhlaWdodD0iMjAwIj48cGF0aCBkPSJNODQ2LjA0IDg2Ni43N2MtMTcuMDggMi4wMy0zMi41Ny0xMC4xOC0zNC41OS0yNy4yNi0wLjIyLTEuOS0wLjI3LTMuODEtMC4xNS01Ljcxdi0xMjNjMC0zMy43My0yMi4xNy0zMy43My0zMC41My0zMy43My0yMS4yOC0wLjQ2LTM4LjkxIDE2LjQzLTM5LjM2IDM3LjcyLTAuMDEgMC40Ni0wLjAxIDAuOTIgMCAxLjM3djExNy42NmMtMC43NiAxOC45LTE2LjcxIDMzLjYxLTM1LjYxIDMyLjg0LTE3LjgzLTAuNzItMzIuMTItMTUuMDEtMzIuODQtMzIuODRWNjQ3LjY4Yy0xLjIzLTE3LjIzIDExLjc0LTMyLjE5IDI4Ljk3LTMzLjQxIDEuNjktMC4xMiAzLjM5LTAuMSA1LjA4IDAuMDVhMzEuOTUzIDMxLjk1MyAwIDAgMSAzMS4zMyAxNy43NiA4OS40MzUgODkuNDM1IDAgMCAxIDU0Ljk5LTE3Ljc2YzU0LjExIDAgODYuNDUgMzMuNTkgODYuNDUgOTAuMDNWODMzLjhhMzIuMjUgMzIuMjUgMCAwIDEtOC44OCAyMy43MiAzNC4wMjYgMzQuMDI2IDAgMCAxLTI0LjgyIDkuMzNsLTAuMDQtMC4wOHogbS0yMzMuMTItNy40NmgtMTM0LjdjLTQyLjc3IDAtNjEuODUtMTguOTYtNjEuODUtNjEuNTdWNjA4LjA3YzAtNDIuNTIgMTkuMDktNjEuNTcgNjEuODUtNjEuNTdoMTI4Ljc0YzE3LjkyIDAgMzIuNDUgMTQuNTMgMzIuNDUgMzIuNDVzLTE0LjUzIDMyLjQ1LTMyLjQ1IDMyLjQ1SDQ5MC43M2MtMS4yMi0wLjA4LTIuNDUgMC4wOS0zLjYgMC41IDAuMTMgMC0wLjE1IDAuOC0wLjE1IDIuODl2NTIuNThoMTA2YzE2LjMzLTEuNjYgMzAuOTEgMTAuMjQgMzIuNTcgMjYuNTcgMC4xNyAxLjY4IDAuMiAzLjM3IDAuMDggNS4wNiAwLjk4IDE2LjY2LTExLjczIDMwLjk3LTI4LjQgMzEuOTUtMS40MSAwLjA4LTIuODMgMC4wNy00LjI0LTAuMDVINDg2LjlWNzkxYy0wLjA0IDEuMDYgMC4wOCAyLjEzIDAuMzUgMy4xNSAxLjEyIDAuMTUgMi4yNSAwLjIzIDMuMzggMC4yNGgxMjIuMzFjMTYuOTYtMS4wNyAzMS41OCAxMS44MSAzMi42NSAyOC43NiAwLjA3IDEuMTYgMC4wOCAyLjMzIDAuMDIgMy41IDEuMzUgMTYuNjgtMTEuMDcgMzEuMy0yNy43NSAzMi42NS0xLjY0IDAuMTMtMy4yOCAwLjEzLTQuOTIgMGgtMC4wMnpNMzI3LjU0IDQ4Mi44NWMtMTcuMzYgMi4zNi0zMy4zNC05LjgtMzUuNy0yNy4xNi0wLjMtMi4yMS0wLjM3LTQuNDQtMC4yLTYuNjdWMzcwLjVoLTg1LjI3Yy00NS44NiAwLTY2LjMxLTIwLjUyLTY2LjMxLTY2LjMxdi05My44N2MwLTQ1LjU4IDIwLjUyLTY1LjkgNjYuMzEtNjUuOWg4NS4yN3YtMzEuNTNjLTEuMzgtMTcuMTEgMTEuMzctMzIuMTEgMjguNDgtMzMuNDkgMS45Mi0wLjE1IDMuODQtMC4xMyA1Ljc2IDAuMDcgMzAuMjYgMCAzNi42MyAxOC4xNyAzNi42MyAzMy40MnYzMS41OWg4Ni4wOWM0NS44NiAwIDY2LjMzIDIwLjM0IDY2LjMzIDY1Ljg4djkzLjg5YzAgNDUuODYtMjAuNTIgNjYuMjktNjYuMzMgNjYuMjloLTg2LjA1djc4LjUyYzEuMjUgMTcuNDctMTEuOSAzMi42NS0yOS4zNyAzMy45MS0xLjg4IDAuMTMtMy43NiAwLjEtNS42My0wLjF2LTAuMDJ6TTIxNy4yMSAyMTEuMjdjLTYuNDcgMC03LjA3IDAuNi03LjA3IDcuMDd2NzguMmMwIDYuNTMgMC42IDcuMTUgNy4wNyA3LjE1aDc0LjQzdi05Mi40MmgtNzQuNDN6IG0xNDUuMzUgOTIuMzhoNzUuMjljNi4yOSAwIDcuMDktMC44IDcuMDktNy4wN3YtNzguMjVjMC02LjI5LTAuOC03LjA5LTcuMDktNy4wOWgtNzUuMzF2OTIuNDJoMC4wMnogbTE1MS40MiA2NTUuOTFDMjY2LjQzIDk1OC44MiA2Ni4zNiA3NTcuNTUgNjcuMSA1MTBjMC4xLTM1IDQuMzEtNjkuODYgMTIuNTItMTAzLjg4IDQuODEtMTkgMjMuOTItMzAuNjggNDMuMDMtMjYuMjkgMTkuMSA0LjYxIDMwLjg2IDIzLjgxIDI2LjI5IDQyLjkxLTQ4LjkzIDIwMi4zMyA3NS40MiA0MDYuMDEgMjc3Ljc1IDQ1NC45NGEzNzYuOTI0IDM3Ni45MjQgMCAwIDAgODcuMjkgMTAuNTZjMTkuNjkgMC4wMiAzNS42NCAxNS45OSAzNS42MyAzNS42OS0wLjAyIDE5LjY3LTE1Ljk2IDM1LjYxLTM1LjYzIDM1LjYzeiBtMzk4LjQ5LTMxMC4wNWMtMTkuNjkgMC0zNS42Ni0xNS45Ni0zNS42Ni0zNS42NSAwLTIuOTUgMC4zNy01LjkgMS4wOS04Ljc2IDUxLjMxLTIwMS44Mi03MC43LTQwNy4wMi0yNzIuNTItNDU4LjMzLTI5Ljg5LTcuNi02MC41OS0xMS41LTkxLjQzLTExLjYyLTE5LjY4IDAtMzUuNjQtMTUuOTUtMzUuNjQtMzUuNjMgMC0xOS42OCAxNS45NS0zNS42NCAzNS42My0zNS42NGgwLjAxYzI0Ny41NyAwLjc2IDQ0Ny42NSAyMDIuMDggNDQ2Ljg5IDQ0OS42NS0wLjExIDM2LjgtNC43NiA3My40NC0xMy44MyAxMDkuMS00IDE1LjgtMTguMjMgMjYuODgtMzQuNTQgMjYuODh6IiBmaWxsPSIjMTk4OWZhIiBwLWlkPSI5MjIxIj48L3BhdGg+PC9zdmc+"

const iconName = 'data:image/svg+xml;base64,PHN2ZyB0PSIxNzE3MTMxOTA1ODExIiBjbGFzcz0iaWNvbiIgdmlld0JveD0iMCAwIDEwMjQgMTAyNCIgdmVyc2lvbj0iMS4xIiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHAtaWQ9IjQ2MDEiIHdpZHRoPSIyMDAiIGhlaWdodD0iMjAwIj48cGF0aCBkPSJNMzIwIDg1LjMzMzMzM0MyNDMuNjI2NjY3IDEzNC40IDE5MiAyMjEuMDEzMzMzIDE5MiAzMjAgMTkyIDQxOC45ODY2NjcgMjQzLjYyNjY2NyA1MDUuNiAzMjEuMjggNTU0LjY2NjY2NyAxOTAuMjkzMzMzIDU1NC42NjY2NjcgODUuMzMzMzMzIDQ0OS43MDY2NjcgODUuMzMzMzMzIDMyMCA4NS4zMzMzMzMgMTkwLjI5MzMzMyAxOTAuMjkzMzMzIDg1LjMzMzMzMyAzMjAgODUuMzMzMzMzTTgxMy42NTMzMzMgMTQ5LjMzMzMzMyA4NzQuNjY2NjY3IDIxMC4zNDY2NjcgMjEwLjM0NjY2NyA4NzQuNjY2NjY3IDE0OS4zMzMzMzMgODEzLjY1MzMzMyA4MTMuNjUzMzMzIDE0OS4zMzMzMzNNNTQ5Ljk3MzMzMyAyNTMuMDEzMzMzIDQ4Ni44MjY2NjcgMjEzLjMzMzMzMyA0MjUuMzg2NjY3IDI1NiA0NDMuMzA2NjY3IDE4My40NjY2NjcgMzg0IDEzOC4yNCA0NTguNjY2NjY3IDEzMy4xMiA0ODMuNDEzMzMzIDYyLjcyIDUxMiAxMzIuMjY2NjY3IDU4NS44MTMzMzMgMTMzLjU0NjY2NyA1MjguMjEzMzMzIDE4MS43NiA1NDkuOTczMzMzIDI1My4wMTMzMzNNNDA5LjE3MzMzMyA0MDcuMDQgMzU5LjY4IDM3NS44OTMzMzMgMzExLjg5MzMzMyA0MDkuMTczMzMzIDMyNi40IDM1Mi44NTMzMzMgMjc5Ljg5MzMzMyAzMTcuNDQgMzM3LjkyIDMxMy42IDM1Ny4xMiAyNTguNTYgMzc4Ljg4IDMxMi43NDY2NjcgNDM2LjkwNjY2NyAzMTQuMDI2NjY3IDM5Mi4xMDY2NjcgMzUxLjE0NjY2NyA0MDkuMTczMzMzIDQwNy4wNE04MTAuNjY2NjY3IDU3NkM4MTAuNjY2NjY3IDcwNS43MDY2NjcgNzA1LjcwNjY2NyA4MTAuNjY2NjY3IDU3NiA4MTAuNjY2NjY3IDUyMy45NDY2NjcgODEwLjY2NjY2NyA0NzUuNzMzMzMzIDc5My42IDQzNi45MDY2NjcgNzY1LjAxMzMzM0w3NjUuMDEzMzMzIDQzNi45MDY2NjdDNzkzLjYgNDc1LjczMzMzMyA4MTAuNjY2NjY3IDUyMy45NDY2NjcgODEwLjY2NjY2NyA1NzZNNjIyLjkzMzMzMyA4NTYuNzQ2NjY3IDc0MS4xMiA4MDcuNjggNzMwLjg4IDk1MC42MTMzMzMgNjIyLjkzMzMzMyA4NTYuNzQ2NjY3TTgwNy42OCA3NDEuNTQ2NjY3IDg1Ni43NDY2NjcgNjIzLjM2IDk1MC42MTMzMzMgNzMxLjczMzMzMyA4MDcuNjggNzQxLjU0NjY2N004NTYuNzQ2NjY3IDUyOS45MiA4MDguMTA2NjY3IDQxMS4zMDY2NjcgOTUwLjYxMzMzMyA0MjEuNTQ2NjY3IDg1Ni43NDY2NjcgNTI5LjkyTTQxMC44OCA4MDcuNjggNTI5LjA2NjY2NyA4NTYuNzQ2NjY3IDQyMS4xMiA5NTAuMTg2NjY3IDQxMC44OCA4MDcuNjhaIiBwLWlkPSI0NjAyIiBmaWxsPSIjMTk4OWZhIj48L3BhdGg+PC9zdmc+';
const add = 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIxZW0iIGhlaWdodD0iMWVtIiB2aWV3Qm94PSIwIDAgMjQgMjQiPjxnIGZpbGw9IiMxOTg5ZmEiIGZpbGwtcnVsZT0iZXZlbm9kZCIgY2xpcC1ydWxlPSJldmVub2RkIj48cGF0aCBkPSJNMiAxMkMyIDYuNDc3IDYuNDc3IDIgMTIgMnMxMCA0LjQ3NyAxMCAxMHMtNC40NzcgMTAtMTAgMTBTMiAxNy41MjMgMiAxMm0xMC04YTggOCAwIDEgMCAwIDE2YTggOCAwIDAgMCAwLTE2Ii8+PHBhdGggZD0iTTEzIDdhMSAxIDAgMSAwLTIgMHY0SDdhMSAxIDAgMSAwIDAgMmg0djRhMSAxIDAgMSAwIDIgMHYtNGg0YTEgMSAwIDEgMCAwLTJoLTR6Ii8+PC9nPjwvc3ZnPg==';
// const onClick = () => {
//   window.location.reload();
// }

const language = [
  { name: "中文(简体)", value: "zh" },
  { name: "English(US)", value: "en" }
]
// 切换语言
const switchLocale = (language) => {
  
  // Vant basic
  vantLocales(language)
  // Business component
  // locale.value = language;
  locale.value = language.value
  // Cookie
  localStorage.setItem('ZerotierForKSU.locale', language.value)
  localeShow.value = false;
}
const initTheme = () => {
  execCmd('settings get secure ui_night_mode').then(v => {
    // 0 表示跟随系统设置?即当前模式与系统设置的主题模式相匹配.
    // 1 表示开启了 Dark Mode（夜间模式）.
    // 2 表示关闭了 Dark Mode（白天模式）.
    if (v == '1') {
      theme.value = true;
    } else {
      theme.value = false;
    }
    localStorage.setItem('ZerotierForKSU.theme', theme.value)
  });
  const cacheTheme = localStorage.getItem('ZerotierForKSU.theme');
  if (!isEmpty(cacheTheme)) {
    theme.value = JSON.parse(cacheTheme);
  } else {
    localStorage.setItem('ZerotierForKSU.theme', false)
  }
}
const initI18n = () => {
  const cacheLocale = localStorage.getItem('ZerotierForKSU.locale')
  if (!isEmpty(cacheLocale)) {
    i18n.global.locale = cacheLocale
    return
  }
  let locale
  switch (navigator.language) {
    case 'en':
      locale = 'en-US'
      break
    case 'zh-CN':
      locale = 'zh-CN'
      break
    default:
      locale = 'zh-CN'
  }
  i18n.global.locale = locale
  localStorage.setItem('ZerotierForKSU.locale', locale)
}

const switchTheme = () => {
  theme.value = !theme.value;
  localStorage.setItem('ZerotierForKSU.theme', theme.value)
};
const newAdd = (index) => {
  routerViewRef.value.newAdd(index);
}
// watch(theme, (theme, prevtheme) => {
//   if (JSON.parse(theme)) {
//     iconName.value = night;
//   } else {
//     iconName.value = light;
//   }
// }, {
//   immediate: true
// })
initTheme()
initI18n()
</script>

<style>
.van-theme-dark body {
  color: #f5f5f5;
  background-color: black;
}

.van-theme-light body {
  /* color: #f7f8fa; */
  background-color: #f7f8fa;
  --van-dialog-background: #f7f8fa;
}

* {
  -webkit-touch-callout: none;
  /*系统默认菜单被禁用*/
  -webkit-user-select: none;
  /*webkit浏览器*/
  -moz-user-select: none;
  /*火狐*/
  -ms-user-select: none;
  /*IE10*/
  user-select: none;
}
</style>
