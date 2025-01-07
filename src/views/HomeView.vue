<script>
import VueMarkdown from 'vue-markdown-render';

export default {
  components: {
    VueMarkdown
  },
  props: ['chatHistory', 'queryText', 'responding'],
  data() {
    return {
      miniVariant: true,
      clipped: true,
      permanent: false,
      copyText: 'Copiar resposta',
      sidebarCloseText: 'Fechar a barra lateral',
      sidebarOpenText: 'Abrir a barra lateral',
      newChatText: 'Novo chat'
    }
  },
  computed: {
    textareaHeigth: function () {
      const lines = this.queryText.split('\n').length;
      var height = 0;
      switch (lines) {
        case 0:
        case 1:
          height = 174;
          break;
        case 2:
          height = 198;
          break;
        default:
          height = 224;
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
    },
  },
  mounted() {

  },
  methods: {
    makeQuery() {

    },
    changeSidePanel() {

      this.miniVariant = !this.miniVariant;
      this.permanent = !this.permanent;
    },
    copyResponse(message) {
      navigator.clipboard.writeText(message);
    }
  },
  watch: {
    '$vuetify.breakpoint': {
      handler(val) {
        if (val.width < 960) {
          this.miniVariant = true;
          this.permanent = false;
        }
        else {
          this.miniVariant = false;
          this.permanent = true;
        }
      },
      immediate: true,
    },
  },

}
</script>

<template style="height: 100vh">
  <v-app style="color: var(--color-text); background: var(--color-background-soft);">
    <v-toolbar dense flat color="var(--color-text)" style="color: inherit; background: var(--color-background-soft);">

      <v-btn v-if="miniVariant" elevation="0" icon @click="changeSidePanel" style="border-radius: 8px;">
        <v-icon>mdi-dock-left</v-icon>
        <v-tooltip activator="parent" location="bottom">{{ sidebarOpenText }}</v-tooltip>
      </v-btn>
      <div style="width: 16px;"></div>
      <v-btn v-if="miniVariant" elevation="0" icon @click="changeSidePanel" style="border-radius: 8px;">
        <v-icon color="var(--color-text)">mdi-square-edit-outline</v-icon>
        <v-tooltip activator="parent" location="bottom">{{ newChatText }}</v-tooltip>
      </v-btn>
    </v-toolbar>
    <v-navigation-drawer :mini-variant.sync="miniVariant" :clipped="clipped" app :permanent="permanent"
      style="color: inherit; background: var(--color-background);">
      <v-list>
        <v-list-item class="px-2">
          <v-row justify="space-between" style="margin: 0px;">
            <v-list-item-avatar>
              <v-btn elevation="0" icon @click="changeSidePanel"
                style="color: inherit; background: var(--color-background); border-radius: 8px;">
                <v-icon color="var(--color-text)">mdi-dock-left</v-icon>
                <v-tooltip activator="parent" location="bottom">
                  {{ sidebarCloseText }}
                </v-tooltip>
              </v-btn>
            </v-list-item-avatar>
            <v-list-item-avatar>
              <v-btn elevation="0" icon @click="changeSidePanel"
                style="color: inherit; background: var(--color-background); border-radius: 8px;">
                <v-icon color="var(--color-text)">mdi-square-edit-outline</v-icon>
                <v-tooltip activator="parent" location="bottom">{{ newChatText }}</v-tooltip>
              </v-btn>
            </v-list-item-avatar>
          </v-row>
        </v-list-item>
        <v-list-item style="color: var(--color-text);">
          Item 2
        </v-list-item>
        <v-list-item style="color: var(--color-text);">
          Item 3
        </v-list-item>
      </v-list>
    </v-navigation-drawer>
    <v-main>
      <v-container fluid style="height: 100%">
        <v-row style="height: 100%;">
          <v-col>
            <v-row :style="textAreaStyle">
              <v-col sm="1" md="1" />
              <v-col>
                <v-sheet style="background: inherit; color: inherit; width: 100%;"
                  v-for="message in chatHistory.messages">
                  <v-card v-if="message.role === 'user'" variant="tonal" style="width: fit-content; justify-self: end;"
                    elevation="1">
                    <v-card-text>
                      <v-html>
                        {{ message.content }}
                      </v-html>
                    </v-card-text>
                  </v-card>
                  <div v-else>
                    <v-hover close-delay="200">
                      <template v-slot:default="{ isHovering, props }">
                        <div v-bind="props">
                          <vue-markdown :source="message.content" />
                          <div style="min-height: 48px;">
                            <v-btn v-show="isHovering" @click="copyResponse(message.content)" icon flat
                              density="comfortable" size="small" color="var(--color-background-soft)"
                              active-color="var(--color-background)">
                              <v-icon color="var(--color-text)">mdi-content-copy</v-icon>
                              <v-tooltip
        activator="parent"
        location="end"
        >{{copyText}}</v-tooltip>
                            </v-btn>
                          </div>
                        </div>
                      </template>
                    </v-hover>
                  </div>
                </v-sheet>
              </v-col>
              <v-col sm="1" md="1" />
            </v-row>
            <v-row style="background: var(--color-background-soft); color: var(--color-text);">
              <v-col sm="1" md="1" />
              <v-col>
                <v-textarea no-resize="true" solo filled placeholder="Mensagem Llama" :rows="textareaRows"
                  v-bind:model-value="queryText" v-on:update:model-value="(event) => $emit('update-query-text', event)"
                  :disabled="responding" @click:append-inner="$emit('submit-query')"
                  @keydown.enter.exact.prevent="$emit('submit-query')"
                  @keydown.enter.shift.exact.prevent="() => $emit('update-query-text-with-enter')">
                  <template v-slot:append-inner>
                    <v-icon style="align-self: center" icon="mdi-send" v-on:click="$emit('submit-query')" />
                  </template>
                </v-textarea>

              </v-col>
              <v-col sm="1" md="1" />
            </v-row>
          </v-col>
        </v-row>
      </v-container>
    </v-main>
  </v-app>
</template>

<style scoped>
body {
  overflow: hidden;
}

::-webkit-scrollbar-track {
  background: var(--color-background-soft);
}

::-webkit-scrollbar {
  width: 3px;
}



html,
body {
  height: 100%;
}

body {
  background: black;
  overflow: hidden;
}
</style>
