<template>
  <VM msg="Hello Vue 3 + TypeScript + Vite" />
</template>

<script lang="ts">
import { defineComponent } from 'vue'
import VM from './components/VM.vue'

export default defineComponent({
  name: 'App',
  components: {
    VM
  }
})
</script>

<style>
#app {
  text-align: center;
  color: #2c3e50;
  margin-top: 60px;
}
</style>
