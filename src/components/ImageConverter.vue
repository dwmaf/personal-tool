<script setup lang="ts">
import { ref } from 'vue';
import { Image as ImageIcon, CheckCircle2, XCircle, Download, Loader2, UploadCloud, FileImage, RefreshCw } from 'lucide-vue-next';

const file = ref<File | null>(null);
const previewUrl = ref<string>('');
const isConverting = ref(false);
const errorMsg = ref('');
const resultBlobUrl = ref<string | null>(null);
const resultFilename = ref<string>('');
const fileStats = ref({ originalSize: 0, newSize: 0 });

const formatBytes = (bytes: number, decimals = 2) => {
    if (!+bytes) return '0 Bytes';
    const k = 1024;
    const dm = decimals < 0 ? 0 : decimals;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return `${parseFloat((bytes / Math.pow(k, i)).toFixed(dm))} ${sizes[i]}`;
};

const handleFileChange = (e: Event) => {
  const target = e.target as HTMLInputElement;
  if (target.files && target.files.length > 0) {
    const selected = target.files[0];
    
    // Basic validation
    if (!['image/png', 'image/jpeg', 'image/jpg', 'image/webp'].includes(selected.type)) {
      errorMsg.value = "Please select a valid PNG, JPG, or WebP image.";
      file.value = null;
      return;
    }
    
    file.value = selected;
    errorMsg.value = '';
    resultBlobUrl.value = null;
    fileStats.value.originalSize = selected.size;
    
    if (previewUrl.value) URL.revokeObjectURL(previewUrl.value);
    previewUrl.value = URL.createObjectURL(selected);
  } else {
    reset();
  }
};

const reset = () => {
    file.value = null;
    errorMsg.value = '';
    resultFilename.value = '';
    resultBlobUrl.value = null;
    if (previewUrl.value) {
        URL.revokeObjectURL(previewUrl.value);
        previewUrl.value = '';
    }
};

const handleConvert = async () => {
  if (!file.value) return;
  
  isConverting.value = true;
  errorMsg.value = '';
  resultBlobUrl.value = null;

  try {
    const formData = new FormData();
    formData.append('image', file.value);

    const response = await fetch('/api/convert', {
      method: 'POST',
      body: formData
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error || 'Server conversion failed');
    }

    const blob = await response.blob();
    const originalName = file.value.name.replace(/\.[^/.]+$/, "");
    
    resultFilename.value = `${originalName}.avif`;
    resultBlobUrl.value = URL.createObjectURL(blob);
    fileStats.value.newSize = blob.size;
    
  } catch (err: any) {
    errorMsg.value = err.message || 'An error occurred during conversion.';
  } finally {
    isConverting.value = false;
  }
};

</script>

<template>
  <div class="w-full max-w-xl mx-auto mt-6" v-cloak>
    <div class="bg-white/70 backdrop-blur-xl rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.06)] border border-white/50 p-8 pt-10 relative overflow-hidden">
      
      <!-- Decorative Element -->
      <div class="absolute -top-24 -right-24 w-48 h-48 bg-emerald-100 rounded-full blur-3xl opacity-50 pointer-events-none"></div>

      <div class="mb-8 text-center relative z-10">
        <div class="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-emerald-50 text-emerald-600 mb-5 shadow-inner">
          <ImageIcon class="w-7 h-7" stroke-width="1.5" />
        </div>
        <h2 class="text-3xl font-bold text-gray-900 mb-2">Convert to AVIF</h2>
        <p class="text-gray-500 text-[15px] leading-relaxed max-w-sm mx-auto">Optimize your PNG or JPG images by converting them to AVIF without losing quality.</p>
      </div>
      
      <!-- Stage 1: Upload or Preview -->
      <form v-if="!resultBlobUrl" @submit.prevent="handleConvert" class="flex flex-col gap-6 relative z-10">
        
        <div class="relative group">
            <label for="image-file" class="flex flex-col items-center justify-center w-full h-56 border-2 border-dashed border-gray-300 rounded-3xl cursor-pointer bg-gray-50/50 hover:bg-emerald-50/50 hover:border-emerald-400 transition-all duration-300 overflow-hidden relative">
                
                <!-- Initial State -->
                <div v-if="!previewUrl" class="flex flex-col items-center justify-center pt-5 pb-6 text-center px-4 w-full h-full relative z-10">
                    <UploadCloud class="w-12 h-12 mb-4 text-gray-400 group-hover:text-emerald-500 transition-colors" stroke-width="1.5" />
                    <p class="mb-1 text-sm text-gray-700 font-medium">Click to upload an image</p>
                    <p class="text-xs text-gray-400 mt-1">PNG, JPG or WebP (Max 10MB)</p>
                </div>

                <!-- Preview State -->
                <div v-else class="absolute inset-0 w-full h-full relative">
                    <img :src="previewUrl" class="w-full h-full object-contain p-2 blur-sm opacity-20" />
                    <img :src="previewUrl" class="absolute inset-0 w-full h-full object-contain p-6 scale-95 group-hover:scale-100 transition-transform duration-500" />
                    
                    <!-- Overlay Detail -->
                    <div class="absolute bottom-4 left-4 right-4 bg-gray-900/80 backdrop-blur-md text-white px-4 py-2.5 rounded-xl shadow-lg flex items-center justify-between text-sm mx-auto max-w-[90%]">
                        <div class="flex items-center gap-2 overflow-hidden">
                            <FileImage class="w-4 h-4 shrink-0 text-emerald-400" />
                            <span class="truncate font-medium">{{ file?.name }}</span>
                        </div>
                        <span class="shrink-0 text-gray-300 text-xs font-mono ml-2">{{ formatBytes(file?.size || 0) }}</span>
                    </div>
                </div>

                <input id="image-file" type="file" accept="image/png, image/jpeg, image/webp" class="hidden" @change="handleFileChange" />
            </label>
            
            <button v-if="previewUrl" @click.prevent="reset" class="absolute -top-3 -right-3 w-8 h-8 bg-white border border-gray-200 shadow-md text-gray-500 hover:text-red-500 hover:border-red-200 rounded-full flex items-center justify-center transition-colors z-20" title="Remove image">
                <XCircle class="w-5 h-5" />
            </button>
        </div>
        
        <!-- Error Message -->
         <div v-if="errorMsg" class="text-sm font-medium flex items-start gap-2 text-red-600 bg-red-50 p-4 rounded-xl border border-red-100">
          <AlertTriangle class="w-5 h-5 shrink-0 mt-0.5" />
          <span class="leading-relaxed">{{ errorMsg }}</span>
        </div>

        <button type="submit" :disabled="isConverting || !file" class="relative overflow-hidden w-full px-5 py-4 bg-gray-900 text-white font-semibold rounded-2xl hover:bg-gray-800 focus:outline-none focus:ring-4 focus:ring-gray-200 transition-all duration-300 shadow-xl shadow-gray-900/20 disabled:opacity-70 disabled:cursor-not-allowed group">
          <span class="relative z-10 flex items-center justify-center gap-2 text-base">
            <span v-if="!isConverting">Convert Magic ✨</span>
            <span v-else>Converting to AVIF...</span>
            <Loader2 v-if="isConverting" class="w-5 h-5 animate-spin ml-1" />
          </span>
        </button>
      </form>

      <!-- Stage 2: Success & Download Result -->
      <div v-else class="flex flex-col items-center justify-center relative z-10 animate-in fade-in slide-in-from-bottom-4 duration-500">
        
        <div class="w-20 h-20 bg-emerald-100 rounded-full flex items-center justify-center mb-6 text-emerald-600 shadow-inner">
            <CheckCircle2 class="w-10 h-10" stroke-width="1.5" />
        </div>
        
        <h3 class="text-2xl font-bold text-gray-900 mb-1">Conversion Complete!</h3>
        <p class="text-xs font-mono text-emerald-600 bg-emerald-50 px-3 py-1 rounded-full mb-3">{{ resultFilename }}</p>
        <p class="text-gray-500 text-sm mb-6 text-center max-w-xs">Your image has been optimized into next-gen AVIF format.</p>
        
        <div class="w-full bg-gray-50 border border-gray-100 rounded-2xl p-5 mb-8">
            <div class="flex items-center justify-between text-sm mb-3 text-gray-600 border-b border-gray-200 pb-3">
                <span>Original Size</span>
                <span class="font-mono font-medium text-gray-900">{{ formatBytes(fileStats.originalSize) }}</span>
            </div>
            <div class="flex items-center justify-between text-sm text-emerald-700 font-medium">
                <span>AVIF Size</span>
                <div class="flex items-center gap-2">
                    <span class="px-2 pb-[1px] rounded bg-emerald-100 text-[11px] font-bold text-emerald-800 tracking-wider">
                       -{{ Math.round((1 - fileStats.newSize / fileStats.originalSize) * 100) }}%
                    </span>
                    <span class="font-mono">{{ formatBytes(fileStats.newSize) }}</span>
                </div>
            </div>
        </div>

        <div class="flex flex-col sm:flex-row w-full gap-3">
            <a 
                :href="resultBlobUrl" 
                :download="resultFilename"
                class="flex-1 flex items-center justify-center gap-2 px-5 py-3.5 bg-emerald-600 text-white font-semibold rounded-xl hover:bg-emerald-700 focus:outline-none focus:ring-4 focus:ring-emerald-200 transition-all shadow-lg shadow-emerald-600/20"
            >
                <Download class="w-5 h-5" /> Download AVIF
            </a>
            <button 
                @click="reset"
                class="flex-none flex items-center justify-center gap-2 px-6 py-3.5 bg-white border border-gray-200 text-gray-700 font-semibold rounded-xl hover:bg-gray-50 focus:outline-none focus:ring-4 focus:ring-gray-100 transition-all"
            >
                <RefreshCw class="w-4 h-4 text-gray-400" /> New
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
