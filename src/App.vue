<script>
export default {

  data() {
    return {
      chatHistory: {
        name: '',
        file: '',
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
    makeQuickQuery() {
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
      window.electronAPI.quickQueryOllama(query)
    },
    updateQuery(value) {
      this.queryText = value;
    },
    updateQueryWithEnter() {
      this.queryText = this.queryText + '\n';
    },
    onCloseQuickView() {
      window.electronAPI.closeQuickView()
    }
  }
}
</script>

<template>
  <RouterView v-slot="{ Component }">
    <component :is="Component" :chatHistory="chatHistory" :queryText="queryText" :responding="responding"
      @submit-query="makeQuery" @update-query-text="updateQuery" @update-query-text-with-enter="updateQueryWithEnter" 
      @submit-quick-query="makeQuickQuery" @close-quick-view="onCloseQuickView"/>
  </RouterView>
</template>
<style></style>
