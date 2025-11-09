<script setup lang="ts">
import { ref, onMounted, onBeforeMount } from 'vue';
import { Plus, Edit, Trash2, BookOpen, Search, X, BookIcon } from 'lucide-vue-next';
import { booksAPI, type Book } from '../services/api';
import { useAuthStore } from '../stores/auth';
import { useRouter } from 'vue-router';

const router = useRouter();
const authStore = useAuthStore();
const books = ref<Book[]>([]);
const loading = ref(true);
const searchQuery = ref('');
const showModal = ref(false);
const modalMode = ref<'create' | 'edit'>('create');
const selectedBook = ref<Book | null>(null);

const formData = ref({
  title: '',
  author: '',
  genre: '',
  description: '',
});

const filteredBooks = ref<Book[]>([]);

const fetchBooks = async () => {
  try {
    loading.value = true;
    const response = await booksAPI.getAll();
    books.value = response.data.books;
    filteredBooks.value = books.value;
  } catch (error) {
    console.error('Failed to fetch books:', error);
  } finally {
    loading.value = false;
  }
};

const searchBooks = () => {
  if (!searchQuery.value) {
    filteredBooks.value = books.value;
    return;
  }
  
  const query = searchQuery.value.toLowerCase();
  filteredBooks.value = books.value.filter(
    (book) =>
      book.title.toLowerCase().includes(query) ||
      book.author.toLowerCase().includes(query) ||
      book.genre.toLowerCase().includes(query)
  );
};

const openCreateModal = () => {
  modalMode.value = 'create';
  formData.value = {
    title: '',
    author: '',
    genre: '',
    description: '',
  };
  showModal.value = true;
};

const openEditModal = (book: Book) => {
  modalMode.value = 'edit';
  selectedBook.value = book;
  formData.value = {
    title: book.title,
    author: book.author,
    genre: book.genre,
    description: book.description,
  };
  showModal.value = true;
};

const closeModal = () => {
  showModal.value = false;
  selectedBook.value = null;
};

const handleSubmit = async () => {
  try {
    if (modalMode.value === 'create') {
      await booksAPI.create(formData.value);
    } else if (selectedBook.value) {
      await booksAPI.update(selectedBook.value.id, formData.value);
    }
    
    await fetchBooks();
    closeModal();
  } catch (error: any) {
    alert(error.response?.data?.error || 'Failed to save book');
  }
};

const handleDelete = async (book: Book) => {
  if (!confirm(`Apakah Anda yakin ingin menghapus buku "${book.title}"?`)) {
    return;
  }
  
  try {
    await booksAPI.delete(book.id);
    await fetchBooks();
  } catch (error: any) {
    alert(error.response?.data?.error || 'Failed to delete book');
  }
};

const getBookCover = (book: Book): string => {
  if (book.cover_img) {
    return `http://localhost:3000/uploads/covers/${book.cover_img}`;
  }
  return `https://via.placeholder.com/200x300/f8fafc/475569?text=${encodeURIComponent(book.title.substring(0, 15))}`;
};

onBeforeMount(() => {
  // Check if user is authenticated and is a pustakawan
  if (!authStore.user || authStore.user.role !== 'pustakawan') {
    router.push('/login');
    return;
  }
});

onMounted(() => {
  fetchBooks();
});
</script>

<template>
  <div class="min-h-screen bg-gray-50">
    <div class="max-w-[1400px] mx-auto px-6 lg:px-8 py-10">
      <!-- Header -->
      <div class="mb-10">
        <div class="flex items-center space-x-3 mb-3">
          <div class="p-3 bg-gradient-to-br from-gray-900 to-gray-700 rounded-2xl">
            <BookIcon class="h-6 w-6 text-white" />
          </div>
          <div>
            <h1 class="text-4xl font-bold text-gray-900">Dashboard Pustakawan</h1>
            <p class="text-gray-600 mt-1">Kelola koleksi buku perpustakaan</p>
          </div>
        </div>
      </div>

      <!-- Stats Cards -->
      <div class="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div class="bg-gradient-to-br from-blue-50 to-blue-100/50 rounded-2xl p-6 border border-blue-200">
          <div class="flex items-center justify-between">
            <div>
              <p class="text-sm font-medium text-blue-700 mb-1">Total Buku</p>
              <p class="text-3xl font-bold text-blue-900">{{ books.length }}</p>
            </div>
            <div class="p-3 bg-blue-500 rounded-xl">
              <BookOpen class="h-6 w-6 text-white" />
            </div>
          </div>
        </div>
        
        <div class="bg-gradient-to-br from-emerald-50 to-emerald-100/50 rounded-2xl p-6 border border-emerald-200">
          <div class="flex items-center justify-between">
            <div>
              <p class="text-sm font-medium text-emerald-700 mb-1">Hasil Pencarian</p>
              <p class="text-3xl font-bold text-emerald-900">{{ filteredBooks.length }}</p>
            </div>
            <div class="p-3 bg-emerald-500 rounded-xl">
              <Search class="h-6 w-6 text-white" />
            </div>
          </div>
        </div>
        
        <div class="bg-gradient-to-br from-purple-50 to-purple-100/50 rounded-2xl p-6 border border-purple-200">
          <div class="flex items-center justify-between">
            <div>
              <p class="text-sm font-medium text-purple-700 mb-1">Kategori</p>
              <p class="text-3xl font-bold text-purple-900">{{ new Set(books.flatMap(b => b.genre.split(','))).size }}</p>
            </div>
            <div class="p-3 bg-purple-500 rounded-xl">
              <BookIcon class="h-6 w-6 text-white" />
            </div>
          </div>
        </div>
      </div>

      <!-- Actions Bar -->
      <div class="bg-white rounded-2xl border border-gray-200 shadow-sm p-5 mb-6">
        <div class="flex flex-col sm:flex-row gap-4 items-center justify-between">
          <!-- Search -->
          <div class="relative flex-1 w-full sm:max-w-md">
            <Search class="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              v-model="searchQuery"
              @input="searchBooks"
              type="text"
              placeholder="Cari buku..."
              class="w-full pl-12 pr-4 py-3 rounded-xl border border-gray-300 focus:border-gray-900 focus:ring-2 focus:ring-gray-900/10 outline-none transition-all text-gray-900 placeholder:text-gray-400"
            />
          </div>

          <!-- Add Button -->
          <button
            @click="openCreateModal"
            class="w-full sm:w-auto flex items-center justify-center space-x-2 bg-gradient-to-r from-gray-900 to-gray-700 text-white px-6 py-3 rounded-xl font-semibold hover:shadow-lg hover:shadow-gray-900/30 transition-all"
          >
            <Plus class="h-5 w-5" />
            <span>Tambah Buku</span>
          </button>
        </div>
      </div>

      <!-- Books Table -->
      <div class="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
        <div v-if="loading" class="flex justify-center items-center py-32">
          <div class="relative">
            <div class="animate-spin rounded-full h-16 w-16 border-4 border-gray-200"></div>
            <div class="animate-spin rounded-full h-16 w-16 border-t-4 border-gray-900 absolute inset-0"></div>
          </div>
        </div>

        <div v-else-if="filteredBooks.length === 0" class="text-center py-32">
          <div class="inline-flex items-center justify-center w-20 h-20 rounded-full bg-gray-100 mb-6">
            <BookOpen class="h-10 w-10 text-gray-400" />
          </div>
          <h3 class="text-xl font-semibold text-gray-900 mb-2">Tidak ada buku</h3>
          <p class="text-gray-600">Tambahkan buku pertama Anda</p>
        </div>

        <div v-else class="overflow-x-auto">
          <table class="w-full">
            <thead class="bg-gray-50 border-b border-gray-200">
              <tr>
                <th class="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                  Cover
                </th>
                <th class="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                  Judul
                </th>
                <th class="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                  Penulis
                </th>
                <th class="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                  Genre
                </th>
                <th class="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                  Aksi
                </th>
              </tr>
            </thead>
            <tbody class="divide-y divide-gray-200">
              <tr v-for="book in filteredBooks" :key="book.id" class="hover:bg-gray-50 transition-colors">
                <td class="px-6 py-4 whitespace-nowrap">
                  <img
                    :src="getBookCover(book)"
                    :alt="book.title"
                    class="h-20 w-14 object-cover rounded-lg shadow-md"
                  />
                </td>
                <td class="px-6 py-4">
                  <div class="font-semibold text-gray-900">{{ book.title }}</div>
                </td>
                <td class="px-6 py-4">
                  <div class="text-sm text-gray-700">{{ book.author }}</div>
                </td>
                <td class="px-6 py-4">
                  <div class="flex flex-wrap gap-2">
                    <span
                      v-for="genre in book.genre.split(',').slice(0, 2)"
                      :key="genre"
                      class="inline-flex items-center px-3 py-1 rounded-lg text-xs font-medium bg-gray-100 text-gray-800 border border-gray-200"
                    >
                      {{ genre.trim() }}
                    </span>
                  </div>
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                  <div class="flex items-center space-x-2">
                    <button
                      @click="openEditModal(book)"
                      class="p-2.5 hover:bg-blue-50 text-blue-600 rounded-xl transition-colors border border-transparent hover:border-blue-200"
                      title="Edit"
                    >
                      <Edit class="h-4 w-4" />
                    </button>
                    <button
                      @click="handleDelete(book)"
                      class="p-2.5 hover:bg-red-50 text-red-600 rounded-xl transition-colors border border-transparent hover:border-red-200"
                      title="Hapus"
                    >
                      <Trash2 class="h-4 w-4" />
                    </button>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>

    <!-- Modal -->
    <div
      v-if="showModal"
      class="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-in fade-in duration-200"
      @click.self="closeModal"
    >
      <div class="bg-white rounded-3xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl animate-in zoom-in-95 duration-200">
        <!-- Modal Header -->
        <div class="flex items-center justify-between p-8 border-b border-gray-200">
          <h2 class="text-2xl font-bold text-gray-900">
            {{ modalMode === 'create' ? 'Tambah Buku Baru' : 'Edit Buku' }}
          </h2>
          <button @click="closeModal" class="p-2 hover:bg-gray-100 rounded-xl transition-colors">
            <X class="h-6 w-6 text-gray-500" />
          </button>
        </div>

        <!-- Modal Body -->
        <form @submit.prevent="handleSubmit" class="p-8 space-y-6">
          <div>
            <label class="block text-sm font-semibold text-gray-900 mb-2">Judul Buku</label>
            <input
              v-model="formData.title"
              type="text"
              required
              class="w-full px-4 py-3 rounded-xl border border-gray-300 focus:border-gray-900 focus:ring-2 focus:ring-gray-900/10 outline-none transition-all text-gray-900"
              placeholder="Masukkan judul buku"
            />
          </div>

          <div>
            <label class="block text-sm font-semibold text-gray-900 mb-2">Penulis</label>
            <input
              v-model="formData.author"
              type="text"
              required
              class="w-full px-4 py-3 rounded-xl border border-gray-300 focus:border-gray-900 focus:ring-2 focus:ring-gray-900/10 outline-none transition-all text-gray-900"
              placeholder="Masukkan nama penulis"
            />
          </div>

          <div>
            <label class="block text-sm font-semibold text-gray-900 mb-2">Genre</label>
            <input
              v-model="formData.genre"
              type="text"
              required
              class="w-full px-4 py-3 rounded-xl border border-gray-300 focus:border-gray-900 focus:ring-2 focus:ring-gray-900/10 outline-none transition-all text-gray-900"
              placeholder="Contoh: Fantasy, Fiction, Magic"
            />
            <p class="text-xs text-gray-500 mt-2">💡 Pisahkan dengan koma</p>
          </div>

          <div>
            <label class="block text-sm font-semibold text-gray-900 mb-2">Deskripsi</label>
            <textarea
              v-model="formData.description"
              required
              rows="5"
              class="w-full px-4 py-3 rounded-xl border border-gray-300 focus:border-gray-900 focus:ring-2 focus:ring-gray-900/10 outline-none transition-all resize-none text-gray-900"
              placeholder="Masukkan deskripsi buku"
            ></textarea>
          </div>

          <!-- Modal Footer -->
          <div class="flex justify-end space-x-3 pt-6 border-t border-gray-200">
            <button
              type="button"
              @click="closeModal"
              class="px-6 py-3 rounded-xl border border-gray-300 text-gray-700 font-medium hover:bg-gray-50 transition-colors"
            >
              Batal
            </button>
            <button
              type="submit"
              class="px-6 py-3 rounded-xl bg-gradient-to-r from-gray-900 to-gray-700 text-white font-semibold hover:shadow-lg hover:shadow-gray-900/30 transition-all"
            >
              {{ modalMode === 'create' ? 'Tambah' : 'Simpan' }}
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>