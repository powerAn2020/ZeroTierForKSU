import { defineConfig } from "vite";
import vue from "@vitejs/plugin-vue";
import AutoImport from "unplugin-auto-import/vite";
import Components from "unplugin-vue-components/vite";
// import Icons from "unplugin-icons/vite";
// import IconsResolver from 'unplugin-icons/resolver'
import { VantResolver } from "@vant/auto-import-resolver";

export default defineConfig({
  plugins: [
    vue(),
    AutoImport({
      resolvers: [VantResolver()],
    }),
    Components({
      resolvers: [VantResolver(),        
      //   IconsResolver({
      //   prefix: 'icon', // 自动引入的Icon组件统一前缀，默认为 i，设置false为不需要前缀
      //   // {prefix}-{collection}-{icon} 使用组件解析器时，您必须遵循名称转换才能正确推断图标。
      //   // alias: { park: 'icon-park' } 集合的别名
      //   enabledCollections: ['ep'] // 这是可选的，默认启用 Iconify 支持的所有集合['mdi']
      // }),
    ],
    }),
    // Icons({
    //   // scale: 1, // 缩放
    //   compiler: 'vue3', // 编译方式
    //   // defaultClass: '', // 默认类名
    //   // defaultStyle: '', // 默认样式
    //   autoInstall: true
    //   // jsx: 'react' // jsx支持
    // }),
  ],
});