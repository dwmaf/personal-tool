<script setup lang="ts">
import { ref, onMounted, watch } from 'vue';
import QRCode from 'qrcode';
import { 
  QrCode as QrIcon, 
  Download, 
  Copy, 
  Check, 
  Trash2, 
  Settings2,
  Share2
} from 'lucide-vue-next';

const text = ref('https://dawam.dev');
const qrDataUrl = ref('');
const isCopied = ref(false);
const color = ref('#000000');
const bgColor = ref('#ffffff');
const margin = ref(4);
const size = ref(300);

const generateQR = async () => {
  if (!text.value) {
    qrDataUrl.value = '';
    return;
  }
  
  try {
    const url = await QRCode.toDataURL(text.value, {
      width: size.value,
      margin: margin.value,
      color: {
        dark: color.value,
        light: bgColor.value,
      },
    });
    qrDataUrl.value = url;
  } catch (err) {
    console.error(err);
  }
};

const copyToClipboard = async () => {
  if (!qrDataUrl.value) return;
  // Actually copying the image to clipboard is tricky across browsers, 
  // so we'll copy the data URL for now, or just focus on download.
  // Better: Copy the link text itself.
  await navigator.clipboard.writeText(text.value);
  isCopied.value = true;
  setTimeout(() => isCopied.value = false, 2000);
};

const downloadQR = () => {
  if (!qrDataUrl.value) return;
  const link = document.createElement('a');
  link.href = qrDataUrl.value;
  link.download = 'qrcode.png';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

onMounted(() => {
  generateQR();
});

// Auto-regenerate on changes
watch([text, color, bgColor, margin, size], () => {
  generateQR();
});

</script>

<template>
  <div class="w-full max-w-4xl mx-auto mt-6" v-cloak>
    <div class="bg-white/70 backdrop-blur-xl rounded-[40px] shadow-[0_20px_50px_rgba(0,0,0,0.05)] border border-white/50 p-8 md:p-12 relative overflow-hidden">
      
      <!-- Ambient Background -->
      <div class="absolute -top-24 -left-24 w-64 h-64 bg-emerald-100 rounded-full blur-3xl opacity-40 pointer-events-none"></div>

      <div class="mb-12 text-center relative z-10">
        <div class="inline-flex items-center justify-center w-16 h-16 rounded-[24px] bg-emerald-50 text-emerald-600 mb-6 shadow-inner">
          <QrIcon class="w-8 h-8" stroke-width="1.5" />
        </div>
        <h2 class="text-3xl font-black text-gray-900 tracking-tight mb-2">QR Wave</h2>
        <p class="text-gray-500 text-sm font-medium uppercase tracking-widest leading-relaxed">Turn links into scan-ready visuals.</p>
      </div>

      <div class="grid grid-cols-1 lg:grid-cols-2 gap-12 relative z-10">
        
        <!-- Left Side: Controls -->
        <div class="flex flex-col gap-8">
          <div class="flex flex-col gap-3">
            <label class="text-[11px] font-black text-gray-400 uppercase tracking-[2px] px-1 flex items-center gap-2">
                Your Link or Text
            </label>
            <input 
              v-model="text"
              type="text"
              class="w-full px-6 py-4 bg-gray-50/50 border border-gray-200 rounded-2xl focus:ring-4 focus:ring-emerald-100 focus:border-emerald-300 transition-all outline-none font-medium text-gray-700"
              placeholder="https://example.com"
            />
          </div>

          <div class="grid grid-cols-2 gap-6">
            <div class="flex flex-col gap-3 text-left">
                <label class="text-[10px] font-black text-gray-400 uppercase tracking-widest px-1">QR Color</label>
                <div class="flex items-center gap-3">
                    <input type="color" v-model="color" class="w-12 h-12 rounded-xl cursor-pointer border-0 bg-transparent overflow-hidden" />
                    <span class="text-xs font-mono text-gray-500 uppercase">{{ color }}</span>
                </div>
            </div>
            <div class="flex flex-col gap-3 text-left">
                <label class="text-[10px] font-black text-gray-400 uppercase tracking-widest px-1">Background</label>
                <div class="flex items-center gap-3">
                    <input type="color" v-model="bgColor" class="w-12 h-12 rounded-xl cursor-pointer border-0 bg-transparent overflow-hidden" />
                    <span class="text-xs font-mono text-gray-500 uppercase">{{ bgColor }}</span>
                </div>
            </div>
          </div>

          <div class="space-y-6 pt-4 border-t border-gray-100">
             <div class="flex flex-col gap-4">
                <div class="flex justify-between items-center">
                    <label class="text-[10px] font-black text-gray-400 uppercase tracking-widest">Margin</label>
                    <span class="text-xs font-bold text-emerald-600">{{ margin }}px</span>
                </div>
                <input type="range" v-model="margin" min="0" max="10" class="w-full h-1.5 bg-gray-100 rounded-lg appearance-none cursor-pointer accent-emerald-600" />
             </div>
          </div>
        </div>

        <!-- Right Side: Result -->
        <div class="flex flex-col items-center justify-center gap-8 relative">
          <div class="relative group p-4 bg-white rounded-[32px] shadow-2xl border border-gray-50 max-w-[340px] w-full aspect-square flex items-center justify-center overflow-hidden">
             
             <div v-if="!qrDataUrl" class="text-gray-300 flex flex-col items-center gap-3">
                <QrIcon class="w-12 h-12 opacity-20" />
                <p class="text-xs font-bold uppercase tracking-widest">Enter text to generate</p>
             </div>

             <img v-else :src="qrDataUrl" class="w-full h-full object-contain animate-in fade-in zoom-in duration-300" alt="Generated QR Code" />

             <!-- Floating info -->
             <div v-if="qrDataUrl" class="absolute inset-0 bg-emerald-900/40 backdrop-blur-sm opacity-0 group-hover:opacity-100 transition-all duration-300 flex items-center justify-center gap-3">
                <button @click="downloadQR" class="w-12 h-12 bg-white rounded-full flex items-center justify-center text-emerald-600 shadow-lg hover:scale-110 active:scale-95 transition-transform">
                    <Download class="w-5 h-5" />
                </button>
                <button @click="copyToClipboard" class="w-12 h-12 bg-white rounded-full flex items-center justify-center text-emerald-600 shadow-lg hover:scale-110 active:scale-95 transition-transform">
                    <component :is="isCopied ? Check : Share2" class="w-5 h-5" />
                </button>
             </div>
          </div>

          <div class="flex flex-col sm:flex-row gap-4 w-full max-w-[340px]">
            <button 
                @click="downloadQR"
                :disabled="!qrDataUrl"
                class="flex-1 flex items-center justify-center gap-2 px-6 py-4 bg-gray-900 text-white font-bold rounded-2xl hover:bg-gray-800 active:scale-95 transition-all shadow-xl shadow-gray-900/10 disabled:opacity-50"
            >
                <Download class="w-5 h-5" /> Download PNG
            </button>
          </div>

          <p class="text-[10px] text-gray-400 font-bold uppercase tracking-widest">Resolution: {{ size }}x{{ size }}px</p>
        </div>

      </div>

    </div>
  </div>
</template>

<style scoped>
[v-cloak] {
  display: none;
}
input[type="range"]::-webkit-slider-thumb {
  -webkit-appearance: none;
  height: 18px;
  width: 18px;
  border-radius: 50%;
  background: #10b981;
  cursor: pointer;
  box-shadow: 0 0 10px rgba(16, 185, 129, 0.3);
  border: 4px solid white;
}
</style>
