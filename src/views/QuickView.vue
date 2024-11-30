<template>
  <v-container style="height: 100%; border-radius: 5px; background: var(--color-background);">
    <v-textarea filled flat :no-resize="true" 
                placeholder="Mensagem Llama" 
                append-inner-icon="mdi-send" 
                rows="1">

    </v-textarea>
  </v-container>
</template>

<style>
body {
  background-color: transparent !important;
}
::-webkit-scrollbar {
  /** removes the scroolbar  */
  display: none;   
}
</style>
