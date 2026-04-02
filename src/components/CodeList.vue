<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { createClient } from '@supabase/supabase-js';
import { 
  FileCode, 
  ExternalLink, 
  Copy, 
  Check, 
  Trash2, 
  Clock, 
  Search,
  Code2,
  AlertCircle
} from 'lucide-vue-next';

const supabaseUrl = import.meta.env.PUBLIC_SUPABASE_URL || '';
const supabaseKey = import.meta.env.PUBLIC_SUPABASE_KEY || '';
const supabase = (supabaseUrl && supabaseKey) ? createClient(supabaseUrl, supabaseKey) : null;

interface Snippet {
  id: string;
  title: string;
  code: string;
  language: string;
  created_at: string;
}

const snippets = ref<Snippet[]>([]);
const isLoading = ref(true);
const copiedId = ref<string | null>(null);

const fetchSnippets = async () => {
  if (!supabase) return;
  isLoading.value = true;
  const { data, error } = await supabase
    .from('snippets')
    .select('*')
    .order('created_at', { ascending: false });
    
  if (data) {
    snippets.value = data;
  }
  isLoading.value = false;
};

const deleteSnippet = async (id: string) => {
  if (!supabase || !confirm('Are you sure you want to delete this snippet?')) return;
  
  const { error } = await supabase
    .from('snippets')
    .delete()
    .eq('id', id);
    
  if (!error) {
    snippets.value = snippets.value.filter(s => s.id !== id);
  } else {
    alert('Failed to delete: ' + error.message);
  }
};

const copyLink = async (id: string) => {
  const link = `${window.location.origin}/snippets/${id}`;
  await navigator.clipboard.writeText(link);
  copiedId.value = id;
  setTimeout(() => copiedId.value = null, 2000);
};

const formatDate = (date: string) => {
  const d = new Date(date);
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
};

onMounted(() => {
  fetchSnippets();
  // Listen for new snippets created by CodeCreator
  window.addEventListener('snippet-created', fetchSnippets);
});
</script>

<template>
  <div class="w-full max-w-5xl mx-auto mt-12 mb-24" v-cloak>
    <div class="flex items-center justify-between mb-8 px-4">
      <div class="flex items-center gap-3">
        <div class="w-10 h-10 rounded-xl bg-orange-100 text-orange-600 flex items-center justify-center shadow-sm">
          <Code2 class="w-5 h-5" />
        </div>
        <h2 class="text-xl font-bold text-gray-900">Your Shared Snippets</h2>
      </div>
      <button @click="fetchSnippets" class="text-sm font-medium text-gray-400 hover:text-gray-600 transition-colors uppercase tracking-widest flex items-center gap-2">
        <Search class="w-4 h-4" /> Refresh
      </button>
    </div>

    <!-- Loading State -->
    <div v-if="isLoading" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-pulse px-4">
      <div v-for="i in 3" :key="i" class="h-48 bg-gray-100 rounded-3xl border border-gray-200"></div>
    </div>

    <!-- Empty State -->
    <div v-else-if="snippets.length === 0" class="flex flex-col items-center justify-center py-20 bg-white/50 backdrop-blur-sm rounded-[40px] border border-dashed border-gray-200 mx-4">
        <div class="p-4 bg-gray-50 rounded-full mb-4">
            <AlertCircle class="w-8 h-8 text-gray-300" />
        </div>
        <p class="text-gray-400 font-medium tracking-wide">No snippets yet. Create your first one above!</p>
    </div>

    <!-- Grid List -->
    <div v-else class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 px-4">
      <div 
        v-for="s in snippets" 
        :key="s.id"
        class="group bg-white/80 backdrop-blur-xl border border-white hover:border-orange-200 p-6 rounded-[32px] shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 relative overflow-hidden flex flex-col"
      >
        <div class="flex items-start justify-between mb-4">
          <div class="p-3 bg-gray-50 rounded-2xl text-gray-400 transition-colors group-hover:bg-orange-50 group-hover:text-orange-500">
            <FileCode class="w-6 h-6" />
          </div>
          <div class="flex items-center gap-1.5 text-[10px] font-bold text-gray-300 uppercase tracking-widest">
            <Clock class="w-3 h-3" /> {{ formatDate(s.created_at) }}
          </div>
        </div>

        <h3 class="text-lg font-bold text-gray-900 mb-1 line-clamp-1 group-hover:text-orange-600 transition-colors">{{ s.title }}</h3>
        <p class="text-xs font-mono text-gray-400 mb-6 flex items-center gap-2">
            <span class="w-2 h-2 rounded-full bg-orange-400"></span> {{ s.language }}
        </p>

        <div class="mt-auto flex items-center gap-2 pt-4 border-t border-gray-50">
          <a 
            :href="'/snippets/' + s.id" 
            class="flex-1 flex items-center justify-center py-2.5 bg-gray-900 text-white text-xs font-bold rounded-xl hover:bg-gray-800 transition-all shadow-md shadow-gray-900/10"
          >
            View Code
          </a>
          <button 
            @click="copyLink(s.id)"
            class="p-2.5 bg-white border border-gray-100 text-gray-500 rounded-xl hover:bg-gray-50 hover:text-orange-600 transition-all shadow-sm"
            :title="copiedId === s.id ? 'Copied!' : 'Copy Link'"
          >
            <component :is="copiedId === s.id ? Check : Copy" class="w-4 h-4" />
          </button>
          <button 
            @click="deleteSnippet(s.id)"
            class="p-2.5 bg-white border border-gray-100 text-gray-300 rounded-xl hover:bg-red-50 hover:text-red-500 transition-all shadow-sm"
            title="Delete"
          >
            <Trash2 class="w-4 h-4" />
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
