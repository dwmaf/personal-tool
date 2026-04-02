<script setup lang="ts">
import { Code2, Clock, Copy, Check, FileCode, ArrowLeft } from 'lucide-vue-next';
import { ref } from 'vue';

const props = defineProps<{
  snippet: {
    title: string;
    code: string;
    language: string;
    created_at: string;
  }
}>();

const isCopied = ref(false);

const copyCode = async () => {
  await navigator.clipboard.writeText(props.snippet.code);
  isCopied.value = true;
  setTimeout(() => isCopied.value = false, 2000);
};

const formatDate = (date: string) => {
  return new Date(date).toLocaleDateString('en-US', { 
    day: 'numeric', 
    month: 'long', 
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
};
</script>

<template>
  <div class="w-full max-w-5xl mx-auto mt-6">
    <div class="bg-white/70 backdrop-blur-xl rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.06)] border border-white/50 p-8 relative">
      
      <div class="mb-8 flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div class="flex items-start gap-4">
          <div class="w-12 h-12 rounded-2xl bg-orange-50 text-orange-600 flex items-center justify-center shrink-0">
            <FileCode class="w-6 h-6" />
          </div>
          <div>
            <a href="/code-sharer" class="inline-flex items-center gap-1.5 text-xs font-bold text-orange-500 hover:text-orange-600 transition-colors uppercase tracking-widest mb-1.5 group">
                <ArrowLeft class="w-3.5 h-3.5 group-hover:-translate-x-1 transition-transform" />
                Back to Shared Snippets
            </a>
            <h1 class="text-2xl font-bold text-gray-900 leading-tight">{{ snippet.title }}</h1>
            <div class="flex items-center gap-4 mt-1 text-sm text-gray-400 font-medium">
                <span class="flex items-center gap-1"><Clock class="w-3.5 h-3.5" /> {{ formatDate(snippet.created_at) }}</span>
                <span class="px-2 py-0.5 bg-gray-100 rounded-md uppercase text-[10px] tracking-widest text-gray-500">{{ snippet.language }}</span>
            </div>
          </div>
        </div>

        <button @click="copyCode" class="flex items-center justify-center gap-2 px-6 py-3 bg-white border border-gray-200 text-gray-900 font-bold rounded-2xl hover:bg-gray-50 transition-all shadow-sm">
            <component :is="isCopied ? Check : Copy" class="w-4 h-4" />
            {{ isCopied ? 'Code Copied!' : 'Copy Code' }}
        </button>
      </div>

      <div class="relative group">
        <div class="absolute -inset-0.5 bg-gradient-to-br from-orange-400/20 to-purple-400/20 rounded-[32px] blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
        <div class="relative bg-gray-900 rounded-[24px] overflow-hidden border border-gray-800 shadow-2xl">
            <!-- Mac style buttons -->
            <div class="px-6 py-4 border-b border-gray-800 flex items-center gap-2">
                <div class="w-3 h-3 rounded-full bg-red-400/50"></div>
                <div class="w-3 h-3 rounded-full bg-yellow-400/50"></div>
                <div class="w-3 h-3 rounded-full bg-green-400/50"></div>
                <div class="ml-4 text-[10px] text-gray-500 font-mono tracking-widest uppercase">{{ snippet.language }}</div>
            </div>
            <pre class="p-8 text-gray-100 font-mono text-sm leading-relaxed overflow-x-auto selection:bg-orange-500/30"><code>{{ snippet.code }}</code></pre>
        </div>
      </div>

      <div class="mt-12 text-center">
        <p class="text-xs font-bold text-gray-400 uppercase tracking-widest mb-4">You can also create your own toolkits</p>
        <a href="/" class="inline-flex px-8 py-3 bg-gray-100 text-gray-600 rounded-full font-bold text-sm hover:bg-gray-200 transition-all">
            Explore All Tools
        </a>
      </div>

    </div>
  </div>
</template>
