<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { User, Lock, ArrowLeft, Eye, EyeOff } from 'lucide-vue-next';
import { useAuthStore } from '../stores/auth';
import { usersAPI } from '../services/api';
import { showToast, showConfirm } from '../utils/toast';

const router = useRouter();
const authStore = useAuthStore();

const form = ref({
  username: '',
  currentPassword: '',
  newPassword: '',
  confirmPassword: ''
});

const showCurrentPassword = ref(false);
const showNewPassword = ref(false);
const showConfirmPassword = ref(false);
const loading = ref(false);

onMounted(() => {
  if (!authStore.user) {
    router.push('/login');
    return;
  }
  form.value.username = authStore.user.username;
});

const handleUpdateProfile = () => {
  showConfirm(
    'Konfirmasi Perubahan',
    'Apakah Anda yakin ingin mengubah informasi profil?',
    async () => {
      try {
        loading.value = true;

        const updateData: any = {};
        
        // Jika username berubah
        if (form.value.username !== authStore.user?.username) {
          updateData.username = form.value.username;
        }

        // Jika mengubah password
        if (form.value.newPassword) {
          if (!form.value.currentPassword) {
            showToast.error('Password saat ini harus diisi');
            loading.value = false;
            return;
          }

          if (form.value.newPassword !== form.value.confirmPassword) {
            showToast.error('Password baru tidak cocok');
            loading.value = false;
            return;
          }

          if (form.value.newPassword.length < 6) {
            showToast.error('Password minimal 6 karakter');
            loading.value = false;
            return;
          }

          updateData.password = form.value.newPassword;
        }

        if (Object.keys(updateData).length === 0) {
          showToast.warning('Tidak ada perubahan');
          loading.value = false;
          return;
        }

        await usersAPI.update(authStore.user!.id, updateData);

        // Update local user data jika username berubah
        if (updateData.username) {
          const updatedUser = { ...authStore.user!, username: updateData.username };
          localStorage.setItem('user', JSON.stringify(updatedUser));
          authStore.setUser(updatedUser);
        }

        showToast.success('Profil berhasil diperbarui!');
        
        // Clear password fields
        form.value.currentPassword = '';
        form.value.newPassword = '';
        form.value.confirmPassword = '';

      } catch (error: any) {
        showToast.error(error.response?.data?.error || 'Gagal memperbarui profil');
      } finally {
        loading.value = false;
      }
    }
  );
};

const goBack = () => {
  if (authStore.user?.role === 'pustakawan') {
    router.push('/dashboard');
  } else {
    router.push('/');
  }
};
</script>

<template>
  <div class="min-h-screen bg-gray-50 py-12 px-4">
    <div class="max-w-2xl mx-auto">
      <!-- Back Button -->
      <button
        @click="goBack"
        class="inline-flex items-center space-x-2 px-4 py-2 rounded-xl text-gray-700 hover:bg-white hover:shadow-sm transition-all mb-6"
      >
        <ArrowLeft class="h-5 w-5" />
        <span class="font-medium">Kembali</span>
      </button>

      <!-- Profile Card -->
      <div class="bg-white rounded-3xl border border-gray-200 shadow-xl shadow-gray-200/50 overflow-hidden">
        <!-- Header -->
        <div class="bg-gradient-to-br from-gray-900 to-gray-700 p-8 text-center">
          <div class="inline-flex items-center justify-center w-24 h-24 rounded-full bg-white/10 backdrop-blur-sm mb-4">
            <User class="h-12 w-12 text-white" />
          </div>
          <h1 class="text-2xl font-bold text-white mb-1">Profil Saya</h1>
          <p class="text-gray-300 text-sm">Kelola informasi akun Anda</p>
        </div>

        <!-- Form -->
        <form @submit.prevent="handleUpdateProfile" class="p-8 space-y-6">
          <!-- Role Badge -->
          <div class="flex items-center justify-center">
            <div
              :class="[
                'px-4 py-2 rounded-full text-sm font-semibold',
                authStore.user?.role === 'pustakawan'
                  ? 'bg-purple-100 text-purple-800'
                  : 'bg-blue-100 text-blue-800'
              ]"
            >
              {{ authStore.user?.role === 'pustakawan' ? '📚 Pustakawan' : '👨‍🎓 Siswa' }}
            </div>
          </div>

          <!-- Username Section -->
          <div>
            <label class="block text-sm font-semibold text-gray-900 mb-2">
              <User class="h-4 w-4 inline mr-2" />
              Username
            </label>
            <input
              v-model="form.username"
              type="text"
              class="w-full px-4 py-3.5 rounded-xl border border-gray-300 focus:border-gray-900 focus:ring-2 focus:ring-gray-900/10 outline-none transition-all text-gray-900"
              :disabled="loading"
            />
          </div>

          <div class="border-t border-gray-200 pt-6">
            <h3 class="text-sm font-semibold text-gray-900 mb-4 flex items-center">
              <Lock class="h-4 w-4 mr-2" />
              Ubah Password
            </h3>

            <!-- Current Password -->
            <div class="mb-4">
              <label class="block text-sm font-medium text-gray-700 mb-2">
                Password Saat Ini
              </label>
              <div class="relative">
                <input
                  v-model="form.currentPassword"
                  :type="showCurrentPassword ? 'text' : 'password'"
                  placeholder="Masukkan password saat ini"
                  class="w-full px-4 py-3.5 pr-12 rounded-xl border border-gray-300 focus:border-gray-900 focus:ring-2 focus:ring-gray-900/10 outline-none transition-all text-gray-900 placeholder:text-gray-400"
                  :disabled="loading"
                />
                <button
                  type="button"
                  @click="showCurrentPassword = !showCurrentPassword"
                  class="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <Eye v-if="!showCurrentPassword" class="h-5 w-5" />
                  <EyeOff v-else class="h-5 w-5" />
                </button>
              </div>
            </div>

            <!-- New Password -->
            <div class="mb-4">
              <label class="block text-sm font-medium text-gray-700 mb-2">
                Password Baru
              </label>
              <div class="relative">
                <input
                  v-model="form.newPassword"
                  :type="showNewPassword ? 'text' : 'password'"
                  placeholder="Minimal 6 karakter"
                  class="w-full px-4 py-3.5 pr-12 rounded-xl border border-gray-300 focus:border-gray-900 focus:ring-2 focus:ring-gray-900/10 outline-none transition-all text-gray-900 placeholder:text-gray-400"
                  :disabled="loading"
                />
                <button
                  type="button"
                  @click="showNewPassword = !showNewPassword"
                  class="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <Eye v-if="!showNewPassword" class="h-5 w-5" />
                  <EyeOff v-else class="h-5 w-5" />
                </button>
              </div>
            </div>

            <!-- Confirm New Password -->
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">
                Konfirmasi Password Baru
              </label>
              <div class="relative">
                <input
                  v-model="form.confirmPassword"
                  :type="showConfirmPassword ? 'text' : 'password'"
                  placeholder="Ketik ulang password baru"
                  class="w-full px-4 py-3.5 pr-12 rounded-xl border border-gray-300 focus:border-gray-900 focus:ring-2 focus:ring-gray-900/10 outline-none transition-all text-gray-900 placeholder:text-gray-400"
                  :disabled="loading"
                />
                <button
                  type="button"
                  @click="showConfirmPassword = !showConfirmPassword"
                  class="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <Eye v-if="!showConfirmPassword" class="h-5 w-5" />
                  <EyeOff v-else class="h-5 w-5" />
                </button>
              </div>
            </div>

            <p class="text-sm text-gray-500 mt-2">
              Kosongkan jika tidak ingin mengubah password
            </p>
          </div>

          <!-- Submit Button -->
          <button
            type="submit"
            :disabled="loading"
            class="w-full bg-gradient-to-r from-gray-900 to-gray-700 text-white py-4 rounded-xl font-semibold hover:shadow-lg hover:shadow-gray-900/30 transition-all duration-300 flex items-center justify-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <div v-if="loading" class="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent"></div>
            <span>{{ loading ? 'Menyimpan...' : 'Simpan Perubahan' }}</span>
          </button>
        </form>
      </div>
    </div>
  </div>
</template>