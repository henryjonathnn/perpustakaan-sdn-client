<!-- frontend/src/views/dashboard/Books.vue -->
<script setup lang="ts">
import { ref, onMounted, computed } from 'vue';
import debounce from 'lodash.debounce';
import { 
  PlusIcon, 
  PencilIcon, 
  TrashIcon, 
  MagnifyingGlassIcon, 
  XMarkIcon,
  PhotoIcon
} from '@heroicons/vue/24/outline';
import { booksAPI, genresAPI, type Book, type Genre } from '../../services/api';
import { showAlert } from '../../utils/alert';

const books = ref<Book[]>([]);
const genres = ref<Genre[]>([]);
const loading = ref(true);
const searchQuery = ref('');
const showModal = ref(false);
const modalMode = ref<'create' | 'edit'>('create');
const selectedBook = ref<Book | null>(null);
const imagePreview = ref<string | null>(null);

const formData = ref<FormData>(new FormData());
const form = ref({
  title: '',
  author: '',
  genreId: '',
  synopsis: '',
});

// Helper function untuk get image URL
const getBookCoverUrl = (coverImg: string | null) => {
  if (!coverImg) return null;
  return `${import.meta.env.VITE_API_URL || 'http://localhost:3000'}/uploads/${coverImg}`;
};

// Debounced search function
const debouncedSearch = debounce(async (query: string) => {
  try {
    loading.value = true;
    const response = await booksAPI.search(query);
    books.value = response.data.books;
  } catch (error) {
    showAlert.error('Failed to search books');
  } finally {
    loading.value = false;
  }
}, 300);

const handleSearch = (event: Event) => {
  const query = (event.target as HTMLInputElement).value;
  searchQuery.value = query;
  if (query.trim()) {
    debouncedSearch(query);
  } else {
    fetchBooks();
  }
};

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
    showAlert.error('Failed to fetch data');
  } finally {
    loading.value = false;
  }
};

const handleImageChange = (event: Event) => {
  const input = event.target as HTMLInputElement;
  if (input.files && input.files[0]) {
    const file = input.files[0];
    formData.value.set('coverImage', file);
    imagePreview.value = URL.createObjectURL(file);
  }
};

const openCreateModal = () => {
  modalMode.value = 'create';
  form.value = {
    title: '',
    author: '',
    genreId: '',
    synopsis: '',
  };
  imagePreview.value = null;
  formData.value = new FormData();
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
  };
  imagePreview.value = book.cover_img ? getBookCoverUrl(book.cover_img) : null;
  formData.value = new FormData();
  showModal.value = true;
};

const closeModal = () => {
  showModal.value = false;
  selectedBook.value = null;
  imagePreview.value = null;
};

const handleSubmit = async () => {
  showAlert.loading();
  
  try {
    // Add form fields to FormData
    formData.value.set('title', form.value.title);
    formData.value.set('author', form.value.author);
    formData.value.set('genreId', form.value.genreId);
    formData.value.set('synopsis', form.value.synopsis);
    
    if (modalMode.value === 'create') {
      await booksAPI.create(formData.value);
      showAlert.success('Book created successfully');
    } else if (selectedBook.value) {
      await booksAPI.update(selectedBook.value.id, formData.value);
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
  
  showAlert.loading();
  
  try {
    await booksAPI.delete(book.id);
    await fetchBooks();
    showAlert.success('Book deleted successfully');
  } catch (error: any) {
    showAlert.error(error.response?.data?.error || 'Failed to delete book');
  }
};

onMounted(() => {
  fetchBooks();
});
</script>

<template>
  <div>
    <!-- Header -->
    <div class="mb-8">
      <h1 class="text-2xl font-bold text-gray-900">Books Management</h1>
      <p class="text-gray-600">Manage your library's book collection</p>
    </div>

    <!-- Actions -->
    <div class="flex flex-col sm:flex-row gap-4 mb-6">
      <!-- Search -->
      <div class="relative flex-1">
        <MagnifyingGlassIcon class="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
        <input
          v-model="searchQuery"
          @input="handleSearch"
          type="text"
          placeholder="Search books..."
          class="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        />
      </div>

      <!-- Add Book Button -->
      <button
        @click="openCreateModal"
        class="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
      >
        <PlusIcon class="h-5 w-5 mr-2" />
        Add Book
      </button>
    </div>

    <!-- Books Table -->
    <div class="bg-white rounded-lg shadow overflow-hidden">
      <div v-if="loading" class="flex justify-center items-center py-12">
        <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>

      <div v-else class="overflow-x-auto">
        <table class="min-w-full divide-y divide-gray-200">
          <thead class="bg-gray-50">
            <tr>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Cover
              </th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Title
              </th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Author
              </th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Genre
              </th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody class="bg-white divide-y divide-gray-200">
            <tr v-for="book in books" :key="book.id">
              <td class="px-6 py-4 whitespace-nowrap">
                <img
                  v-if="book.cover_img"
                  :src="getBookCoverUrl(book.cover_img) || ''"
                  :alt="book.title"
                  class="h-16 w-12 object-cover rounded"
                />
                <div v-else class="h-16 w-12 bg-gray-100 rounded flex items-center justify-center">
                  <PhotoIcon class="h-6 w-6 text-gray-400" />
                </div>
              </td>
              <td class="px-6 py-4">
                <div class="text-sm font-medium text-gray-900">{{ book.title }}</div>
              </td>
              <td class="px-6 py-4">
                <div class="text-sm text-gray-500">{{ book.author }}</div>
              </td>
              <td class="px-6 py-4">
                <span class="px-2 py-1 text-xs font-medium bg-blue-100 text-blue-800 rounded-full">
                  {{ book.genre_name }}
                </span>
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-sm font-medium">
                <button
                  @click="openEditModal(book)"
                  class="text-indigo-600 hover:text-indigo-900 mr-4"
                >
                  <PencilIcon class="h-5 w-5" />
                </button>
                <button
                  @click="handleDelete(book)"
                  class="text-red-600 hover:text-red-900"
                >
                  <TrashIcon class="h-5 w-5" />
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- Modal -->
    <div
      v-if="showModal"
      class="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center p-4 z-50"
    >
      <div class="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div class="px-6 py-4 border-b border-gray-200">
          <div class="flex items-center justify-between">
            <h3 class="text-lg font-medium text-gray-900">
              {{ modalMode === 'create' ? 'Add New Book' : 'Edit Book' }}
            </h3>
            <button @click="closeModal" class="text-gray-400 hover:text-gray-500">
              <XMarkIcon class="h-6 w-6" />
            </button>
          </div>
        </div>

        <form @submit.prevent="handleSubmit" class="px-6 py-4">
          <!-- Cover Image -->
          <div class="mb-4">
            <label class="block text-sm font-medium text-gray-700 mb-2">
              Cover Image
            </label>
            <div class="flex items-center space-x-4">
              <div
                class="h-32 w-24 border-2 border-gray-300 border-dashed rounded-lg flex items-center justify-center"
              >
                <img
                  v-if="imagePreview"
                  :src="imagePreview"
                  class="h-full w-full object-cover rounded-lg"
                />
                <div v-else class="text-center">
                  <PhotoIcon class="h-8 w-8 text-gray-400 mx-auto" />
                  <span class="text-xs text-gray-500">No image</span>
                </div>
              </div>
              <input
                type="file"
                accept="image/*"
                @change="handleImageChange"
                class="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
              />
            </div>
          </div>

          <!-- Title -->
          <div class="mb-4">
            <label class="block text-sm font-medium text-gray-700 mb-2">
              Title
            </label>
            <input
              v-model="form.title"
              type="text"
              required
              class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            />
          </div>

          <!-- Author -->
          <div class="mb-4">
            <label class="block text-sm font-medium text-gray-700 mb-2">
              Author
            </label>
            <input
              v-model="form.author"
              type="text"
              required
              class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            />
          </div>

          <!-- Genre -->
          <div class="mb-4">
            <label class="block text-sm font-medium text-gray-700 mb-2">
              Genre
            </label>
            <select
              v-model="form.genreId"
              required
              class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            >
              <option value="">Select a genre</option>
              <option
                v-for="genre in genres"
                :key="genre.id"
                :value="genre.id"
              >
                {{ genre.name }}
              </option>
            </select>
          </div>

          <!-- Synopsis -->
          <div class="mb-4">
            <label class="block text-sm font-medium text-gray-700 mb-2">
              Synopsis
            </label>
            <textarea
              v-model="form.synopsis"
              rows="4"
              required
              class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            ></textarea>
          </div>

          <!-- Buttons -->
          <div class="flex justify-end space-x-3">
            <button
              type="button"
              @click="closeModal"
              class="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              class="px-4 py-2 bg-blue-600 text-white rounded-md text-sm font-medium hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
            >
              {{ modalMode === 'create' ? 'Create' : 'Update' }}
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>