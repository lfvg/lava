<script>
export default {
    props: {
        queryText: {
            type: String,
            required: true,
        },
        responding: {
            type: Boolean,
            required: true,
        },
        rows: {
            type: [String, Number], // Allow both String and Number
            required: true,
        },
        alert: {
            type: Object,
            required: true,
        },
        alertControll: {
            type: Boolean,
            required: true
        }
    },
    emits: ['update-query-text', 'submit-query', 'close-alert', 'stop-query'],
    watch: {
        queryText(newVal) {
            this.$emit('update:queryText', newVal)
        }
    }
}
</script>

<template>
    <v-col sm="1" md="1" />
    <v-col>
        <v-alert @click:close="$emit('close-alert')" v-model="alert.controll" :type="alert.type" density="compact"
            :text="alert.message" :title="alert.title" closable style="margin-bottom: 16px;">
        </v-alert>
        <v-textarea no-resize="true" solo filled placeholder="Mensagem Llama" :rows="rows"
            v-bind:model-value="queryText" v-on:update:model-value="(event) => $emit('update-query-text', event)"
            :disabled="responding" @click:append-inner="$emit('submit-query')"
            @keydown.enter.exact.prevent="$emit('submit-query')">
            <template v-slot:append-inner>
                <v-icon v-if="responding" size="x-large"
                    style="align-self: center; color: var(--color-text); pointer-events: auto;"
                    icon="mdi-stop-circle-outline" v-on:click="$emit('stop-query')" />
                <v-icon v-else style="align-self: center" icon="mdi-send" v-on:click="$emit('submit-query')" />
            </template>
        </v-textarea>
    </v-col>
    <v-col sm="1" md="1" />
</template>

<style></style>
