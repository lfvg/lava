<script>
import { RouterLink, RouterView } from 'vue-router'

export default {
  
  data () {
    return {
      chatHistory: [{ message: 'Foo' }, { message: 'Bar' }],
      queryText: "Esse é um teste"
    }
  },
  mounted() {
    window.electronAPI.pushRouter((route) => {
      console.log(route)
      this.$router.push('/')
    })
  },
  methods: {
    makeQuery() {
      //window.electronAPI.queryOllama("")
      alert(this.queryText);
      console.log(this.queryText);
    },
    updateQuery(value) {
      console.log('update', value);
      this.queryText = value;
    }
  }
}
</script>

<template style="height: 100%">
  <RouterView v-slot="{ Component }" >
    <component :is="Component" :chatHistory="chatHistory" :queryText="queryText" @submit-query="makeQuery" @update-query-text="updateQuery"/>
  </RouterView>
</template>

<style>

</style>
