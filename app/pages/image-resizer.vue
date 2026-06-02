<template>
  <NuxtLayout name="default" title="Image Resizer">
    <div id="container" class="min-h-screen relative overflow-hidden font-sans">
      <AuthStatus />
      <img src="/background.svg" class="absolute top-0 left-0 w-full h-full -z-10 object-cover opacity-60 pointer-events-none" style="filter: blur(100px);" />
      
      <main class="w-full min-h-screen flex flex-col items-center py-16 px-6 sm:px-12">
        <header class="mb-12 flex flex-col items-center text-center">
          <h1 class="text-4xl md:text-5xl font-bold bg-clip-text text-transparent bg-linear-to-r from-gray-900 via-gray-700 to-gray-900 tracking-tight">
            Image Resizer
          </h1>
          <div class="mt-6 flex gap-4">
            <NuxtLink to="/" class="px-5 py-2.5 bg-white border border-gray-200 text-gray-700 font-medium rounded-xl hover:bg-gray-50 transition-colors shadow-sm">
              &larr; Back to Tools
            </NuxtLink>
          </div>
        </header>
        
        <ImageResizer />
      </main>
    </div>
  </NuxtLayout>
</template>
