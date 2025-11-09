<script setup lang="ts">
import { Toast } from "primevue";
import { useRouter } from "vue-router";
import { computed } from "vue";
import DashboardLayout from "@/components/layout/DashboardLayout.vue";

const router = useRouter();

const layout = computed(
    () => router.currentRoute.value.meta?.layout || "blank",
);
</script>

<template>
  <main>
    <Toast />
    <div v-if="layout === 'dashboard'">
      <dashboard-layout></dashboard-layout>
    </div>
    <div v-else>
      <router-view />
    </div>
  </main>
</template>

<style scoped></style>
