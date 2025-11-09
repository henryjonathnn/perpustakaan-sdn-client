&lt;script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { Book as BookIcon, ArrowLeft, Loader } from 'lucide-vue-next'
import BookCard from '../components/BookCard.vue'
import { bookService, type Book } from '../services/api'

const route = useRoute()
const router = useRouter()
const book = ref&lt;Book | null>(null)
const recommendations = ref&lt;Book[]>([])
const loading = ref(true)
const error = ref('')

onMounted(async () => {
  try {
    loading.value = true
    const bookId = Number(route.params.id)
    const [bookData, recommendationsData] = await Promise.all([
      bookService.getBook(bookId),
      bookService.getRecommendations(bookId)
    ])
    book.value = bookData
    recommendations.value = recommendationsData.recommendations || []
  } catch (err) {
    error.value = 'Gagal memuat detail buku'
    console.error('Error fetching book details:', err)
  } finally {
    loading.value = false
  }
})
&lt;/script>

&lt;template>
  &lt;div class="container mx-auto px-4 py-8">
    &lt;!-- Back Button -->
    &lt;button
      @click="router.back()"
      class="mb-8 inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground"
    >
      &lt;ArrowLeft class="h-4 w-4" />
      Kembali
    &lt;/button>

    &lt;!-- Loading State -->
    &lt;div v-if="loading" class="flex items-center justify-center py-12">
      &lt;Loader class="h-8 w-8 animate-spin" />
    &lt;/div>

    &lt;!-- Error State -->
    &lt;div v-else-if="error" class="text-center py-12 text-destructive">
      {{ error }}
    &lt;/div>

    &lt;!-- Book Details -->
    &lt;div v-else-if="book" class="grid grid-cols-1 md:grid-cols-2 gap-8">
      &lt;!-- Book Cover -->
      &lt;div class="aspect-[4/3] overflow-hidden rounded-lg bg-muted">
        &lt;img
          :src="book.coverUrl || '/placeholder-book.jpg'"
          :alt="book.title"
          class="h-full w-full object-cover"
        />
      &lt;/div>

      &lt;!-- Book Info -->
      &lt;div class="space-y-6">
        &lt;h1 class="text-3xl font-bold tracking-tight">{{ book.title }}&lt;/h1>
        &lt;div class="space-y-2">
          &lt;p class="text-lg font-medium">{{ book.author }}&lt;/p>
          &lt;span class="inline-flex items-center rounded-full bg-primary/10 px-3 py-1 text-sm font-medium text-primary">
            {{ book.genre }}
          &lt;/span>
        &lt;/div>
        &lt;p class="text-muted-foreground">{{ book.description }}&lt;/p>
      &lt;/div>
    &lt;/div>

    &lt;!-- Recommendations -->
    &lt;div v-if="recommendations.length > 0" class="mt-16">
      &lt;h2 class="text-2xl font-bold tracking-tight mb-8">Rekomendasi Buku Serupa&lt;/h2>
      &lt;div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        &lt;BookCard
          v-for="book in recommendations"
          :key="book.id"
          v-bind="book"
          class="cursor-pointer"
          @click="router.push(`/books/${book.id}`)"
        />
      &lt;/div>
    &lt;/div>
  &lt;/div>
&lt;/template>

&lt;style scoped>
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
&lt;/style>