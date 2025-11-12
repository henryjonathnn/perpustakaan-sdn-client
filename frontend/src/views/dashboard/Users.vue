<script setup lang="ts">
import { ref, onMounted, computed } from 'vue';
import { 
  PlusIcon, 
  PencilIcon, 
  TrashIcon, 
  MagnifyingGlassIcon, 
  XMarkIcon,
  UserCircleIcon,
  EyeIcon
} from '@heroicons/vue/24/outline';
import { usersAPI, type User } from '../../services/api';
import { showToast, showConfirm } from '../../utils/toast';

const users = ref<User[]>([]);
const loading = ref(true);
const searchQuery = ref('');
const showModal = ref(false);
const showDetailModal = ref(false);
const modalMode = ref<'create' | 'edit'>('create');
const selectedUser = ref<User | null>(null);
const selectedUsers = ref<number[]>([]);

const form = ref({
  username: '',
  password: '',
  role: 'siswa' as 'siswa' | 'pustakawan',
});

// Computed
const allSelected = computed(() => 
  filteredUsers.value.length > 0 && selectedUsers.value.length === filteredUsers.value.length
);

const filteredUsers = computed(() => {
  if (!searchQuery.value.trim()) return users.value;
  
  const query = searchQuery.value.toLowerCase();
  return users.value.filter(user => 
    user.username.toLowerCase().includes(query) ||
    user.role.toLowerCase().includes(query)
  );
});

const toggleSelectAll = () => {
  if (allSelected.value) {
    selectedUsers.value = [];
  } else {
    selectedUsers.value = filteredUsers.value.map(user => user.id);
  }
};

const toggleSelectUser = (userId: number) => {
  const index = selectedUsers.value.indexOf(userId);
  if (index > -1) {
    selectedUsers.value.splice(index, 1);
  } else {
    selectedUsers.value.push(userId);
  }
};

const bulkDelete = () => {
  if (selectedUsers.value.length === 0) {
    showToast.warning('Pilih user yang ingin dihapus');
    return;
  }

  showConfirm(
    'Hapus User Terpilih',
    `Apakah Anda yakin ingin menghapus ${selectedUsers.value.length} user?`,
    async () => {
      try {
        await Promise.all(
          selectedUsers.value.map(id => usersAPI.delete(id))
        );
        await fetchUsers();
        selectedUsers.value = [];
        showToast.success(`User berhasil dihapus`);
      } catch (error: any) {
        showToast.error('Gagal menghapus beberapa user');
      }
    }
  );
};

const handleSearch = (event: Event) => {
  const query = (event.target as HTMLInputElement).value;
  searchQuery.value = query;
};

const fetchUsers = async () => {
  try {
    loading.value = true;
    const response = await usersAPI.getAll();
    users.value = response.data.users;
  } catch (error) {
    showToast.error('Gagal memuat users');
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
    password: '',
    role: user.role,
  };
  showModal.value = true;
};

const openDetailModal = (user: User) => {
  selectedUser.value = user;
  showDetailModal.value = true;
};

const closeModal = () => {
  showModal.value = false;
  showDetailModal.value = false;
  selectedUser.value = null;
};

const handleSubmit = () => {
  showConfirm(
    modalMode.value === 'create' ? 'Tambah User' : 'Edit User',
    `Apakah Anda yakin ingin ${modalMode.value === 'create' ? 'menambah' : 'mengubah'} user ini?`,
    async () => {
      try {
        if (modalMode.value === 'create') {
          await usersAPI.create(form.value);
          showToast.success('User berhasil ditambahkan');
        } else if (selectedUser.value) {
          const updateData: any = { ...form.value };
          if (!updateData.password) {
            delete updateData.password;
          }
          await usersAPI.update(selectedUser.value.id, updateData);
          showToast.success('User berhasil diperbarui');
        }

        await fetchUsers();
        closeModal();
      } catch (error: any) {
        showToast.error(error.response?.data?.error || 'Gagal menyimpan user');
      }
    }
  );
};

const handleDelete = (user: User) => {
  showConfirm(
    'Hapus User',
    `Apakah Anda yakin ingin menghapus "${user.username}"?`,
    async () => {
      try {
        await usersAPI.delete(user.id);
        await fetchUsers();
        showToast.success('User berhasil dihapus');
      } catch (error: any) {
        showToast.error(error.response?.data?.error || 'Gagal menghapus user');
      }
    }
  );
};

onMounted(() => {
  fetchUsers();
});
</script>

<template>
  <div>
    <!-- Header -->
    <div class="mb-8">
      <h1 class="text-2xl font-bold text-gray-900">Kelola Users</h1>
      <p class="text-gray-600">Kelola akun pengguna dan pustakawan</p>
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
          placeholder="Cari users..."
          class="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        />
      </div>

      <!-- Bulk Actions -->
      <div v-if="selectedUsers.length > 0" class="flex items-center gap-2">
        <span class="text-sm text-gray-600">{{ selectedUsers.length }} dipilih</span>
        <button
          @click="bulkDelete"
          class="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 text-sm font-medium"
        >
          Hapus Terpilih
        </button>
      </div>

      <!-- Add User Button -->
      <button
        @click="openCreateModal"
        class="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
      >
        <PlusIcon class="h-5 w-5 mr-2" />
        Tambah User
      </button>
    </div>

    <!-- Users Table -->
    <div class="bg-white rounded-lg shadow overflow-hidden">
      <div class="overflow-x-auto">
        <table class="min-w-full divide-y divide-gray-200">
          <thead class="bg-gray-50">
            <tr>
              <th class="px-6 py-3">
                <input
                  type="checkbox"
                  :checked="allSelected"
                  @change="toggleSelectAll"
                  class="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
              </th>
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
                Aksi
              </th>
            </tr>
          </thead>
          <tbody class="bg-white divide-y divide-gray-200">
            <tr v-for="user in filteredUsers" :key="user.id" class="hover:bg-gray-50">
              <td class="px-6 py-4">
                <input
                  type="checkbox"
                  :checked="selectedUsers.includes(user.id)"
                  @change="toggleSelectUser(user.id)"
                  class="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
              </td>
              <td class="px-6 py-4 whitespace-nowrap">
                <div class="flex items-center">
                  <UserCircleIcon class="h-10 w-10 text-gray-400" />
                  <div class="ml-4">
                    <button
                      @click="openDetailModal(user)"
                      class="text-sm font-medium text-gray-900 hover:text-blue-600 transition-colors"
                    >
                      {{ user.username }}
                    </button>
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
              <td class="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                <button
                  @click="openDetailModal(user)"
                  class="text-green-600 hover:text-green-900"
                  title="Detail"
                >
                  <EyeIcon class="h-5 w-5" />
                </button>
                <button
                  @click="openEditModal(user)"
                  class="text-indigo-600 hover:text-indigo-900"
                  title="Edit"
                >
                  <PencilIcon class="h-5 w-5" />
                </button>
                <button
                  @click="handleDelete(user)"
                  class="text-red-600 hover:text-red-900"
                  title="Hapus"
                >
                  <TrashIcon class="h-5 w-5" />
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- Create/Edit Modal -->
    <div
      v-if="showModal"
      class="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center p-4 z-50"
    >
      <div class="bg-white rounded-lg max-w-md w-full">
        <div class="px-6 py-4 border-b border-gray-200">
          <div class="flex items-center justify-between">
            <h3 class="text-lg font-medium text-gray-900">
              {{ modalMode === 'create' ? 'Tambah User Baru' : 'Edit User' }}
            </h3>
            <button @click="closeModal" class="text-gray-400 hover:text-gray-500">
              <XMarkIcon class="h-6 w-6" />
            </button>
          </div>
        </div>

        <form @submit.prevent="handleSubmit" class="px-6 py-4">
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

          <div class="mb-4">
            <label class="block text-sm font-medium text-gray-700 mb-2">
              Password
              <span v-if="modalMode === 'edit'" class="text-sm text-gray-500">
                (Kosongkan jika tidak ingin mengubah)
              </span>
            </label>
            <input
              v-model="form.password"
              type="password"
              :required="modalMode === 'create'"
              class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            />
          </div>

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

          <div class="flex justify-end space-x-3">
            <button
              type="button"
              @click="closeModal"
              class="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
            >
              Batal
            </button>
            <button
              type="submit"
              class="px-4 py-2 bg-blue-600 text-white rounded-md text-sm font-medium hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
            >
              {{ modalMode === 'create' ? 'Tambah' : 'Perbarui' }}
            </button>
          </div>
        </form>
      </div>
    </div>

    <!-- Detail Modal -->
    <div
      v-if="showDetailModal && selectedUser"
      class="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center p-4 z-50"
      @click.self="closeModal"
    >
      <div class="bg-white rounded-lg max-w-md w-full">
        <div class="px-6 py-4 border-b border-gray-200">
          <div class="flex items-center justify-between">
            <h3 class="text-lg font-medium text-gray-900">Detail User</h3>
            <button @click="closeModal" class="text-gray-400 hover:text-gray-500">
              <XMarkIcon class="h-6 w-6" />
            </button>
          </div>
        </div>

        <div class="px-6 py-6 space-y-6">
          <!-- Avatar -->
          <div class="flex justify-center">
            <div class="w-24 h-24 rounded-full bg-gradient-to-br from-gray-900 to-gray-700 flex items-center justify-center">
              <span class="text-white text-3xl font-bold">
                {{ selectedUser.username.charAt(0).toUpperCase() }}
              </span>
            </div>
          </div>

          <!-- Info -->
          <div class="space-y-4">
            <div>
              <label class="text-sm font-medium text-gray-500">Username</label>
              <p class="mt-1 text-base font-semibold text-gray-900">{{ selectedUser.username }}</p>
            </div>

            <div>
              <label class="text-sm font-medium text-gray-500">Role</label>
              <div class="mt-1">
                <span 
                  class="inline-flex px-3 py-1 text-sm font-medium rounded-full"
                  :class="{
                    'bg-purple-100 text-purple-800': selectedUser.role === 'pustakawan',
                    'bg-blue-100 text-blue-800': selectedUser.role === 'siswa'
                  }"
                >
                  {{ selectedUser.role === 'pustakawan' ? '📚 Pustakawan' : '👨‍🎓 Siswa' }}
                </span>
              </div>
            </div>

            <div>
              <label class="text-sm font-medium text-gray-500">Terdaftar Sejak</label>
              <p class="mt-1 text-base text-gray-900">
                {{ new Date(selectedUser.created_at).toLocaleDateString('id-ID', { dateStyle: 'long' }) }}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>