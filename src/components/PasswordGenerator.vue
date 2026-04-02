<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { 
  Key, 
  Copy, 
  Check, 
  RefreshCw, 
  ShieldCheck, 
  ShieldAlert,
  Shield
} from 'lucide-vue-next';

const password = ref('');
const length = ref(16);
const includeUppercase = ref(true);
const includeLowercase = ref(true);
const includeNumbers = ref(true);
const includeSymbols = ref(true);
const isCopied = ref(false);

const generatePassword = () => {
  const uppercase = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  const lowercase = 'abcdefghijklmnopqrstuvwxyz';
  const numbers = '0123456789';
  const symbols = '!@#$%^&*()_+~`|}{[]:;?><,./-=';
  
  let charset = '';
  if (includeUppercase.value) charset += uppercase;
  if (includeLowercase.value) charset += lowercase;
  if (includeNumbers.value) charset += numbers;
  if (includeSymbols.value) charset += symbols;
  
  if (!charset) {
    password.value = 'Please select at least one option';
    return;
  }
  
  let generated = '';
  for (let i = 0; i < length.value; i++) {
    const randomIndex = Math.floor(Math.random() * charset.length);
    generated += charset[randomIndex];
  }
  password.value = generated;
};

const copyToClipboard = async () => {
  if (!password.value || password.value.includes('Please select')) return;
  await navigator.clipboard.writeText(password.value);
  isCopied.value = true;
  setTimeout(() => isCopied.value = false, 2000);
};

const getStrength = () => {
    if (password.value.length < 8) return { label: 'Weak', color: 'text-red-500', bg: 'bg-red-500' };
    
    let score = 0;
    if (includeUppercase.value) score++;
    if (includeLowercase.value) score++;
    if (includeNumbers.value) score++;
    if (includeSymbols.value) score++;
    
    if (length.value >= 16 && score >= 3) return { label: 'Very Strong', color: 'text-emerald-500', bg: 'bg-emerald-500' };
    if (length.value >= 12 && score >= 3) return { label: 'Strong', color: 'text-blue-500', bg: 'bg-blue-500' };
    if (length.value >= 10 && score >= 2) return { label: 'Medium', color: 'text-yellow-500', bg: 'bg-yellow-500' };
    return { label: 'Weak', color: 'text-red-500', bg: 'bg-red-500' };
};

onMounted(() => {
  generatePassword();
});
</script>

<template>
  <div class="w-full max-w-xl mx-auto mt-6" v-cloak>
    <div class="bg-white/70 backdrop-blur-xl rounded-[40px] shadow-[0_20px_50px_rgba(0,0,0,0.05)] border border-white/50 p-10 relative overflow-hidden">
      
      <!-- Ambient Glow -->
      <div class="absolute -top-24 -right-24 w-64 h-64 bg-blue-100 rounded-full blur-3xl opacity-40 pointer-events-none"></div>

      <div class="mb-10 text-center relative z-10">
        <div class="inline-flex items-center justify-center w-16 h-16 rounded-[24px] bg-blue-50 text-blue-600 mb-6 shadow-inner">
          <Key class="w-8 h-8" stroke-width="1.5" />
        </div>
        <h2 class="text-3xl font-black text-gray-900 tracking-tight mb-2">Shield Pass</h2>
        <p class="text-gray-500 text-sm font-medium uppercase tracking-widest px-4 leading-relaxed">Secure, Random, and Instant.</p>
      </div>

      <!-- Result Display -->
      <div class="relative mb-8 group">
        <div class="absolute -inset-1 bg-gradient-to-r from-blue-400 to-indigo-400 rounded-3xl blur opacity-10 group-hover:opacity-20 transition-opacity"></div>
        <div class="relative bg-gray-50/50 border border-gray-200 rounded-3xl p-6 flex flex-col items-center gap-4 shadow-inner">
            <div 
                class="w-full text-center font-mono text-2xl md:text-3xl break-all min-h-[40px] px-4 selection:bg-blue-100"
                :class="password.includes('Please select') ? 'text-gray-300 text-sm mt-2' : 'text-gray-900'"
            >
                {{ password }}
            </div>
            
            <div v-if="!password.includes('Please select')" class="flex items-center gap-4 w-full pt-4 border-t border-gray-100/50">
                <div class="flex-1 flex items-center gap-2">
                    <component :is="getStrength().label === 'Very Strong' ? ShieldCheck : getStrength().label === 'Weak' ? ShieldAlert : Shield" class="w-4 h-4" :class="getStrength().color" />
                    <span class="text-[10px] font-bold uppercase tracking-widest" :class="getStrength().color">{{ getStrength().label }}</span>
                    <!-- Simple bar -->
                    <div class="flex-1 h-1 bg-gray-100 rounded-full overflow-hidden">
                        <div 
                            class="h-full transition-all duration-500" 
                            :class="getStrength().bg"
                            :style="{ width: getStrength().label === 'Very Strong' ? '100%' : getStrength().label === 'Strong' ? '75%' : getStrength().label === 'Medium' ? '50%' : '25%' }"
                        ></div>
                    </div>
                </div>

                <div class="flex items-center gap-2">
                    <button @click="generatePassword" class="p-2 text-gray-400 hover:text-blue-500 transition-colors" title="Regenerate">
                        <RefreshCw class="w-5 h-5" />
                    </button>
                    <button 
                        @click="copyToClipboard" 
                        class="flex items-center gap-2 px-5 py-2.5 bg-gray-900 text-white text-xs font-bold rounded-xl hover:bg-gray-800 active:scale-95 transition-all shadow-lg shadow-gray-900/10"
                    >
                        <component :is="isCopied ? Check : Copy" class="w-3.5 h-3.5" />
                        {{ isCopied ? 'Copied' : 'Copy' }}
                    </button>
                </div>
            </div>
        </div>
      </div>

      <!-- Controls -->
      <div class="space-y-8 relative z-10">
        <div>
            <div class="flex justify-between items-center mb-4 px-1">
                <label class="text-[11px] font-black text-gray-400 uppercase tracking-[2px]">Length: <span class="text-blue-600 font-mono text-sm ml-1">{{ length }}</span></label>
            </div>
            <input 
                type="range" v-model="length" min="4" max="64" @input="generatePassword"
                class="w-full h-1.5 bg-gray-100 rounded-lg appearance-none cursor-pointer accent-blue-600"
            />
        </div>

        <div class="grid grid-cols-2 gap-4">
            <label class="group cursor-pointer">
                <input type="checkbox" v-model="includeUppercase" @change="generatePassword" class="hidden" />
                <div 
                    class="p-4 rounded-2xl border-2 transition-all flex flex-col gap-1 shadow-sm"
                    :class="includeUppercase ? 'bg-blue-50/50 border-blue-200 ring-2 ring-blue-50' : 'bg-white border-gray-100 hover:border-gray-200'"
                >
                    <span class="text-[10px] font-bold uppercase tracking-widest" :class="includeUppercase ? 'text-blue-600' : 'text-gray-400'">ABC</span>
                    <span class="text-xs font-bold" :class="includeUppercase ? 'text-blue-900' : 'text-gray-600'">Uppercase</span>
                </div>
            </label>

            <label class="group cursor-pointer">
                <input type="checkbox" v-model="includeLowercase" @change="generatePassword" class="hidden" />
                <div 
                    class="p-4 rounded-2xl border-2 transition-all flex flex-col gap-1 shadow-sm"
                    :class="includeLowercase ? 'bg-blue-50/50 border-blue-200 ring-2 ring-blue-50' : 'bg-white border-gray-100 hover:border-gray-200'"
                >
                    <span class="text-[10px] font-bold uppercase tracking-widest" :class="includeLowercase ? 'text-blue-600' : 'text-gray-400'">abc</span>
                    <span class="text-xs font-bold" :class="includeLowercase ? 'text-blue-900' : 'text-gray-600'">Lowercase</span>
                </div>
            </label>

            <label class="group cursor-pointer">
                <input type="checkbox" v-model="includeNumbers" @change="generatePassword" class="hidden" />
                <div 
                    class="p-4 rounded-2xl border-2 transition-all flex flex-col gap-1 shadow-sm"
                    :class="includeNumbers ? 'bg-blue-50/50 border-blue-200 ring-2 ring-blue-50' : 'bg-white border-gray-100 hover:border-gray-200'"
                >
                    <span class="text-[10px] font-bold uppercase tracking-widest" :class="includeNumbers ? 'text-blue-600' : 'text-gray-400'">123</span>
                    <span class="text-xs font-bold" :class="includeNumbers ? 'text-blue-900' : 'text-gray-600'">Numbers</span>
                </div>
            </label>

            <label class="group cursor-pointer">
                <input type="checkbox" v-model="includeSymbols" @change="generatePassword" class="hidden" />
                <div 
                    class="p-4 rounded-2xl border-2 transition-all flex flex-col gap-1 shadow-sm"
                    :class="includeSymbols ? 'bg-blue-50/50 border-blue-200 ring-2 ring-blue-50' : 'bg-white border-gray-100 hover:border-gray-200'"
                >
                    <span class="text-[10px] font-bold uppercase tracking-widest" :class="includeSymbols ? 'text-blue-600' : 'text-gray-400'">#$&</span>
                    <span class="text-xs font-bold" :class="includeSymbols ? 'text-blue-900' : 'text-gray-600'">Symbols</span>
                </div>
            </label>
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
  height: 20px;
  width: 20px;
  border-radius: 50%;
  background: #2563eb;
  cursor: pointer;
  box-shadow: 0 0 10px rgba(37, 99, 235, 0.3);
  border: 4px solid white;
}
</style>
