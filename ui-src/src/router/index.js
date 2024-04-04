import { createRouter, createWebHashHistory } from 'vue-router'


const routes = [
  { path: '/', component: ()=>  import('../Home.vue') },
  { path: '/setting', component: ()=>  import('../Setting.vue') },
  { path: '/plant', component: ()=>  import('../Plant.vue') },
]

const router = createRouter({
  // vueRouter@3版本的mode改成了history，hash模式配置createWebHashHistory，history模式配置createWebHistory
  history: createWebHashHistory(),
  routes
})
// 导出路由
export default router;
