<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useEmployees } from '@/composables/useEmployees'
import { useClients } from '@/composables/useClients'
import { useHouses } from '@/composables/useHouses'
import api from '@/axios.config'

const schedules = ref<any[]>([])
const employeesMap = ref<Record<number, string>>({})
const clientsMap = ref<Record<number, string>>({})
const housesMap = ref<Record<number, string>>({})

const { fetchEmployees, employees } = useEmployees()
const { fetchClients, clients } = useClients()
const { fetchHouses, houses } = useHouses()

async function fetchMaps() {
  await fetchEmployees({ status: 'ACTIVE', limit: 100 })
  employeesMap.value = Object.fromEntries(employees.value.map(e => [e.id, `${e.first_name} ${e.last_name}`]))
  await fetchClients({ is_active: true, limit: 100 })
  clientsMap.value = Object.fromEntries(clients.value.map(c => [c.id, `${c.first_name} ${c.last_name}`]))
  await fetchHouses({})
  housesMap.value = Object.fromEntries(houses.value.map(h => [h.id, h.name]))
}

async function fetchSchedules() {
  const response = await api.get('/schedules')
  schedules.value = response?.data || []
}

onMounted(async () => {
  await fetchMaps()
  await fetchSchedules()
})

function formatTime(iso: string) {
  const d = new Date(iso)
  return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
}

function formatSchedule(s: any) {
  return {
    id: s.id,
    employee: employeesMap.value[s.employee_id] || `Employee #${s.employee_id}`,
    client: clientsMap.value[s.client_id] || `Client #${s.client_id}`,
    house: housesMap.value[s.house_id] || `House #${s.house_id}`,
    role: s.role_on_visit,
    status: s.status,
    start: formatTime(s.scheduled_start_at),
    end: formatTime(s.scheduled_end_at),
    checkIn: s.check_in_at ? formatTime(s.check_in_at) : '',
    checkOut: s.check_out_at ? formatTime(s.check_out_at) : '',
    assignedAt: s.assigned_at ? new Date(s.assigned_at).toLocaleDateString() : ''
  }
}
</script>

<template>
  <div class="overflow-x-auto">
    <table class="min-w-full bg-white rounded-lg shadow-sm border border-gray-200">
      <thead>
        <tr>
          <th class="px-4 py-2 text-left text-xs font-semibold text-gray-700">Employee</th>
          <th class="px-4 py-2 text-left text-xs font-semibold text-gray-700">Client</th>
          <th class="px-4 py-2 text-left text-xs font-semibold text-gray-700">House</th>
          <th class="px-4 py-2 text-left text-xs font-semibold text-gray-700">Role</th>
          <th class="px-4 py-2 text-left text-xs font-semibold text-gray-700">Status</th>
          <th class="px-4 py-2 text-left text-xs font-semibold text-gray-700">Start</th>
          <th class="px-4 py-2 text-left text-xs font-semibold text-gray-700">End</th>
          <th class="px-4 py-2 text-left text-xs font-semibold text-gray-700">Check In</th>
          <th class="px-4 py-2 text-left text-xs font-semibold text-gray-700">Check Out</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="s in schedules" :key="s.id">
          <td class="px-4 py-2">{{ formatSchedule(s).employee }}</td>
          <td class="px-4 py-2">{{ formatSchedule(s).client }}</td>
          <td class="px-4 py-2">{{ formatSchedule(s).house }}</td>
          <td class="px-4 py-2">{{ formatSchedule(s).role }}</td>
          <td class="px-4 py-2">{{ formatSchedule(s).status }}</td>
          <td class="px-4 py-2">{{ formatSchedule(s).start }}</td>
          <td class="px-4 py-2">{{ formatSchedule(s).end }}</td>
          <td class="px-4 py-2">{{ formatSchedule(s).checkIn }}</td>
          <td class="px-4 py-2">{{ formatSchedule(s).checkOut }}</td>
        </tr>
      </tbody>
    </table>
  </div>
</template>
