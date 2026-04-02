<script setup lang="ts">
import { ref } from 'vue';
import { createClient } from '@supabase/supabase-js';
import { Code2, Save, Copy, Check, Share2, Loader2, Trash2 } from 'lucide-vue-next';

const supabaseUrl = import.meta.env.PUBLIC_SUPABASE_URL || '';
const supabaseKey = import.meta.env.PUBLIC_SUPABASE_KEY || '';
const supabase = (supabaseUrl && supabaseKey) ? createClient(supabaseUrl, supabaseKey) : null;

const code = ref('');
const title = ref('');
const language = ref('javascript');
const isSaving = ref(false);
const shareLink = ref('');
const isCopied = ref(false);

const languages = [
  { value: 'javascript', label: 'JavaScript / TS' },
  { value: 'html', label: 'HTML' },
  { value: 'css', label: 'CSS' },
  { value: 'python', label: 'Python' },
  { value: 'php', label: 'PHP' },
  { value: 'sql', label: 'SQL' },
  { value: 'markdown', label: 'Markdown' },
];

const handleSave = async () => {
  if (!supabase || !code.value) return;

  isSaving.value = true;
  try {
    const { data, error } = await supabase
      .from('snippets')
      .insert([
        { 
          code: code.value, 
          title: title.value || 'Untitled Snippet', 
          language: language.value 
        }
      ])
      .select()
      .single();

    if (error) throw error;

    // Generate full URL
    const baseUrl = window.location.origin;
    shareLink.value = `${baseUrl}/snippets/${data.id}`;
    
    // Trigger list refresh
    window.dispatchEvent(new CustomEvent('snippet-created'));
  } catch (err) {
    alert('Failed to save snippet: ' + (err as any).message);
  } finally {
    isSaving.value = false;
  }
};

const copyLink = async () => {
  if (!shareLink.value) return;
  await navigator.clipboard.writeText(shareLink.value);
  isCopied.value = true;
  setTimeout(() => isCopied.value = false, 2000);
};

const reset = () => {
  code.value = '';
  title.value = '';
  shareLink.value = '';
};
</script>

<template>
  <div class="w-full max-w-5xl mx-auto mt-6" v-cloak>
    <div class="bg-white/70 backdrop-blur-xl rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.06)] border border-white/50 p-8 relative overflow-hidden">
      
      <!-- Stage 1: Input Code -->
      <div v-if="!shareLink">
        <div class="mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div class="flex items-center gap-4">
            <div class="w-12 h-12 rounded-2xl bg-orange-50 text-orange-600 flex items-center justify-center shadow-inner">
              <Code2 class="w-6 h-6" />
            </div>
            <div>
              <h2 class="text-2xl font-bold text-gray-900">Create New Snippet</h2>
              <p class="text-sm text-gray-500">Paste your code and share the link instantly.</p>
            </div>
          </div>
          
          <div class="flex gap-2">
             <select v-model="language" class="bg-white border border-gray-200 rounded-xl px-4 py-2 text-sm font-medium outline-none focus:ring-2 focus:ring-orange-100 transition-all">
                <option v-for="lang in languages" :key="lang.value" :value="lang.value">{{ lang.label }}</option>
             </select>
          </div>
        </div>

        <div class="flex flex-col gap-4">
          <input 
            v-model="title" 
            type="text" 
            placeholder="Give it a title (optional)..." 
            class="w-full px-5 py-3 rounded-2xl border border-gray-200 bg-gray-50/50 outline-none focus:ring-4 focus:ring-orange-50 focus:border-orange-200 transition-all font-semibold"
          />
          
          <textarea 
            v-model="code"
            class="w-full h-[400px] p-6 bg-gray-900 text-gray-100 rounded-3xl font-mono text-sm leading-relaxed resize-none outline-none border border-gray-800 shadow-inner"
            placeholder="// Paste your magic code here..."
          ></textarea>

          <button 
            @click="handleSave"
            :disabled="isSaving || !code"
            class="mt-2 w-full py-4 bg-gray-900 text-white font-bold rounded-2xl hover:bg-gray-800 transition-all shadow-xl shadow-gray-900/10 flex items-center justify-center gap-2 disabled:opacity-50"
          >
            <span v-if="!isSaving" class="flex items-center gap-2">
              <Save class="w-5 h-5" /> Save & Get Link
            </span>
            <span v-else class="flex items-center gap-2">
              <Loader2 class="w-5 h-5 animate-spin" /> Saving...
            </span>
          </button>
        </div>
      </div>

      <!-- Stage 2: Shared Success -->
      <div v-else class="py-12 flex flex-col items-center justify-center text-center animate-in fade-in zoom-in duration-300">
        <div class="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mb-6 text-green-600">
            <Share2 class="w-10 h-10" />
        </div>
        <h3 class="text-3xl font-bold text-gray-900 mb-2">Code Shared!</h3>
        <p class="text-gray-500 mb-8 max-w-sm">Anyone with this link can now view your beautifully formatted code.</p>

        <div class="w-full max-w-md bg-white border border-gray-100 p-2 rounded-2xl shadow-sm flex items-center gap-2 mb-8">
            <input readonly :value="shareLink" class="flex-1 bg-transparent px-4 py-2 text-sm font-mono text-gray-600 outline-none" />
            <button @click="copyLink" class="bg-gray-900 text-white px-5 py-2 rounded-xl text-sm font-bold flex items-center gap-2 hover:bg-gray-800 transition-all">
                <component :is="isCopied ? Check : Copy" class="w-4 h-4" />
                {{ isCopied ? 'Copied' : 'Copy Link' }}
            </button>
        </div>

        <button @click="reset" class="text-sm font-bold text-gray-400 hover:text-gray-600 transition-colors uppercase tracking-widest">
            Create another one
        </button>
      </div>

    </div>
  </div>
</template>

<style scoped>
[v-cloak] {
  display: none;
}
</style>
