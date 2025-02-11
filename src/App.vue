<script>
import {v4 as uuidv4} from 'uuid';
export default {

  data() {
    return {
      chatHistory:[

      ],
      currentChat: {
        name: '',
        colorCode: '',
        id: '',
        date: '',
        messages: []
      },
      queryText: "",
      responding: false,
      finishQuery: true,
      responseText: "",
      alertControll: false,
      alert: {
        controll: false,
        message: '',
        type: 'error',
        title: ''
      }
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
          let sChatHisotry = JSON.stringify(this.currentChat);
          window.electronAPI.saveChat(sChatHisotry)
          this.responseText = "";
        }
        else {
          this.currentChat.messages[this.currentChat.messages.length - 1].content += parsedData.message.content;
          this.responseText = this.responseText + parsedData.message.content;
        }
        
        
      }),
      window.electronAPI.pushHistory((history) => {
        let tempHistory = JSON.parse(history);
        this.chatHistory = tempHistory;
      }),
      window.electronAPI.pushAlert((newAlert) => {
        console.log(newAlert);
        let alertParsed = JSON.parse(newAlert);
        this.alert = alertParsed;
        this.alertControll = alertParsed.controll;
      })
  },
  computed: {
   
  },
  methods: {
    makeQuery() {
      if (this.currentChat.id === '') {
        this.currentChat.id = uuidv4();
        this.currentChat.name = this.queryText;
        //this.currentChat.date = Date.now();
      }
      this.responding = true;
      this.currentChat.messages.push({
        role: 'user',
        content: this.queryText
      });
      let query = JSON.stringify(this.currentChat.messages);
      this.currentChat.messages.push({
        role: 'assistant',
        content: ''
      });
      
      window.electronAPI.queryOllama(query)

      this.queryText = '';
    },
    makeQuickQuery() {
      this.responding = true;
      this.currentChat.messages.push({
        role: 'user',
        content: this.queryText
      });
      let query = JSON.stringify(this.currentChat.messages);
      this.currentChat.messages.push({
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
    },
    handleCreateNewChat() {
      this.currentChat = {
        name: '',
        colorCode: undefined,
        id: '',
        date: '',
        messages: []
      }
    },
    onLoadChatEntry(id) {
      console.log('chegou no load entry',  id);
      let temp = this.chatHistory.find(function (entry){
        return entry.id === id;
      });
      console.log('chegou no load entry',  temp);
      temp = JSON.parse(JSON.stringify(temp));
      this.currentChat = temp;
      console.log('chegou no load entry',  this.currentChat);
    },
    onCloseAlert() {
      this.alertControll = false;
    }
  }
}
</script>

<template>
  <RouterView v-slot="{ Component }">
    <component :is="Component" :responseText="responseText" :chatHistory="chatHistory" :currentChat="currentChat" 
      :queryText="queryText" :responding="responding" :alert="alert" :alertControll="alertControll"
      @submit-query="makeQuery" @update-query-text="updateQuery" @update-query-text-with-enter="updateQueryWithEnter" 
      @submit-quick-query="makeQuickQuery" @close-quick-view="onCloseQuickView" @create-new-chat="handleCreateNewChat"
      @load-chat-entry="onLoadChatEntry" @close-alert="onCloseAlert"/>
  </RouterView>
</template>
<style></style>
