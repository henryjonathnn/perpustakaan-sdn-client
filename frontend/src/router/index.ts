import { createRouter, createWebHistory } from 'vue-router'
import Home from '../views/Home.vue'
import Login from '../views/Login.vue'
import Books from '../views/Books.vue'
import BookDetails from '../views/BookDetails.vue'
import Recommendations from '../views/Recommendations.vue'
import ManageBooks from '../views/ManageBooks.vue'

const router = createRouter({
  history: createWebHistory(),
  routes: [
    {
      path: '/',
      name: 'home',
      component: Home
    },
    {
      path: '/login',
      name: 'login',
      component: Login
    },
    {
      path: '/books',
      name: 'books',
      component: Books
    },
    {
      path: '/books/:id',
      name: 'book-details',
      component: BookDetails
    },
    {
      path: '/recommendations',
      name: 'recommendations',
      component: Recommendations
    },
    {
      path: '/manage-books',
      name: 'manage-books',
      component: ManageBooks,
      meta: { requiresPustakawan: true }
    }
  ]
})

// Navigation guard
router.beforeEach((to, from, next) => {
  const isAuthenticated = localStorage.getItem('token')
  const userRole = localStorage.getItem('userRole')

  if (to.matched.some(record => record.meta.requiresAuth) && !isAuthenticated) {
    next('/login')
  } else if (
    to.matched.some(record => record.meta.requiresPustakawan) && 
    userRole !== 'pustakawan'
  ) {
    next('/')
  } else {
    next()
  }
})

export default router