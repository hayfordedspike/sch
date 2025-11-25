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
              <h3 class="text-lg font-semibold text-gray-900"></h3>
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
import { computed, ref, watch, onMounted } from 'vue'
import { useVisits } from '@/composables/useVisits'
import { useClients } from '@/composables/useClients'
import { useHouses } from '@/composables/useHouses'
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
const { getClient } = useClients()
const { getHouse } = useHouses()

const clientName = ref<string>('')
const houseName = ref<string>('')

async function fetchNames() {
  if (props.visit?.client_id) {
    const client = await getClient(props.visit.client_id)
    clientName.value = client ? `${client.first_name} ${client.last_name}` : ''
  }
  if (props.visit?.house_id) {
    const house = await getHouse(props.visit.house_id)
    houseName.value = house ? house.name : ''
  }
}

onMounted(fetchNames)
watch(() => props.visit, fetchNames, { immediate: true })

const displayInfo = computed(() => {
  function getDuration(start: string | Date, end: string | Date): string {
    const startDate = new Date(start)
    const endDate = new Date(end)
    const diffMs = endDate.getTime() - startDate.getTime()
    if (diffMs <= 0) return '0 min'
    const diffMins = Math.floor(diffMs / 60000)
    const hours = Math.floor(diffMins / 60)
    const mins = diffMins % 60
    if (hours > 0 && mins > 0) return `${hours} hr${hours > 1 ? 's' : ''} ${mins} min${mins > 1 ? 's' : ''}`
    if (hours > 0) return `${hours} hr${hours > 1 ? 's' : ''}`
    return `${mins} min${mins > 1 ? 's' : ''}`
  }
  try {
    const info = getVisitDisplayInfo(props.visit)
    return {
      ...info,
      clientName: clientName.value || info.clientName,
      houseName: houseName.value || info.houseName,
      duration: getDuration(props.visit.start_at, props.visit.end_at)
    }
  } catch (error) {
    console.error('Error getting visit display info:', error)
    return {
      id: props.visit.id,
      clientName: clientName.value || '',
      houseName: houseName.value || '',
      startDate: new Date(props.visit.start_at).toLocaleDateString(),
      endDate: new Date(props.visit.end_at).toLocaleDateString(),
      duration: getDuration(props.visit.start_at, props.visit.end_at),
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