<script>
import { RouterLink, RouterView } from 'vue-router'

export default {

  data() {
    return {
      chatHistory: [],
      queryText: "",
      responding: false,
      finishQuery: true
    }
  },
  mounted() {
    window.electronAPI.pushRouter((route) => {
      route === 'home' ?
        this.$router.push('/') :
        this.$router.push('/quick')
    }),
      window.electronAPI.pushOllamaResponse((data) => {
        const parsedData = JSON.parse(data);
        this.chatHistory[this.chatHistory.length - 1].text += parsedData.response;
        if (parsedData.done) {
          this.responding = false;
        }
      })
  },
  computed: {
    formatedQueryText: function() {
      return this.queryText.replace("\n", "<br/>");
    }
  },
  methods: {
    makeQuery() {
      this.responding = true;
      this.chatHistory.push({
        type: 'question',
        text: this.formatedQueryText
      })
      this.chatHistory.push({
        type: 'response',
        text: ''
      })
      window.electronAPI.queryOllama(this.queryText)

      this.queryText = '';
    },
    updateQuery(value) {
      this.queryText = value;
    },
    updateQueryWithEnter() {
      this.queryText = this.queryText + '\n';
    }
  }
}
</script>

<template>
  <RouterView v-slot="{ Component }">
    <component :is="Component" :chatHistory="chatHistory" :queryText="queryText" :responding="responding"
      @submit-query="makeQuery" @update-query-text="updateQuery" @update-query-text-with-enter="updateQueryWithEnter" />
  </RouterView>
</template>

<style></style>
