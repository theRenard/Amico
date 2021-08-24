<template>
  <h1>Virtual Machine</h1>
</template>

<script lang="ts">
import { ref, defineComponent, onMounted } from 'vue';
import vm from '../vm/virtual-machine';

export default defineComponent({
  name: 'HelloWorld',
  props: {
    msg: {
      type: String,
      required: true
    }
  },
  setup: () => {
    const count = ref(0)
    onMounted(() => {
      console.log('mounted')
      vm();
    })
    return { count }
  },
})
</script>

<style scoped>
a {
  color: #42b983;
}

label {
  margin: 0 0.5em;
  font-weight: bold;
}

code {
  background-color: #eee;
  padding: 2px 4px;
  border-radius: 4px;
  color: #304455;
}
</style>
