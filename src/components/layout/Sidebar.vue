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
    'app-sidebar min-w-[256px] pt-6 border-r-2 h-full relative transition-transform duration-300 ease-in-out',
    'md:translate-x-0 md:static md:z-auto',
    visible ? 'translate-x-0' : '-translate-x-full',
    'md:block',
    visible ? 'block fixed left-0 top-0 z-50' : 'hidden md:block'
  ]">
    <img alt="DropShop" class="w-30 mx-auto" src="@/assets/scheduler-logo.svg" />

    <div class="mt-6">
      <div
        v-for="item in navItems"
        :key="item.key"
        :class="[
          'sidebar-item mt-2 px-4 py-2 cursor-pointer flex items-center gap-2 transition-colors ease-in-out duration-500',
          { 'sidebar-item--active': isRouteActive(item.route) }
        ]"
        @click="handleNavigation(item.route)"
      >
        <i :class="item.icon"></i>
        <p>{{ item.title }}</p>
      </div>
    </div>
  </aside>
</template>

<style scoped>
.app-sidebar {
  background-color: var(--app-sidebar-bg);
  border-color: var(--app-sidebar-border);
  color: var(--app-text);
  box-shadow: var(--app-card-shadow);
}

.sidebar-item {
  border-radius: 0.75rem;
  background-color: transparent;
  color: var(--app-text);
}

.sidebar-item i {
  color: var(--app-text-muted);
}

.sidebar-item:hover {
  background-color: rgba(6, 89, 134, 0.08);
  color: var(--app-accent);
}

.sidebar-item:hover i {
  color: var(--app-accent);
}

.sidebar-item--active {
  background-color: var(--sidebar-active-bg) !important;
  color: var(--sidebar-active-text) !important;
}

.sidebar-item--active i {
  color: inherit !important;
}
</style>
