<script lang="ts" setup>
import Sidebar from "./Sidebar.vue";
import Navbar from "./Navbar.vue";
</script>

<template>
  <main class="h-screen w-screen overflow-hidden">
    <section class="flex w-full h-full">
      <!-- Conditionally render Sidebar and Navbar based on the route -->
      <sidebar class="sidebar"></sidebar>
      <section class="w-full h-full overflow-y-auto">
        <navbar></navbar>
        <div class="p-6 pb-20">
          <router-view></router-view>
        </div>
      </section>
    </section>
  </main>
</template>

<style scoped></style>
