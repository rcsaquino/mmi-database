<template>
  <div class="time-in-out-container">
    <v-card class="pa-3">
      <v-autocomplete
        v-model="selectedIn"
        label="Member/Officer"
        :items="notWorkingMembers"
        item-text="fullName"
        item-value="id"
        clearable
      ></v-autocomplete>
      <v-card-actions>
        <div class="flex-grow-1"></div>
        <v-btn text @click="timeInOut(selectedIn, true)">Time In</v-btn>
      </v-card-actions>
    </v-card>
    <v-card class="pa-3">
      <v-autocomplete
        v-model="selectedOut"
        label="Member/Officer"
        :items="workingMembers"
        item-text="fullName"
        item-value="id"
        clearable
      ></v-autocomplete>
      <v-card-actions>
        <div class="flex-grow-1"></div>
        <v-btn text @click="timeInOut(selectedOut, false)">Time Out</v-btn>
      </v-card-actions>
    </v-card>
    <v-snackbar v-model="snackbar" :timeout="1000">{{ snackbarText }}</v-snackbar>
  </div>
</template>

<script>
import store from "@/store";
import DatabaseMixin from "@/mixins/DatabaseMixin";

export default {
  mixins: [DatabaseMixin],
  data: () => ({
    selectedIn: "",
    selectedOut: "",
    snackbar: false,
    snackbarText: ""
  }),

  computed: {
    notWorkingMembers() {
      return store.state.members.filter(
        member => !member.isWorking && member.status === "Active"
      );
    },
    workingMembers() {
      const today = Date.now();

      let memberList = [];

      store.state.members
        .filter(member => member.isWorking && member.status === "Active")
        .forEach(member => {
          // Check if time in is today
          if (
            this.convertTime(member.lastTimeIn, "date") ===
            this.convertTime(today, "date")
          ) {
            memberList.push(member);
          } else {
            member.isWorking = false;
            this.db_update_members(member);

            // Create log
            this.db_create_log(
              `${member.fName} ${
                member.lName
              } didn't time out last ${this.convertTime(
                member.lastTimeIn,
                "date"
              )}. No points credited.`
            );
          }
        });
      return memberList;
    }
  },

  methods: {
    timeInOut(selected, timingIn) {
      const today = Date.now();

      // Set selected member to a variable
      const member = store.state.members.find(member => member.id === selected);

      // TIME IN
      if (timingIn) {
        member.isWorking = true;
        member.lastTimeIn = today;

        // Update DB
        this.db_update_members(member);

        // TIME OUT
      } else {
        // Init variables
        const workTime = today - member.lastTimeIn;
        const updatedTotalWork = workTime + member.totalWorkTime;
        const addedPoints = workTime / 360000;
        let timeString;
        if (workTime >= 3600000) {
          timeString = Math.round((workTime / 3600000) * 100) / 100;
          timeString = timeString + (timeString === 1 ? " hour" : " hours.");
        } else if (workTime >= 60000) {
          timeString = Math.round((workTime / 60000) * 100) / 100;
          timeString = timeString + (timeString === 1 ? " minute" : " minutes.");
        } else {
          timeString = Math.round((workTime / 1000) * 100) / 100;
          timeString = timeString + (timeString === 1 ? " second." : " seconds.");
        }

        // Add members points if member
        if (member.position === "Member") {
          member.points = Math.round((member.points + addedPoints) * 100) / 100;
        }

        member.totalWorkTime = updatedTotalWork;
        member.isWorking = false;

        // Update DB
        this.db_update_members(member);

        // Create log
        this.db_create_log(
          `${member.fName} ${member.lName} worked for ${timeString}`
        );
      }
      if (timingIn) {
        this.snackbarText = "Time in: Success!";
        this.selectedIn = "";
      } else {
        this.snackbarText = "Time out: Success!";
        this.selectedOut = "";
      }
      this.snackbar = true;
    },
    convertTime(time, val) {
      return val === "date"
        ? new Date(time).toISOString().slice(0, 10)
        : new Date().toLocaleTimeString(time);
    }
  }
};
</script>

<style scoped>
.time-in-out-container {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  grid-gap: 15px;
}
</style>