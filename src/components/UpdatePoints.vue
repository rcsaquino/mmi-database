<template>
  <v-card class="py-3 px-4">
    <v-autocomplete
      v-model="selected"
      :search-input.sync="search"
      label="Members"
      :items="members"
      item-text="fullName"
      item-value="id"
      multiple
      chips
      deletable-chips
      hide-selected
      @change="search = ''"
      :disabled="!isMembership"
    ></v-autocomplete>
    <v-text-field
      v-model="points"
      label="Points"
      :disabled="!isMembership"
    ></v-text-field>
    <v-checkbox
      v-model="affectsWorkTime"
      color="primary"
      :disabled="!isMembership"
      v-bind="attrs"
      v-on="on"
    >
      <template v-slot:label>
        <v-tooltip top>
          <template v-slot:activator="{ on, attrs }">
            <span v-bind="attrs" v-on="on">Update Missioner Standing</span>
          </template>
          <span>Update missioner's standing on "Most Active Missioners" depending on the points added/deducted.</span>
        </v-tooltip>
      </template></v-checkbox
    >
    <v-row class="px-2 pb-2" justify="end">
      <v-btn text @click="openDialog('resetPoints')" :disabled="!isMembership"
        >Reset</v-btn
      >
      <v-btn text @click="updatePoints()" :disabled="!isMembership"
        >Deduct</v-btn
      >
      <v-btn text @click="updatePoints('add')" :disabled="!isMembership"
        >Add</v-btn
      >
    </v-row>
    <ConfirmPrompt
      :title="confirmTitle"
      :body="confirmBody"
      :open="confirmDialog"
      :snackbarTrigger="confirmSnackbar"
      :snackbarText="confirmSnackbarText"
      @cancel="answerDialog"
      @ok="answerDialog('ok')"
    />
    <v-snackbar v-model="snackbar" :timeout="1000">{{
      snackbarText
    }}</v-snackbar>
  </v-card>
</template>

<script>
import store from "@/store";
import DatabaseMixin from "@/mixins/DatabaseMixin";
import ConfirmPrompt from "@/components/ConfirmPrompt.vue";

export default {
  components: { ConfirmPrompt },
  mixins: [DatabaseMixin],
  data: () => ({
    selected: "",
    search: "",
    points: "",
    snackbar: false,
    snackbarText: "",
    confirmTitle: "",
    confirmBody: "",
    confirmDialog: false,
    dialogTrigger: "",
    confirmSnackbar: 0,
    confirmSnackbarText: "",
    affectsWorkTime: false,
  }),

  computed: {
    members() {
      return store.state.members.filter(
        (member) => member.position === "Member" && member.status === "Active"
      );
    },
    isMembership() {
      return store.state.isMembership;
    },
  },

  methods: {
    updatePoints(operator) {
      if (this.selected && !isNaN(this.points) && this.points !== "") {
        const today = new Date().getTime();
        this.members.forEach((member) => {
          this.selected.forEach((select) => {
            if (member.id === select) {
              if (operator === "add") {
                member.points += +this.points;
                if (this.affectsWorkTime) {
                  member.totalWorkTime += +this.points * 360000;
                }
              } else {
                member.points -= this.points;
                if (this.affectsWorkTime) {
                  member.totalWorkTime -= +this.points * 360000;
                }
              }

              this.db_update_members(member);

              // Create Log
              this.db_create_log(
                `${member.fName} ${member.lName} ${
                  operator === "add" ? "received" : "lost"
                } ${this.points} ${
                  this.points > 1 || this.points === 0 ? "points!" : "point!"
                }`
              );
            }
          });
        });
        this.snackbarText =
          this.points +
          (this.points > 1 || this.points === 0 ? " points " : " point ") +
          (operator === "add" ? "added." : "deducted.");
        this.snackbar = true;
        this.selected = "";
        this.points = "";
        this.affectsWorkTime = false;
      }
    },
    resetPoints() {
      const today = new Date().getTime();
      if (this.selected) {
        this.members.forEach((member) => {
          this.selected.forEach((select) => {
            if (member.id === select) {
              member.points = 0;
              if (this.affectsWorkTime) {
                member.totalWorkTime = 0;
              }
              this.db_update_members(member);

              // Create log
              this.db_create_log(
                `${member.fName} ${member.lName}'s points is reset to 0.`
              );
            }
          });
        });
        this.selected = "";
        this.points = "";

        this.affectsWorkTime = false;
      }
    },
    openDialog(trigger) {
      switch (trigger) {
        case "resetPoints":
          this.confirmTitle = "Reset points?";
          this.confirmBody = `This will reset the points of selected members to 0.`;
          this.confirmSnackbarText = "Points reset to 0.";
      }
      this.confirmDialog = true;
      this.dialogTrigger = trigger;
    },
    answerDialog(answer) {
      if (answer === "ok") {
        switch (this.dialogTrigger) {
          case "resetPoints":
            this.resetPoints();
        }
        this.confirmSnackbar++;
      }
      this.confirmDialog = false;
    },
  },
};
</script>
