import { createApp } from 'vue';
import App from './App.vue';
import JsonViewer from "vue3-json-viewer";
import "vue3-json-viewer/dist/index.css";

// import VueRouter from 'vue-router'
// app.use(VueRouter)

import VueRouter from './router'

createApp(App)
.use(JsonViewer)
.use(VueRouter)
.mount('#app');
