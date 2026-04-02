<script setup lang="ts">
import { Bookmark, Image as ImageIcon, Zap, Share2, Key, QrCode, ScanLine } from 'lucide-vue-next';

const tools = [
  {
    name: 'Bookmark Sync',
    description: 'Extract and back up your Brave bookmarks directly to Supabase.',
    href: '/bookmarks',
    icon: Bookmark,
    color: 'bg-blue-50 text-blue-600',
    borderColor: 'group-hover:border-blue-400',
    hoverBg: 'hover:bg-blue-50/50'
  },
  {
    name: 'Image Converter',
    description: 'Convert PNG/JPG images to AVIF format blazingly fast in the cloud.',
    href: '/image-converter',
    icon: ImageIcon,
    color: 'bg-emerald-50 text-emerald-600',
    borderColor: 'group-hover:border-emerald-400',
    hoverBg: 'hover:bg-emerald-50/50'
  },
  {
    name: 'Base64 Converter',
    description: 'Convert text or files to Base64 strings and vice-versa instantly.',
    href: '/base64-converter',
    icon: Zap,
    color: 'bg-purple-50 text-purple-600',
    borderColor: 'group-hover:border-purple-400',
    hoverBg: 'hover:bg-purple-50/50'
  },
  {
    name: 'Code Sharer',
    description: 'Save and share code snippets with your team via unique secure links.',
    href: '/code-sharer',
    icon: Share2,
    color: 'bg-orange-50 text-orange-600',
    borderColor: 'group-hover:border-orange-400',
    hoverBg: 'hover:bg-orange-50/50'
  },
  {
    name: 'Password Generator',
    description: 'Generate rock-solid passwords with customizable strength and security.',
    href: '/password-generator',
    icon: Key,
    color: 'bg-cyan-50 text-cyan-600',
    borderColor: 'group-hover:border-cyan-400',
    hoverBg: 'hover:bg-cyan-50/50'
  },
  {
    name: 'QR Wave',
    description: 'Generate scan-ready QR codes for links, text, or any data instantly.',
    href: '/qr-generator',
    icon: QrCode,
    color: 'bg-emerald-50 text-emerald-600',
    borderColor: 'group-hover:border-emerald-400',
    hoverBg: 'hover:bg-emerald-50/50'
  },
  {
    name: 'Beam Scan',
    description: 'Instantly scan QR codes and open links directly in your browser.',
    href: '/qr-scanner',
    icon: ScanLine,
    color: 'bg-violet-50 text-violet-600',
    borderColor: 'group-hover:border-violet-400',
    hoverBg: 'hover:bg-violet-50/50'
  }
];
</script>

<template>
  <div class="w-full max-w-5xl grid grid-cols-1 md:grid-cols-2 gap-6" v-cloak>
    <a 
      v-for="tool in tools" 
      :key="tool.name"
      :href="tool.href"
      class="group bg-white/70 backdrop-blur-xl rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.06)] border border-white/50 p-8 transition-all duration-300 hover:-translate-y-1 relative overflow-hidden"
      :class="[tool.borderColor, tool.hoverBg]"
    >
      <div class="flex flex-col h-full relative z-10">
        <div :class="['w-14 h-14 rounded-2xl flex items-center justify-center mb-6 shadow-inner transition-transform group-hover:scale-110', tool.color]">
          <component :is="tool.icon" class="w-7 h-7" stroke-width="2" />
        </div>
        <h2 class="text-2xl font-bold text-gray-900 mb-2">{{ tool.name }}</h2>
        <p class="text-gray-500 leading-relaxed">{{ tool.description }}</p>
        
        <div class="mt-auto pt-6 flex items-center text-sm font-semibold text-gray-900 gap-1.5 transition-transform group-hover:translate-x-1">
          Open tool <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14 5l7 7m0 0l-7 7m7-7H3"></path></svg>
        </div>
      </div>
      
      <!-- Decorative background blur -->
      <div class="absolute -bottom-12 -right-12 w-32 h-32 rounded-full opacity-10 group-hover:opacity-20 transition-opacity blur-2xl" :class="tool.color.split(' ')[0]"></div>
    </a>
  </div>
</template>

<style scoped>
[v-cloak] {
  display: none;
}
</style>
