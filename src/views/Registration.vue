<template>
  <div class="px-2 py-2">
    <v-card class="pa-4 mb-2">
      <v-card-title>New Member</v-card-title>
      <v-card-text>
        <v-form ref="memberForm">
          <div v-on:keyup.enter="register">
            <v-row>
              <v-col cols="4">
                <v-text-field
                  v-model="newMember.fName"
                  label="First Name"
                  :rules="requiredField"
                  ref="autofocus"
                ></v-text-field>
              </v-col>
              <v-col cols="4">
                <v-text-field
                  v-model="newMember.mName"
                  label="Middle Name"
                ></v-text-field>
              </v-col>
              <v-col cols="4">
                <v-text-field
                  v-model="newMember.lName"
                  label="Last Name"
                  :rules="requiredField"
                ></v-text-field>
              </v-col>
            </v-row>
            <v-row>
              <v-col cols="4">
                <v-text-field
                  v-model="newMember.id"
                  label="Student Number"
                  :rules="requiredField"
                ></v-text-field>
              </v-col>
              <v-col cols="4">
                <v-text-field
                  v-model="newMember.section"
                  label="Section"
                  :rules="requiredField"
                ></v-text-field>
              </v-col>
              <v-col cols="4">
                <v-select
                  v-model="newMember.status"
                  :items="status"
                  label="Status"
                  :rules="requiredField"
                ></v-select>
              </v-col>
            </v-row>
            <v-row>
              <v-col cols="4">
                <v-text-field
                  v-model="newMember.contact"
                  label="Contact Number"
                  :rules="requiredField"
                ></v-text-field>
              </v-col>
              <v-col cols="8">
                <v-text-field
                  v-model="newMember.email"
                  label="Email"
                ></v-text-field>
              </v-col>
            </v-row>
          </div>
        </v-form>
      </v-card-text>
      <v-card-actions class="pt-0">
        <div class="flex-grow-1"></div>
        <v-btn text @click="openPrompt('exportMembers')">Export</v-btn>
        <v-btn text @click="openPrompt('reset')">Reset</v-btn>
        <v-btn text @click="clear">Clear</v-btn>
        <v-btn text @click="register">Register</v-btn>
      </v-card-actions>
    </v-card>
    <v-card>
      <v-card-title>New Members: {{ newMembers.length }}</v-card-title>
      <v-card-text>
        <span>ⓘ INFORMATION</span>
        <ul>
          <li>You can access this page again even without internet.</li>
        </ul>
      </v-card-text>
    </v-card>
    <v-snackbar :color="snackbarColor" v-model="showSnackbar" :timeout="2000">{{
      snackbarText
    }}</v-snackbar>
    <ConfirmPrompt
      :title="promptTitle"
      :body="promptBody"
      :open="promptOpen"
      @cancel="answerPrompt(false)"
      @ok="answerPrompt(true)"
    />
  </div>
</template>

<script>
import ConfirmPrompt from "@/components/ConfirmPrompt.vue";

export default {
  components: { ConfirmPrompt },
  data: () => ({
    newMember: {},
    newMembers: [],
    logs: [],
    showSnackbar: false,
    snackbarText: "",
    snackbarColor: "",
    status: ["Active", "Inactive"],
    requiredField: [v => (!!v && v.toString().length > 0) || "Required field."],
    promptTitle: "",
    promptBody: "",
    promptOpen: false,
    promptTrigger: ""
  }),
  created() {
    let temp = JSON.parse(localStorage.getItem("new_members"));
    temp && (this.newMembers = temp);
    temp = JSON.parse(localStorage.getItem("new_logs"));
    temp && (this.logs = temp);
  },
  methods: {
    register() {
      if (this.$refs.memberForm.validate()) {
        // Check for duplicates
        if (!this.newMembers.some(member => member.id === this.newMember.id)) {
          // Push member to local storage
          this.newMembers.push(this.newMember);
          localStorage.setItem("new_members", JSON.stringify(this.newMembers));
          // Configure snackbar
          this.snackbarText = `Registered ${this.newMember.fName} ${this.newMember.lName}`;
          this.snackbarColor = "success";
          // Create log
          let log = {};
          // Add time
          log.time = Date.now();
          // Compose log
          log.text = `${new Date(log.time)
            .toISOString()
            .slice(0, 10)} | ${new Date().toLocaleTimeString(log.time)}: ${
            this.newMember.fName
          } ${this.newMember.lName} is now registered.`;
          // Add ID
          log.id =
            Math.random()
              .toString(36)
              .substring(2) + Date.now().toString(36);
          // Push log to local storage
          this.logs.push(log);
          localStorage.setItem("new_logs", JSON.stringify(this.logs));
          // Clear registration sheet
          this.clear();
        } else {
          this.snackbarText = `${this.newMember.id} is already registered.`;
          this.snackbarColor = "error";
        }
        this.showSnackbar = true;
      }
    },
    clear() {
      this.newMember = {};
      this.$refs.memberForm.resetValidation();
    },
    openPrompt(trigger) {
      switch (trigger) {
        case "reset":
          this.promptTitle = "Reset and clear all registration records?";
          this.promptBody =
            "This will delete all members registered on this device. Make sure you export beforehand if you want to keep data.";
          this.snackbarText = "Deleted all records.";
          this.snackbarColor = "success";
          break;
        case "exportMembers":
          this.promptTitle = "Export data?";
          this.promptBody =
            "This will export all members registered on this device.";
          this.snackbarText = "Successfully exported all members.";
          this.snackbarColor = "success";
      }
      this.promptOpen = true;
      this.promptTrigger = trigger;
    },
    answerPrompt(proceed) {
      if (proceed) {
        switch (this.promptTrigger) {
          case "reset":
            this.newMembers = [];
            localStorage.removeItem("new_members");
            this.logs = [];
            localStorage.removeItem("new_logs");
            this.clear();
            break;
          case "exportMembers":
            let file = JSON.stringify({
              members: this.newMembers,
              logs: this.logs
            });
            file = new Blob([file], { type: "text/plain" });
            let link = document.createElement("a");
            link.download =
              "new_members_" +
              new Date()
                .toISOString()
                .slice(0, 10)
                .split("-")
                .join("")
                .slice(2) +
              new Date()
                .toTimeString()
                .slice(0, 8)
                .split(":")
                .join("") +
              ".mmi";
            link.href = window.URL.createObjectURL(file);
            link.click();
        }
        this.showSnackbar = true;
      }
      this.promptOpen = false;
    }
  }
};
</script>
