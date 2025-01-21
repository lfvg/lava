<script>
import VueMarkdown from 'vue-markdown-render';
import { useGoTo } from 'vuetify'


export default {
  setup () {
      const goTo = useGoTo()
      return { goTo }
    },
  components: {
    VueMarkdown
  },
  props: ['chatHistory', 'queryText', 'responding', 'currentChat', 'responseText'],
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
    calculateHistoryItemColorCode(color) {
      return {
        width: '8px',
        height: '8px',
        'border-radius': '50%',
        'background-color': color
      }
    },
    makeQuery() {

    },
    changeSidePanel() {

      this.miniVariant = !this.miniVariant;
      this.permanent = !this.permanent;
    },
    copyResponse(message) {
      navigator.clipboard.writeText(message);
    },
    deleteHistoryEntry(id) {
      window.electronAPI.deleteHistoryEntry(id);
    },
    selectHistoryEntryColorCode(id, color) {
      let data = JSON.stringify({id: id, color: color});
      window.electronAPI.changeColorCodeOfHistoryEntry(data);
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
    responseText(newValue, oldValue) {
      console.log('chegou no watch do current chat');
      this.$nextTick(() => {
        const elem = document.getElementById("chat");
        let children = elem.children;
        let height = 0;
        for(const child of children) {
          console.log('height: ', child.offsetHeight);
          height += child.offsetHeight;
        }
        
        console.log('Height: ', height);
        
      if (elem) {
        // Check if the container has content and is scrollable
        if (height > elem.clientHeight) {
          elem.scrollTop = height;
          console.log("Scrolled to bottom");
        } else {
          console.warn("Container not scrollable or has no overflow content");
        }
      } else {
        console.error("chatContainer ref not found");
      }
    });
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
      <v-btn v-if="miniVariant" elevation="0" icon @click="$emit('create-new-chat')" style="border-radius: 8px;">
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
              <v-btn elevation="0" icon @click="$emit('create-new-chat')"
                style="color: inherit; background: var(--color-background); border-radius: 8px;">
                <v-icon color="var(--color-text)">mdi-square-edit-outline</v-icon>
                <v-tooltip activator="parent" location="bottom">{{ newChatText }}</v-tooltip>
              </v-btn>
            </v-list-item-avatar>
          </v-row>
        </v-list-item>
        <v-divider></v-divider>
        <!-- <template v-slot:default="{ isHovering, props }"> -->
        <v-list-item @click="$emit('load-chat-entry', chat.id)" v-for="chat in chatHistory" :key="chat.id" style="
       
         position: relative;
          cursor: pointer;
          color: var(--color-text);
         
        ">
          <v-hover v-slot="{ isHovering, props }" close-delay="200">
            <v-row v-bind="props" no-gutters align="center" style="position: relative;">
              <div style="width: 13px; height: 100%;">
                <div v-if="chat.colorCode != ''" :style="calculateHistoryItemColorCode(chat.colorCode)"></div>
              </div>
              <div style="width: 190px;">
                <div class="text-no-wrap">{{ chat.name }}</div>
              </div>
              <div>
                <div style="position: absolute; right: 0px; top: 0px;">
                  <v-btn v-if="isHovering" elevation="0" density="comfortable" plain icon size="x-small"
                    style="border-radius: 8px; background-color: var(--color-background); /*background-image: linear-gradient(to right, rgba(255,0,0,0), var(--color-background-soft));*/">
                    <v-icon color="var(--color-text)">mdi-dots-horizontal</v-icon>
                    <v-menu  v-bind="props" activator="parent">
                      <v-list style="color: var(--color-text); background-color: var(--color-background-mute) ;">
                        <v-list-item>
                          <v-list-item-title @click="console.log('excluir: ', chat.id)" style="cursor: pointer;">Renomear</v-list-item-title>
                        </v-list-item>
                        <v-divider style="margin-left: 8px; margin-right: 8px;"></v-divider>                        
                        <div class="text-caption" style="margin-left: 16px; margin-top: 6px;">Etiquetas</div>
                        <v-list-item>
                          <v-row aligne="center">
                            <v-col @click="selectHistoryEntryColorCode(chat.id, 'tomato')" style="cursor: pointer;" >
                              <div style="border-radius: 50%; background-color: tomato; width: 12px; height: 12px;"></div>
                            </v-col>
                            <v-col @click="selectHistoryEntryColorCode(chat.id, 'gold')" style="cursor: pointer;">
                              <div style="border-radius: 50%; background-color: gold; width: 12px; height: 12px;"></div>
                            </v-col>
                            <v-col @click="selectHistoryEntryColorCode(chat.id, 'limegreen')" style="cursor: pointer;">
                              <div style="border-radius: 50%; background-color: limegreen; width: 12px; height: 12px;"></div>
                            </v-col>
                            <v-col @click="selectHistoryEntryColorCode(chat.id, '')" style="cursor: pointer;">
                              <div style="color: var(--color-text); width: 12px; height: 12px; margin-top: -6px">⊗</div>
                            </v-col>
                          </v-row>
                        </v-list-item>
                        <v-divider style="margin-left: 8px; margin-right: 8px;"></v-divider>
                                                <v-list-item>
                          <v-list-item-title @click="deleteHistoryEntry(chat.id)" style="cursor: pointer;">Excluir</v-list-item-title>
                        </v-list-item>
                      </v-list>
                    </v-menu>
                  </v-btn>
                </div>
              </div>
            </v-row>
          </v-hover>
        </v-list-item>
        <!-- </template> -->

      </v-list>
    </v-navigation-drawer>
    <v-main>
      <v-container fluid style="height: 100%">
        <v-row style="height: 100%;">
          <v-col style="overflow-y: scroll;">
            <v-row :style="textAreaStyle">
              <v-col sm="1" md="1" />
              <v-col id="chat" ref="chatContainer" style="height: 100%; overflow-y: auto;">
                <v-sheet style="background: inherit; color: inherit; width: 100%; margin-bottom: 6px;"
                  v-for="message in currentChat.messages">
                  <v-card v-if="message.role === 'user'" variant="tonal" style="width: fit-content; justify-self: end;"
                    elevation="1">
                    <v-card-text>
                      <vue-markdown :source="message.content" />
                    </v-card-text>
                  </v-card>
                  <div v-else>
                    <v-hover close-delay="200">
                      <template v-slot:default="{ isHovering, props }">
                        <div v-bind="props">
                          <vue-markdown :source="message.content" />
                          <div style="min-height: 48px;">
                            <v-btn v-if="!responding" v-show="isHovering" @click="copyResponse(message.content)" icon
                              flat density="comfortable" size="small" color="var(--color-background-soft)"
                              active-color="var(--color-background)">
                              <v-icon color="var(--color-text)">mdi-content-copy</v-icon>
                              <v-tooltip activator="parent" location="end">{{ copyText }}</v-tooltip>
                            </v-btn>
                          </div>
                        </div>
                      </template>
                    </v-hover>
                  </div>
                </v-sheet>
                <!-- <div id="end"></div> -->
              </v-col>
              <v-col sm="1" md="1" />
            </v-row>
            <v-row style="background: var(--color-background-soft); color: var(--color-text);">
              <v-col sm="1" md="1" />
              <v-col>
                <v-textarea no-resize="true" solo filled placeholder="Mensagem Llama" :rows="textareaRows"
                  v-bind:model-value="queryText" v-on:update:model-value="(event) => $emit('update-query-text', event)"
                  :disabled="responding" @click:append-inner="$emit('submit-query')"
                  @keydown.enter.exact.prevent="$emit('submit-query')">
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

@keyframes pulse {
  0% {
    transform: scale(1);
  }

  50% {
    transform: scale(1.5);
  }

  100% {
    transform: scale(1);
  }
}

.pulse {
  width: 4px;
  height: 4px;
  background-color: #3498db;
  border-radius: 50%;
  animation: pulse 2s infinite;
}
</style>
