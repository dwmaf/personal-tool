<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { createClient } from '@supabase/supabase-js';
import { LogOut, LogIn, User } from 'lucide-vue-next';

const supabaseUrl = import.meta.env.PUBLIC_SUPABASE_URL || '';
const supabaseKey = import.meta.env.PUBLIC_SUPABASE_KEY || '';
const supabase = (supabaseUrl && supabaseKey) ? createClient(supabaseUrl, supabaseKey) : null;

const isLoggedIn = ref(false);
const isLoading = ref(true);

const checkUser = async () => {
  if (!supabase) return;
  const { data } = await supabase.auth.getSession();
  isLoggedIn.value = !!data.session;
  isLoading.value = false;
};

const handleLogout = async () => {
  if (supabase) await supabase.auth.signOut();
  localStorage.removeItem('sb-access-token');
  window.location.href = '/login';
};

const goToLogin = () => {
  window.location.href = '/login';
};

onMounted(() => {
  checkUser();
});
</script>

<template>
  <div class="fixed top-6 right-6 sm:right-12 z-[100]" v-cloak>
    <div v-if="isLoading" class="w-24 h-10 bg-white/20 backdrop-blur-md rounded-xl animate-pulse"></div>
    
    <div v-else class="flex items-center gap-3">
      <!-- Logged In State -->
      <button 
        v-if="isLoggedIn"
        @click="handleLogout"
        class="group flex items-center gap-2 px-5 py-2.5 bg-white shadow-[0_4px_20px_rgba(0,0,0,0.08)] border border-white/50 text-red-500 font-bold text-xs rounded-2xl hover:bg-red-50 transition-all active:scale-95"
      >
        <LogOut class="w-3.5 h-3.5 group-hover:-translate-x-0.5 transition-transform" />
        Logout
      </button>

      <!-- Logged Out State -->
      <button 
        v-else
        @click="goToLogin"
        class="group flex items-center gap-2 px-5 py-2.5 bg-gray-900 shadow-[0_4px_20px_rgba(0,0,0,0.15)] text-white font-bold text-xs rounded-2xl hover:bg-gray-800 transition-all active:scale-95"
      >
        <LogIn class="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
        Login
      </button>
    </div>
  </div>
</template>

<style scoped>
[v-cloak] {
  display: none;
}
</style>
