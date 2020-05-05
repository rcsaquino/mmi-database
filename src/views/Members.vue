<template>
  <v-card class="pa-2 ma-2">
    <v-dialog v-model="memberDialog" width="50%" persistent>
      <v-card>
        <v-card-title>
          <span class="headline">{{ formTitle }}</span>
          <div class="flex-grow-1"></div>
          <v-tooltip bottom v-if="formTitle === 'Edit Member'">
            <template v-slot:activator="{ on }">
              <v-icon
                class="clickable"
                v-on="on"
                @click="openDialog('deleteMember', editedMember)"
              >delete</v-icon>
            </template>
            <span>Delete Member</span>
          </v-tooltip>
        </v-card-title>

        <v-card-text>
          <v-container>
            <v-form ref="memberForm">
              <div v-on:keyup.enter="save">
                <v-row>
                  <v-col cols="4">
                    <v-text-field
                      v-model="editedMember.fName"
                      label="First Name"
                      :rules="requiredField"
                      ref="autofocus"
                    ></v-text-field>
                  </v-col>
                  <v-col cols="4">
                    <v-text-field v-model="editedMember.mName" label="Middle Name"></v-text-field>
                  </v-col>
                  <v-col cols="4">
                    <v-text-field
                      v-model="editedMember.lName"
                      label="Last Name"
                      :rules="requiredField"
                    ></v-text-field>
                  </v-col>
                </v-row>
                <v-row>
                  <v-col cols="4">
                    <v-text-field
                      v-model="editedMember.id"
                      label="Student Number"
                      :disabled="isEditing"
                      :rules="requiredField"
                    ></v-text-field>
                  </v-col>
                  <v-col cols="4">
                    <v-text-field
                      v-model="editedMember.section"
                      label="Section"
                      :rules="requiredField"
                    ></v-text-field>
                  </v-col>
                  <v-col cols="4">
                    <v-select
                      v-model="editedMember.status"
                      :items="status"
                      label="Status"
                      :rules="requiredField"
                    ></v-select>
                  </v-col>
                </v-row>
                <v-row>
                  <v-col cols="4">
                    <v-text-field
                      v-model="editedMember.contact"
                      label="Contact Number"
                      :rules="requiredField"
                    ></v-text-field>
                  </v-col>
                  <v-col cols="8">
                    <v-text-field v-model="editedMember.email" label="Email"></v-text-field>
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
      :class="{ clickable: isMembership }"
      fixed-header
      max-height="78vh"
      hide-default-footer
      :items-per-page="10"
      :search="search"
      :headers="headers"
      :items="members"
      :page.sync="page"
      @page-count="pageCount = $event"
      @click:row="editMember"
    ></v-data-table>
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
    page: 1,
    pageCount: 0,
    formTitle: "New Member",
    status: ["Active", "Inactive"],
    editedMember: {},
    requiredField: [v => (!!v && v.toString().length > 0) || "Required field."],
    confirmTitle: "",
    confirmBody: "",
    confirmDialog: false,
    dialogTrigger: "",
    confirmSnackbar: 0,
    confirmSnackbarText: "",
    isEditing: false
  }),

  computed: {
    members() {
      return store.state.members;
    },
    search() {
      return store.state.searchMembers;
    },
    headers() {
      return store.state.isMembership
        ? [
            { text: "Full Name", value: "fullName" },
            { text: "Section", value: "section" },
            { text: "Contact", value: "contact" },
            { text: "Points", value: "points" },
            { text: "Status", value: "status" }
          ]
        : [
            { text: "Full Name", value: "fullName" },
            { text: "Section", value: "section" },
            { text: "Contact", value: "contact" },
            { text: "Status", value: "status" }
          ];
    },
    memberDialog() {
      return store.state.memberDialog;
    },
    isMembership() {
      return store.state.isMembership;
    }
  },

  watch: {
    memberDialog(open) {
      if (open) {
        requestAnimationFrame(() => {
          this.$refs.autofocus.focus();
        });
      }
    }
  },

  methods: {
    editMember(member) {
      if (store.state.isMembership) {
        this.editedMember = Object.assign({}, member);
        this.formTitle = "Edit Member";
        this.isEditing = true;
        this.$store.commit("updateMemberDialog", true);
      }
    },

    close() {
      this.$store.commit("updateMemberDialog", false);
      this.formTitle = "New Member";
      this.isEditing = false;
      this.editedMember = { status: "Active" };
      this.$refs.memberForm.resetValidation();
    },

    save() {
      if (this.$refs.memberForm.validate()) {
        // Check duplicates for new members
        const hasDuplicates = this.members.some(
          member => member.id === this.editedMember.id
        );
        const isNewMember = this.formTitle === "New Member";
        if (isNewMember && hasDuplicates) {
          this.openDialog("duplicate", this.editedMember);
        } else {
          this.db_update_members(this.editedMember);
          isNewMember &&
            this.db_create_log(
              `${this.editedMember.fName} ${this.editedMember.lName} is now registered.`
            );
          this.close();
        }
      }
    },
    openDialog(trigger, payload) {
      switch (trigger) {
        case "deleteMember":
          this.confirmTitle = "Delete member?";
          this.confirmBody = `Are you sure you want to delete ${payload.fullName} from database?`;
          this.confirmSnackbarText = "Member deleted from database!";
          break;
        case "duplicate":
          this.confirmTitle = `${payload.id} already exist!`;
          this.confirmBody = "Do you want to replace existing data?";
          this.confirmSnackbarText = "Member replaced from database!";
      }
      this.confirmDialog = true;
      this.dialogTrigger = trigger;
    },
    answerDialog(answer) {
      if (answer === "ok") {
        switch (this.dialogTrigger) {
          case "deleteMember":
            this.db_delete_member(this.editedMember);
            this.close();
            break;
          case "duplicate":
            this.db_update_members(this.editedMember);
            this.close();
        }
        this.confirmSnackbar++;
      }
      this.confirmDialog = false;
    }
  }
};
</script>
