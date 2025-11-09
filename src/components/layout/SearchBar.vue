<template>
  <div class="search-container">
    <span class="p-input-icon-right w-full">
      <InputText
        v-model="searchQuery"
        placeholder="Search Clients, Managers, Team Leads..."
        class="p-inputtext-sm w-full"
        @focus="showResults = true"
        @blur="handleBlur"
      />
      <i class="pi pi-search" />
    </span>
    <!-- Search Results Dropdown -->
    <div
      v-if="showResults && searchQuery"
      class="absolute w-full mt-1 bg-white rounded-md shadow-lg border border-gray-200 z-50"
    >
      <div v-if="loading" class="p-4 text-center">
        <i class="pi pi-spin pi-spinner text-primary"></i>
      </div>
      <div v-else-if="results.length > 0" class="py-2">
        <div
          v-for="result in results"
          :key="result.id"
          class="px-4 py-2 hover:bg-gray-100 cursor-pointer flex items-center gap-2"
          @mousedown="handleResultClick(result)"
        >
          <i :class="result.icon"></i>
          <div>
            <p class="text-sm font-medium">{{ result.title }}</p>
            <p class="text-xs text-gray-500">{{ result.subtitle }}</p>
          </div>
        </div>
      </div>
      <div v-else-if="searchQuery" class="p-4 text-center text-gray-500">
        No results found
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'
import { useRouter } from 'vue-router'
import { useDebounce } from '@/composables/useDebounce'

const router = useRouter()
const searchQuery = ref('')
const showResults = ref(false)
const loading = ref(false)

interface SearchResult {
  id: number | string
  title: string
  subtitle?: string
  icon?: string
  route?: string
}

const results = ref<SearchResult[]>([])

// Search function with proper typing
const performSearch = (query: string) => {
  if (!query) {
    results.value = []
    loading.value = false
    return
  }

  loading.value = true
  // Simulate API call
  setTimeout(() => {
    // Mock results - replace with actual search logic
    results.value = [
      {
        id: 1,
        title: 'Client Management',
        subtitle: 'View client details',
        icon: 'pi pi-users',
        route: '/clients'
      },
      {
        id: 2,
        title: 'Team Schedule',
        subtitle: 'Check team availability',
        icon: 'pi pi-calendar',
        route: '/roster'
      }
    ]
    loading.value = false
  }, 300)
}

// Debounce search to avoid too many API calls
const debouncedSearch = useDebounce(performSearch, 300)

watch(searchQuery, (newQuery) => {
  debouncedSearch(newQuery)
})

const handleResultClick = (result: SearchResult) => {
  if (result.route) {
    router.push(result.route)
  }
  searchQuery.value = ''
  showResults.value = false
}

const handleBlur = () => {
  // Small delay to allow click on results
  setTimeout(() => {
    showResults.value = false
  }, 200)
}
</script>

<style scoped>
.search-container {
  width: 300px;
  position: relative;
}

.p-input-icon-right {
  display: flex;
  align-items: center;
}

:deep(.p-inputtext) {
  padding-right: 2.5rem;
  border-radius: 0.375rem;
}

:deep(.p-input-icon-right) {
  width: 100%;
  position: relative;
  display: inline-flex;
  align-items: center;
}

:deep(.p-input-icon-right > i:first-of-type) {
  position: absolute;
  right: 0.75rem;
  top: 50%;
  transform: translateY(-50%);
  color: #64748b; /* Slate gray color */
  pointer-events: none;
  z-index: 1;
}
</style>