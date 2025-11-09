<script setup lang="ts">
import { computed, ref } from "vue";
import { useRouter } from "vue-router";
import { useToast } from "primevue/usetoast";
import { Avatar, Menu } from "primevue";
import SearchBar from "./SearchBar.vue";
import { useAuth } from "@/composables/useAuth";
import { capitalizeFirstLetter } from "@/lib/utils";

defineOptions({ name: 'AppNavbar' })

const router = useRouter()
const toast = useToast()
const { user, logout } = useAuth()

const menu = ref();
const userImage = ref(null); // This would normally come from your auth store

const defaultAvatarUrl = 'https://png.pngtree.com/png-clipart/20231019/original/pngtree-user-profile-avatar-png-image_13369991.png';

const items = [
  {
    label: "Profile",
    icon: "pi pi-user",
    command: () => {
      console.log("Profile");
      // TODO: Navigate to profile page
    },
  },
  {
    separator: true
  },
  {
    label: "Logout",
    icon: "pi pi-power-off",
    command: async () => {
      try {
        await logout()
        
        toast.add({
          severity: 'success',
          summary: 'Logged Out',
          detail: 'You have been successfully logged out.',
          life: 3000
        })
        
        // Redirect to sign in page
        router.push('/signin')
      } catch (error) {
        console.error('Logout error:', error)
        toast.add({
          severity: 'error',
          summary: 'Logout Failed',
          detail: 'There was an error logging out.',
          life: 3000
        })
      }
    },
  },
];

const displayName = computed(() => {
  if (!user.value) return 'User'
  
  const firstName = user.value.first_name
  const lastName = user.value.last_name
  
  if (firstName && lastName) {
    return `${capitalizeFirstLetter(firstName)} ${capitalizeFirstLetter(lastName)}`
  } else if (firstName) {
    return capitalizeFirstLetter(firstName)
  } else if (user.value.email) {
    return capitalizeFirstLetter(user.value.email.split('@')[0])
  }
  
  return 'User'
})

const userRole = computed(() => {
  if (!user.value) return 'User'
  
  if (user.value.is_superuser) {
    return 'Super Admin'
  } else if (user.value.is_active) {
    return 'User'
  }
  
  return 'Inactive'
})

const initials = computed(() => {
  if (!user.value) return 'U'
  
  const firstName = user.value.first_name
  const lastName = user.value.last_name
  
  if (firstName && lastName) {
    return `${firstName[0]}${lastName[0]}`.toUpperCase()
  } else if (firstName) {
    return firstName[0].toUpperCase()
  } else if (user.value.email) {
    return user.value.email[0].toUpperCase()
  }
  
  return 'U'
});

const toggleMenu = (event?: Event) => {
  // PrimeVue Menu.toggle accepts an Event; forward if available
  if (menu.value && typeof menu.value.toggle === 'function') {
    menu.value.toggle(event);
  }
};
</script>

<template>
  <nav class="w-full flex items-center justify-between sticky top-0 bg-white z-50 px-6 py-3 border-b border-gray-200 text-gray-500">
    <SearchBar />
    <div class="flex items-center gap-6">
      <i class="pi pi-bell cursor-pointer" style="width: 24px; height: 24px"></i>
      <div class="flex items-center gap-3">
        <Avatar
          :image="userImage || defaultAvatarUrl"
          :label="!userImage && !defaultAvatarUrl ? initials : undefined"
          shape="circle"
          size="large"
          class="w-12 h-12"
        />
        <div class="hidden md:block">
          <p class="font-semibold">{{ displayName }}</p>
          <p class="text-sm text-gray-500">{{ userRole }}</p>
        </div>
        <i
          class="pi pi-chevron-down hidden md:block w-4 h-4 cursor-pointer"
          @click="toggleMenu"
        ></i>
        <Menu
          id="overlay_menu"
          ref="menu"
          :model="items"
          :popup="true"
          class="hidden md:block !right-6 !top-12 w-max ml-auto"
        />
      </div>
    </div>
  </nav>
</template>

<style scoped></style>
