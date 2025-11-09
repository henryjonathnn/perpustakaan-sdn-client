<script setup lang="ts">
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { Book, LogOut, User } from 'lucide-vue-next'

const router = useRouter()
const token = ref(localStorage.getItem('token'))
const isLoggedIn = computed(() => !!token.value)
const userRole = ref(localStorage.getItem('userRole') || 'siswa')

const handleLogout = () => {
  // Implement logout logic
  router.push('/login')
}
</script>

<template>
  <nav class="border-b bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/60">
    <div class="container flex h-16 items-center justify-between">
      <!-- Logo & Brand -->
      <div class="flex items-center gap-6">
        <router-link to="/" class="flex items-center space-x-2">
          <Book class="h-6 w-6" />
          <span class="font-bold">Perpustakaan SDN</span>
        </router-link>
        
        <!-- Navigation Links -->
        <div class="hidden md:flex md:gap-6">
          <router-link to="/books" class="text-sm font-medium transition-colors hover:text-primary">
            Buku
          </router-link>
          <router-link to="/recommendations" class="text-sm font-medium transition-colors hover:text-primary">
            Rekomendasi
          </router-link>
          <router-link 
            v-if="userRole === 'pustakawan'" 
            to="/manage-books" 
            class="text-sm font-medium transition-colors hover:text-primary"
          >
            Kelola Buku
          </router-link>
        </div>
      </div>

      <!-- Auth Buttons -->
      <div class="flex items-center gap-4">
        <template v-if="isLoggedIn">
          <button 
            class="inline-flex items-center justify-center text-sm font-medium transition-colors hover:text-primary"
            @click="handleLogout"
          >
            <LogOut class="mr-2 h-4 w-4" />
            Keluar
          </button>
        </template>
        <template v-else>
          <router-link 
            to="/login"
            class="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
          >
            <User class="mr-2 h-4 w-4" />
            Masuk
          </router-link>
        </template>
      </div>
    </div>
  </nav>
</template>