<template>
  <v-card>
    <v-card-text>
      <v-switch v-model="darkMode" color="primary" label="Dark Mode"></v-switch>
      <div class="buttons-container">
        <v-btn @click="openDialog('startNewAY')" :disabled="!isMembership">{{
          newAYText
        }}</v-btn>
        <v-btn @click="openDialog('exportDB')" :disabled="!isMembership"
          >Export Database</v-btn
        >
        <v-btn @click="importDB('open')" :disabled="!isMembership"
          >Import Database</v-btn
        >
      </div>
      <v-divider></v-divider>

      <v-row justify="end">
        <v-btn
          color="error"
          class="mt-4 mb-1 mr-4"
          @click="openDialog('clearDB')"
          :disabled="!isMembership"
        >
          <v-icon left>warning</v-icon>Reset Database
        </v-btn>
      </v-row>
    </v-card-text>
    <ConfirmPrompt
      :title="confirmTitle"
      :body="confirmBody"
      :open="confirmDialog"
      :snackbarTrigger="confirmSnackbar"
      :snackbarText="confirmSnackbarText"
      @cancel="answerDialog"
      @ok="answerDialog('ok')"
    />

    <v-dialog v-model="restoreDialog" persistent max-width="500">
      <v-card>
        <v-card-title class="headline">Choose a .mmi file</v-card-title>
        <v-card-text>
          The imported database will merge with the existing one. Imported data
          will have priority in case of duplicates.
          <v-form ref="fileForm">
            <v-file-input
              v-model="mmiFile"
              accept=".mmi"
              label="db.mmi"
              :rules="fileInputRules"
              v-if="!isRestoring"
            ></v-file-input>
          </v-form>
        </v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>

          <v-btn text @click="importDB('close')" v-if="!isRestoring"
            >Cancel</v-btn
          >
          <v-btn :loading="isRestoring" text @click="importDB('execute')"
            >Restore</v-btn
          >
        </v-card-actions>
      </v-card>
    </v-dialog>
    <v-snackbar v-model="snackbar" :timeout="1500">{{
      snackbarText
    }}</v-snackbar>
  </v-card>
</template>

<script>
import DatabaseMixin from "@/mixins/DatabaseMixin";
import ConfirmPrompt from "@/components/ConfirmPrompt.vue";
import store from "@/store";

export default {
  mixins: [DatabaseMixin],
  components: { ConfirmPrompt },
  data: () => ({
    snackbar: false,
    snackbarText: "",
    isRestoring: false,
    mmiFile: [],
    darkMode: true,
    restoreDialog: false,
    confirmTitle: "",
    confirmBody: "",
    confirmDialog: false,
    dialogTrigger: "",
    confirmSnackbar: 0,
    confirmSnackbarText: "",
    fileInputRules: [
      v =>
        (!!v && v instanceof Blob && v.name.split(".").pop() === "mmi") ||
        "Please choose a .mmi db file."
    ]
  }),
  created() {
    const enableDark = JSON.parse(localStorage.getItem("darkMode"));
    if (enableDark !== null) {
      this.darkMode = enableDark;
    }
  },
  watch: {
    darkMode(val) {
      this.$vuetify.theme.dark = val;
      localStorage.setItem("darkMode", val);
    }
  },
  computed: {
    isMembership() {
      return store.state.isMembership;
    },
    newAYText() {
      const currentAY = localStorage.getItem("AY").split("-");
      const currentYear = new Date().getFullYear();
      if (currentAY[0] < currentYear) {
        return "Start New Academic Year";
      } else {
        return "Restart Academic Year";
      }
    }
  },
  methods: {
    openDialog(trigger) {
      switch (trigger) {
        case "clearDB":
          this.confirmTitle = "Reset database?";
          this.confirmBody =
            "This will permanently delete all members and logs in the database. This will not reset the current A.Y.";
          break;
        case "clearDB2":
          this.confirmTitle = "This can't be undone!";
          this.confirmBody =
            "Clearing the database is permanent. Please make a backup before continuing. If you still you want to proceed, press ok.";
          this.confirmSnackbarText = "Database cleared!";
          break;
        case "startNewAY":
          // Grammar stuff
          const currentAY = localStorage.getItem("AY").split("-");
          const currentYear = new Date().getFullYear();
          let grammar;
          if (currentAY[0] < currentYear) {
            grammar = "Start";
          } else {
            grammar = "Restart";
          }
          const newAY = `${currentYear}-${currentYear + 1}`;
          this.confirmTitle = `${grammar} A.Y. ${newAY}?`;
          this.confirmSnackbarText = `${grammar}ed A.Y. ${newAY}`;
          this.confirmBody =
            "This will inactivate all memberships, retire all officers, and reset top missioners.";
          break;
        case "exportDB":
          this.confirmTitle = "Export database?";
          this.confirmBody =
            "This will create a .mmi file containing all members and logs.";
          this.confirmSnackbarText = "Database exported!";
      }
      this.confirmDialog = true;
      this.dialogTrigger = trigger;
    },
    answerDialog(answer) {
      if (answer === "ok") {
        switch (this.dialogTrigger) {
          case "clearDB":
            this.confirmDialog = false;
            setTimeout(() => {
              this.openDialog("clearDB2");
            }, 300);
            return;
          case "clearDB2":
            this.db_clear_members();
            this.db_clear_logs();
            this.start_new_AY();
            this.$store.commit("syncLogs");
            break;
          case "startNewAY":
            store.state.members.forEach(member => {
              // Reset Memberships
              member.status = "Inactive";
              // Retire Officers
              if (member.position !== "Member") {
                member.position = "Member";
                member.position2 = "Senior Member";
              }
              // Reset top missioners
              member.totalWorkTime = 0;
              // Update db
              const membersOS = this.getOS("members", "rw");
              membersOS.put(member);
            });
            // Sync store
            this.$store.commit("syncMembers");
            // Set new AY
            this.start_new_AY();
            break;
          case "exportDB":
            this.exportDB();
        }
        this.confirmSnackbar++;
      }
      this.confirmDialog = false;
    },
    exportDB() {
      let file = JSON.stringify({
        members: store.state.members,
        logs: store.state.logs.filter(log => !log.dontExport)
      });
      file = new Blob([file], { type: "text/plain" });
      let link = document.createElement("a");
      link.download =
        "db_" +
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

      // Set variables for log message
      const membersCount = store.state.members.length;
      const logsCount = store.state.logs.length;
      // Create log, dontExport === true
      this.db_create_log(
        `Exported database with ${membersCount} ${
          membersCount === 1 ? "member" : "members"
        } and ${logsCount} ${logsCount === 1 ? "log" : "logs"}.`,
        true
      );
    },
    importDB(action) {
      switch (action) {
        case "open":
          this.restoreDialog = true;
          break;

        case "close":
          this.restoreDialog = false;
          this.$refs.fileForm.resetValidation();
          break;

        case "execute":
          if (this.$refs.fileForm.validate()) {
            this.isRestoring = true;
            const fr = new FileReader();
            fr.onload = e => {
              const file = JSON.parse(e.target.result);

              // This function will return a snackbar text
              this.snackbarText = this.db_import(file);
              // Give time for import to finish
              setTimeout(() => {
                this.importDB("close");
                this.isRestoring = false;
                this.snackbar = true;
              }, 1500);
            };
            fr.readAsText(this.mmiFile);
          }
      }
    }
  }
};
</script>

<style scoped>
.buttons-container {
  display: grid;
  width: 35%;
  grid-gap: 15px;
  margin-bottom: 15px;
}
</style>
