<template>
  <div>
    <v-dialog v-model="open" persistent max-width="500px">
      <v-card>
        <v-card-title class="headline">{{ title }}</v-card-title>

        <v-card-text>{{ body }}</v-card-text>

        <v-card-actions>
          <div class="flex-grow-1"></div>

          <v-btn text @click="$emit('cancel')">Cancel</v-btn>

          <v-btn text @click="$emit('ok')">Ok</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
    <v-snackbar v-model="snackbar" :timeout="1000"><span> {{ snackbarText }} </span></v-snackbar>
  </div>
</template>

<script>
export default {
  props: {
    title: {
      type: String
    },
    body: {
      type: String
    },
    snackbarText: {
      type: String
    },
    open: {
      type: Boolean
    },
    snackbarTrigger: {
      type: Number
    }
  },
  data: () => ({ snackbar: false }),
  watch: {
    snackbarTrigger() {
      this.snackbar = true;
    }
  }
};
</script>