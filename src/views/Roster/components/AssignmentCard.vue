<template>
  <Card class="assignment-card">
    <template #content>
      <div class="p-4">
        <!-- Assignment Header -->
        <div class="flex items-center justify-between mb-3">
          <div class="flex items-center space-x-3">
            <div class="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
              <i class="pi pi-user text-blue-600 text-lg"></i>
            </div>
            <div>
              <h3 class="text-lg font-semibold text-gray-900">{{ displayInfo.employeeName }}</h3>
              <p class="text-sm text-gray-600">{{ displayInfo.visitInfo }}</p>
            </div>
          </div>
          <div class="flex space-x-1">
            <Button
              v-if="!displayInfo.isCheckedIn"
              icon="pi pi-sign-in"
              severity="success"
              size="small"
              outlined
              rounded
              @click="$emit('check-in', assignment)"
              v-tooltip.top="'Check In'"
            />
            <Button
              v-if="displayInfo.isCheckedIn && !displayInfo.isCheckedOut"
              icon="pi pi-sign-out"
              severity="warning"
              size="small"
              outlined
              rounded
              @click="$emit('check-out', assignment)"
              v-tooltip.top="'Check Out'"
            />
            <Button
              icon="pi pi-eye"
              severity="info"
              size="small"
              outlined
              rounded
              @click="$emit('view-details', assignment)"
              v-tooltip.top="'View Details'"
            />
            <Button
              icon="pi pi-pencil"
              severity="secondary"
              size="small"
              outlined
              rounded
              @click="$emit('edit', assignment)"
              v-tooltip.top="'Edit Assignment'"
            />
            <Button
              icon="pi pi-trash"
              severity="danger"
              size="small"
              outlined
              rounded
              @click="$emit('delete', assignment)"
              v-tooltip.top="'Delete Assignment'"
            />
          </div>
        </div>

        <!-- Assignment Details -->
        <div class="space-y-2 mb-4">
          <div class="flex items-center text-sm text-gray-600">
            <i class="pi pi-calendar mr-2 text-gray-400"></i>
            <span>{{ displayInfo.scheduledStart }}</span>
          </div>
          <div class="flex items-center text-sm text-gray-600">
            <i class="pi pi-clock mr-2 text-gray-400"></i>
            <span>{{ displayInfo.duration }}</span>
          </div>
          <div class="flex items-center text-sm text-gray-600">
            <i class="pi pi-user mr-2 text-gray-400"></i>
            <span>{{ displayInfo.role }}</span>
          </div>
          <div class="flex items-center text-sm text-gray-600">
            <i class="pi pi-circle-fill mr-2 text-xs"
               :class="'text-gray-500'">
            </i>
            <span class="capitalize">{{ displayInfo.status.toLowerCase() }}</span>
          </div>
        </div>
        <div class="pt-3 border-t border-gray-200">
          <div class="flex items-center justify-between text-xs text-gray-500">
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
import Button from 'primevue/button'
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
    visitInfo.value = visit ? `${visit.client_id ? 'Client #' + visit.client_id : ''} @ ${visit.house_id ? 'House #' + visit.house_id : ''}` : `Visit #${props.assignment.visit_id}`
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
    CONFIRMED: 'text-blue-500',
    IN_PROGRESS: 'text-green-500',
    COMPLETED: 'text-purple-500',
    CANCELLED: 'text-red-500'
  }
  return colors[status as keyof typeof colors] || 'text-gray-500'
}
</script>

<style scoped>
.assignment-card {
  box-shadow: 0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1);
  transition-property: box-shadow;
  transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1);
  transition-duration: 200ms;
}

.assignment-card:hover {
  box-shadow: 0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1);
  border-color: rgb(191 219 254);
}
</style>