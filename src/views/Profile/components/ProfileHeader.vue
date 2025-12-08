<template>
  <Card class="profile-header-card w-full">
    <template #content>
      <div class="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
        <div class="flex w-full md:flex-1 items-center gap-4 sm:gap-6">
          <div class="shrink-0">
            <img
              :src="defaultAvatarUrl"
              :alt="displayName"
              class="w-24 h-24 sm:w-32 sm:h-32 md:w-40 md:h-40 lg:profile-image-pc rounded-full object-cover shadow-lg"
            />
          </div>

          <div class="flex flex-col text-left">
            <h1 class="profile-name text-2xl sm:text-3xl font-bold">
              {{ displayName }}
            </h1>
          </div>
        </div>

        <div class="profile-actions flex flex-col md:flex-row md:items-center gap-2 w-full md:w-auto">
            <div v-if="!editing" class="flex flex-col sm:flex-row gap-2 w-full md:w-auto md:justify-end">
            <GlobalButton type="primary" class="profile-btn w-full sm:w-auto" @click="$emit('edit')">
              <i class="pi pi-user-edit"></i>
              <span>Edit Profile</span>
            </GlobalButton>
            
            <GlobalButton type="secondary" class="profile-btn w-full sm:w-auto" @click="$emit('change-password')">
              <i class="pi pi-key"></i>
              <span>Change Password</span>
            </GlobalButton>
          </div>
          <div v-else class="flex flex-col sm:flex-row gap-2 w-full md:w-auto md:justify-end">
            <GlobalButton type="warning" class="profile-btn w-full sm:w-auto" @click="$emit('cancel')">
              <i class="pi pi-times"></i>
              <span>Cancel</span>
            </GlobalButton>
            
            <GlobalButton type="primary" class="profile-btn w-full sm:w-auto" @click="$emit('save')">
              <i class="pi pi-check"></i>
              <span>Save</span>
            </GlobalButton>
          </div>
        </div>
      </div>
    </template>
  </Card>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import Card from 'primevue/card'
import GlobalButton from '@/components/shared/GlobalButton.vue' // <-- Make sure the path is correct
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
  'change-password': []
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
/*
  Note on Dark Mode: The custom button's dark mode requires Tailwind's 'dark' class
  to be toggled on the <html> or <body> tag, which you seem to be handling 
  with the :global([data-theme='dark']) selector in your CSS.
*/

:deep(.profile-header-card .p-card) {
  background: linear-gradient(135deg, rgba(102, 126, 234, 0.95) 0%, rgba(118, 75, 162, 0.95) 100%);
  border: 1px solid transparent;
  box-shadow: var(--app-card-shadow);
  width: 100%;
  border-radius: 1.5rem;
  padding: 0.25rem;
  transition: background 0.3s ease, border-color 0.3s ease, box-shadow 0.3s ease;
}

:global([data-theme='dark']) :deep(.profile-header-card .p-card) {
  background: linear-gradient(135deg, rgba(15, 23, 42, 0.95) 0%, rgba(30, 41, 59, 0.95) 100%);
  border-color: var(--app-border);
}

:deep(.profile-header-card .p-card-content) {
  background: var(--app-surface);
  color: var(--app-text);
  margin: 4px;
  border-radius: 1.25rem;
  padding: 2rem;
  width: calc(100% - 8px);
  border: 1px solid var(--app-border);
  box-shadow: none;
  transition: background-color 0.3s ease, border-color 0.3s ease;
}

.profile-name {
  color: var(--app-text-strong);
  transition: color 0.3s ease;
}

.profile-actions {
  width: 100%;
}

.profile-btn {
  /* Ensure these styles integrate with the GlobalButton's base styles */
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  min-height: 3rem;
  padding: 0.75rem 1.5rem;
  font-weight: 600;
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