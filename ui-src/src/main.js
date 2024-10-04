import { createApp } from 'vue';
import App from './App.vue';
import JsonViewer from "vue3-json-viewer";
import "vue3-json-viewer/dist/index.css";
import { createPinia } from 'pinia'
import router from './router'
import i18n from './locales/i18n'

const pinia = createPinia()

createApp(App)
.use(i18n)
.use(JsonViewer)
.use(router)
.use(pinia)
.mount('#app');
