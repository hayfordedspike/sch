<script lang="ts" setup>
import { ref } from 'vue'
import Sidebar from "./Sidebar.vue";
import Navbar from "./Navbar.vue";

const sidebarVisible = ref(false)

const toggleSidebar = () => {
  sidebarVisible.value = !sidebarVisible.value
}
</script>

<template>
  <main class="dashboard-shell h-screen w-screen overflow-hidden">
    <section class="flex w-full h-full">
      <!-- Conditionally render Sidebar and Navbar based on the route -->
      <Sidebar :visible="sidebarVisible" @close="sidebarVisible = false" />
      <section class="dashboard-content w-full h-full overflow-y-auto">
        <Navbar :toggleSidebar="toggleSidebar" :sidebarVisible="sidebarVisible" />
        <div class="p-6 pb-20">
          <router-view></router-view>
        </div>
      </section>
    </section>
  </main>
</template>

<style scoped>
.dashboard-shell {
  background-color: var(--app-background);
  color: var(--app-text);
}

.dashboard-content {
  background-color: var(--app-background);
  color: inherit;
}
</style>
