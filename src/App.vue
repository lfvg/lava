<script>
import { RouterLink, RouterView } from 'vue-router'

export default {
  
  data () {
    return {
      items: [{ message: 'Foo' }, { message: 'Bar' }]
    }
  },
  mounted() {
    window.electronAPI.pushRouter((route) => {
      console.log(route)
      this.$router.push('/')
    })
  }
}
</script>

<template style="height: 100%">
  <RouterView v-slot="{ Component }" >
    <component :is="Component" :chatHistory="items"/>
  </RouterView>
</template>

<style>

</style>
