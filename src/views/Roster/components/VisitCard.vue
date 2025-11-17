<template>
  <Card class="visit-card">
    <template #content>
      <div class="p-4">
        <!-- Visit Header -->
        <div class="flex items-center justify-between mb-3">
          <div class="flex items-center space-x-3">
            <div class="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
              <i class="pi pi-map-marker text-blue-600 text-lg"></i>
            </div>
            <div>
              <h3 class="text-lg font-semibold text-gray-900">{{ displayInfo.clientName }}</h3>
              <p class="text-sm text-gray-600">{{ displayInfo.houseName }}</p>
            </div>
          </div>
          <div class="flex space-x-1">
            <Button
              icon="pi pi-eye"
              severity="info"
              size="small"
              outlined
              rounded
              @click="$emit('view-details', visit)"
              v-tooltip.top="'View Details'"
            />
            <Button
              icon="pi pi-pencil"
              severity="secondary"
              size="small"
              outlined
              rounded
              @click="$emit('edit', visit)"
              v-tooltip.top="'Edit Visit'"
            />
            <Button
              icon="pi pi-trash"
              severity="danger"
              size="small"
              outlined
              rounded
              @click="$emit('delete', visit)"
              v-tooltip.top="'Delete Visit'"
            />
          </div>
        </div>

        <!-- Visit Details -->
        <div class="space-y-2 mb-4">
          <div class="flex items-center text-sm text-gray-600">
            <i class="pi pi-calendar mr-2 text-gray-400"></i>
            <span>{{ displayInfo.startDate }}</span>
          </div>
          <div class="flex items-center text-sm text-gray-600">
            <i class="pi pi-clock mr-2 text-gray-400"></i>
            <span>{{ displayInfo.duration }}</span>
          </div>
          <div class="flex items-center text-sm text-gray-600">
            <i class="pi pi-users mr-2 text-gray-400"></i>
            <span>{{ displayInfo.requiredStaff }} staff required</span>
          </div>
          <div class="flex items-center text-sm text-gray-600">
            <i class="pi pi-circle-fill mr-2 text-xs"
               :class="displayInfo.status === 'completed' ? 'text-green-500' :
                      displayInfo.status === 'in_progress' ? 'text-blue-500' : 'text-orange-500'"></i>
            <span class="capitalize">{{ displayInfo.status.replace('_', ' ') }}</span>
          </div>
        </div>

        <!-- Notes -->
        <div v-if="visit.notes" class="mb-4">
          <div class="text-sm text-gray-600">
            <i class="pi pi-comment mr-2 text-gray-400"></i>
            {{ visit.notes.length > 50 ? visit.notes.substring(0, 50) + '...' : visit.notes }}
          </div>
        </div>

        <!-- Footer -->
        <div class="pt-3 border-t border-gray-200">
          <div class="flex items-center justify-between text-xs text-gray-500">
            <span>ID: {{ visit.id }}</span>
            <span>{{ new Date(visit.created_at).toLocaleDateString() }}</span>
          </div>
        </div>
      </div>
    </template>
  </Card>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useVisits } from '@/composables/useVisits'
import Card from 'primevue/card'
import Button from 'primevue/button'
import type { Visit } from '@/views/Roster/types'

interface Props {
  visit: Visit
}

const props = defineProps<Props>()

defineEmits<{
  edit: [visit: Visit]
  delete: [visit: Visit]
  'view-details': [visit: Visit]
}>()

const { getVisitDisplayInfo } = useVisits()

const displayInfo = computed(() => {
  try {
    return getVisitDisplayInfo(props.visit)
  } catch (error) {
    console.error('Error getting visit display info:', error)
    return {
      id: props.visit.id,
      clientName: `Client #${props.visit.client_id}`,
      houseName: `House #${props.visit.house_id}`,
      startDate: new Date(props.visit.start_at).toLocaleDateString(),
      endDate: new Date(props.visit.end_at).toLocaleDateString(),
      duration: 'Unknown',
      requiredStaff: props.visit.required_staff_count,
      notes: props.visit.notes,
      status: 'scheduled' as const
    }
  }
})
</script>

<style scoped>
.visit-card {
  box-shadow: 0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1);
  transition-property: box-shadow;
  transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1);
  transition-duration: 200ms;
}

.visit-card:hover {
  box-shadow: 0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1);
  border-color: rgb(191 219 254);
}
</style>