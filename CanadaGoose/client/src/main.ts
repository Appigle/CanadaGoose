import './assets/main.css'

import { createPinia } from 'pinia'
import { createApp } from 'vue'

import App from './App.vue'
import router from './router'

const app = createApp(App)

if (import.meta.env.VITE_DISABLE_DEVTOOLS === 'true') {
  // @ts-ignore
  window.__VUE_DEVTOOLS_GLOBAL_HOOK__ = undefined
}

app.use(createPinia())
app.use(router)

app.mount('#app')
