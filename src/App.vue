<script>
import { RouterLink, RouterView } from 'vue-router'

export default {

  data() {
    return {
      chatHistory: {
        name: '',
        messages: []
      },
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
        if (parsedData.done) {
          this.responding = false;
          let sChatHisotry = JSON.stringify(this.chatHistory);
          window.electronAPI.saveChat(sChatHisotry)
        }
        else
          this.chatHistory.messages[this.chatHistory.messages.length - 1].content += parsedData.message.content;
        
      })
  },
  computed: {
   
  },
  methods: {
    makeQuery() {
      this.responding = true;
      this.chatHistory.messages.push({
        role: 'user',
        content: this.queryText
      });
      let query = JSON.stringify(this.chatHistory.messages);
      this.chatHistory.messages.push({
        role: 'assistant',
        content: ''
      });
      
      window.electronAPI.queryOllama(query)

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
