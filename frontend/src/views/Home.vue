<script setup lang="ts">
import { ref, onMounted, computed } from 'vue';
import { useRouter } from 'vue-router';
import { Search, BookOpen, Sparkles, SlidersHorizontal } from 'lucide-vue-next';
import { booksAPI, type Book } from '../services/api';
import { useAuthStore } from '../stores/auth';

const router = useRouter();
const authStore = useAuthStore();
const books = ref<Book[]>([]);
const searchQuery = ref('');
const loading = ref(true);
const error = ref('');

const filteredBooks = computed(() => {
  if (!searchQuery.value) return books.value;

  const query = searchQuery.value.toLowerCase();
  return books.value.filter(
    (book) =>
      book.title.toLowerCase().includes(query) ||
      book.author.toLowerCase().includes(query) ||
      book.genre_name.toLowerCase().includes(query)
  );
});

const fetchBooks = async () => {
  try {
    loading.value = true;
    const response = await booksAPI.getAll();
    books.value = response.data.books;
  } catch (err: any) {
    error.value = err.response?.data?.error || 'Failed to fetch books';
  } finally {
    loading.value = false;
  }
};

const getGenreBadgeClass = (genre: string): string => {
  const lowerGenre = genre.toLowerCase();
  if (lowerGenre.includes('fantasy')) return 'badge-fantasy';
  if (lowerGenre.includes('fiction')) return 'badge-fiction';
  if (lowerGenre.includes('magic')) return 'badge-magic';
  if (lowerGenre.includes('adventure')) return 'badge-adventure';
  if (lowerGenre.includes('childrens') || lowerGenre.includes('children')) return 'badge-childrens';
  if (lowerGenre.includes('mythology')) return 'badge-mythology';
  if (lowerGenre.includes('dragon')) return 'badge-dragons';
  return 'badge-default';
};

const getBookCover = (book: Book): string => {
  if (book.cover_img) {
    return `http://localhost:3000/uploads/covers/${book.cover_img}`;
  }
  return `https://via.placeholder.com/400x600/f8fafc/475569?text=${encodeURIComponent(book.title.substring(0, 20))}`;
};

const viewBookDetail = (id: number) => {
  router.push(`/books/${id}`);
};

onMounted(() => {
  fetchBooks();
});
</script>

<template>
  <div class="min-h-screen bg-gray-50">
    <!-- Hero Section -->
    <div class="bg-gradient-to-b from-white via-gray-50/50 to-gray-50 border-b border-gray-200/50">
      <div class="max-w-[1400px] mx-auto px-6 lg:px-8 pt-16 pb-12">
        <!-- Title Section -->
        <div class="text-center mb-12 space-y-4">
          <div class="flex items-center justify-center space-x-3 mb-6">
            <div class="relative">
              <div
                class="absolute inset-0 bg-gradient-to-r from-amber-400 to-yellow-400 rounded-full blur-lg opacity-30 animate-pulse">
              </div>
              <Sparkles class="h-8 w-8 text-amber-500 relative z-10" />
            </div>
            <h1 class="text-5xl lg:text-6xl font-bold text-gray-900 tracking-tight">
              Perpustakaan Digital
            </h1>
          </div>
          <p class="text-lg text-gray-600 max-w-2xl mx-auto leading-relaxed">
            Jelajahi koleksi buku pilihan dan temukan bacaan favoritmu dengan rekomendasi yang dipersonalisasi
          </p>
        </div>

        <!-- Search Bar -->
        <div class="max-w-3xl mx-auto">
          <div class="relative group">
            <div
              class="absolute inset-0 bg-gradient-to-r from-gray-900 to-gray-700 rounded-2xl blur-xl opacity-0 group-hover:opacity-10 transition-opacity duration-500">
            </div>
            <div
              class="relative flex items-center bg-white rounded-2xl border border-gray-200 shadow-lg shadow-gray-200/50 focus-within:border-gray-400 focus-within:shadow-xl transition-all duration-300">
              <Search class="absolute left-6 h-5 w-5 text-gray-400" />
              <input v-model="searchQuery" type="text" placeholder="Cari buku berdasarkan judul, penulis, atau genre..."
                class="w-full pl-14 pr-6 py-5 text-base bg-transparent rounded-2xl outline-none text-gray-900 placeholder:text-gray-400" />
              <button class="mr-3 p-2.5 rounded-xl hover:bg-gray-100 transition-colors">
                <SlidersHorizontal class="h-5 w-5 text-gray-500" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Books Catalog -->
    <div class="max-w-[1400px] mx-auto px-6 lg:px-8 py-12">
      <!-- Loading State -->
      <div v-if="loading" class="flex flex-col justify-center items-center py-32">
        <div class="relative">
          <div class="animate-spin rounded-full h-16 w-16 border-4 border-gray-200"></div>
          <div class="animate-spin rounded-full h-16 w-16 border-t-4 border-gray-900 absolute inset-0"></div>
        </div>
        <p class="mt-6 text-gray-500 font-medium">Memuat koleksi buku...</p>
      </div>

      <!-- Error State -->
      <div v-else-if="error" class="text-center py-32">
        <div class="inline-flex items-center justify-center w-20 h-20 rounded-full bg-red-50 mb-6">
          <BookOpen class="h-10 w-10 text-red-500" />
        </div>
        <h3 class="text-xl font-semibold text-gray-900 mb-2">Terjadi Kesalahan</h3>
        <p class="text-gray-600 mb-6">{{ error }}</p>
        <button @click="fetchBooks"
          class="px-6 py-3 bg-gray-900 text-white rounded-xl hover:bg-gray-800 transition-colors font-medium shadow-lg">
          Coba Lagi
        </button>
      </div>

      <!-- Empty State -->
      <div v-else-if="filteredBooks.length === 0" class="text-center py-32">
        <div class="inline-flex items-center justify-center w-20 h-20 rounded-full bg-gray-100 mb-6">
          <BookOpen class="h-10 w-10 text-gray-400" />
        </div>
        <h3 class="text-2xl font-semibold text-gray-900 mb-3">Tidak ada buku ditemukan</h3>
        <p class="text-gray-600 mb-6">Coba gunakan kata kunci pencarian yang berbeda</p>
        <button @click="searchQuery = ''"
          class="px-6 py-3 bg-gray-900 text-white rounded-xl hover:bg-gray-800 transition-colors font-medium">
          Reset Pencarian
        </button>
      </div>

      <!-- Books Grid -->
      <div v-else class="space-y-8">
        <!-- Header -->
        <div class="flex items-center justify-between">
          <div>
            <h2 class="text-2xl font-bold text-gray-900 mb-1">
              {{ searchQuery ? 'Hasil Pencarian' : 'Semua Koleksi' }}
            </h2>
            <p class="text-gray-600">
              Menampilkan <span class="font-semibold text-gray-900">{{ filteredBooks.length }}</span> buku
            </p>
          </div>
        </div>

        <!-- Books Grid - 6 columns on large screens -->
        <div class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-5">
          <div v-for="book in filteredBooks" :key="book.id" @click="viewBookDetail(book.id)"
            class="book-card cursor-pointer">
            <!-- Book Cover -->
            <div class="book-cover">
              <img :src="getBookCover(book)" :alt="book.title" loading="lazy" />
              <!-- Overlay on hover -->
              <div
                class="absolute inset-0 bg-gradient-to-t from-black/60 via-black/0 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300">
              </div>
            </div>

            <!-- Book Info -->
            <div class="p-4 space-y-3">
              <div>
                <h3
                  class="font-semibold text-gray-900 text-sm leading-snug line-clamp-2 group-hover:text-gray-700 transition-colors mb-1">
                  {{ book.title }}
                </h3>
                <p class="text-xs text-gray-500 line-clamp-1">{{ book.author }}</p>
              </div>

              <!-- Genre Badges -->
              <div class="flex flex-wrap gap-1.5">
                <span v-for="genre in (book.genre_name ? book.genre_name.split(',').slice(0, 2) : [])" :key="genre"
                  :class="['badge-genre text-[10px]', getGenreBadgeClass(genre.trim())]">
                  {{ genre.trim() }}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.line-clamp-1 {
  display: -webkit-box;
  -webkit-line-clamp: 1;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.line-clamp-2 {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
</style>