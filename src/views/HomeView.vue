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
  props: ['chatHistory', 'queryText', 'responding', 'currentChat', 'responseText', 'alert', 'alertControll'],
  data() {
    return {
      miniVariant: true,
      clipped: true,
      permanent: false,
      copyText: 'Copiar resposta',
      sidebarCloseText: 'Fechar a barra lateral',
      sidebarOpenText: 'Abrir a barra lateral',
      newChatText: 'Novo chat',
      messageArea: 102 //78 170
    }
  },
  computed: {
    //todo mudar aqui
    textareaHeigth: function () {
      // elem = document.getElementById("message-area");
      const lines = this.queryText.split('\n').length;
      //92
      //var height = this.alert.controll ? 84 : 0;
      var height = this.messageArea + 72;
      // let alertSize  = this.alert.contr
      // switch (lines) {
      //   case 0:
      //   case 1:
      //     height += 174; //258
      //     break;
      //   case 2:
      //     height += 198;
      //     break;
      //   default:
      //     height += 224;
      //     break;
      // }
      console.log('height computed', height);
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
    onCloseAlert(){
      if(!this.alert.controll) this.messageArea = this.messageArea - 108;
    },
    calculateMessageArea(){
      this.$nextTick(()=>{
      
      });
    },
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
      this.$nextTick(() => {
        const elem = document.getElementById("chat");
        let children = elem.children;
        let height = 0;
        for(const child of children) {
          height += child.offsetHeight;
        }
        
        
      if (elem) {
        // Check if the container has content and is scrollable
        if (height > elem.clientHeight) {
          elem.scrollTop = height;
        } else {
          console.warn("Container not scrollable or has no overflow content");
        }
      } else {
        console.error("chatContainer ref not found");
      }
    });
    },
    queryText(newValue, oldValue) {
      this.$nextTick(()=>{
        const elem = document.getElementById("message-area");
        //let children = elem.children;
        let height = elem.clientHeight;
        // for(const child of children) {
        //   height += child.offsetHeight;
        // }
        console.log('message-area query', height);
        this.messageArea = height;
      });
    },
    alertControll(newValue, oldValue) {
      this.$nextTick(()=>{
        const elem = document.getElementById("message-area");
        //let children = elem.children;
        let height = elem.clientHeight;
        // for(const child of children) {
        //   height += child.offsetHeight;
        // }
        console.log('message-area alert', height);
        this.messageArea = height;
      });
    },
    responding(newValue, oldValue) {
      this.$nextTick(()=>{
        const elem = document.getElementById("message-area");
        //let children = elem.children;
        let height = elem.clientHeight;
        // for(const child of children) {
        //   height += child.offsetHeight;
        // }
        console.log('message-area alert', height);
        this.messageArea = height;
      });
    }

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
              <v-col id="chat" ref="chatContainer" style="height: 100%; overflow-y: auto; padding-left: 32px; padding-right: 32px;">
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
              </v-col>
              <v-col sm="1" md="1" />
            </v-row>
            <v-row style="background: var(--color-background-soft); color: var(--color-text);">
              <v-col sm="1" md="1" />
              <v-col id="message-area">
                <v-alert @click:close="$emit('close-alert')" v-model="alert.controll" :type="alert.type"  density="compact" :text="alert.message" :title="alert.title" closable style="margin-bottom: 16px;">
                </v-alert>
                <div v-if="responding" style="position: relative; height: 174px; width: 100%; display: flex; justify-content: center; align-items: center;">
                  <div style="position: relative; width: 174px; height: 174px;">
                  <div class="pulse2" style="top: 49.8px; left: 13.1px;"></div>
                  <div class="pulse2" style="top: 92.6px; left: 39.8px;"></div>
                  <div class="pulse2" style="top: 50.4px; left: 60.6px;"></div>
                  <div class="pulse2" style="top: 108.9px; left: 64.4px;"></div>
                  <div class="pulse3" style="top: 97.17px; left: 86.8px;"></div>
                  <div class="pulse" style="top: 81px; left: 102px;"></div>
                  <div class="pulse" style="top: 8.3px; left: 62.75px"></div>
                  <div class="pulse2" style="top: 23px; left: 91.89px;"></div>

                  <div class="pulse" style="top: 75.5px; left: 60.8px;"></div>
                  <div class="pulse" style="top: 59.8px; left: 34.7px;"></div>
                  <div class="pulse2" style="top: 15.64px; left: 24.78px;"></div>

                  <div class="pulse" style="top: 81.4px; left: 102.1px;"></div>

                  <div class="pulse3" style="top: 56.55px; left: 77.63px;"></div>

                  <div class="pulse3" style="top: 47.82px; left: 99.3px;"></div>
                  <div class="pulse" style="top: 32.62px; left: 56.73px;"></div>
                  <div class="pulse3" style="top: 70.38px; left: 22.5px;"></div>
                  <div class="pulse2" style="top: 98.53px; left: 21.19px;"></div>

                </div>
                </div>
                <v-textarea v-else no-resize="true" solo filled placeholder="Mensagem Llama" :rows="textareaRows"
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
  position: absolute;
  width: 4px;
  height: 4px;
  background-color: var(--color-text);
  border-radius: 50%;
  animation: pulse 1s infinite;
}
.pulse2 {
  position: absolute;
  width: 6px;
  height: 6px;
  background-color: var(--color-text);
  border-radius: 50%;
  animation: pulse 3s infinite;
}
.pulse3 {
  position: absolute;
  top: 33%;
  left: 10%;
  width: 8px;
  height: 8px;
  background-color: var(--color-text);
  border-radius: 50%;
  animation: pulse 4s infinite;
}
.pulse4 {
  position: absolute;
  top: 33%;
  left: 80%;
  width: 4px;
  height: 4px;
  background-color: var(--color-text);
  border-radius: 50%;
  animation: pulse 4s infinite;
}
</style>
