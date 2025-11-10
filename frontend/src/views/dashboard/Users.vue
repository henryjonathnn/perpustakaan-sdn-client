<!-- frontend/src/views/dashboard/Users.vue -->
<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { 
  PlusIcon, 
  PencilIcon, 
  TrashIcon, 
  MagnifyingGlassIcon, 
  XMarkIcon,
  UserCircleIcon
} from '@heroicons/vue/24/outline';
import { usersAPI, type User } from '../../services/api';
import { showAlert } from '../../utils/alert';

const users = ref<User[]>([]);
const loading = ref(true);
const searchQuery = ref('');
const showModal = ref(false);
const modalMode = ref<'create' | 'edit'>('create');
const selectedUser = ref<User | null>(null);

const form = ref({
  username: '',
  password: '',
  role: 'siswa' as 'siswa' | 'pustakawan',
});

// Debounced search function
const handleSearch = (event: Event) => {
  const query = (event.target as HTMLInputElement).value;
  searchQuery.value = query;
  // Implement search functionality if needed
};

const fetchUsers = async () => {
  try {
    loading.value = true;
    const response = await usersAPI.getAll();
    users.value = response.data.users;
  } catch (error) {
    showAlert.error('Failed to fetch users');
  } finally {
    loading.value = false;
  }
};

const openCreateModal = () => {
  modalMode.value = 'create';
  form.value = {
    username: '',
    password: '',
    role: 'siswa',
  };
  showModal.value = true;
};

const openEditModal = (user: User) => {
  modalMode.value = 'edit';
  selectedUser.value = user;
  form.value = {
    username: user.username,
    password: '', // Don't populate password for security
    role: user.role,
  };
  showModal.value = true;
};

const closeModal = () => {
  showModal.value = false;
  selectedUser.value = null;
};

const handleSubmit = async () => {
  showAlert.loading();
  
  try {
    if (modalMode.value === 'create') {
      await usersAPI.create(form.value);
      showAlert.success('User created successfully');
    } else if (selectedUser.value) {
      const updateData: any = { ...form.value };
      if (!updateData.password) {
        delete updateData.password; // Don't send empty password
      }
      await usersAPI.update(selectedUser.value.id, updateData);
      showAlert.success('User updated successfully');
    }
    
    await fetchUsers();
    closeModal();
  } catch (error: any) {
    showAlert.error(error.response?.data?.error || 'Failed to save user');
  }
};

const handleDelete = async (user: User) => {
  const result = await showAlert.confirm(
    'Delete User',
    `Are you sure you want to delete "${user.username}"?`
  );
  
  if (!result.isConfirmed) return;
  
  showAlert.loading();
  
  try {
    await usersAPI.delete(user.id);
    await fetchUsers();
    showAlert.success('User deleted successfully');
  } catch (error: any) {
    showAlert.error(error.response?.data?.error || 'Failed to delete user');
  }
};

onMounted(() => {
  fetchUsers();
});
</script>

<template>
  <div>
    <!-- Header -->
    <div class="mb-8">
      <h1 class="text-2xl font-bold text-gray-900">Users Management</h1>
      <p class="text-gray-600">Manage user accounts and permissions</p>
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
          placeholder="Search users..."
          class="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        />
      </div>

      <!-- Add User Button -->
      <button
        @click="openCreateModal"
        class="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
      >
        <PlusIcon class="h-5 w-5 mr-2" />
        Add User
      </button>
    </div>

    <!-- Users Table -->
    <div class="bg-white rounded-lg shadow overflow-hidden">
      <div class="overflow-x-auto">
        <table class="min-w-full divide-y divide-gray-200">
          <thead class="bg-gray-50">
            <tr>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                User
              </th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Username
              </th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Role
              </th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody class="bg-white divide-y divide-gray-200">
            <tr v-for="user in users" :key="user.id">
              <td class="px-6 py-4 whitespace-nowrap">
                <div class="flex items-center">
                  <UserCircleIcon class="h-10 w-10 text-gray-400" />
                  <div class="ml-4">
                    <div class="text-sm font-medium text-gray-900">{{ user.username }}</div>
                  </div>
                </div>
              </td>
              <td class="px-6 py-4">
                <div class="text-sm text-gray-500">{{ user.username }}</div>
              </td>
              <td class="px-6 py-4">
                <span 
                  class="px-2 py-1 text-xs font-medium rounded-full"
                  :class="{
                    'bg-purple-100 text-purple-800': user.role === 'pustakawan',
                    'bg-blue-100 text-blue-800': user.role === 'siswa'
                  }"
                >
                  {{ user.role }}
                </span>
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-sm font-medium">
                <button
                  @click="openEditModal(user)"
                  class="text-indigo-600 hover:text-indigo-900 mr-4"
                >
                  <PencilIcon class="h-5 w-5" />
                </button>
                <button
                  @click="handleDelete(user)"
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
      class="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center p-4"
    >
      <div class="bg-white rounded-lg max-w-md w-full">
        <div class="px-6 py-4 border-b border-gray-200">
          <div class="flex items-center justify-between">
            <h3 class="text-lg font-medium text-gray-900">
              {{ modalMode === 'create' ? 'Add New User' : 'Edit User' }}
            </h3>
            <button @click="closeModal" class="text-gray-400 hover:text-gray-500">
              <XMarkIcon class="h-6 w-6" />
            </button>
          </div>
        </div>

        <form @submit.prevent="handleSubmit" class="px-6 py-4">
          <!-- Username -->
          <div class="mb-4">
            <label class="block text-sm font-medium text-gray-700 mb-2">
              Username
            </label>
            <input
              v-model="form.username"
              type="text"
              required
              class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            />
          </div>

          <!-- Password -->
          <div class="mb-4">
            <label class="block text-sm font-medium text-gray-700 mb-2">
              Password
              <span v-if="modalMode === 'edit'" class="text-sm text-gray-500">
                (Leave blank to keep current password)
              </span>
            </label>
            <input
              v-model="form.password"
              type="password"
              :required="modalMode === 'create'"
              class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            />
          </div>

          <!-- Role -->
          <div class="mb-4">
            <label class="block text-sm font-medium text-gray-700 mb-2">
              Role
            </label>
            <select
              v-model="form.role"
              required
              class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            >
              <option value="siswa">Siswa</option>
              <option value="pustakawan">Pustakawan</option>
            </select>
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