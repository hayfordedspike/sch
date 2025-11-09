<template>
  <Card class="member-card">
    <template #content>
      <div class="p-4">
        <!-- Member Header -->
        <div class="flex items-center justify-between mb-3">
          <div class="flex items-center space-x-3">
            <div class="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
              <i class="pi pi-user text-blue-600 text-lg"></i>
            </div>
            <div>
              <h3 class="text-lg font-semibold text-gray-900">{{ member.name }}</h3>
              <p class="text-sm text-gray-600">{{ member.role }}</p>
            </div>
          </div>
          <div class="flex space-x-1">
            <Button
              icon="pi pi-pencil"
              severity="secondary"
              size="small"
              outlined
              rounded
              @click="$emit('edit', member)"
              v-tooltip.top="'Edit Member'"
            />
            <Button
              icon="pi pi-trash"
              severity="danger"
              size="small"
              outlined
              rounded
              @click="$emit('delete', member)"
              v-tooltip.top="'Delete Member'"
            />
          </div>
        </div>

        <!-- Contact Information -->
        <div class="space-y-2 mb-4">
          <div class="flex items-center text-sm text-gray-600">
            <i class="pi pi-phone mr-2 text-gray-400"></i>
            <span>{{ member.phone || 'No phone number' }}</span>
          </div>
          <div class="flex items-center text-sm text-gray-600">
            <i class="pi pi-envelope mr-2 text-gray-400"></i>
            <span>{{ member.email }}</span>
          </div>
          <div class="flex items-center text-sm text-gray-600">
            <i class="pi pi-map-marker mr-2 text-gray-400"></i>
            <span>{{ member.address || 'No address provided' }}</span>
          </div>
        </div>

        <!-- Schedule Information -->
        <div class="mb-4">
          <div class="flex items-center mb-2">
            <i class="pi pi-calendar mr-2 text-gray-400"></i>


          <div class="flex flex-wrap gap-2">
            <span
              v-for="day in member.schedule"
              :key="day"
              class="px-2 py-1 text-xs bg-green-100 text-gray-700 rounded-md font-medium"
            >
              {{ day }}
            </span>
            <span
              v-if="!member.schedule || member.schedule.length === 0"
              class="text-xs text-gray-500 italic"
            >
              No schedule set
            </span>
          </div> </div>
        </div>

        <!-- Rate Information -->
        <div class="pt-3 ">
          <div class="flex items-center mb-2">

            <span class="text-sm font-medium text-gray-700">Rate</span>
          </div>
          <div class="text-left">
            <div v-if="member.hourlyRate" class="text-lg font-bold text-black">
              ${{ member.hourlyRate }}/hr
            </div>
            <div v-else class="text-sm text-gray-500 italic">
              Rate not set
            </div>
          </div>
        </div>
      </div>
    </template>
  </Card>
</template>

<script setup lang="ts">
interface MemberDisplay {
  id: number
  name: string
  email: string
  phone?: string
  address?: string
  role: string
  status: 'active' | 'inactive'
  schedule?: string[]
  hourlyRate?: number
  teams?: Array<{ id: number; name: string }>
}

interface Props {
  member: MemberDisplay
}

defineProps<Props>()

defineEmits<{
  edit: [member: MemberDisplay]
  delete: [member: MemberDisplay]
}>()
</script>

<style scoped>
.member-card {
  box-shadow: 0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1);
  transition-property: box-shadow;
  transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1);
  transition-duration: 200ms;
}

.member-card:hover {
  box-shadow: 0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1);
  border-color: rgb(191 219 254);
}
</style>
