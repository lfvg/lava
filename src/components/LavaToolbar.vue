<script>
  export default {
    props: ['miniVariant', 'sidebarOpenText', 'newChatText']
  }
</script>
<template>
    <v-toolbar dense flat color="var(--color-text)" style="color: inherit; background: var(--color-backgrund-color);">
      <v-btn v-if="miniVariant" elevation="0" icon @click="$emit('on-change-sidebar-click')" style="border-radius: 8px;">
        <v-icon>mdi-dock-left</v-icon>
        <v-tooltip activator="parent" location="bottom">{{ sidebarOpenText }}</v-tooltip>
      </v-btn>
      <div style="width: 16px;"></div>
      <v-btn v-if="miniVariant" elevation="0" icon @click="$emit('create-new-chat')" style="border-radius: 8px;">
        <v-icon>mdi-square-edit-outline</v-icon>
        <v-tooltip activator="parent" location="bottom">{{ newChatText }}</v-tooltip>
      </v-btn>
    </v-toolbar>
</template>

<style scoped>
</style>
