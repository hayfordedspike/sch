<template>
  <Card class="assignment-card">
    <template #content>
      <div class="p-4">
        <!-- Assignment Header -->
        <div class="flex items-center justify-between mb-3">
          <div class="flex items-center space-x-3">
            <div class="card-avatar">
              <i class="pi pi-user card-avatar__icon"></i>
            </div>
            <div>
              <h3 class="text-lg font-semibold text-gray-900">{{ displayInfo.employeeName }}</h3>
              <p class="text-sm text-muted">{{ displayInfo.visitInfo }}</p>
            </div>
          </div>
          <div class="flex space-x-1">
            <GlobalButton
              v-if="!displayInfo.isCheckedIn"
              icon="pi pi-sign-in"
              severity="success"
              size="sm"
              outlined
              rounded
              @click="$emit('check-in', assignment)"
              v-tooltip.top="'Check In'"
            />
            <GlobalButton
              v-if="displayInfo.isCheckedIn && !displayInfo.isCheckedOut"
              icon="pi pi-sign-out"
              severity="warning"
              size="sm"
              outlined
              rounded
              @click="$emit('check-out', assignment)"
              v-tooltip.top="'Check Out'"
            />
            <GlobalButton
              icon="pi pi-eye"
              severity="info"
              size="sm"
              outlined
              rounded
              @click="$emit('view-details', assignment)"
              v-tooltip.top="'View Details'"
            />
            <GlobalButton
              icon="pi pi-pencil"
              severity="secondary"
              size="sm"
              outlined
              rounded
              @click="$emit('edit', assignment)"
              v-tooltip.top="'Edit Assignment'"
            />
            <GlobalButton
              icon="pi pi-trash"
              severity="danger"
              size="sm"
              outlined
              rounded
              @click="$emit('delete', assignment)"
              v-tooltip.top="'Delete Assignment'"
            />
          </div>
        </div>

        <!-- Assignment Details -->
        <div class="space-y-2 mb-4">
          <div class="flex items-center text-sm text-muted">
            <i class="pi pi-calendar mr-2 text-muted"></i>
            <span>{{ displayInfo.scheduledStart }}</span>
          </div>
          <div class="flex items-center text-sm text-muted">
            <i class="pi pi-clock mr-2 text-muted"></i>
            <span>{{ displayInfo.duration }}</span>
          </div>
          <div class="flex items-center text-sm text-muted">
            <i class="pi pi-user mr-2 text-muted"></i>
            <span>{{ displayInfo.role }}</span>
          </div>
          <div class="flex items-center text-sm text-muted">
            <i
              class="pi pi-circle-fill mr-2 text-xs assignment-status-dot"
              :class="`assignment-status-dot--${displayInfo.status.toLowerCase()}`"
            ></i>
            <span class="capitalize">{{ displayInfo.status.toLowerCase() }}</span>
          </div>
        </div>
        <div class="assignment-card__meta">
          <div class="flex items-center justify-between text-xs text-muted">
            <span>ID: {{ assignment.id }}</span>
            <span>{{ displayInfo.assignedAt }}</span>
          </div>
        </div>
      </div>
    </template>
  </Card>
</template>

<script setup lang="ts">
import { computed, ref, onMounted, watch } from 'vue'
import { useEmployees } from '@/composables/useEmployees'
import { useVisits } from '@/composables/useVisits'
import { useAssignments } from '@/composables/useAssignments'
import Card from 'primevue/card'
import GlobalButton from '@/components/shared/GlobalButton.vue'
import type { Assignment } from '@/views/Roster/types'

interface Props {
  assignment: Assignment
}

const props = defineProps<Props>()

defineEmits<{
  edit: [assignment: Assignment]
  delete: [assignment: Assignment]
  'view-details': [assignment: Assignment]
  'check-in': [assignment: Assignment]
  'check-out': [assignment: Assignment]
}>()

const { getAssignmentDisplayInfo } = useAssignments()
const { getEmployee } = useEmployees()
const { getVisit } = useVisits()
const employeeName = ref('')
const visitInfo = ref('')

async function fetchNames() {
  if (props.assignment?.employee_id) {
    const emp = await getEmployee(props.assignment.employee_id)
    employeeName.value = emp ? `${emp.first_name} ${emp.last_name}` : `Employee #${props.assignment.employee_id}`
  }
  if (props.assignment?.visit_id) {
    const visit = await getVisit(props.assignment.visit_id)
    if (visit) {
      const clientLabel = visit.client_id ? `Client #${visit.client_id}` : null
      const houseLabel = visit.house_id ? `House #${visit.house_id}` : null
      if (clientLabel && houseLabel) {
        visitInfo.value = `${clientLabel} @ ${houseLabel}`
      } else {
        visitInfo.value = clientLabel || houseLabel || `Visit #${props.assignment.visit_id}`
      }
    } else {
      visitInfo.value = `Visit #${props.assignment.visit_id}`
    }
  }
}

onMounted(fetchNames)
watch(() => props.assignment, fetchNames, { immediate: true })

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

const displayInfo = computed(() => {
  return {
    id: props.assignment.id,
    employeeName: employeeName.value || `Employee #${props.assignment.employee_id}`,
    visitInfo: visitInfo.value || `Visit #${props.assignment.visit_id}`,
    role: props.assignment.role_on_visit,
    status: props.assignment.status,
    scheduledStart: new Date(props.assignment.scheduled_start_at).toLocaleString(),
    scheduledEnd: new Date(props.assignment.scheduled_end_at).toLocaleString(),
    duration: getDuration(props.assignment.scheduled_start_at, props.assignment.scheduled_end_at),
    assignedAt: new Date(props.assignment.assigned_at).toLocaleDateString(),
    assignedById: props.assignment.assigned_by_id,
    checkInTime: props.assignment.check_in_at ? new Date(props.assignment.check_in_at).toLocaleString() : null,
    checkOutTime: props.assignment.check_out_at ? new Date(props.assignment.check_out_at).toLocaleString() : null,
    isCheckedIn: !!props.assignment.check_in_at,
    isCheckedOut: !!props.assignment.check_out_at
  }
})

const getStatusColor = (status: string) => {
  const colors = {
    TENTATIVE: 'text-orange-500',
    CONFIRMED: 'text-[#065986]',
    IN_PROGRESS: 'text-green-500',
    COMPLETED: 'text-purple-500',
    CANCELLED: 'text-red-500'
  }
  return colors[status as keyof typeof colors] || 'text-gray-500'
}
</script>

<style scoped>
.assignment-card {
  border: 1px solid var(--app-border);
  border-radius: 16px;
  background: var(--app-surface);
  box-shadow: var(--app-card-shadow);
  transition: border-color 0.2s ease, box-shadow 0.2s ease, transform 0.2s ease;
}

.assignment-card:hover {
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

.assignment-card__meta {
  border-top: 1px solid var(--app-border);
  padding-top: 0.75rem;
  margin-top: 0.75rem;
}

.assignment-status-dot {
  color: var(--app-text-muted);
}

.assignment-status-dot--tentative {
  color: #f59e0b;
}

.assignment-status-dot--confirmed {
  color: #2563eb;
}

.assignment-status-dot--in_progress {
  color: #10b981;
}

.assignment-status-dot--completed {
  color: #8b5cf6;
}

.assignment-status-dot--cancelled {
  color: #ef4444;
}
</style>