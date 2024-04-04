<template>
  <van-config-provider :theme="theme?'light':'dark'">
    <van-nav-bar title="Zerotier For KSU">
      <!-- <template #left>
        <van-icon name="chat-o" dot size="1.2rem" />
      </template> -->
      <template #right>
        <!-- <el-icon><icon-ep-sunny /></el-icon>
      <el-icon><icon-ep-moon /></el-icon> -->
        <!-- <v-icon name="bi-music-player" /> -->
        <van-icon size="1.2rem" @click="switchTheme" :name="iconName" style="background-color: #1989fa;border-radius: 50%;"/>
        <van-icon v-if="router.currentRoute.value.fullPath !== '/setting'" name="add" size="1.2rem"
          @click="newAdd(undefined)" />
      </template>
    </van-nav-bar>
    <router-view v-slot="{ Component }">
      <component ref="routerViewRef" :is="Component" />
    </router-view> <van-tabbar route>
      <van-tabbar-item replace to="/" icon="home-o">首页</van-tabbar-item>
      <van-tabbar-item replace to="/plant" icon="fire-o">私有plant</van-tabbar-item>
      <van-tabbar-item replace to="/setting" icon="setting-o">设置</van-tabbar-item>
    </van-tabbar>
  </van-config-provider>
</template>

<script setup>
import { ref, watch } from 'vue';
import { useRouter } from 'vue-router';
const router = useRouter()
console.log('router',);
const theme = ref(true);

const routerViewRef = ref()
const night="data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIxZW0iIGhlaWdodD0iMWVtIiB2aWV3Qm94PSIwIDAgMjQgMjQiPjxwYXRoIGZpbGw9Im5vbmUiIHN0cm9rZT0iY3VycmVudENvbG9yIiBzdHJva2UtbGluZWpvaW49InJvdW5kIiBzdHJva2Utd2lkdGg9IjIiIGQ9Ik05Ljg3NCA1LjAwOGMyLjcyOC0xLjY4IDYuNjA0LTEuMDE0IDguMjUuMTk3Yy0yLjk1NS44NC01LjExIDMuMjY3LTUuMjQyIDYuNDE1Yy0uMTggNC4yOCAzLjAwNiA2LjU4OCA1LjI0IDcuMTUyYy0xLjk2NCAxLjM0My00LjM2IDEuMjkzLTUuMjM1IDEuMTcyYy0zLjU2OC0uNDkyLTYuOTAyLTMuNDMzLTcuMDA3LTcuNzExYy0uMTA2LTQuMjc4IDIuNTczLTYuMzUgMy45OTQtNy4yMjV6Ii8+PC9zdmc+";
const light="data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIxZW0iIGhlaWdodD0iMWVtIiB2aWV3Qm94PSIwIDAgMTAyNCAxMDI0Ij48cGF0aCBmaWxsPSJjdXJyZW50Q29sb3IiIGQ9Ik01MTIgNzA0YTE5MiAxOTIgMCAxIDAgMC0zODRhMTkyIDE5MiAwIDAgMCAwIDM4NG0wIDY0YTI1NiAyNTYgMCAxIDEgMC01MTJhMjU2IDI1NiAwIDAgMSAwIDUxMm0wLTcwNGEzMiAzMiAwIDAgMSAzMiAzMnY2NGEzMiAzMiAwIDAgMS02NCAwVjk2YTMyIDMyIDAgMCAxIDMyLTMybTAgNzY4YTMyIDMyIDAgMCAxIDMyIDMydjY0YTMyIDMyIDAgMSAxLTY0IDB2LTY0YTMyIDMyIDAgMCAxIDMyLTMyTTE5NS4yIDE5NS4yYTMyIDMyIDAgMCAxIDQ1LjI0OCAwbDQ1LjI0OCA0NS4yNDhhMzIgMzIgMCAxIDEtNDUuMjQ4IDQ1LjI0OEwxOTUuMiAyNDAuNDQ4YTMyIDMyIDAgMCAxIDAtNDUuMjQ4bTU0My4xMDQgNTQzLjEwNGEzMiAzMiAwIDAgMSA0NS4yNDggMGw0NS4yNDggNDUuMjQ4YTMyIDMyIDAgMCAxLTQ1LjI0OCA0NS4yNDhsLTQ1LjI0OC00NS4yNDhhMzIgMzIgMCAwIDEgMC00NS4yNDhNNjQgNTEyYTMyIDMyIDAgMCAxIDMyLTMyaDY0YTMyIDMyIDAgMCAxIDAgNjRIOTZhMzIgMzIgMCAwIDEtMzItMzJtNzY4IDBhMzIgMzIgMCAwIDEgMzItMzJoNjRhMzIgMzIgMCAxIDEgMCA2NGgtNjRhMzIgMzIgMCAwIDEtMzItMzJNMTk1LjIgODI4LjhhMzIgMzIgMCAwIDEgMC00NS4yNDhsNDUuMjQ4LTQ1LjI0OGEzMiAzMiAwIDAgMSA0NS4yNDggNDUuMjQ4TDI0MC40NDggODI4LjhhMzIgMzIgMCAwIDEtNDUuMjQ4IDBtNTQzLjEwNC01NDMuMTA0YTMyIDMyIDAgMCAxIDAtNDUuMjQ4bDQ1LjI0OC00NS4yNDhhMzIgMzIgMCAwIDEgNDUuMjQ4IDQ1LjI0OGwtNDUuMjQ4IDQ1LjI0OGEzMiAzMiAwIDAgMS00NS4yNDggMCIvPjwvc3ZnPg=="
const iconName = ref(light);
const cacheTheme=localStorage.getItem('theme');
if(typeof cacheTheme !="undefined" && cacheTheme != null){
  theme.value = cacheTheme;
}else{
  localStorage.setItem('theme',true)
}
const switchTheme =()=>{
  theme.value=!theme.value;
  localStorage.setItem('theme',!theme)
};
const newAdd = (index) => {
  routerViewRef.value.newAdd(index);
}
watch(theme, (theme, prevtheme) => {
  if(prevtheme){
    iconName.value=light;
  }else{
    iconName.value=night;
  }
},{
  immediate:true
})
</script>

<style>
.van-theme-dark body {
  color: #f5f5f5;
  background-color: black;
}
</style>
