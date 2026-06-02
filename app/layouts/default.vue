<script setup>
const props = defineProps({
  title: String
})

const siteTitle = computed(() => 
  props.title ? `${props.title} | Personal Toolkits` : 'Personal Toolkits'
)

useHead({
  title: siteTitle,
  link: [
    { rel: 'icon', type: 'image/png', href: '/ai-star-icon-v2.png' }
  ]
})
</script>

<template>
  <div class="min-h-screen">
    <slot></slot>
  </div>
</template>

<style>
html, body {
  margin: 0;
  width: 100%;
  height: 100%;
}
</style>
