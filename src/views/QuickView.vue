<script>
import VueMarkdown from 'vue-markdown-render'
export default {
  components: {
    VueMarkdown
  },
  props: ['chatHistory', 'queryText', 'responding', 'currentChat'],
  data() {
    return {
      bottonResponse: null,
      options: {
        duration: 300,
        easing: 'easeInOutCubic'
      }
     }
  },
  computed : {
    showResponse: function () { 
      if(this.currentChat.messages.length === 0) return false;
      let messagesCount = this.currentChat.messages.length;
      
      let lastMessageRole = this.currentChat.messages[messagesCount-1].role;
      
      if (lastMessageRole === 'assistant') return true;
      return false;
    },
    chatResponse: function () {
      if(this.currentChat.messages.length < 2) return '';
      let messagesCount = this.currentChat.messages.length;
      return this.currentChat.messages[messagesCount -1].content;
    }
  },
  watch: {
    chatResponse() {
      this.$nextTick(() => {
        this.goTo(this.bottonResponse.$el);
      })
    }
  },
  methods: {
    copyResponse() {
      navigator.clipboard.writeText(this.chatResponse);
    }
  }
}
</script>

<template>
  <v-container style="height: 96px; border-radius: 5px; background: var(--color-background);">
    <v-textarea filled flat :no-resize="true" autofocus
                placeholder="Mensagem Llama" 
                append-inner-icon="mdi-send" 
                rows="1" :disabled="responding"
                v-bind:model-value="queryText"
                v-on:update:model-value="(event) => $emit('update-query-text', event)"
                @keydown.enter.exact.prevent="$emit('submit-quick-query')"
                @click:append-inner="$emit('submit-quick-query')">

    </v-textarea>
  </v-container>
  <v-hover close-delay="200">
    <template v-slot:default="{ isHovering, props }">
        <v-sheet ref="scrollContainer" v-bind="props" v-if="showResponse" style="margin-top: 32px; height: fit-content; max-height: 400px; overflow: scroll; border-radius: 5px; background: var(--color-background); color: var(--color-text); padding: 32px;">
          <v-btn v-show="isHovering" @click="copyResponse"  icon flat density="comfortable" size="small" color="var(--color-background)" active-color="var(--color-background)" style="position: absolute; top: 136px; right: 8px;">
            <v-icon color="var(--color-text)">mdi-content-copy</v-icon>
          </v-btn>
          <vue-markdown :source="chatResponse" />
          <div :ref="instance => bottonResponse = instance"></div>
        </v-sheet>
   
    </template>
  </v-hover>
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
