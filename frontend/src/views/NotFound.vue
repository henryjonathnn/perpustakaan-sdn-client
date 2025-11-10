<script setup lang="ts">
import { useRouter } from 'vue-router';
import { BookOpen, Home, ArrowLeft } from 'lucide-vue-next';

const router = useRouter();

const goHome = () => {
  router.push('/');
};

const goBack = () => {
  router.go(-1);
};
</script>

<template>
  <div class="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50 flex items-center justify-center px-4">
    <div class="max-w-md w-full text-center">
      <!-- Icon -->
      <div class="inline-flex items-center justify-center mb-8">
        <div class="relative">
          <div class="absolute inset-0 bg-gray-900/10 rounded-3xl blur-2xl"></div>
          <div class="relative p-8 bg-white rounded-3xl border border-gray-200 shadow-xl">
            <BookOpen class="h-20 w-20 text-gray-400" />
          </div>
        </div>
      </div>

      <!-- 404 Text -->
      <h1 class="text-9xl font-bold text-gray-900 mb-4">404</h1>
      <h2 class="text-2xl font-bold text-gray-900 mb-3">Halaman Tidak Ditemukan</h2>
      <p class="text-gray-600 mb-8">
        Maaf, halaman yang Anda cari tidak dapat ditemukan. Mungkin telah dipindahkan atau dihapus.
      </p>

      <!-- Actions -->
      <div class="flex flex-col sm:flex-row gap-3 justify-center">
        <button
          @click="goBack"
          class="flex items-center justify-center gap-2 px-6 py-3 rounded-xl border border-gray-300 text-gray-700 font-medium hover:bg-gray-50 transition-all"
        >
          <ArrowLeft class="h-5 w-5" />
          Kembali
        </button>
        <button
          @click="goHome"
          class="flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-gray-900 to-gray-700 text-white font-semibold hover:shadow-lg hover:shadow-gray-900/30 transition-all"
        >
          <Home class="h-5 w-5" />
          Ke Beranda
        </button>
      </div>
    </div>
  </div>
</template>