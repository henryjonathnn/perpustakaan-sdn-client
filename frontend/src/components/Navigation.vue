<script setup lang="ts">
import { ref, computed } from 'vue';
import { useRouter } from 'vue-router';
import { BookOpen, User, LogOut, LayoutDashboard, Menu, X } from 'lucide-vue-next';
import { authAPI } from '../services/api';
import { useAuthStore } from '../stores/auth';

const router = useRouter();
const authStore = useAuthStore();
const mobileMenuOpen = ref(false);

const isAuthenticated = computed(() => !!authStore.user);
const isPustakawan = computed(() => authStore.user?.role === 'pustakawan');

const handleLogout = async () => {
  try {
    await authAPI.logout();
  } catch (error) {
    console.error('Logout error:', error);
  } finally {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    authStore.clearUser();
    router.push('/');
  }
};

const navigateTo = (path: string) => {
  router.push(path);
  mobileMenuOpen.value = false;
};
</script>

<template>
  <nav class="sticky top-0 z-50 bg-white/80 backdrop-blur-xl border-b border-gray-200/80">
    <div class="max-w-[1400px] mx-auto px-6 lg:px-8">
      <div class="flex justify-between h-20">
        <!-- Logo -->
        <div class="flex items-center">
          <button @click="navigateTo('/')" class="flex items-center space-x-3 group">
            <div class="p-2 bg-gradient-to-br from-gray-900 to-gray-700 rounded-xl group-hover:shadow-lg transition-all">
              <BookOpen class="h-5 w-5 text-white" />
            </div>
            <span class="font-bold text-xl text-gray-900">Perpustakaan SDN</span>
          </button>
        </div>

        <!-- Desktop Navigation -->
        <div class="hidden md:flex items-center space-x-2">
          <button
            @click="navigateTo('/')"
            class="px-4 py-2 rounded-xl text-sm font-medium text-gray-700 hover:bg-gray-100 transition"
          >
            Katalog
          </button>

          <template v-if="isAuthenticated">
            <button
              v-if="isPustakawan"
              @click="navigateTo('/dashboard')"
              class="flex items-center space-x-2 px-4 py-2 rounded-xl text-sm font-medium text-gray-700 hover:bg-gray-100 transition"
            >
              <LayoutDashboard class="h-4 w-4" />
              <span>Dashboard</span>
            </button>

            <div class="flex items-center space-x-3 ml-4 pl-4 border-l border-gray-200">
              <div class="flex items-center space-x-2.5">
                <div class="w-9 h-9 rounded-full bg-gradient-to-br from-gray-900 to-gray-700 flex items-center justify-center">
                  <User class="h-4 w-4 text-white" />
                </div>
                <div class="flex flex-col">
                  <span class="text-sm font-semibold text-gray-900">{{ authStore.user.username }}</span>
                  <span class="text-xs text-gray-500">{{ authStore.user.role }}</span>
                </div>
              </div>
              <button
                @click="handleLogout"
                class="flex items-center space-x-2 px-4 py-2 rounded-xl text-sm font-medium text-gray-700 hover:bg-red-50 hover:text-red-600 transition"
              >
                <LogOut class="h-4 w-4" />
                <span>Keluar</span>
              </button>
            </div>
          </template>

          <template v-else>
            <button
              @click="navigateTo('/login')"
              class="px-4 py-2 rounded-xl text-sm font-medium text-gray-700 hover:bg-gray-100 transition"
            >
              Masuk
            </button>
            <button
              @click="navigateTo('/register')"
              class="px-5 py-2.5 rounded-xl text-sm font-medium bg-gray-900 text-white hover:bg-gray-800 transition shadow-sm"
            >
              Daftar
            </button>
          </template>
        </div>

        <!-- Mobile menu button -->
        <div class="md:hidden flex items-center">
          <button
            @click="mobileMenuOpen = !mobileMenuOpen"
            class="p-2 rounded-xl hover:bg-gray-100 transition"
          >
            <Menu v-if="!mobileMenuOpen" class="h-6 w-6" />
            <X v-else class="h-6 w-6" />
          </button>
        </div>
      </div>
    </div>

    <!-- Mobile menu -->
    <div v-if="mobileMenuOpen" class="md:hidden border-t border-gray-200 bg-white">
      <div class="px-6 py-4 space-y-2">
        <button
          @click="navigateTo('/')"
          class="block w-full text-left px-4 py-3 rounded-xl text-base font-medium text-gray-700 hover:bg-gray-100 transition"
        >
          Katalog
        </button>

        <template v-if="isAuthenticated">
          <button
            v-if="isPustakawan"
            @click="navigateTo('/dashboard')"
            class="flex items-center space-x-2 w-full px-4 py-3 rounded-xl text-base font-medium text-gray-700 hover:bg-gray-100 transition"
          >
            <LayoutDashboard class="h-4 w-4" />
            <span>Dashboard</span>
          </button>

          <div class="px-4 py-3 border-t mt-2 pt-4">
            <div class="flex items-center space-x-3 mb-3">
              <div class="w-10 h-10 rounded-full bg-gradient-to-br from-gray-900 to-gray-700 flex items-center justify-center">
                <User class="h-5 w-5 text-white" />
              </div>
              <div class="flex flex-col">
                <span class="font-semibold text-gray-900">{{ authStore.user.username }}</span>
                <span class="text-sm text-gray-500">{{ authStore.user.role }}</span>
              </div>
            </div>
            <button
              @click="handleLogout"
              class="flex items-center justify-center space-x-2 w-full px-4 py-3 rounded-xl text-sm font-medium bg-red-50 text-red-600 hover:bg-red-100 transition"
            >
              <LogOut class="h-4 w-4" />
              <span>Keluar</span>
            </button>
          </div>
        </template>

        <template v-else>
          <button
            @click="navigateTo('/login')"
            class="block w-full text-left px-4 py-3 rounded-xl text-base font-medium text-gray-700 hover:bg-gray-100 transition"
          >
            Masuk
          </button>
          <button
            @click="navigateTo('/register')"
            class="block w-full text-left px-4 py-3 rounded-xl text-base font-medium bg-gray-900 text-white hover:bg-gray-800 transition"
          >
            Daftar
          </button>
        </template>
      </div>
    </div>
  </nav>
</template>