<script setup lang="ts">
import { useRouter } from 'vue-router'

const router = useRouter()

const props = defineProps<{
  id: number
  title: string
  author: string
  genre: string
  description: string
  coverUrl?: string
}>()

const navigateToDetail = () => {
  router.push({
    name: 'book-details',
    params: { id: props.id }
  })
}
</script>

<template>
  <div 
    class="group relative overflow-hidden rounded-lg border bg-white shadow-md transition-all hover:shadow-lg cursor-pointer"
    @click="navigateToDetail">
    <!-- Cover Image -->
    <div class="aspect-[4/3] overflow-hidden bg-muted">
      <img
        :src="coverUrl || '/placeholder-book.jpg'"
        :alt="title"
        class="h-full w-full object-cover transition-transform group-hover:scale-105"
      />
    </div>
    
    <!-- Content -->
    <div class="p-6">
      <h3 class="font-semibold tracking-tight">{{ title }}</h3>
      <p class="text-sm text-muted-foreground">{{ author }}</p>
      
      <!-- Genre Badge -->
      <div class="mt-4">
        <span class="inline-flex items-center rounded-full bg-primary/10 px-2.5 py-0.5 text-xs font-medium text-primary">
          {{ genre }}
        </span>
      </div>
      
      <!-- Description -->
      <p class="mt-4 text-sm text-muted-foreground line-clamp-3">
        {{ description }}
      </p>
    </div>
  </div>
</template>