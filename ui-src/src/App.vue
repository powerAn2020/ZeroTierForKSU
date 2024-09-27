<template>
  <van-config-provider :theme="theme ? 'light' : 'dark'">
    <van-nav-bar title="Zerotier For KSU" >
      <template #left>
        <van-icon size="1.2rem" @click="switchTheme" :name="iconName"
          style="background-color: #1989fa;border-radius: 50%;" />
      </template>
      <template #right>
        <!-- <el-icon><icon-ep-sunny /></el-icon>
      <el-icon><icon-ep-moon /></el-icon> -->
        <!-- <v-icon name="bi-music-player" /> -->
        <van-icon v-if="router.currentRoute.value.fullPath !== '/setting'" name="add" size="1.2rem"
          @click="newAdd(undefined)" />
      </template>
    </van-nav-bar>
    <router-view v-slot="{ Component }">
      <component ref="routerViewRef" :is="Component" :theme="theme ? 'light' : 'dark'" />
    </router-view>
    <van-tabbar route>
      <van-tabbar-item replace to="/" icon="home-o">首页</van-tabbar-item>
      <van-tabbar-item replace to="/peers" icon="friends-o">成员</van-tabbar-item>
      <van-tabbar-item replace to="/center">
        <template #icon>
          <svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" viewBox="0 0 36 36"><path fill="currentColor" d="M26.58 32h-18a1 1 0 1 0 0 2h18a1 1 0 0 0 0-2" class="clr-i-outline clr-i-outline-path-1"/><path fill="currentColor" d="M17.75 2a14 14 0 0 0-14 14c0 .45 0 .89.07 1.33A14 14 0 1 0 17.75 2m0 2a12 12 0 0 1 8.44 3.48v1A18.5 18.5 0 0 0 14 8.53a2.33 2.33 0 0 0-1.14-.61h-.25c-.12-.42-.23-.84-.32-1.27s-.14-.81-.19-1.22A11.9 11.9 0 0 1 17.75 4m-3 5.87a17 17 0 0 1 11.17.13a16.9 16.9 0 0 1-3.11 7a2.28 2.28 0 0 0-2.58.57c-.35-.2-.7-.4-1-.63a16 16 0 0 1-4.93-5.23a2.25 2.25 0 0 0 .47-1.77Zm-4-3.6c0 .21.06.43.1.64c.09.44.21.87.33 1.3a2.28 2.28 0 0 0-1.1 2.25a18.3 18.3 0 0 0-4.18 3.76a12 12 0 0 1 4.86-7.95Zm0 15.71a2.34 2.34 0 0 0-1.55 1.76h-.64a11.94 11.94 0 0 1-2.76-6.82l.11-.19a16.9 16.9 0 0 1 4.81-4.89a2.31 2.31 0 0 0 2.28.63a17.5 17.5 0 0 0 5.35 5.65c.41.27.83.52 1.25.76a2.3 2.3 0 0 0 .18 1.12a16.9 16.9 0 0 1-6.2 3.11A2.34 2.34 0 0 0 10.76 22Zm7 6a11.9 11.9 0 0 1-5.81-1.51l.28-.06a2.34 2.34 0 0 0 1.57-1.79a18.4 18.4 0 0 0 7-3.5a2.29 2.29 0 0 0 3-.62a17.4 17.4 0 0 0 4.32.56h.53A12 12 0 0 1 17.75 28Zm6.51-8.9a2.33 2.33 0 0 0-.33-1.19a18.4 18.4 0 0 0 3.39-7.37q.75.35 1.48.78a12 12 0 0 1 .42 8.2a16 16 0 0 1-4.95-.39Z" class="clr-i-outline clr-i-outline-path-2"/><path fill="none" d="M0 0h36v36H0z"/></svg>
        
        </template>
        管理
      </van-tabbar-item>
      <van-tabbar-item replace to="/setting" icon="setting-o">设置</van-tabbar-item>
    </van-tabbar>
  </van-config-provider>
</template>

<script setup>
import { ref, watch } from 'vue';
import { useRouter } from 'vue-router';
import { execCmd } from './tools'

const router = useRouter()
const theme = ref();
const routerViewRef = ref()
const night = "data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIxZW0iIGhlaWdodD0iMWVtIiB2aWV3Qm94PSIwIDAgMjQgMjQiPjxwYXRoIGZpbGw9Im5vbmUiIHN0cm9rZT0iY3VycmVudENvbG9yIiBzdHJva2UtbGluZWpvaW49InJvdW5kIiBzdHJva2Utd2lkdGg9IjIiIGQ9Ik05Ljg3NCA1LjAwOGMyLjcyOC0xLjY4IDYuNjA0LTEuMDE0IDguMjUuMTk3Yy0yLjk1NS44NC01LjExIDMuMjY3LTUuMjQyIDYuNDE1Yy0uMTggNC4yOCAzLjAwNiA2LjU4OCA1LjI0IDcuMTUyYy0xLjk2NCAxLjM0My00LjM2IDEuMjkzLTUuMjM1IDEuMTcyYy0zLjU2OC0uNDkyLTYuOTAyLTMuNDMzLTcuMDA3LTcuNzExYy0uMTA2LTQuMjc4IDIuNTczLTYuMzUgMy45OTQtNy4yMjV6Ii8+PC9zdmc+";
const light = "data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIxZW0iIGhlaWdodD0iMWVtIiB2aWV3Qm94PSIwIDAgMTAyNCAxMDI0Ij48cGF0aCBmaWxsPSJjdXJyZW50Q29sb3IiIGQ9Ik01MTIgNzA0YTE5MiAxOTIgMCAxIDAgMC0zODRhMTkyIDE5MiAwIDAgMCAwIDM4NG0wIDY0YTI1NiAyNTYgMCAxIDEgMC01MTJhMjU2IDI1NiAwIDAgMSAwIDUxMm0wLTcwNGEzMiAzMiAwIDAgMSAzMiAzMnY2NGEzMiAzMiAwIDAgMS02NCAwVjk2YTMyIDMyIDAgMCAxIDMyLTMybTAgNzY4YTMyIDMyIDAgMCAxIDMyIDMydjY0YTMyIDMyIDAgMSAxLTY0IDB2LTY0YTMyIDMyIDAgMCAxIDMyLTMyTTE5NS4yIDE5NS4yYTMyIDMyIDAgMCAxIDQ1LjI0OCAwbDQ1LjI0OCA0NS4yNDhhMzIgMzIgMCAxIDEtNDUuMjQ4IDQ1LjI0OEwxOTUuMiAyNDAuNDQ4YTMyIDMyIDAgMCAxIDAtNDUuMjQ4bTU0My4xMDQgNTQzLjEwNGEzMiAzMiAwIDAgMSA0NS4yNDggMGw0NS4yNDggNDUuMjQ4YTMyIDMyIDAgMCAxLTQ1LjI0OCA0NS4yNDhsLTQ1LjI0OC00NS4yNDhhMzIgMzIgMCAwIDEgMC00NS4yNDhNNjQgNTEyYTMyIDMyIDAgMCAxIDMyLTMyaDY0YTMyIDMyIDAgMCAxIDAgNjRIOTZhMzIgMzIgMCAwIDEtMzItMzJtNzY4IDBhMzIgMzIgMCAwIDEgMzItMzJoNjRhMzIgMzIgMCAxIDEgMCA2NGgtNjRhMzIgMzIgMCAwIDEtMzItMzJNMTk1LjIgODI4LjhhMzIgMzIgMCAwIDEgMC00NS4yNDhsNDUuMjQ4LTQ1LjI0OGEzMiAzMiAwIDAgMSA0NS4yNDggNDUuMjQ4TDI0MC40NDggODI4LjhhMzIgMzIgMCAwIDEtNDUuMjQ4IDBtNTQzLjEwNC01NDMuMTA0YTMyIDMyIDAgMCAxIDAtNDUuMjQ4bDQ1LjI0OC00NS4yNDhhMzIgMzIgMCAwIDEgNDUuMjQ4IDQ1LjI0OGwtNDUuMjQ4IDQ1LjI0OGEzMiAzMiAwIDAgMS00NS4yNDggMCIvPjwvc3ZnPg=="
const iconName = ref();

execCmd('settings get secure ui_night_mode').then(v => {
  // 0 表示跟随系统设置?即当前模式与系统设置的主题模式相匹配.
  // 1 表示开启了 Dark Mode（夜间模式）.
  // 2 表示关闭了 Dark Mode（白天模式）.
  if (v == '1') {
    theme.value = true;
  } else if (v == '2') {
    theme.value = false;
  }
  // 返回值竟然有null
  if (v == null) {
    theme.value = false;
  }
  localStorage.setItem('theme', theme.value)
});
const cacheTheme = localStorage.getItem('theme');
if (typeof cacheTheme != "undefined" && cacheTheme != null) {
  theme.value = JSON.parse(cacheTheme);
} else {
  localStorage.setItem('theme', false)
}
const switchTheme = () => {
  theme.value = !theme.value;
  localStorage.setItem('theme', theme.value)
};
const newAdd = (index) => {
  routerViewRef.value.newAdd(index);
}
watch(theme, (theme, prevtheme) => {
  if (JSON.parse(theme)) {
    iconName.value = night;
  } else {
    iconName.value = light;
  }
}, {
  immediate: true
})
</script>

<style>
.van-theme-dark body {
  color: #f5f5f5;
  background-color: black;
}
</style>
