<template>
  <div v-if="currentPage.route !== '/login' && currentPage.route !== '/index.html'">
    <v-app-bar app>
      <v-toolbar-title>
        <span>{{ currentPage.title }}</span>
        <span v-if="currentPage.route === '/members'">: {{ memberCount }}</span>
        <span v-if="currentPage.route === '/officers'"
          >: {{ officerCount }}</span
        >
      </v-toolbar-title>
      <v-divider
        v-if="currentPage.search"
        class="mx-4"
        inset
        vertical
      ></v-divider>
      <v-text-field
        v-if="currentPage.route === '/members'"
        v-model="searchMembers"
        append-icon="search"
        label="Search"
        single-line
        hide-details
        class="mr-2"
      />
      <v-text-field
        v-if="currentPage.route === '/officers'"
        v-model="searchOfficers"
        append-icon="search"
        label="Search"
        single-line
        hide-details
        class="mr-2"
      />
      <div v-if="!currentPage.search" class="flex-grow-1"></div>
      <v-btn
        text
        v-if="currentPage.button"
        @click="buttonClicked(currentPage.route)"
        :disabled="!isMembership"
        >{{ currentPage.button }}</v-btn
      >
    </v-app-bar>
    <ConfirmPrompt
      :title="confirmTitle"
      :body="confirmBody"
      :open="confirmDialog"
      :snackbarTrigger="confirmSnackbar"
      :snackbarText="confirmSnackbarText"
      @cancel="answerDialog"
      @ok="answerDialog('ok')"
    />
  </div>
</template>

<script>
import store from "@/store";
import DatabaseMixin from "@/mixins/DatabaseMixin.js";
import ConfirmPrompt from "./ConfirmPrompt.vue";

export default {
  components: { ConfirmPrompt },
  mixins: [DatabaseMixin],
  data: () => ({
    searchMembers: "",
    searchOfficers: "",
    pages: [
      { route: "/login" },
      { route: "/index.html" },
      { title: "Dashboard", route: "/" },
      {
        title: "Members",
        route: "/members",
        button: "New Member",
        search: true
      },
      {
        title: "Officers",
        route: "/officers",
        button: "New Officer",
        search: true
      },
      {
        title: "Logs",
        route: "/logs",
        button: "Clear Logs"
      },
      { title: "Help", route: "/help" },
      { title: "Settings", route: "/settings" },
      { title: "UST Medical Missions Inc.", route: "/registration" }
    ],
    confirmTitle: "",
    confirmBody: "",
    confirmDialog: false,
    dialogTrigger: "",
    confirmSnackbar: 0,
    confirmSnackbarText: ""
  }),
  watch: {
    searchMembers() {
      this.$store.commit("updateSearchMembers", this.searchMembers);
    },
    searchOfficers() {
      this.$store.commit("updateSearchOfficers", this.searchOfficers);
    },
    currentPage() {
      // Reset search on page change
      this.searchMembers = "";
      this.searchOfficers = "";
    }
  },
  computed: {
    currentPage() {
      return this.pages.find(({ route }) => route === this.$route.path);
    },
    memberCount() {
      return store.state.members.length;
    },
    officerCount() {
      const listOfficers = [];
      store.state.members.forEach(member => {
        if (member.position !== "Member") {
          member.fullPosition = member.position + " - " + member.position2;
          listOfficers.push(member);
        }
      });
      return listOfficers.length;
    },
    isMembership() {
      return store.state.isMembership;
    }
  },
  methods: {
    buttonClicked(route) {
      if (route === "/members") {
        this.$store.commit("updateMemberDialog", true);
      } else if (route === "/officers") {
        this.$store.commit("updateOfficerDialog", true);
      } else if (route === "/logs") {
        this.openDialog("db_clear_logs");
      }
    },
    openDialog(trigger) {
      switch (trigger) {
        case "db_clear_logs":
          this.confirmTitle = "Clear all logs?";
          this.confirmBody = "This will delete all logs in the database.";
          this.confirmSnackbarText = "Cleared all logs!";
      }
      this.confirmDialog = true;
      this.dialogTrigger = trigger;
    },
    answerDialog(answer) {
      if (answer === "ok") {
        switch (this.dialogTrigger) {
          case "db_clear_logs":
            this.db_clear_logs();
        }
        this.confirmSnackbar++;
      }
      this.confirmDialog = false;
    }
  }
};
</script>
