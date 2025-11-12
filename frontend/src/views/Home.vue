<script setup lang="ts">
import { ref, onMounted, watch, computed } from 'vue';
import { useRouter } from 'vue-router';
import debounce from 'lodash.debounce';
import { Search, BookOpen, Sparkles, Loader2, Filter, X } from 'lucide-vue-next';
import { booksAPI, genresAPI, createSlug, type Book, type Genre } from '../services/api';

const router = useRouter();
const allBooks = ref<Book[]>([]);
const displayedBooks = ref<Book[]>([]);
const genres = ref<Genre[]>([]);
const searchQuery = ref('');
const selectedGenres = ref<number[]>([]);
const showGenreFilter = ref(false);
const loading = ref(true);
const searching = ref(false);
const error = ref('');

const fetchData = async () => {
  try {
    loading.value = true;
    error.value = '';
    
    const [booksResponse, genresResponse] = await Promise.all([
      booksAPI.getAll(),
      genresAPI.getAll()
    ]);
    
    allBooks.value = booksResponse.data.books;
    displayedBooks.value = booksResponse.data.books;
    genres.value = genresResponse.data.data;
  } catch (err: any) {
    error.value = err.response?.data?.error || 'Gagal memuat buku';
    console.error('Fetch data error:', err);
  } finally {
    loading.value = false;
  }
};

// Filter buku berdasarkan genre yang dipilih
const filterByGenres = () => {
  if (selectedGenres.value.length === 0) {
    displayedBooks.value = allBooks.value;
  } else {
    displayedBooks.value = allBooks.value.filter(book => 
      selectedGenres.value.includes(book.genre_id)
    );
  }
};

// Toggle genre selection
const toggleGenre = (genreId: number) => {
  const index = selectedGenres.value.indexOf(genreId);
  if (index > -1) {
    selectedGenres.value.splice(index, 1);
  } else {
    selectedGenres.value.push(genreId);
  }
  filterByGenres();
};

// Clear all genre filters
const clearGenreFilters = () => {
  selectedGenres.value = [];
  filterByGenres();
};

// Search dengan API
const performSearch = async (query: string) => {
  try {
    searching.value = true;
    const response = await booksAPI.search(query);
    displayedBooks.value = response.data.books;
  } catch (err: any) {
    console.error('Search error:', err);
    displayedBooks.value = [];
  } finally {
    searching.value = false;
  }
};

// Debounced search
const debouncedSearch = debounce((query: string) => {
  if (!query.trim()) {
    displayedBooks.value = allBooks.value;
    filterByGenres(); // Apply genre filter jika ada
    searching.value = false;
    return;
  }
  performSearch(query);
}, 500);

// Watch search query
watch(searchQuery, (newQuery) => {
  if (newQuery.trim()) {
    searching.value = true;
  }
  debouncedSearch(newQuery);
});

const getGenreBadgeClass = (genre: string): string => {
  const lowerGenre = genre.toLowerCase();
  if (lowerGenre.includes('fantasy')) return 'badge-fantasy';
  if (lowerGenre.includes('fiction') || lowerGenre.includes('fiksi')) return 'badge-fiction';
  if (lowerGenre.includes('magic')) return 'badge-magic';
  if (lowerGenre.includes('adventure')) return 'badge-adventure';
  if (lowerGenre.includes('childrens') || lowerGenre.includes('children') || lowerGenre.includes('anak')) return 'badge-childrens';
  if (lowerGenre.includes('mythology')) return 'badge-mythology';
  if (lowerGenre.includes('dragon')) return 'badge-dragons';
  if (lowerGenre.includes('matematika')) return 'bg-blue-50 text-blue-700 border border-blue-200/50 hover:bg-blue-100/80';
  if (lowerGenre.includes('ipa') || lowerGenre.includes('sains')) return 'bg-green-50 text-green-700 border border-green-200/50 hover:bg-green-100/80';
  if (lowerGenre.includes('ips')) return 'bg-orange-50 text-orange-700 border border-orange-200/50 hover:bg-orange-100/80';
  if (lowerGenre.includes('bahasa')) return 'bg-purple-50 text-purple-700 border border-purple-200/50 hover:bg-purple-100/80';
  if (lowerGenre.includes('agama')) return 'bg-teal-50 text-teal-700 border border-teal-200/50 hover:bg-teal-100/80';
  return 'badge-default';
};

const getBookCover = (book: Book): string => {
  if (book.cover_img) {
    return `http://localhost:3000/uploads/${book.cover_img}`;
  }
  return `https://via.placeholder.com/400x600/f8fafc/475569?text=${encodeURIComponent(book.title.substring(0, 20))}`;
};

const viewBookDetail = (book: Book) => {
  const slug = createSlug(book.title);
  router.push(`/books/${slug}`);
};

const clearSearch = () => {
  searchQuery.value = '';
  debouncedSearch.cancel();
  searching.value = false;
};

onMounted(() => {
  fetchData();
});
</script>

<template>
  <div class="min-h-screen bg-gray-50">
    <!-- Hero Section with Banner -->
    <div class="relative bg-gradient-to-b from-white via-gray-50/50 to-gray-50 border-b border-gray-200/50">
      <!-- Banner Background (Placeholder) -->
      <div class="absolute inset-0 overflow-hidden">
        <div class="absolute inset-0 bg-gradient-to-br from-gray-900/5 via-transparent to-gray-900/5"></div>
        <!-- Placeholder for school banner image -->
        <img 
          src="/banners/banner.png" 
          alt="Perpustakaan Cemerlang" 
          class="w-full h-full object-cover opacity-10"
          @error="(e) => (e.target as HTMLImageElement).style.display = 'none'"
        />
      </div>

      <div class="relative max-w-[1400px] mx-auto px-6 lg:px-8 pt-16 pb-12">
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
              Perpustakaan Cemerlang
            </h1>
          </div>
          <p class="text-lg text-gray-600 max-w-2xl mx-auto leading-relaxed">
            Jelajahi koleksi buku pilihan dan temukan bacaan favoritmu dengan rekomendasi yang dipersonalisasi
          </p>
        </div>

        <!-- Search Bar & Genre Filter -->
        <div class="max-w-3xl mx-auto space-y-4">
          <!-- Search Bar -->
          <div class="relative group">
            <div
              class="absolute inset-0 bg-gradient-to-r from-gray-900 to-gray-700 rounded-2xl blur-xl opacity-0 group-hover:opacity-10 transition-opacity duration-500">
            </div>
            <div
              class="relative flex items-center bg-white rounded-2xl border border-gray-200 shadow-lg shadow-gray-200/50 focus-within:border-gray-400 focus-within:shadow-xl transition-all duration-300">
              <Search class="absolute left-6 h-5 w-5 text-gray-400" />
              <input 
                v-model="searchQuery" 
                type="text" 
                placeholder="Cari buku berdasarkan judul, penulis, atau sinopsis..."
                class="w-full pl-14 pr-14 py-5 text-base bg-transparent rounded-2xl outline-none text-gray-900 placeholder:text-gray-400" 
              />
              <Loader2 v-if="searching" class="absolute right-14 h-5 w-5 text-gray-400 animate-spin" />
              <button 
                v-if="searchQuery"
                @click="clearSearch"
                class="absolute right-6 p-1 rounded-lg hover:bg-gray-100 transition-colors"
              >
                <X class="h-5 w-5 text-gray-400" />
              </button>
            </div>
          </div>

          <!-- Genre Filter Button & Dropdown -->
          <div class="relative">
            <button
              @click="showGenreFilter = !showGenreFilter"
              class="flex items-center space-x-2 px-5 py-3 bg-white rounded-xl border border-gray-200 hover:border-gray-300 transition-colors shadow-sm"
            >
              <Filter class="h-5 w-5 text-gray-600" />
              <span class="text-sm font-medium text-gray-700">
                Filter Genre
                <span v-if="selectedGenres.length > 0" class="ml-1 text-amber-600">({{ selectedGenres.length }})</span>
              </span>
            </button>

            <!-- Genre Dropdown -->
            <div v-if="showGenreFilter" class="absolute z-10 mt-2 w-full bg-white rounded-xl border border-gray-200 shadow-xl p-4 max-h-80 overflow-y-auto">
              <div class="flex items-center justify-between mb-4">
                <h3 class="font-semibold text-gray-900">Pilih Genre</h3>
                <button 
                  v-if="selectedGenres.length > 0"
                  @click="clearGenreFilters"
                  class="text-sm text-amber-600 hover:text-amber-700 font-medium"
                >
                  Reset
                </button>
              </div>
              
              <div class="grid grid-cols-2 gap-2">
                <button
                  v-for="genre in genres"
                  :key="genre.id"
                  @click="toggleGenre(genre.id)"
                  :class="[
                    'text-left px-4 py-2.5 rounded-lg text-sm font-medium transition-all',
                    selectedGenres.includes(genre.id)
                      ? 'bg-amber-100 text-amber-900 border-2 border-amber-400'
                      : 'bg-gray-50 text-gray-700 border border-gray-200 hover:bg-gray-100'
                  ]"
                >
                  {{ genre.name }}
                </button>
              </div>
            </div>
          </div>

          <!-- Active Genre Filters -->
          <div v-if="selectedGenres.length > 0" class="flex flex-wrap gap-2">
            <button
              v-for="genreId in selectedGenres"
              :key="genreId"
              @click="toggleGenre(genreId)"
              class="inline-flex items-center space-x-2 px-3 py-1.5 bg-amber-100 text-amber-900 rounded-lg text-sm font-medium hover:bg-amber-200 transition-colors"
            >
              <span>{{ genres.find(g => g.id === genreId)?.name }}</span>
              <X class="h-3.5 w-3.5" />
            </button>
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
        <button @click="fetchData"
          class="px-6 py-3 bg-gray-900 text-white rounded-xl hover:bg-gray-800 transition-colors font-medium shadow-lg">
          Coba Lagi
        </button>
      </div>

      <!-- Empty State -->
      <div v-else-if="displayedBooks.length === 0" class="text-center py-32">
        <div class="inline-flex items-center justify-center w-20 h-20 rounded-full bg-gray-100 mb-6">
          <BookOpen class="h-10 w-10 text-gray-400" />
        </div>
        <h3 class="text-2xl font-semibold text-gray-900 mb-3">Tidak ada buku ditemukan</h3>
        <p class="text-gray-600 mb-6">
          {{ searchQuery ? 'Coba gunakan kata kunci pencarian yang berbeda' : 'Belum ada buku tersedia' }}
        </p>
        <button v-if="searchQuery || selectedGenres.length > 0" @click="() => { clearSearch(); clearGenreFilters(); }"
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
              {{ searchQuery ? 'Hasil Pencarian' : selectedGenres.length > 0 ? 'Filter Genre' : 'Semua Koleksi' }}
            </h2>
            <p class="text-gray-600">
              Menampilkan <span class="font-semibold text-gray-900">{{ displayedBooks.length }}</span> buku
              <span v-if="searching" class="text-gray-400">(mencari...)</span>
            </p>
          </div>
        </div>

        <!-- Books Grid -->
        <div class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-5">
          <div v-for="book in displayedBooks" :key="book.id" @click="viewBookDetail(book)"
            class="book-card cursor-pointer group">
            <!-- Book Cover -->
            <div class="book-cover">
              <img :src="getBookCover(book)" :alt="book.title" loading="lazy" />
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

              <!-- Genre Badge -->
              <div class="flex flex-wrap gap-1.5">
                <span 
                  :class="['badge-genre text-[10px]', getGenreBadgeClass(book.genre_name)]">
                  {{ book.genre_name }}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Footer -->
    <footer class="bg-white border-t border-gray-200 mt-20">
      <div class="max-w-[1400px] mx-auto px-6 lg:px-8 py-12">
        <div class="grid grid-cols-1 md:grid-cols-3 gap-8">
          <!-- About -->
          <div>
            <div class="flex items-center space-x-3 mb-4">
              <div class="p-2 bg-gradient-to-br from-gray-900 to-gray-700 rounded-xl">
                <BookOpen class="h-5 w-5 text-white" />
              </div>
              <span class="font-bold text-xl text-gray-900">Perpustakaan Cemerlang</span>
            </div>
            <p class="text-gray-600 text-sm leading-relaxed">
              Platform perpustakaan digital untuk siswa SD dengan sistem rekomendasi buku yang cerdas dan personal.
            </p>
          </div>

          <!-- Quick Links -->
          <div>
            <h3 class="font-semibold text-gray-900 mb-4">Link Cepat</h3>
            <ul class="space-y-2 text-sm">
              <li><a href="/" class="text-gray-600 hover:text-gray-900 transition-colors">Katalog Buku</a></li>
              <li><a href="/login" class="text-gray-600 hover:text-gray-900 transition-colors">Login</a></li>
              <li><a href="/register" class="text-gray-600 hover:text-gray-900 transition-colors">Daftar</a></li>
            </ul>
          </div>

          <!-- Contact Info -->
          <div>
            <h3 class="font-semibold text-gray-900 mb-4">Kontak</h3>
            <ul class="space-y-2 text-sm text-gray-600">
              <li>Email: perpustakaan@cemerlang.sch.id</li>
              <li>Telp: (021) 1234-5678</li>
              <li>Alamat: Jl. Pendidikan No. 123, Jakarta</li>
            </ul>
          </div>
        </div>

        <div class="border-t border-gray-200 mt-8 pt-8 text-center text-sm text-gray-600">
          <p>&copy; {{ new Date().getFullYear() }} Perpustakaan Cemerlang. All rights reserved.</p>
        </div>
      </div>
    </footer>
  </div>
</template>

<style scoped>
.line-clamp-1 {
  display: -webkit-box;
  -webkit-line-clamp: 1;
  line-clamp: 1;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.line-clamp-2 {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
</style>