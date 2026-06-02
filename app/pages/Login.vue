<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.PUBLIC_SUPABASE_URL || '';
const supabaseKey = import.meta.env.PUBLIC_SUPABASE_KEY || '';
const supabase = (supabaseUrl && supabaseKey) ? createClient(supabaseUrl, supabaseKey) : null;

const email = ref('');
const password = ref('');
const authLoading = ref(false);
const authError = ref('');
const isLoading = ref(true);

onMounted(async () => {
  if (supabase) {
    const { data } = await supabase.auth.getSession();
    if (data.session) {
      localStorage.setItem('sb-access-token', data.session.access_token);
      window.location.href = '/';
      return;
    }
  }
  isLoading.value = false;
});

const handleLogin = async () => {
  if (!supabase) {
    authError.value = 'Supabase credentials are not configured in your .env file.';
    return;
  }
  authLoading.value = true;
  authError.value = '';

  const { data, error } = await supabase.auth.signInWithPassword({
    email: email.value,
    password: password.value,
  });

  authLoading.value = false;
  if (error) {
    authError.value = error.message;
  } else if (data.session) {
    localStorage.setItem('sb-access-token', data.session.access_token);
    window.location.href = '/';
  }
};
</script>

<template>
  <div v-if="isLoading" class="flex justify-center items-center py-20">
    <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
  </div>

  <div v-else class="w-full">
    <div class="bg-white/70 backdrop-blur-xl rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.06)] border border-white/50 w-full max-w-md mx-auto p-8 mb-8" v-cloak>
      <div class="mb-6 text-center">
        <h2 class="text-2xl font-bold text-gray-900">Sign In Required</h2>
        <p class="text-gray-500 mt-2 text-sm">Please log in to upload bookmarks to your secured database.</p>
      </div>
      
      <form @submit.prevent="handleLogin" class="flex flex-col gap-4">
        <div>
          <label for="email" class="block text-sm font-medium text-gray-700 mb-1">Email</label>
          <input v-model="email" type="email" id="email" required class="w-full px-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all outline-none" placeholder="you@example.com" />
        </div>
        
        <div>
          <label for="password" class="block text-sm font-medium text-gray-700 mb-1">Password</label>
          <input v-model="password" type="password" id="password" required class="w-full px-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all outline-none" placeholder="••••••••" />
        </div>
        
        <button type="submit" :disabled="authLoading" class="mt-4 w-full px-5 py-3.5 bg-blue-600 text-white font-semibold rounded-xl hover:bg-blue-700 focus:outline-none focus:ring-4 focus:ring-blue-200 transition-all duration-300 shadow-md disabled:opacity-70 disabled:cursor-not-allowed">
          <span>{{ authLoading ? 'Logging in...' : 'Log In' }}</span>
        </button>
      </form>

      <div v-if="authError" class="mt-4 text-sm font-medium text-center text-red-600">
        {{ authError }}
      </div>
    </div>
  </div>
</template>

<style scoped>
[v-cloak] {
  display: none;
}
</style>
