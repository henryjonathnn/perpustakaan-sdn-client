<!-- frontend/src/components/dashboard/Sidebar.vue -->
<script setup lang="ts">
import { ref } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import {
  BookOpenIcon,
  UsersIcon,
  ChartBarIcon,
  Cog6ToothIcon,
  ArrowLeftOnRectangleIcon,
} from '@heroicons/vue/24/outline';
import { useAuthStore } from '../../stores/auth';

const authStore = useAuthStore();
const route = useRoute();
const router = useRouter();

const navigation = [
  { name: 'Books', href: '/dashboard/books', icon: BookOpenIcon },
  { name: 'Users', href: '/dashboard/users', icon: UsersIcon },
  { name: 'Analytics', href: '/dashboard/analytics', icon: ChartBarIcon },
  { name: 'Settings', href: '/dashboard/settings', icon: Cog6ToothIcon },
];

const handleLogout = async () => {
  await authStore.logout();
};
</script>

<template>
  <div class="h-full flex flex-col bg-white border-r border-gray-200">
    <!-- Logo -->
    <div class="flex items-center justify-center h-16 px-4">
      <BookOpenIcon class="h-8 w-8 text-gray-900" />
      <span class="ml-2 text-xl font-bold text-gray-900">Admin Panel</span>
    </div>

    <!-- Navigation -->
    <nav class="flex-1 px-2 py-4 space-y-1">
      <router-link
        v-for="item in navigation"
        :key="item.name"
        :to="item.href"
        :class="[
          route.path.startsWith(item.href)
            ? 'bg-gray-100 text-gray-900'
            : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900',
          'group flex items-center px-2 py-2 text-sm font-medium rounded-md transition-colors'
        ]"
      >
        <component
          :is="item.icon"
          :class="[
            route.path.startsWith(item.href)
              ? 'text-gray-500'
              : 'text-gray-400 group-hover:text-gray-500',
            'mr-3 flex-shrink-0 h-6 w-6'
          ]"
          aria-hidden="true"
        />
        {{ item.name }}
      </router-link>
    </nav>

    <!-- Logout Button -->
    <div class="flex-shrink-0 p-4">
      <button
        @click="handleLogout"
        class="w-full flex items-center px-4 py-2 text-sm font-medium text-red-600 hover:bg-red-50 rounded-md transition-colors"
      >
        <ArrowLeftOnRectangleIcon class="h-5 w-5 mr-2" />
        Logout
      </button>
    </div>
  </div>
</template>