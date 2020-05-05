<template>
  <v-card class="pa-2 ma-2">
    <v-dialog v-model="officerDialog" width="60%" persistent>
      <v-card>
        <v-card-title>
          <span class="headline">New Officer</span>
        </v-card-title>

        <v-card-text>
          <v-container>
            <v-form ref="officerForm">
              <div v-on:keyup.enter="save">
                <v-autocomplete
                  v-model="selected"
                  label="Member"
                  :items="notOfficers"
                  item-text="fullName"
                  item-value="id"
                  :rules="requiredField"
                ></v-autocomplete>
                <v-row>
                  <v-col>
                    <v-text-field v-model="position2" label="Position" :rules="requiredField" />
                  </v-col>
                  <v-col>
                    <v-radio-group v-model="position" row>
                      <v-radio color="primary" label="Executive Board" value="Executive Board" />
                      <v-radio
                        color="primary"
                        label="Committee Secretary"
                        value="Committee Secretary"
                      />
                    </v-radio-group>
                  </v-col>
                </v-row>
              </div>
            </v-form>
          </v-container>
        </v-card-text>

        <v-card-actions>
          <div class="flex-grow-1"></div>
          <v-btn text @click="close">Cancel</v-btn>
          <v-btn text @click="save">Save</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
    <v-data-table
      fixed-header
      max-height="78vh"
      hide-default-footer
      :items-per-page="10"
      :search="search"
      :headers="headers"
      :items="officers"
      :page.sync="page"
      @page-count="pageCount = $event"
    >
      <template v-slot:item.action="{ item }">
        <v-tooltip bottom>
          <template v-slot:activator="{ on }">
            <v-icon
              small
              class="mr-2"
              v-on="{ ...on }"
              @click="openDialog('removeOfficer', item)"
            >person_add_disabled</v-icon>
          </template>
          <span>Remove Officer</span>
        </v-tooltip>
      </template>
    </v-data-table>
    <div class="text-center py-2">
      <v-pagination v-model="page" :length="pageCount" total-visible="10"></v-pagination>
    </div>
    <ConfirmPrompt
      :title="confirmTitle"
      :body="confirmBody"
      :open="confirmDialog"
      :snackbarTrigger="confirmSnackbar"
      :snackbarText="confirmSnackbarText"
      @cancel="answerDialog"
      @ok="answerDialog('ok')"
    />
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
    position: "Executive Board",
    position2: "",
    page: 1,
    pageCount: 0,
    headers: [
      { text: "Full Name", value: "fullName" },
      { text: "Position", value: "fullPosition" },
      { text: "Section", value: "section" },
      { text: "Contact", value: "contact" }
    ],
    requiredField: [v => v !== "" || "This is a required field."],
    confirmTitle: "",
    confirmBody: "",
    confirmDialog: false,
    dialogTrigger: "",
    confirmSnackbar: 0,
    confirmSnackbarText: "",
    payloadHolder: ""
  }),

  created() {
    if (store.state.isMembership) {
      this.headers.push({ text: "", value: "action", sortable: false });
    }
  },

  computed: {
    officers() {
      return store.state.members.filter(member => member.position !== "Member");
    },
    notOfficers() {
      return store.state.members.filter(member => member.position === "Member");
    },
    members() {
      return store.state.members;
    },
    search() {
      return store.state.searchOfficers;
    },
    officerDialog() {
      return store.state.officerDialog;
    }
  },
  methods: {
    close() {
      this.$store.commit("updateOfficerDialog", false);
      this.selected = "";
      this.position = "Executive Board";
      this.position2 = "";
      this.$refs.officerForm.resetValidation();
    },
    save() {
      if (this.$refs.officerForm.validate()) {
        const today = new Date().getTime();

        const newOfficer = this.members.find(({ id }) => id === this.selected);
        newOfficer.position = this.position;
        newOfficer.position2 = this.position2;
        newOfficer.totalWorkTime = 0;

        this.db_update_members(newOfficer);

        // Create log
        this.db_create_log(
          `${newOfficer.fName} ${newOfficer.lName} is now ${this.position} - ${this.position2}.`
        );

        this.close();
      }
    },
    removeOfficer(officer) {
      const today = new Date().getTime();

      officer.position = "Member";
      officer.position2 = "Senior Member";
      officer.totalWorkTime = 0;
      this.db_update_members(officer);

      // Create log
      this.db_create_log(
        `${officer.fName} ${officer.lName} is demoted to Senior Member`
      );
    },
    openDialog(trigger, payload) {
      switch (trigger) {
        case "removeOfficer":
          this.confirmTitle = "Remove officer?";
          this.confirmBody = `Are you sure you want to remove ${payload.fullName} from the list of officers?`;
          this.confirmSnackbarText = "Officer removed from list!";
      }
      this.confirmDialog = true;
      this.payloadHolder = payload;
      this.dialogTrigger = trigger;
    },
    answerDialog(answer) {
      if (answer === "ok") {
        switch (this.dialogTrigger) {
          case "removeOfficer":
            this.removeOfficer(this.payloadHolder);
        }
        this.confirmSnackbar++;
      }
      this.confirmDialog = false;
    }
  }
};
</script>
