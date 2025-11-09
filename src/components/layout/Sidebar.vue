<script setup lang="ts">
import { useRoute, useRouter } from "vue-router";
import { computed } from "vue";
import { navItems } from "@/constants/fields.ts"

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
};
</script>

<template>
  <aside class="min-w-[256px] pt-6 border-r-2 border-gray-100 h-full relative">
    <img alt="DropShop" class="w-30 mx-auto" src="@/assets/scheduler-logo.svg" />

    <div class="mt-6">
      <div
        v-for="item in navItems"
        :key="item.key"
        :class="[
          'mt-2 px-4 py-2 cursor-pointer flex items-center gap-2 text-primary hover:bg-primary hover:text-white transition-colors ease-in-out duration-500',
          {
            'bg-primary text-white':
              isRouteActive(item.route),
          },
        ]"
        @click="handleNavigation(item.route)"
      >
        <i :class="item.icon"></i>
        <p>{{ item.title }}</p>
      </div>
    </div>
  </aside>
</template>

<style scoped></style>
