<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { createClient } from '@supabase/supabase-js';
import { UploadCloud, CheckCircle2, XCircle, Info, LogOut, Loader2 } from 'lucide-vue-next';

const supabaseUrl = import.meta.env.PUBLIC_SUPABASE_URL || '';
const supabaseKey = import.meta.env.PUBLIC_SUPABASE_KEY || '';
const supabase = (supabaseUrl && supabaseKey) ? createClient(supabaseUrl, supabaseKey) : null;

const session = ref<any>(null);
const isLoading = ref(true);

const file = ref<File | null>(null);
const uploadLoading = ref(false);
const uploadStatus = ref('');
const uploadIsError = ref(false);

onMounted(async () => {
  if (supabase) {
    const { data } = await supabase.auth.getSession();
    if (!data.session) {
      window.location.href = '/login';
      return;
    }
    session.value = data.session;
    localStorage.setItem('sb-access-token', data.session.access_token);
  } else {
      // If there's no supabase keys configured, just show an error page or redirect.
      window.location.href = '/login';
      return;
  }
  isLoading.value = false;
});

const handleLogout = async () => {
  if (supabase) await supabase.auth.signOut();
  localStorage.removeItem('sb-access-token');
  window.location.href = '/login';
};

const handleFileChange = (e: Event) => {
  const target = e.target as HTMLInputElement;
  if (target.files && target.files.length > 0) {
    file.value = target.files[0];
    uploadStatus.value = '';
  } else {
    file.value = null;
  }
};

const handleUpload = async () => {
  if (!file.value) {
    uploadStatus.value = 'Please select a file first.';
    uploadIsError.value = true;
    return;
  }

  uploadLoading.value = true;
  uploadStatus.value = 'Extracting bookmarks...';
  uploadIsError.value = false;

  try {
    const text = await file.value.text();
    const parser = new DOMParser();
    const doc = parser.parseFromString(text, 'text/html');
    
    const aTags = Array.from(doc.querySelectorAll('a'));
    const bookmarks = aTags.map(a => {
      const url = a.getAttribute('href');
      if (url && (url.startsWith('http://') || url.startsWith('https://'))) {
        return {
          title: a.textContent?.trim() || 'Untitled',
          url,
          addDate: a.getAttribute('add_date') || '',
          icon: a.getAttribute('icon') || ''
        };
      }
      return null;
    }).filter(Boolean);

    if (bookmarks.length === 0) {
      throw new Error("No web bookmarks found in the file.");
    }

    uploadStatus.value = `Found ${bookmarks.length} bookmarks. Uploading to Supabase...`;

    const token = localStorage.getItem('sb-access-token') || session.value?.access_token;
    
    const response = await fetch('/api/bookmarks', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { 'Authorization': `Bearer ${token}` } : {})
      },
      body: JSON.stringify({ bookmarks })
    });

    const result = await response.json();
    if (!response.ok) throw new Error(result.error || 'Upload failed');
    
    uploadStatus.value = result.message || 'Successfully saved to Supabase!';
    uploadIsError.value = false;
    file.value = null;
    
    // Redirect to list page after brief delay
    setTimeout(() => {
      window.location.href = '/';
    }, 1500);
  } catch (err: any) {
    uploadStatus.value = err.message || 'An error occurred during extraction.';
    uploadIsError.value = true;
  } finally {
    uploadLoading.value = false;
  }
};
</script>

<template>
  <div v-if="isLoading" class="flex justify-center items-center py-20">
    <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
  </div>

  <div v-else class="w-full">
    <div class="uploader-container bg-white/70 backdrop-blur-xl rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.06)] border border-white/50 w-full max-w-md mx-auto p-8 translate-y-0 hover:-translate-y-1 transition-transform duration-300" v-cloak>
      <div class="mb-8 flex justify-between items-start">
        <div>
          <div class="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-blue-50 text-blue-600 mb-4 shadow-inner">
            <UploadCloud class="w-6 h-6" stroke-width="2" />
          </div>
          <h2 class="text-2xl font-bold text-gray-900">Upload Data</h2>
          <p class="text-gray-500 mt-2 text-sm leading-relaxed">Select the exported HTML file to securely save your bookmarks.</p>
        </div>
        <button type="button" @click="handleLogout" class="flex items-center gap-1.5 text-sm text-red-600 hover:text-red-800 font-medium px-3 py-1.5 rounded-lg border border-red-100 hover:bg-red-50 transition-colors">
          <LogOut class="w-4 h-4" /> Logout
        </button>
      </div>
      
      <form @submit.prevent="handleUpload" class="flex flex-col gap-6">
        <div class="relative group">
            <label for="bookmark-file" class="flex flex-col items-center justify-center w-full h-48 border-2 border-dashed border-gray-300 rounded-2xl cursor-pointer bg-gray-50/50 hover:bg-blue-50/50 hover:border-blue-400 transition-all duration-300 overflow-hidden relative">
                <div v-if="!file" class="flex flex-col items-center justify-center pt-5 pb-6 text-center px-4">
                    <UploadCloud class="w-10 h-10 mb-3 text-gray-400 group-hover:text-blue-500 transition-colors" stroke-width="1.5" />
                    <p class="mb-1 text-sm text-gray-600 font-medium">Click to select</p>
                    <p class="text-xs text-gray-400">HTML file exported from Brave</p>
                </div>
                <div v-else class="absolute inset-0 flex flex-col items-center justify-center bg-blue-50/90 text-blue-700">
                    <CheckCircle2 class="w-10 h-10 mb-2" stroke-width="1.5" />
                    <span class="font-semibold text-sm truncate max-w-[200px] px-2 text-center">{{ file.name }}</span>
                </div>
                <input id="bookmark-file" type="file" accept=".html" class="hidden" @change="handleFileChange" required />
            </label>
        </div>
        
        <button type="submit" :disabled="uploadLoading || !file" class="relative overflow-hidden w-full px-5 py-3.5 bg-gray-900 text-white font-semibold rounded-xl hover:bg-gray-800 focus:outline-none focus:ring-4 focus:ring-gray-200 transition-all duration-300 shadow-lg shadow-gray-900/20 disabled:opacity-70 disabled:cursor-not-allowed group">
          <span class="relative z-10 flex items-center justify-center gap-2">
            <span>{{ uploadLoading ? 'Processing...' : 'Extract & Save' }}</span>
            <UploadCloud v-if="!uploadLoading" class="w-5 h-5 transition-transform group-hover:translate-x-1 -rotate-90" />
            <Loader2 v-else class="w-5 h-5 animate-spin" />
          </span>
        </button>
      </form>

      <div v-if="uploadStatus" class="mt-6 transition-all duration-300 bg-gray-50 rounded-xl p-4 border border-gray-100">
        <div class="text-sm font-medium flex items-start gap-2">
          <XCircle v-if="uploadIsError" class="w-5 h-5 text-red-500 shrink-0 mt-0.5" />
          <CheckCircle2 v-else-if="uploadStatus.includes('Success')" class="w-5 h-5 text-green-500 shrink-0 mt-0.5" />
          <Info v-else class="w-5 h-5 text-blue-500 shrink-0 mt-0.5" />
          
          <span :class="{'text-red-600': uploadIsError, 'text-green-600': uploadStatus.includes('Success'), 'text-blue-600': !uploadIsError && !uploadStatus.includes('Success')}" class="leading-relaxed">{{ uploadStatus }}</span>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
[v-cloak] {
  display: none;
}
</style>
