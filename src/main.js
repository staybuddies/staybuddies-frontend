// src/main.js
import { createApp } from 'vue'
import App from './App.vue'
import router from './router'

import { Buffer } from 'buffer'
window.Buffer = window.Buffer || Buffer

createApp(App).use(router).mount('#app')
