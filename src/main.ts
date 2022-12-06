import { createApp } from 'vue'
import { autoAnimatePlugin } from '@formkit/auto-animate/vue'
import { vfmPlugin } from 'vue-final-modal'
import App from './App.vue'
import pinia from '@/store'

import './assets/main.css'

createApp(App)
  .use(pinia)
  .use(autoAnimatePlugin)
  .use(vfmPlugin({
    key: "$vfm",
    componentName: "VueFinalModal",
    dynamicContainerName: "ModalsContainer"
  }))
  .mount('#app')
