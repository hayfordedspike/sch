<template>
  <Card class="visit-card">
    <template #content>
      <div class="p-4">
        <!-- Visit Header -->
        <div class="flex items-center justify-between mb-3">
          <div class="flex items-center space-x-3">
            <div class="card-avatar">
              <i class="pi pi-map-marker card-avatar__icon"></i>
            </div>
            <div>
              <h3 class="text-lg font-semibold text-gray-900"></h3>
            </div>
          </div>
          <div class="flex space-x-1">
            <GlobalButton
              icon="pi pi-eye"
              severity="info"
              size="sm"
              outlined
              rounded
              @click="$emit('view-details', visit)"
              v-tooltip.top="'View Details'"
            />
            <GlobalButton
              icon="pi pi-pencil"
              severity="secondary"
              size="sm"
              outlined
              rounded
              @click="$emit('edit', visit)"
              v-tooltip.top="'Edit Visit'"
            />
            <GlobalButton
              icon="pi pi-trash"
              severity="danger"
              size="sm"
              outlined
              rounded
              @click="$emit('delete', visit)"
              v-tooltip.top="'Delete Visit'"
            />
          </div>
        </div>

        <!-- Visit Details -->
        <div class="space-y-2 mb-4">
          <div class="flex items-center text-sm text-muted">
            <i class="pi pi-calendar mr-2 text-muted"></i>
            <span>{{ displayInfo.startDate }}</span>
          </div>
          <div class="flex items-center text-sm text-muted">
            <i class="pi pi-clock mr-2 text-muted"></i>
            <span>{{ displayInfo.duration }}</span>
          </div>
          <div class="flex items-center text-sm text-muted">
            <i class="pi pi-users mr-2 text-muted"></i>
            <span>{{ displayInfo.requiredStaff }} staff required</span>
          </div>
          <div class="flex items-center text-sm text-muted">
            <i
              class="pi pi-circle-fill mr-2 text-xs visit-status-dot"
              :class="`visit-status-dot--${displayInfo.status}`"
            ></i>
            <span class="capitalize">{{ displayInfo.status.replace('_', ' ') }}</span>
          </div>
        </div>

        <!-- Notes -->
        <div v-if="visit.notes" class="mb-4">
          <div class="text-sm text-muted">
            <i class="pi pi-comment mr-2 text-muted"></i>
            {{ visit.notes.length > 50 ? visit.notes.substring(0, 50) + '...' : visit.notes }}
          </div>
        </div>

        <!-- Footer -->
        <div class="visit-card__meta">
          <div class="flex items-center justify-between text-xs text-muted">
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
import GlobalButton from '@/components/shared/GlobalButton.vue'
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
  border: 1px solid var(--app-border);
  border-radius: 16px;
  background: var(--app-surface);
  box-shadow: var(--app-card-shadow);
  transition: border-color 0.2s ease, box-shadow 0.2s ease, transform 0.2s ease;
}

.visit-card:hover {
  border-color: var(--app-accent);
  box-shadow: 0 20px 45px rgba(2, 6, 23, 0.12);
  transform: translateY(-2px);
}

.card-avatar {
  width: 3rem;
  height: 3rem;
  border-radius: 9999px;
  background: var(--app-surface-muted);
  color: var(--app-accent);
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: inset 0 0 0 1px var(--app-border);
}

.card-avatar__icon {
  font-size: 1.1rem;
  color: inherit;
}

.visit-card__meta {
  border-top: 1px solid var(--app-border);
  padding-top: 0.75rem;
  margin-top: 0.75rem;
}

.visit-status-dot {
  color: var(--app-text-muted);
}

.visit-status-dot--completed {
  color: #10b981;
}

.visit-status-dot--in_progress {
  color: #2563eb;
}

.visit-status-dot--scheduled {
  color: #f59e0b;
}

.visit-status-dot--cancelled {
  color: #ef4444;
}
</style>