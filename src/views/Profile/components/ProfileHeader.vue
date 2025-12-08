<template>
  <Card class="profile-panel profile-header-card w-full">
    <template #content>
      <div class="profile-header__layout">
        <div class="profile-header__info">
          <div class="profile-avatar">
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

        <div class="profile-actions">
          <div v-if="!editing" class="profile-actions__group">
            <GlobalButton
              label="Edit Profile"
              icon="pi pi-user-edit"
              severity="primary"
              class="profile-btn w-full sm:w-auto"
              @click="$emit('edit')"
            />

            <GlobalButton
              label="Change Password"
              icon="pi pi-key"
              type="secondary"
              severity="secondary"
              class="profile-btn w-full sm:w-auto"
              @click="$emit('change-password')"
            />
          </div>
          <div v-else class="profile-actions__group">
            <GlobalButton
              label="Cancel"
              icon="pi pi-times"
              type="warning"
              severity="warning"
              class="profile-btn w-full sm:w-auto"
              @click="$emit('cancel')"
            />

            <GlobalButton
              label="Save"
              icon="pi pi-check"
              severity="primary"
              class="profile-btn w-full sm:w-auto"
              @click="$emit('save')"
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

.profile-header-card {
  color: var(--app-text);
}

:deep(.profile-header-card .p-card) {
   background-color: var(--app-surface);
  border: 1px solid var(--profile-gradient-border);
  box-shadow: var(--app-card-shadow);
  width: 100%;
  border-radius: 1.5rem;
  padding: 0.25rem;
  transition: background 0.3s ease, border-color 0.3s ease, box-shadow 0.3s ease;
}

:deep(.profile-header-card .p-card-content) {
    background-color: var(--app-surface);
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


.profile-header__layout {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

@media (min-width: 768px) {
  .profile-header__layout {
    flex-direction: row;
    align-items: center;
    justify-content: space-between;
  }
}

.profile-header__info {
  display: flex;
  width: 100%;
  align-items: center;
  gap: 1.5rem;
  color: var(--app-text);
}

.profile-avatar {
  padding: 0.35rem;
  border-radius: 9999px;
  background: var(--app-surface);
  border: 1px solid var(--app-border);
  box-shadow: var(--app-card-shadow);
  display: inline-flex;
}

.profile-actions {
  width: 100%;
  color: var(--app-text);
  display: flex;
  flex-direction: column;
  align-items: stretch;
}

@media () {
  .profile-actions {
    width: auto;
    align-items: flex-end;
  }
}

.profile-actions__group {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  width: 100%;
}

@media (min-width: 640px) {
  .profile-actions__group {
    flex-direction: row;
    justify-content: flex-end;
  }
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
    width: 220px !important;
    height: 220px !important;
  }
}
</style>