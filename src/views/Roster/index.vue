
<script setup lang="ts">
import { ref } from 'vue'
import RosterCalendar from '@/components/RosterCalendar.vue'
import RosterFilterCard from '@/components/RosterFilterCard.vue'

defineOptions({ name: 'RosterView' })

const selectedMember = ref<string>('all')
const selectedMonth = ref<number>(new Date().getMonth())
</script>

<template>
	<div class="p-4">
		<RosterFilterCard
			class="mb-6"
			v-model:selectedFilter="selectedMember"
			v-model:currentDate="selectedMonth"
		/>
		<RosterCalendar
			:selectedMember="selectedMember"
			:selectedMonth="selectedMonth"
		/>
		<div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
			<!-- Roster widgets/cards will go here -->
		</div>
	</div>
</template>

<style scoped>

</style>
