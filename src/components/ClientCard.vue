<script lang="ts">
import { defineComponent } from 'vue'
import GlobalButton from '@/components/shared/GlobalButton.vue'

export default defineComponent({
  name: 'ClientCard',
  components: {
    GlobalButton
  },
  emits: ['edit', 'view']
})
</script>

<template>
<div class="w-full min-w-[380px] h-full border border-gray-200 rounded-sm p-4">
 <div class="flex justify-between">
   <div>
     <p class="text-lg font-medium">Client Name</p>
     <p class="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded-full">client job title</p>
   </div>
   <div class="flex gap-2 text-gray-500">
     <i class="pi pi-pencil cursor-pointer" @click="$emit('edit')"></i>
     <i class="pi pi-trash cursor-pointer"></i>
   </div>
 </div>

  <section class="mt-4 text-gray-500">
    <div class="flex items-center gap-2">
      <i class="pi pi-phone"></i>
      <p class="text-lg">Phone</p>
    </div>
    <div class="flex items-center gap-2">
      <i class="pi pi-envelope"></i>
      <p class="text-lg">Mail</p>
    </div>
    <div class="flex items-center gap-2">
      <i class="pi pi-map-marker"></i>
      <p class="text-lg">Address</p>
    </div>
    <div class="flex items-center gap-2">
      <i class="pi pi-calendar"></i>
      <p class="text-lg">upcoming appointments</p>
    </div>
  </section>

  <GlobalButton label="View Details" class="mt-5 !bg-transparent !text-primary hover:!bg-primary hover:!text-white w-full" @click="$emit('view')" />
</div>
</template>

<style scoped>

</style>
