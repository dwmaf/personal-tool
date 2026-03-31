<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { createClient } from '@supabase/supabase-js';
import { 
  Eye, 
  EyeOff, 
  Copy, 
  Check, 
  Trash2, 
  Search,
  ExternalLink,
  AlertTriangle
} from 'lucide-vue-next';

const supabaseUrl = import.meta.env.PUBLIC_SUPABASE_URL || '';
const supabaseKey = import.meta.env.PUBLIC_SUPABASE_KEY || '';
const supabase = (supabaseUrl && supabaseKey) ? createClient(supabaseUrl, supabaseKey) : null;

interface Bookmark {
  id: number;
  title: string;
  url: string;
  add_date: string;
  icon?: string;
}

const bookmarks = ref<Bookmark[]>([]);
const isLoading = ref(true);
const isTitleHidden = ref(false);

const copiedId = ref<number | null>(null);

// Modal state
const deleteModalOpen = ref(false);
const bookmarkToDelete = ref<Bookmark | null>(null);
const isDeleting = ref(false);

const fetchBookmarks = async () => {
  if (!supabase) return;
  isLoading.value = true;
  const { data, error } = await supabase
    .from('bookmarks')
    .select('*')
    .order('add_date', { ascending: false });
    
  if (data) {
    bookmarks.value = data;
  }
  isLoading.value = false;
};

onMounted(() => {
  fetchBookmarks();
  window.addEventListener('bookmarks-updated', fetchBookmarks);
});

const copyUrl = async (id: number, url: string) => {
  try {
    await navigator.clipboard.writeText(url);
    copiedId.value = id;
    setTimeout(() => {
      if (copiedId.value === id) copiedId.value = null;
    }, 2000);
  } catch (err) {
    alert('Failed to copy');
  }
};

const openDeleteModal = (bookmark: Bookmark) => {
  bookmarkToDelete.value = bookmark;
  deleteModalOpen.value = true;
};

const closeDeleteModal = () => {
  deleteModalOpen.value = false;
  bookmarkToDelete.value = null;
};

const confirmDelete = async () => {
  if (!supabase || !bookmarkToDelete.value) return;
  
  isDeleting.value = true;
  const { error } = await supabase
    .from('bookmarks')
    .delete()
    .eq('id', bookmarkToDelete.value.id);
    
  isDeleting.value = false;
  
  if (!error) {
    bookmarks.value = bookmarks.value.filter(b => b.id !== bookmarkToDelete.value?.id);
    closeDeleteModal();
  } else {
    alert("Failed to delete bookmark: " + error.message);
  }
};

const formatDate = (dateStr: string) => {
  if (!dateStr) return '-';
  const date = new Date(dateStr);
  return date.toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' });
};
</script>

<template>
  <div class="w-full max-w-5xl mx-auto mt-12 bg-white/70 backdrop-blur-xl rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.06)] border border-white/50 overflow-hidden" v-cloak>
    
    <!-- Table Header Toolbar -->
    <div class="p-6 border-b border-gray-100 flex flex-col sm:flex-row justify-between items-center gap-4 bg-white/40">
      <div>
        <h2 class="text-2xl font-bold text-gray-900">Your Bookmarks</h2>
        <p class="text-sm text-gray-500 mt-1">Manage and view your extracted links.</p>
      </div>
      
      <div class="flex items-center gap-3">
        <button 
          @click="fetchBookmarks" 
          class="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 text-gray-700 text-sm font-medium rounded-xl hover:bg-gray-50 hover:border-blue-200 transition-colors shadow-sm"
        >
          <Search class="w-4 h-4" /> Refresh
        </button>
        
        <button 
          @click="isTitleHidden = !isTitleHidden" 
          class="flex items-center gap-2 px-4 py-2 bg-gray-900 text-white text-sm font-medium rounded-xl hover:bg-gray-800 transition-colors shadow-sm shadow-gray-900/10"
        >
          <component :is="isTitleHidden ? Eye : EyeOff" class="w-4 h-4" /> 
          {{ isTitleHidden ? 'Show Titles' : 'Hide Titles' }}
        </button>
      </div>
    </div>

    <!-- Loading State -->
    <div v-if="isLoading" class="p-12 flex justify-center items-center">
      <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
    </div>

    <!-- Empty State -->
    <div v-else-if="bookmarks.length === 0" class="p-12 text-center flex flex-col items-center">
      <div class="w-16 h-16 bg-blue-50 text-blue-400 rounded-full flex items-center justify-center mb-4">
        <Search class="w-6 h-6" />
      </div>
      <h3 class="text-lg font-semibold text-gray-900">No bookmarks found</h3>
      <p class="text-gray-500 text-sm mt-1 max-w-sm">You haven't uploaded any bookmarks yet, or the ones you uploaded didn't map correctly.</p>
    </div>

    <!-- Table -->
    <div v-else class="overflow-x-auto">
      <table class="w-full text-left text-sm whitespace-nowrap">
        <thead class="bg-gray-50/50 text-gray-600 font-medium">
          <tr>
            <th class="px-6 py-4">Title</th>
            <th class="px-6 py-4">URL</th>
            <th class="px-6 py-4">Added On</th>
            <th class="px-6 py-4 text-center">Actions</th>
          </tr>
        </thead>
        <tbody class="divide-y divide-gray-100/60">
          <tr v-for="b in bookmarks" :key="b.id" class="hover:bg-blue-50/30 transition-colors group">
            <td class="px-6 py-4">
              <div class="flex items-center gap-3">
                <div v-if="b.icon" class="flex-shrink-0 w-6 h-6 rounded bg-gray-100 flex items-center justify-center overflow-hidden">
                  <img :src="b.icon" alt="" class="w-4 h-4 object-contain" />
                </div>
                <div v-else class="flex-shrink-0 w-6 h-6 rounded bg-gray-100 flex items-center justify-center text-gray-400">
                  <ExternalLink class="w-3 h-3" />
                </div>
                
                <span v-if="isTitleHidden" class="bg-gray-200 text-transparent select-none rounded animate-pulse">
                  ************************
                </span>
                <span v-else class="font-medium text-gray-900 truncate max-w-[200px] block" :title="b.title">
                  {{ b.title }}
                </span>
              </div>
            </td>
            
            <td class="px-6 py-4">
              <a :href="b.url" target="_blank" class="text-blue-600 hover:text-blue-800 hover:underline truncate max-w-[250px] block" :title="b.url">
                {{ b.url }}
              </a>
            </td>
            
            <td class="px-6 py-4 text-gray-500">
              {{ formatDate(b.add_date) }}
            </td>
            
            <td class="px-6 py-4 flex items-center justify-center gap-2">
              <button 
                @click="copyUrl(b.id, b.url)"
                class="flex items-center justify-center w-8 h-8 rounded-lg border transition-colors focus:ring-2 focus:ring-blue-100"
                :class="copiedId === b.id ? 'bg-green-50 border-green-200 text-green-600' : 'bg-white border-gray-200 text-gray-500 hover:bg-gray-50 hover:text-gray-800'"
                :title="copiedId === b.id ? 'Copied!' : 'Copy Link'"
              >
                <Check v-if="copiedId === b.id" class="w-4 h-4" />
                <Copy v-else class="w-4 h-4" />
              </button>
              
              <button 
                @click="openDeleteModal(b)"
                class="flex items-center justify-center w-8 h-8 rounded-lg bg-white border border-red-100 text-red-500 hover:bg-red-50 focus:ring-2 focus:ring-red-100 transition-colors"
                title="Delete Bookmark"
              >
                <Trash2 class="w-4 h-4" />
              </button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>

  <!-- Delete Modal Dialog -->
  <div v-if="deleteModalOpen" class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/50 backdrop-blur-sm" @click.self="closeDeleteModal" v-cloak>
    <div class="bg-white rounded-2xl shadow-xl w-full max-w-sm overflow-hidden animate-in zoom-in-95 duration-200">
      <div class="p-6">
        <div class="w-12 h-12 rounded-full bg-red-100 text-red-600 flex items-center justify-center mb-4 mx-auto">
          <AlertTriangle class="w-6 h-6" />
        </div>
        <h3 class="text-xl font-bold text-center text-gray-900 mb-2">Delete Bookmark?</h3>
        <p class="text-center text-gray-500 text-sm mb-6">
          Are you sure you want to delete <span class="font-semibold text-gray-700">"{{ bookmarkToDelete?.title }}"</span>? This action cannot be undone.
        </p>
        
        <div class="flex gap-3">
          <button 
            @click="closeDeleteModal" 
            class="flex-1 px-4 py-2.5 bg-white border border-gray-300 text-gray-700 font-medium rounded-xl hover:bg-gray-50 transition-colors focus:ring-4 focus:ring-gray-100"
          >
            Cancel
          </button>
          <button 
            @click="confirmDelete" 
            :disabled="isDeleting"
            class="flex-1 px-4 py-2.5 bg-red-600 text-white font-medium rounded-xl hover:bg-red-700 transition-colors focus:ring-4 focus:ring-red-200 flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
          >
            <span v-if="isDeleting" class="animate-spin w-4 h-4 border-2 border-white/30 border-t-white rounded-full"></span>
            <span>{{ isDeleting ? 'Deleting...' : 'Delete' }}</span>
          </button>
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
