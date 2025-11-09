import { createApp } from 'vue'
import { createRouter, createWebHistory } from 'vue-router'
import App from './App.vue'

// Import styles
import './styles/globals.css'

// Import components
import Home from './views/Home.vue'

// Create router
const router = createRouter({
  history: createWebHistory(),
  routes: [
    {
      path: '/',
      name: 'Home',
      component: Home
    },
    // Add more routes as needed
  ]
})

const app = createApp(App)
app.use(router)
app.mount('#app')
