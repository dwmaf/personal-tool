<template>
  <div id="container" class="min-h-screen flex flex-col relative overflow-hidden font-sans">
    <AuthStatus />
    
    <img 
      id="background" 
      src="/background.svg" 
      alt="" 
      class="absolute top-0 left-0 w-full h-full -z-10 object-cover opacity-60 pointer-events-none" 
      style="filter: blur(100px);" 
    />

    <main class="w-full grow flex flex-col items-center justify-center py-16 px-6 sm:px-12 z-10">
      <header class="mb-12 flex flex-col items-center text-center">
        <img src="/ai-star-icon.png" alt="AI Star Icon" class="w-16 h-16 mb-6 drop-shadow-xl" />
        <h1 class="text-4xl md:text-5xl font-bold bg-clip-text text-transparent bg-linear-to-r from-gray-900 via-gray-700 to-gray-900 tracking-tight">
          Personal Toolkits
        </h1>
        <p class="mt-4 text-gray-600 max-w-lg mx-auto text-lg leading-relaxed">
          My super minimal self-hosted tools. Built natively under one domain.
        </p>
      </header>
      
      <Dashboard />
    </main>

    <!-- Footer -->
    <footer class="w-full py-6 mt-auto text-center z-10">
      <p class="text-[13px] font-medium text-gray-400 flex items-center justify-center gap-1.5 mx-auto max-w-fit px-4 py-1.5 rounded-full bg-white/30 border border-white/50">
        Crafted with <span class="text-red-500 animate-pulse">❤️</span> by <span class="font-bold text-gray-700">Dawam</span>
      </p>
    </footer>
  </div>
</template>
