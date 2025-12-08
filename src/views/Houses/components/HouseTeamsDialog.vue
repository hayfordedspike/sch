<template>
  <Dialog
    v-model:visible="isVisible"
    modal
    :style="{ width: '60rem' }"
    :closable="true"
    @hide="handleClose"
  >
    <template #header>
      <h2 class="text-blue-500 font-bold text-3xl">
        Teams for {{ house?.name }}
      </h2>
    </template>

    <div v-if="house" class="flex flex-col gap-6 py-4">
      <!-- House Info -->
      <div class="bg-gray-50 rounded-lg p-4">
        <div class="flex items-center">
          <div class="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center mr-3">
            <span class="text-white font-bold text-lg">
              {{ getHouseInitials(house) }}
            </span>
          </div>
          <div>
            <h3 class="font-semibold text-lg text-gray-900">{{ house.name }}</h3>
            <p class="text-gray-600 text-sm">{{ house.city }}, {{ house.region }}</p>
          </div>
        </div>
      </div>

      <!-- Teams Section -->
      <div class="border border-gray-200 rounded-lg p-4">
        <div class="flex justify-between items-center mb-4">
          <h3 class="text-lg font-semibold text-gray-900 flex items-center">
            <i class="pi pi-users mr-2 text-green-500"></i>
            Teams ({{ teams.length }})
          </h3>
          <GlobalButton
            label="Add Team"
            icon="pi pi-plus"
            size="sm"
            @click="showAddTeamDialog = true"
          />
        </div>

        <!-- Loading State -->
        <div v-if="loading" class="text-center py-8">
          <i class="pi pi-spinner pi-spin text-gray-400 mr-2"></i>
          <span class="text-gray-600">Loading teams...</span>
        </div>

        <!-- Teams List -->
        <div v-else-if="teams.length > 0" class="space-y-3">
          <div
            v-for="team in teams"
            :key="team.id"
            class="border border-gray-200 rounded-lg p-4 hover:bg-gray-50"
          >
            <div class="flex justify-between items-start">
              <div class="flex-1">
                <h4 class="font-semibold text-gray-900 mb-1">Team ID: {{ team.team_id }}</h4>
                <p v-if="team.coverage_notes" class="text-gray-600 text-sm mb-2">{{ team.coverage_notes }}</p>
                <div class="flex items-center gap-3 text-xs">
                  <span :class="team.active ? 'text-green-600 bg-green-100' : 'text-red-600 bg-red-100'" 
                        class="px-2 py-1 rounded-full">
                    {{ team.active ? 'Active' : 'Inactive' }}
                  </span>
                </div>
              </div>
              <div class="flex gap-2">
                <GlobalButton
                  icon="pi pi-trash"
                  size="sm"
                  text
                  rounded
                  severity="danger"
                  @click="confirmDeleteTeam(team)"
                  aria-label="Remove team"
                />
              </div>
            </div>
          </div>
        </div>

        <!-- Empty State -->
        <div v-else class="text-center py-8">
          <i class="pi pi-users text-gray-300 text-3xl mb-2"></i>
          <p class="text-gray-600 text-sm mb-4">No teams assigned to this house yet</p>
          <GlobalButton
            label="Add First Team"
            icon="pi pi-plus"
            size="sm"
            @click="showAddTeamDialog = true"
          />
        </div>
      </div>
    </div>

    <template #footer>
      <div class="flex justify-end">
        <GlobalButton label="Close" @click="handleClose" type="warning" />
      </div>
    </template>

    <!-- Add Team Dialog -->
    <AddTeamDialog
      v-model:visible="showAddTeamDialog"
      :house-id="house?.id"
      @team-added="handleTeamAdded"
    />
  </Dialog>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { useConfirm } from 'primevue/useconfirm'
import { useToast } from 'primevue/usetoast'
import { useHouses } from '@/composables/useHouses'
import type { House, HouseTeam } from '../types'
import Dialog from 'primevue/dialog'
import GlobalButton from '@/components/shared/GlobalButton.vue'
import AddTeamDialog from './AddTeamDialog.vue'

interface Props {
  visible: boolean
  house?: House | null
}

interface Emits {
  (e: 'update:visible', value: boolean): void
}

const props = withDefaults(defineProps<Props>(), {
  visible: false,
  house: null
})

const emit = defineEmits<Emits>()

const confirm = useConfirm()
const toast = useToast()
const { fetchHouseTeams, removeTeamFromHouse, loading } = useHouses()

const teams = ref<HouseTeam[]>([])
const showAddTeamDialog = ref(false)

const isVisible = computed({
  get: () => props.visible,
  set: (value) => emit('update:visible', value)
})

const getHouseInitials = (house: House): string => {
  return house.name
    .split(' ')
    .map(word => word.charAt(0))
    .join('')
    .toUpperCase()
    .slice(0, 2)
}

const fetchTeams = async () => {
  if (props.house?.id) {
    const result = await fetchHouseTeams(props.house.id)
    if (result) {
      teams.value = result
    }
  }
}

const confirmDeleteTeam = (team: HouseTeam) => {
  confirm.require({
    message: `Are you sure you want to remove team ${team.team_id} from this house?`,
    header: 'Remove Team',
    icon: 'pi pi-exclamation-triangle',
    rejectClass: 'p-button-secondary p-button-outlined',
    acceptClass: 'p-button-danger',
    rejectLabel: 'Cancel',
    acceptLabel: 'Remove',
    accept: () => handleDeleteTeam(team.id)
  })
}

const handleDeleteTeam = async (teamId: number) => {
  if (!props.house?.id) return
  
  const result = await removeTeamFromHouse(props.house.id, teamId)
  if (result?.success) {
    toast.add({
      severity: 'success',
      summary: 'Success',
      detail: 'Team removed successfully',
      life: 3000
    })
    fetchTeams()
  } else {
    toast.add({
      severity: 'error',
      summary: 'Error',
      detail: 'Failed to remove team',
      life: 5000
    })
  }
}

const handleTeamAdded = () => {
  showAddTeamDialog.value = false
  fetchTeams()
  toast.add({
    severity: 'success',
    summary: 'Success',
    detail: 'Team added successfully',
    life: 3000
  })
}

const handleClose = () => {
  teams.value = []
  emit('update:visible', false)
}

// Watch for house changes
watch(
  () => props.house,
  (newHouse) => {
    if (newHouse && props.visible) {
      fetchTeams()
    }
  },
  { immediate: true }
)

// Watch for visibility changes
watch(
  () => props.visible,
  (visible) => {
    if (visible && props.house) {
      fetchTeams()
    }
  }
)
</script>

<style scoped>
/* Custom styles for house teams dialog */
</style>