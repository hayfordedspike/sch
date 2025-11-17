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
               :class="getStatusColor(displayInfo.statusKey)"></i>
            <span class="capitalize">{{ displayInfo.status.toLowerCase() }}</span>
          </div>
        </div>

        <!-- Check-in/out Status -->
        <div class="mb-4">
          <div class="flex items-center justify-between">
            <div class="text-sm">
              <span v-if="displayInfo.isCheckedIn" class="text-green-600 font-medium">
                <i class="pi pi-check-circle mr-1"></i>
                Checked in: {{ displayInfo.checkInTime }}
              </span>
              <span v-else class="text-gray-500">
                <i class="pi pi-clock mr-1"></i>
                Not checked in
              </span>
            </div>
            <div v-if="displayInfo.isCheckedOut" class="text-sm text-blue-600 font-medium">
              <i class="pi pi-check-circle mr-1"></i>
              Checked out: {{ displayInfo.checkOutTime }}
            </div>
          </div>
        </div>

        <!-- Footer -->
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
import { computed } from 'vue'
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

const displayInfo = computed(() => {
  try {
    return getAssignmentDisplayInfo(props.assignment)
  } catch (error) {
    console.error('Error getting assignment display info:', error)
    return {
      id: props.assignment.id,
      employeeName: `Employee #${props.assignment.employee_id}`,
      visitInfo: `Visit #${props.assignment.visit_id}`,
      role: props.assignment.role_on_visit,
      status: props.assignment.status,
      statusKey: props.assignment.status,
      statusColor: 'text-gray-500',
      scheduledStart: new Date(props.assignment.scheduled_start_at).toLocaleString(),
      scheduledEnd: new Date(props.assignment.scheduled_end_at).toLocaleString(),
      duration: 'Unknown',
      assignedAt: new Date(props.assignment.assigned_at).toLocaleDateString(),
      checkInTime: props.assignment.check_in_at ? new Date(props.assignment.check_in_at).toLocaleString() : null,
      checkOutTime: props.assignment.check_out_at ? new Date(props.assignment.check_out_at).toLocaleString() : null,
      isCheckedIn: !!props.assignment.check_in_at,
      isCheckedOut: !!props.assignment.check_out_at
    }
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