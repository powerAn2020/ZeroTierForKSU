import { createRouter, createWebHashHistory } from 'vue-router'


const routes = [
  { path: '/', component: () => import('../Home.vue') },
  { path: '/setting', component: () => import('../Setting.vue') },
  { path: '/peers', component: () => import('../Peers.vue') },
  {
    path: '/center', component: () => import('../Center.vue')
    , children: [
      {
        // 当 /user/:id/posts 匹配成功
        // UserPosts 将被渲染到 User 的 <router-view> 内部
        path: 'network',
        component: () => import('../Network.vue')
      },
    ]
  }
]

const router = createRouter({
  // vueRouter@3版本的mode改成了history，hash模式配置createWebHashHistory，history模式配置createWebHistory
  history: createWebHashHistory(),
  routes
})
// 导出路由
export default router;
