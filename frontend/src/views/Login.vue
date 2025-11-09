<script setup lang="ts">
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { BookOpen, LogIn, Eye, EyeOff } from 'lucide-vue-next';
import { authAPI } from '../services/api';
import { useAuthStore } from '../stores/auth';

const router = useRouter();
const authStore = useAuthStore();

const username = ref('');
const password = ref('');
const showPassword = ref(false);
const loading = ref(false);
const error = ref('');

const handleLogin = async () => {
  if (!username.value || !password.value) {
    error.value = 'Username dan password harus diisi';
    return;
  }

  try {
    loading.value = true;
    error.value = '';
    
    const response = await authAPI.login(username.value, password.value);
    
    localStorage.setItem('token', response.data.token);
    localStorage.setItem('user', JSON.stringify(response.data.user));
    
    // Update auth store and wait for it to complete
    authStore.setUser(response.data.user);
    
    // Wait for auth store to update
    await new Promise(resolve => setTimeout(resolve, 100));
    
    if (response.data.user.role === 'pustakawan') {
      await router.push('/dashboard');
    } else {
      await router.push('/');
    }
  } catch (err: any) {
    error.value = err.response?.data?.error || 'Login gagal. Silakan coba lagi.';
  } finally {
    loading.value = false;
  }
};
</script>

<template>
  <div class="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50 flex items-center justify-center px-4 py-12">
    <div class="max-w-md w-full">
      <!-- Logo & Title -->
      <div class="text-center mb-10">
        <div class="inline-flex items-center justify-center mb-6">
          <div class="relative">
            <div class="absolute inset-0 bg-gradient-to-br from-gray-900 to-gray-700 rounded-2xl blur-xl opacity-20"></div>
            <div class="relative p-4 bg-gradient-to-br from-gray-900 to-gray-700 rounded-2xl">
              <BookOpen class="h-8 w-8 text-white" />
            </div>
          </div>
        </div>
        <h1 class="text-3xl font-bold text-gray-900 mb-2">Selamat Datang Kembali</h1>
        <p class="text-gray-600">Masuk ke perpustakaan digital Anda</p>
      </div>

      <!-- Login Card -->
      <div class="bg-white rounded-3xl border border-gray-200 shadow-xl shadow-gray-200/50 p-8">
        <form @submit.prevent="handleLogin" class="space-y-6">
          <!-- Error Message -->
          <div v-if="error" class="bg-red-50 border border-red-200 rounded-2xl p-4">
            <p class="text-sm text-red-800 font-medium">{{ error }}</p>
          </div>

          <!-- Username -->
          <div>
            <label for="username" class="block text-sm font-semibold text-gray-900 mb-2">
              Username
            </label>
            <input
              id="username"
              v-model="username"
              type="text"
              placeholder="Masukkan username"
              class="w-full px-4 py-3.5 rounded-xl border border-gray-300 focus:border-gray-900 focus:ring-2 focus:ring-gray-900/10 outline-none transition-all text-gray-900 placeholder:text-gray-400"
              :disabled="loading"
            />
          </div>

          <!-- Password -->
          <div>
            <label for="password" class="block text-sm font-semibold text-gray-900 mb-2">
              Password
            </label>
            <div class="relative">
              <input
                id="password"
                v-model="password"
                :type="showPassword ? 'text' : 'password'"
                placeholder="Masukkan password"
                class="w-full px-4 py-3.5 pr-12 rounded-xl border border-gray-300 focus:border-gray-900 focus:ring-2 focus:ring-gray-900/10 outline-none transition-all text-gray-900 placeholder:text-gray-400"
                :disabled="loading"
              />
              <button
                type="button"
                @click="showPassword = !showPassword"
                class="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                :disabled="loading"
              >
                <Eye v-if="!showPassword" class="h-5 w-5" />
                <EyeOff v-else class="h-5 w-5" />
              </button>
            </div>
          </div>

          <!-- Submit Button -->
          <button
            type="submit"
            :disabled="loading"
            class="w-full bg-gradient-to-r from-gray-900 to-gray-700 text-white py-4 rounded-xl font-semibold hover:shadow-lg hover:shadow-gray-900/30 transition-all duration-300 flex items-center justify-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <LogIn v-if="!loading" class="h-5 w-5" />
            <div v-else class="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent"></div>
            <span>{{ loading ? 'Memproses...' : 'Masuk' }}</span>
          </button>
        </form>

        <!-- Register Link -->
        <div class="mt-8 text-center">
          <p class="text-sm text-gray-600">
            Belum punya akun?
            <router-link to="/register" class="ml-1 font-semibold text-gray-900 hover:underline">
              Daftar sekarang
            </router-link>
          </p>
        </div>

        <!-- Demo Accounts -->
        <div class="mt-8 pt-8 border-t border-gray-200">
          <p class="text-xs font-semibold text-gray-500 text-center mb-4">AKUN DEMO</p>
          <div class="grid grid-cols-2 gap-3">
            <div class="bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl p-4 border border-gray-200">
              <p class="font-semibold text-gray-900 text-sm mb-2">👨‍🎓 Siswa</p>
              <p class="text-xs text-gray-600 font-mono">siswa1</p>
              <p class="text-xs text-gray-600 font-mono">password123</p>
            </div>
            <div class="bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl p-4 border border-gray-200">
              <p class="font-semibold text-gray-900 text-sm mb-2">📚 Pustakawan</p>
              <p class="text-xs text-gray-600 font-mono">pustakawan1</p>
              <p class="text-xs text-gray-600 font-mono">password123</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>