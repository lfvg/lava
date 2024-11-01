<script>
import TheWelcome from '../components/TheWelcome.vue'

export default {
  data () {
    return {

    }
  },
  mounted() {
    window.electronAPI.pushOllamaResponse((data) => {
      const parsedData = JSON.parse(data);
    })
  },
  methods: {
    makeQuery() {
      window.electronAPI.queryOllama("")
    }
  }

}
</script>

<template>
  <main>
    <TheWelcome />
  </main>
</template>
