<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount } from 'vue';
import { Html5QrcodeScanner, Html5QrcodeScanType } from 'html5-qrcode';
import { 
  Scan, 
  ExternalLink, 
  Camera, 
  Upload, 
  RefreshCw,
  AlertCircle,
  CheckCircle2
} from 'lucide-vue-next';

const decodedText = ref('');
const isUrl = ref(false);
const scanner = ref<Html5QrcodeScanner | null>(null);
const error = ref('');

const onScanSuccess = (text: string) => {
  decodedText.value = text;
  isUrl.value = text.startsWith('http://') || text.startsWith('https://');
  
  if (isUrl.value) {
    // If it's a URL, notify and open it immediately
    window.location.href = text;
  }
  
  // Also stop scanner to prevent multiple scans
  if (scanner.value) {
    scanner.value.clear();
  }
};

const onScanFailure = (err: string) => {
  // Silent or small log, qr scanner errors often trigger rapidly
  console.warn(`Scan error: ${err}`);
};

const initScanner = () => {
    error.value = '';
    decodedText.value = '';
    
    setTimeout(() => {
        const config = { 
            fps: 10, 
            qrbox: { width: 250, height: 250 },
            rememberLastUsedCamera: true,
            supportedScanTypes: [Html5QrcodeScanType.SCAN_TYPE_CAMERA, Html5QrcodeScanType.SCAN_TYPE_FILE]
        };
        
        scanner.value = new Html5QrcodeScanner("reader", config, false);
        scanner.value.render(onScanSuccess, onScanFailure);
    }, 100);
};

const handleReset = () => {
  if (scanner.value) {
    scanner.value.clear();
    initScanner();
  }
};

onMounted(() => {
  initScanner();
});

onBeforeUnmount(() => {
  if (scanner.value) {
    scanner.value.clear();
  }
});
</script>

<template>
  <div class="w-full max-w-2xl mx-auto mt-6" v-cloak>
    <div class="bg-white/70 backdrop-blur-xl rounded-[40px] shadow-[0_20px_50px_rgba(0,0,0,0.05)] border border-white/50 p-8 md:p-10 relative overflow-hidden">
      
      <!-- Glow -->
      <div class="absolute -bottom-24 -left-24 w-64 h-64 bg-violet-100 rounded-full blur-3xl opacity-40 pointer-events-none"></div>

      <div class="mb-10 text-center relative z-10">
        <div class="inline-flex items-center justify-center w-16 h-16 rounded-[24px] bg-violet-50 text-violet-600 mb-6 shadow-inner">
          <Scan class="w-8 h-8" stroke-width="1.5" />
        </div>
        <h2 class="text-3xl font-black text-gray-900 tracking-tight mb-2">Beam Scan</h2>
        <p class="text-gray-500 text-sm font-medium uppercase tracking-widest leading-relaxed">Scan QR codes & direct-open links.</p>
      </div>

      <div class="relative z-10">
        <!-- Scanner Container -->
        <div id="reader" class="overflow-hidden rounded-[32px] border border-gray-100 bg-gray-50/50 shadow-inner min-h-[300px]"></div>

        <!-- Result Card (shown after scan) -->
        <div v-if="decodedText" class="mt-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div class="bg-violet-900 text-white p-6 rounded-[28px] shadow-2xl relative overflow-hidden">
                <div class="absolute top-0 right-0 p-4 opacity-20 capitalize text-[80px] font-black pointer-events-none -mr-10 -mt-10 select-none">
                    SCAN
                </div>
                
                <div class="flex items-center gap-3 mb-4">
                    <CheckCircle2 class="w-5 h-5 text-violet-300" />
                    <span class="text-[10px] font-black uppercase tracking-[2px] text-violet-300">Decoded Content</span>
                </div>

                <div class="font-mono text-lg break-all mb-6">
                    {{ decodedText }}
                </div>

                <div class="flex flex-col sm:flex-row gap-3">
                    <a v-if="isUrl" :href="decodedText" class="flex-1 flex items-center justify-center gap-2 bg-white text-violet-900 py-3 rounded-2xl font-bold hover:bg-violet-50 transition-all shadow-xl">
                        <ExternalLink class="w-4 h-4" /> Open Link
                    </a>
                    <button @click="handleReset" class="flex-1 flex items-center justify-center gap-2 bg-violet-800 text-violet-100 py-3 rounded-2xl font-bold hover:bg-violet-700 transition-all">
                        <RefreshCw class="w-4 h-4" /> Scan Again
                    </button>
                </div>
            </div>
        </div>

        <div v-if="!decodedText" class="mt-8 text-center bg-gray-50/30 py-4 rounded-2xl border border-dashed border-gray-200">
             <p class="text-[11px] font-bold text-gray-400 uppercase tracking-widest flex items-center justify-center gap-2">
                <Camera class="w-3.5 h-3.5" /> Aim at a QR Code or upload image
             </p>
        </div>
      </div>

    </div>
  </div>
</template>

<style>
/* Styling html5-qrcode internals to match our theme */
#reader {
    border: none !important;
}
#reader > div:first-child {
    border: none !important;
}
#reader__dashboard {
    padding: 24px !important;
    background: transparent !important;
}
#reader__status_span {
    display: none !important;
}
#reader__camera_selection {
    width: 100%;
    margin-bottom: 12px;
    padding: 8px 12px;
    border-radius: 12px;
    border: 1px solid #e5e7eb;
    outline: none;
    font-size: 14px;
}
#reader button {
    background-color: #111827 !important;
    color: white !important;
    border-radius: 14px !important;
    padding: 10px 20px !important;
    font-weight: 700 !important;
    border: none !important;
    font-size: 12px !important;
    text-transform: uppercase !important;
    letter-spacing: 1px !important;
    transition: transform 0.2s !important;
    cursor: pointer;
    margin: 5px;
}
#reader button:active {
    transform: scale(0.95);
}
#reader img {
    margin: 20px auto;
}
#reader__filescan_input {
    margin-bottom: 20px;
}
[v-cloak] {
  display: none;
}
</style>
