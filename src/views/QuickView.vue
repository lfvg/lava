<script>
import VueMarkdown from 'vue-markdown-render'
export default {
  components: {
    VueMarkdown
  },
  props: ['chatHistory', 'queryText', 'responding'],
  computed : {
    showResponse: function () { 
      if(this.chatHistory.messages.length === 0) return false;
      let messagesCount = this.chatHistory.messages.length;
      
      let lastMessageRole = this.chatHistory.messages[messagesCount-1].role;
      
      if (lastMessageRole === 'assistant') return true;
      return false;
    },
    chatResponse: function () {
      if(this.chatHistory.messages.length < 2) return '';
      let messagesCount = this.chatHistory.messages.length;
      return this.chatHistory.messages[messagesCount -1].content;
    }
  }
}
</script>

<template>
  <v-container style="height: 96px; border-radius: 5px; background: var(--color-background);">
    <v-textarea filled flat :no-resize="true" 
                placeholder="Mensagem Llama" 
                append-inner-icon="mdi-send" 
                rows="1" :disabled="responding"
                v-bind:model-value="queryText"
                v-on:update:model-value="(event) => $emit('update-query-text', event)"
                @keydown.enter.exact.prevent="$emit('submit-quick-query')"
                @click:append-inner="$emit('submit-quick-query')">

    </v-textarea>
  </v-container>
  <v-sheet v-if="showResponse" style="margin-top: 32px; height: fit-content; max-height: 400px; overflow: scroll; border-radius: 5px; background: var(--color-background); color: var(--color-text); padding: 32px;">
       <vue-markdown :source="chatResponse" /> 
    </v-sheet>
</template>

<style>
body {
  background-color: transparent !important;
  overflow: hidden;
}
::-webkit-scrollbar {
  /** removes the scroolbar  */
  display: none;   
}
::-webkit-scrollbar-track {
  background: var(--color-background);
}
</style>
