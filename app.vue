// pages/index.vue
<template>
  <div>
    <h1>Data from Supabase</h1>
    <ul>
      <li v-for="item in data" :key="item.id">{{ item.title }}</li>
    </ul>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref, onMounted } from 'vue'
import { useNuxtApp } from '#app'

export default defineComponent({
  setup() {
    const data = ref<any[]>([])

    const fetchData = async () => {
      const { $supabase } = useNuxtApp()
      const { data: items, error } = await ($supabase as any)
        .from('jobs')
        .select('*')

      if (error) {
        console.error(error)
      } else {
        data.value = items
      }
    }

    onMounted(fetchData)

    return { data }
  }
})
</script>
