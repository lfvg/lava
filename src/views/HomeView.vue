<script>
export default {
  props: ['chatHistory', 'queryText', 'responding'],
  data() {
    return {

    }
  },
  computed: {
    textareaHeigth: function () {
      const lines = this.queryText.split('\n').length;
      var height = 0;
      switch (lines) {
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
      switch (lines) {
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
        overflow: 'scroll',
        'overflow-x': 'hidden'
      };
    }
  },
  mounted() {

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
          <v-col sm="1" md="1" />
          <v-col>
            <v-sheet style="background: inherit; color: inherit; width: 100%; margin-bottom: 12px;"
              v-for="message in chatHistory">
              <v-card v-if="message.type === 'question'" variant="tonal" style="width: fit-content; justify-self: end;"
                elevation="3">
                <v-card-text>
                  <v-html>
                  {{ message.text }}
                  </v-html>
                </v-card-text>
              </v-card>
              <div v-else>{{ message.text }}</div>
            </v-sheet>
          </v-col>
          <v-col sm="1" md="1" />
        </v-row>
        <v-row style="background: var(--color-background); color: var(--color-text);">
          <v-col sm="1" md="1" />
          <v-col>
            
            <v-textarea no-resize="true" solo filled placeholder="Mensagem Llama" :rows="textareaRows"
              v-bind:model-value="queryText" v-on:update:model-value="(event) => $emit('update-query-text', event)"
              append-inner-icon="mdi-send" :disabled="responding" @click:append-inner="$emit('submit-query')"
              @keydown.enter.exact.prevent="$emit('submit-query')"
              @keydown.enter.shift.exact.prevent="() => $emit('update-query-text-with-enter')" />
            
          </v-col>
          <v-col sm="1" md="1" />
        </v-row>
      </v-col>
    </v-row>
  </v-container>
</template>

<style scoped>
body {
  overflow: hidden;
}
::-webkit-scrollbar-track {
  background: var(--color-background);
}

::-webkit-scrollbar {
  width: 3px;
}

</style>
