<script>
export default {
  props: ['chatHistory', 'queryText'],
  data () {
    return {
      
    }
  },
  computed: {
    textareaHeigth: function () {
      const lines = this.queryText.split('\n').length;
      var height = 0;
      switch(lines) {
        case 0:
        case 1:
          height = 106;
          break;
        case 2:
          height = 130;
          break;
        default:
          height = 156;
          break;
      }
      return height;
    },
    textareaRows: function () {
      const lines = this.queryText.split('\n').length;
      var rows = 0;
      switch(lines) {
        case 0:
        case 1:
          rows = 1;
          break;
        case 2:
          rows = 2;
          break;
        default:
          rows = 3;
          break;
      }
      return rows.toString();
    },
    textAreaStyle: function () {
      return {
        height: `calc( 100vh - ${this.textareaHeigth}px)`,
      };
    }
  },
  mounted() {
    window.electronAPI.pushOllamaResponse((data) => {
      const parsedData = JSON.parse(data);
    })
  },
  methods: {
    makeQuery() {
     
    }
  }

}
</script>

<template style="height: 100vh">
    <v-container style="height: 100%">
      <v-row style="height: 100%;">
        <v-col cols="1" sm="4" md="2" style="height: 100%;">
          List
        </v-col>
        <v-col>
          <v-row :style="textAreaStyle">
            <v-sheet>
              {{ chatHistory }}
              <v-card v-for="message in chatHistory">
                {{ message.message }}
              </v-card>
            </v-sheet>
          </v-row>
          <v-row>
            <v-col sm="1" md="1"/>
            <v-col>
              <v-textarea no-resize="true" variant="solo-filled" placeholder="Mensagem Llama" 
                          :rows="textareaRows" v-bind:model-value="queryText" 
                          v-on:update:model-value="(event) => $emit('update-query-text', event)"  
                          append-inner-icon="mdi-send"
                          @click:append-inner="$emit('submit-query')"/>
            </v-col>
            <v-col sm="1" md="1"/>
          </v-row>
        </v-col>
      </v-row>
    </v-container>
</template>

<style scoped>
textarea {
  resize: none !important;
  
}
</style>
