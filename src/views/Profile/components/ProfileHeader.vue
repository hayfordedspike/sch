<template>
  <Card class="profile-header-card w-full">
    <template #content>
      <div class="flex items-center justify-between">
        <!-- Profile Image and Name -->
        <div class="flex items-center space-x-6">
          <!-- Profile Image -->
          <div>
            <img
              :src="defaultAvatarUrl"
              :alt="displayName"
              class="w-32 h-32 sm:w-48 sm:h-48 md:w-64 md:h-64 lg:profile-image-pc rounded-full object-cover shadow-lg"
            />
          </div>

          <!-- User Name -->
          <div>
            <h1 class="text-2xl sm:text-3xl font-bold text-gray-600">
              {{ displayName }}
            </h1>
          </div>
        </div>

        <!-- Edit Profile Button -->
        <div class="flex-shrink-0">
          <div v-if="!editing" class="flex flex-col gap-2">
            <Button
              @click="$emit('edit')"
              class="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-lg transition-all duration-300 border-0"
              label="Edit Profile"
              icon="pi pi-user-edit"
            />
          </div>
          
          <div v-else class="flex flex-col sm:flex-row gap-2">
            <Button
              @click="$emit('cancel')"
              outlined
              class="border-2 border-gray-300 text-gray-700 font-semibold py-3 px-6 rounded-lg transition-all duration-300 hover:border-gray-400 hover:bg-gray-50"
              label="Cancel"
              icon="pi pi-times"
              severity="secondary"
            />
            <Button
              @click="$emit('save')"
              class="bg-green-600 hover:bg-green-700 text-white font-semibold py-3 px-6 rounded-lg transition-all duration-300 border-0"
              label="Save"
              icon="pi pi-check"
            />
          </div>
        </div>
      </div>
    </template>
  </Card>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import Card from 'primevue/card'
import Button from 'primevue/button'
import type { User } from '@/stores/auth'

interface Props {
  user: User | null
  editing: boolean
}

const props = defineProps<Props>()

defineEmits<{
  edit: []
  save: []
  cancel: []
}>()

// Default avatar URL
const defaultAvatarUrl = 'https://png.pngtree.com/png-clipart/20231019/original/pngtree-user-profile-avatar-png-image_13369991.png'

const displayName = computed(() => {
  const user = props.user
  if (!user) return 'User'
  
  const firstName = user.first_name
  const lastName = user.last_name
  
  if (firstName && lastName) {
    return `${firstName} ${lastName}`
  } else if (firstName) {
    return firstName
  } else if (user.email) {
    return user.email.split('@')[0]
  }
  
  return 'User'
})
</script>

<style scoped>
:deep(.profile-header-card .p-card) {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border: none;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
  width: 100%;
  border-radius: 0;
}

:deep(.profile-header-card .p-card-content) {
  background: white;
  margin: 4px;
  border-radius: 12px;
  padding: 2rem;
  width: calc(100% - 8px);
}

/* Responsive adjustments */
@media (max-width: 640px) {
  :deep(.profile-header-card .p-card-content) {
    padding: 1.5rem;
  }
}

/* Custom profile image size for PC */
@media (min-width: 1024px) {
  .profile-image-pc {
    width: 150px !important;
    height: 150px !important;
  }
}
</style>