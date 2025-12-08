<script setup lang="ts">
import { useRoute, useRouter } from "vue-router";
import { computed } from "vue";
import { navItems } from "@/constants/fields.ts"

interface Props {
  visible?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  visible: false
})

const emit = defineEmits<{
  close: []
}>()

const route = useRoute();
const router = useRouter();

const isRouteActive = computed(() => {
  return (navItemRoute: string) => {
    const firstRoute = route.path.split("/")[1];
    return firstRoute === navItemRoute.split("/")[1];
  };
});

defineOptions({ name: 'AppSidebar' })

const handleNavigation = (route: string) => {
  // Debug: log navigation attempts
  console.log('[Sidebar] navigate to', route);
  router.push(route).catch((err) => {
    console.error('[Sidebar] navigation error', err);
  });
  // Close sidebar on mobile after navigation
  emit('close')
};
</script>

<template>
  <aside :class="[
    'min-w-[256px] pt-6 border-r-2 border-gray-100 h-full relative transition-transform duration-300 ease-in-out',
    'md:translate-x-0 md:static md:z-auto',
    visible ? 'translate-x-0' : '-translate-x-full',
    'md:block',
    visible ? 'block fixed left-0 top-0 z-50 bg-transparent' : 'hidden md:block'
  ]">
    <img alt="DropShop" class="w-30 mx-auto" src="@/assets/scheduler-logo.svg" />

    <div class="mt-6">
      <div
        v-for="item in navItems"
        :key="item.key"
        class="sidebar-item mt-2 px-4 py-2 cursor-pointer flex items-center gap-2 text-primary transition-colors ease-in-out duration-500"
        :style="isRouteActive(item.route) ? { backgroundColor: '#064a6d !important', color: 'white !important' } : {}"
        @click="handleNavigation(item.route)"
      >
        <i :class="item.icon"></i>
        <p>{{ item.title }}</p>
      </div>
    </div>
  </aside>
</template>

<style scoped>
.sidebar-item:hover {
  background-color: #064a6d !important;
  color: white !important;
}

.sidebar-item:hover i {
  color: white !important;
}
</style>

<style scoped></style>