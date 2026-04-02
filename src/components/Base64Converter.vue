<script setup lang="ts">
import { ref, watch } from 'vue';
import { 
  ArrowLeftRight, 
  Copy, 
  Check, 
  UploadCloud, 
  FileText, 
  Image as ImageIcon, 
  Trash2, 
  Zap, 
  Download
} from 'lucide-vue-next';

const inputText = ref('');
const resultText = ref('');
const mode = ref<'encode' | 'decode'>('encode');
const fileInput = ref<File | null>(null);
const isCopied = ref(false);
const errorMsg = ref('');
const previewUrl = ref<string | null>(null);

const handleTextChange = () => {
  if (!inputText.value) {
    resultText.value = '';
    errorMsg.value = '';
    previewUrl.value = null;
    return;
  }

  try {
    if (mode.value === 'encode') {
      // If it looks like a Data URI already (from file upload), don't double-encode
      if (inputText.value.startsWith('data:')) {
          resultText.value = inputText.value;
      } else {
          resultText.value = btoa(inputText.value);
      }
      errorMsg.value = '';
    } else {
      let toDecode = inputText.value;
      // If decoding a Data URI, strip the prefix first to get raw text if possible, 
      // or just show preview if it's an image
      if (toDecode.startsWith('data:')) {
          previewUrl.value = toDecode;
          const commaIdx = toDecode.indexOf(',');
          if (commaIdx !== -1) toDecode = toDecode.substring(commaIdx + 1);
      } else {
          previewUrl.value = null;
      }

      const decoded = atob(toDecode);
      resultText.value = decoded;
      errorMsg.value = '';
    }
  } catch (e) {
    resultText.value = '';
    errorMsg.value = mode.value === 'decode' ? 'Invalid Base64 string.' : 'Encoding error.';
  }
};

const switchMode = () => {
  mode.value = mode.value === 'encode' ? 'decode' : 'encode';
  // Swap input and results
  const oldInput = inputText.value;
  inputText.value = resultText.value;
  resultText.value = oldInput;
  handleTextChange();
};

const handleFileUpload = (e: Event) => {
  const target = e.target as HTMLInputElement;
  if (target.files && target.files.length > 0) {
    const file = target.files[0];
    const reader = new FileReader();
    reader.onload = (event) => {
      const dataUrl = event.target?.result as string;
      mode.value = 'encode';
      inputText.value = dataUrl; // Put data URL in input
      handleTextChange(); // resultText will now also be the data URL (no double encode)
    };
    reader.readAsDataURL(file);
    fileInput.value = file;
  }
};

const copyToClipboard = async () => {
  if (!resultText.value) return;
  try {
    await navigator.clipboard.writeText(resultText.value);
    isCopied.value = true;
    setTimeout(() => isCopied.value = false, 2000);
  } catch (err) {
    console.error('Failed to copy!', err);
  }
};

const clearAll = () => {
  inputText.value = '';
  resultText.value = '';
  errorMsg.value = '';
  previewUrl.value = null;
  fileInput.value = null;
};

// Watch for manual input changes
watch(inputText, handleTextChange);

</script>

<template>
  <div class="w-full max-w-4xl mx-auto mt-6" v-cloak>
    <div class="bg-white/70 backdrop-blur-xl rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.06)] border border-white/50 p-8 relative overflow-hidden">
      
      <!-- Decorative Backdrop -->
      <div class="absolute -top-24 -left-24 w-48 h-48 bg-purple-100 rounded-full blur-3xl opacity-50 pointer-events-none"></div>
      <div class="absolute -bottom-24 -right-24 w-48 h-48 bg-blue-100 rounded-full blur-3xl opacity-50 pointer-events-none"></div>

      <div class="mb-10 text-center relative z-10">
        <div class="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-purple-50 text-purple-600 mb-5 shadow-inner">
          <Zap class="w-7 h-7" stroke-width="1.5" />
        </div>
        <h2 class="text-3xl font-bold text-gray-900 mb-2">Base64 Converter</h2>
        <p class="text-gray-500 text-[15px] leading-relaxed max-w-md mx-auto">Convert text or files to Base64 strings and vice-versa instantly.</p>
      </div>

      <!-- Toolbar -->
      <div class="flex flex-col sm:flex-row items-center justify-between gap-4 mb-6 relative z-10">
        <div class="flex bg-gray-100/80 p-1 rounded-xl w-full sm:w-auto">
          <button 
            @click="mode = 'encode'; handleTextChange()" 
            class="flex-1 sm:flex-none px-6 py-2 rounded-lg text-sm font-semibold transition-all"
            :class="mode === 'encode' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'"
          >
            Encode
          </button>
          <button 
            @click="mode = 'decode'; handleTextChange()" 
            class="flex-1 sm:flex-none px-6 py-2 rounded-lg text-sm font-semibold transition-all"
            :class="mode === 'decode' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'"
          >
            Decode
          </button>
        </div>

        <div class="flex items-center gap-2 w-full sm:w-auto">
          <label class="flex-1 sm:flex-none cursor-pointer flex items-center justify-center gap-2 px-4 py-2 bg-white border border-gray-200 text-gray-700 text-sm font-medium rounded-xl hover:bg-gray-50 transition-all shadow-sm">
            <UploadCloud class="w-4 h-4" />
            <span>Upload File</span>
            <input type="file" class="hidden" @change="handleFileUpload" />
          </label>
          <button @click="clearAll" class="p-2 text-gray-400 hover:text-red-500 transition-colors" title="Clear all">
            <Trash2 class="w-5 h-5" />
          </button>
        </div>
      </div>

      <!-- Main Interaction Area -->
      <div class="grid grid-cols-1 md:grid-cols-2 gap-6 relative z-10">
        
        <!-- Input Area -->
        <div class="flex flex-col gap-2">
          <label class="text-xs font-bold text-gray-400 uppercase tracking-wider px-1 flex items-center gap-2">
            Input {{ mode === 'encode' ? 'Text/File' : 'Base64' }}
          </label>
          <textarea 
            v-model="inputText"
            class="w-full h-64 p-5 bg-gray-50/50 border border-gray-200 rounded-2xl focus:ring-4 focus:ring-purple-100 focus:border-purple-300 transition-all outline-none resize-none font-mono text-sm leading-relaxed"
            placeholder="Paste or type here..."
          ></textarea>
        </div>

        <!-- Middle Switch Button (Absolute on Desktop, between columns on Mobile) -->
        <div class="flex items-center justify-center -my-3 md:my-0 md:absolute md:left-1/2 md:top-[60%] md:-translate-x-1/2 md:-translate-y-1/2 z-20">
          <button 
            @click="switchMode"
            class="w-12 h-12 bg-white border border-gray-200 rounded-full shadow-lg flex items-center justify-center text-gray-400 hover:text-purple-600 hover:border-purple-200 hover:rotate-180 transition-all duration-500 active:scale-90"
          >
            <ArrowLeftRight class="w-5 h-5" />
          </button>
        </div>

        <!-- Output Area -->
        <div class="flex flex-col gap-2">
          <div class="flex items-center justify-between px-1">
            <label class="text-xs font-bold text-gray-400 uppercase tracking-wider flex items-center gap-2">
              Result {{ mode === 'encode' ? 'Base64' : 'Text' }}
            </label>
            <div v-if="resultText.startsWith('data:')" class="animate-pulse flex items-center gap-1 text-[10px] font-bold text-emerald-500 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-100">
               <Zap class="w-3 h-3" /> Ready for &lt;img src="..." /&gt;
            </div>
            <button 
                v-if="resultText"
                @click="copyToClipboard"
                class="text-xs font-bold flex items-center gap-1.5 transition-colors"
                :class="isCopied ? 'text-green-600' : 'text-purple-600 hover:text-purple-800'"
            >
                <Check v-if="isCopied" class="w-3.5 h-3.5" />
                <Copy v-else class="w-3.5 h-3.5" />
                {{ isCopied ? 'Copied!' : 'Copy Result' }}
            </button>
          </div>
          
          <div class="relative h-64">
             <textarea 
                v-model="resultText"
                readonly
                class="w-full h-full p-5 bg-gray-50/80 border border-gray-200 rounded-2xl font-mono text-sm leading-relaxed outline-none resize-none text-gray-600"
                :class="{'text-red-500 bg-red-50/30 border-red-100': errorMsg}"
                placeholder="Output will appear here..."
            ></textarea>
            
            <!-- Error Popup inside output -->
             <div v-if="errorMsg" class="absolute inset-0 flex items-center justify-center p-8 text-center bg-red-50/90 rounded-2xl border border-red-200 animate-in fade-in duration-200">
                <p class="text-red-600 font-semibold text-sm">{{ errorMsg }}</p>
             </div>

             <!-- Image Preview Overlay -->
             <div v-if="previewUrl" class="absolute inset-0 flex flex-col items-center justify-center p-4 bg-white/95 rounded-2xl border border-gray-100 shadow-inner group overflow-hidden">
                <div class="text-[10px] uppercase font-bold text-gray-400 mb-2">Decoded Image Preview</div>
                <img :src="previewUrl" class="max-w-full max-h-[140px] rounded shadow-sm transition-transform group-hover:scale-105 duration-500" />
                <div class="mt-4 flex gap-2">
                    <a :href="previewUrl" download="decoded-image" class="px-3 py-1.5 bg-gray-900 text-white text-[11px] font-bold rounded-lg hover:bg-gray-800 transition-all flex items-center gap-1">
                        <Download class="w-3 h-3" /> Save Image
                    </a>
                    <button @click="previewUrl = null" class="px-3 py-1.5 bg-gray-100 text-gray-500 text-[11px] font-bold rounded-lg hover:bg-gray-200 transition-all">
                        Hide Preview
                    </button>
                </div>
             </div>
          </div>
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
