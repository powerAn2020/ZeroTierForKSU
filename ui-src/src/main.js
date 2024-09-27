import { createApp } from 'vue';
import App from './App.vue';
import JsonViewer from "vue3-json-viewer";
import "vue3-json-viewer/dist/index.css";
import { createPinia } from 'pinia'
import router from './router'
const pinia = createPinia()

createApp(App)
.use(JsonViewer)
.use(router)
.use(pinia)
.mount('#app');
