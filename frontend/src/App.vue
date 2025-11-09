<script setup lang="ts">
import { RouterView } from 'vue-router';
import Navigation from './components/Navigation.vue';
</script>

<template>
  <div class="min-h-screen">
    <Navigation />
    <RouterView />
  </div>
</template>