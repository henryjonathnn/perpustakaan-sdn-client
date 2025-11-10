<script setup lang="ts">
import { ref, onMounted, onBeforeMount, computed } from 'vue';
import { Plus, Edit, Trash2, BookOpen, Search, X, BookIcon } from 'lucide-vue-next';
import { booksAPI, genresAPI, type Book, type Genre } from '../services/api';
import { useAuthStore } from '../stores/auth';
import { useRouter } from 'vue-router';
import { showAlert } from '../utils/alert';

const router = useRouter();
const authStore = useAuthStore();
const books = ref<Book[]>([]);
const genres = ref<Genre[]>([]);
const loading = ref(true);
const searchQuery = ref('');
const showModal = ref(false);
const modalMode = ref<'create' | 'edit'>('create');
const selectedBook = ref<Book | null>(null);

const formData = ref<FormData>(new FormData());
const form = ref({
  title: '',
  author: '',
  genreId: '',
  synopsis: '',
  coverImage: null as File | null,
});

const filteredBooks = computed(() => {
  if (!searchQuery.value) return books.value;
  
  const query = searchQuery.value.toLowerCase();
  return books.value.filter(
    (book) =>
      book.title.toLowerCase().includes(query) ||
      book.author.toLowerCase().includes(query) ||
      (book.genre_name && book.genre_name.toLowerCase().includes(query))
  );
});

// Get unique genres count
const uniqueGenresCount = computed(() => {
  const genreNames = books.value
    .map(b => b.genre_name)
    .filter(Boolean);
  return new Set(genreNames).size;
});

const fetchBooks = async () => {
  try {
    loading.value = true;
    const [booksRes, genresRes] = await Promise.all([
      booksAPI.getAll(),
      genresAPI.getAll()
    ]);
    books.value = booksRes.data.books;
    genres.value = genresRes.data.data;
  } catch (error) {
    console.error('Failed to fetch books:', error);
    showAlert.error('Failed to fetch books');
  } finally {
    loading.value = false;
  }
};

const handleImageChange = (event: Event) => {
  const input = event.target as HTMLInputElement;
  if (input.files && input.files[0]) {
    form.value.coverImage = input.files[0];
  }
};

const openCreateModal = () => {
  modalMode.value = 'create';
  form.value = {
    title: '',
    author: '',
    genreId: '',
    synopsis: '',
    coverImage: null,
  };
  showModal.value = true;
};

const openEditModal = (book: Book) => {
  modalMode.value = 'edit';
  selectedBook.value = book;
  form.value = {
    title: book.title,
    author: book.author,
    genreId: book.genre_id.toString(),
    synopsis: book.synopsis,
    coverImage: null,
  };
  showModal.value = true;
};

const closeModal = () => {
  showModal.value = false;
  selectedBook.value = null;
  form.value.coverImage = null;
};

const handleSubmit = async () => {
  try {
    showAlert.loading();
    
    const submitFormData = new FormData();
    submitFormData.append('title', form.value.title);
    submitFormData.append('author', form.value.author);
    submitFormData.append('genreId', form.value.genreId);
    submitFormData.append('synopsis', form.value.synopsis);
    
    if (form.value.coverImage) {
      submitFormData.append('coverImage', form.value.coverImage);
    }
    
    if (modalMode.value === 'create') {
      await booksAPI.create(submitFormData);
      showAlert.success('Book created successfully');
    } else if (selectedBook.value) {
      await booksAPI.update(selectedBook.value.id, submitFormData);
      showAlert.success('Book updated successfully');
    }
    
    await fetchBooks();
    closeModal();
  } catch (error: any) {
    showAlert.error(error.response?.data?.error || 'Failed to save book');
  }
};

const handleDelete = async (book: Book) => {
  const result = await showAlert.confirm(
    'Delete Book',
    `Are you sure you want to delete "${book.title}"?`
  );
  
  if (!result.isConfirmed) return;
  
  try {
    showAlert.loading();
    await booksAPI.delete(book.id);
    await fetchBooks();
    showAlert.success('Book deleted successfully');
  } catch (error: any) {
    showAlert.error(error.response?.data?.error || 'Failed to delete book');
  }
};

const getBookCover = (book: Book): string => {
  if (book.cover_img) {
    return `${import.meta.env.VITE_API_URL || 'http://localhost:3000'}/uploads/${book.cover_img}`;
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
              <p class="text-sm font-medium text-purple-700 mb-1">Total Genre</p>
              <p class="text-3xl font-bold text-purple-900">{{ genres.length }}</p>
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
                  <span class="inline-flex items-center px-3 py-1 rounded-lg text-xs font-medium bg-gray-100 text-gray-800 border border-gray-200">
                    {{ book.genre_name || 'No Genre' }}
                  </span>
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
          <!-- Cover Image -->
          <div>
            <label class="block text-sm font-semibold text-gray-900 mb-2">Cover Buku</label>
            <input
              type="file"
              accept="image/*"
              @change="handleImageChange"
              class="w-full px-4 py-3 rounded-xl border border-gray-300 focus:border-gray-900 focus:ring-2 focus:ring-gray-900/10 outline-none transition-all text-gray-900 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:bg-gray-100 file:text-gray-700 hover:file:bg-gray-200"
            />
          </div>

          <div>
            <label class="block text-sm font-semibold text-gray-900 mb-2">Judul Buku</label>
            <input
              v-model="form.title"
              type="text"
              required
              class="w-full px-4 py-3 rounded-xl border border-gray-300 focus:border-gray-900 focus:ring-2 focus:ring-gray-900/10 outline-none transition-all text-gray-900"
              placeholder="Masukkan judul buku"
            />
          </div>

          <div>
            <label class="block text-sm font-semibold text-gray-900 mb-2">Penulis</label>
            <input
              v-model="form.author"
              type="text"
              required
              class="w-full px-4 py-3 rounded-xl border border-gray-300 focus:border-gray-900 focus:ring-2 focus:ring-gray-900/10 outline-none transition-all text-gray-900"
              placeholder="Masukkan nama penulis"
            />
          </div>

          <div>
            <label class="block text-sm font-semibold text-gray-900 mb-2">Genre</label>
            <select
              v-model="form.genreId"
              required
              class="w-full px-4 py-3 rounded-xl border border-gray-300 focus:border-gray-900 focus:ring-2 focus:ring-gray-900/10 outline-none transition-all text-gray-900"
            >
              <option value="">Pilih genre</option>
              <option
                v-for="genre in genres"
                :key="genre.id"
                :value="genre.id"
              >
                {{ genre.name }}
              </option>
            </select>
          </div>

          <div>
            <label class="block text-sm font-semibold text-gray-900 mb-2">Sinopsis</label>
            <textarea
              v-model="form.synopsis"
              required
              rows="5"
              class="w-full px-4 py-3 rounded-xl border border-gray-300 focus:border-gray-900 focus:ring-2 focus:ring-gray-900/10 outline-none transition-all resize-none text-gray-900"
              placeholder="Masukkan sinopsis buku"
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