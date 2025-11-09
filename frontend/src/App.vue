<script setup lang="ts">
import { RouterView } from 'vue-router'
import Navigation from './components/Navigation.vue'
</script>

<template>
  <div class="min-h-screen bg-background font-sans antialiased">
    <Navigation />
    <main class="container py-8">
      <RouterView />
    </main>
  </div>
</template>

<style>
</style>
