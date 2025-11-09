<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { Book, Search, Loader } from 'lucide-vue-next'
import BookCard from '../components/BookCard.vue'
import { bookService, type Book as BookType } from '../services/api'

const books = ref<BookType[]>([])
const searchQuery = ref('')
const loading = ref(false)
const error = ref('')

const searchBooks = async () => {
  try {
    loading.value = true
    error.value = ''
    if (searchQuery.value) {
      books.value = await bookService.searchBooks(searchQuery.value)
    } else {
      books.value = await bookService.getBooks()
    }
  } catch (err) {
    error.value = 'Gagal memuat data buku'
    console.error('Error fetching books:', err)
  } finally {
    loading.value = false
  }
}

onMounted(async () => {
  await searchBooks()
})
</script>

<template>
  <div class="flex flex-col items-center justify-center space-y-8 px-4 py-8">
    <div class="text-center space-y-4">
      <Book class="mx-auto h-16 w-16" />
      <h1 class="text-4xl font-bold tracking-tighter">
        Selamat Datang di Perpustakaan SDN
      </h1>
      <p class="text-lg text-muted-foreground">
        Temukan dan jelajahi koleksi buku kami yang lengkap
      </p>
    </div>
    
    <!-- Search Bar -->
    <div class="w-full max-w-2xl">
      <div class="relative">
        <Search class="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <input
          v-model="searchQuery"
          type="text"
          placeholder="Cari buku berdasarkan judul, penulis, atau genre..."
          class="w-full rounded-lg border border-input bg-background py-2 pl-10 pr-4 text-sm"
          @input="searchBooks"
        />
      </div>
    </div>

    <!-- Quick Links -->
    <div class="grid grid-cols-1 md:grid-cols-3 gap-6 w-full max-w-4xl">
      <div class="group relative overflow-hidden rounded-lg border bg-white p-6 shadow-md transition-all hover:shadow-lg">
        <div class="flex items-center gap-4">
          <div class="rounded-full bg-primary/10 p-3">
            <Book class="h-6 w-6" />
          </div>
          <div>
            <h3 class="font-semibold">Koleksi Buku</h3>
            <p class="text-sm text-muted-foreground">
              Jelajahi berbagai macam buku
            </p>
          </div>
        </div>
      </div>

      <div class="group relative overflow-hidden rounded-lg border bg-white p-6 shadow-md transition-all hover:shadow-lg">
        <div class="flex items-center gap-4">
          <div class="rounded-full bg-primary/10 p-3">
            <Book class="h-6 w-6" />
          </div>
          <div>
            <h3 class="font-semibold">Rekomendasi</h3>
            <p class="text-sm text-muted-foreground">
              Dapatkan rekomendasi buku
            </p>
          </div>
        </div>
      </div>

      <div class="group relative overflow-hidden rounded-lg border bg-white p-6 shadow-md transition-all hover:shadow-lg">
        <div class="flex items-center gap-4">
          <div class="rounded-full bg-primary/10 p-3">
            <Book class="h-6 w-6" />
          </div>
          <div>
            <h3 class="font-semibold">Peminjaman</h3>
            <p class="text-sm text-muted-foreground">
              Pinjam buku dengan mudah
            </p>
          </div>
        </div>
      </div>
    </div>

    <!-- Books List -->
    <div class="w-full max-w-7xl">
      <!-- Loading & Error States -->
      <div v-if="loading" class="flex items-center justify-center py-12">
        <Loader class="h-8 w-8 animate-spin" />
      </div>
      
      <div v-else-if="error" class="text-center py-12 text-destructive">
        {{ error }}
      </div>
      
      <!-- Books Grid -->
      <div v-else class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        <template v-if="books.length > 0">
          <BookCard
            v-for="book in books"
            :key="book.id"
            v-bind="book"
          />
        </template>
        <div v-else class="col-span-full text-center py-12 text-muted-foreground">
          Tidak ada buku yang ditemukan
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.animate-spin {
  animation: spin 1s linear infinite;
}

@keyframes spin {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}
</style>