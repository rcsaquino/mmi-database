<template>
  <v-navigation-drawer app permanent>
    <v-list-item>
      <v-list-item-content>
        <v-list-item-title>Medical Missions Inc.</v-list-item-title>
        <v-list-item-subtitle>{{currentUser}}</v-list-item-subtitle>
      </v-list-item-content>
      <v-tooltip bottom>
        <template v-slot:activator="{ on }">
          <v-icon v-on="{ ...on }" @click="openDialog('logout')">exit_to_app</v-icon>
        </template>
        <span>Logout</span>
      </v-tooltip>
    </v-list-item>

    <v-divider></v-divider>
    <v-list class="pa-2" rounded>
      <v-list-item v-for="route in routes" :key="route.title" @click="reroute(route.path)">
        <v-list-item-icon>
          <v-icon>{{ route.icon }}</v-icon>
        </v-list-item-icon>
        <v-list-item-content>
          <v-list-item-title>{{ route.title }}</v-list-item-title>
        </v-list-item-content>
      </v-list-item>
    </v-list>

    <v-divider></v-divider>

    <v-list class="pa-2" rounded>
      <v-list-item @click="reroute('/settings')">
        <v-list-item-icon>
          <v-icon>settings</v-icon>
        </v-list-item-icon>
        <v-list-item-content>
          <v-list-item-title>Settings</v-list-item-title>
        </v-list-item-content>
      </v-list-item>
    </v-list>
    <ConfirmPrompt
      :title="confirmTitle"
      :body="confirmBody"
      :open="confirmDialog"
      @cancel="answerDialog"
      @ok="answerDialog('ok')"
    />
  </v-navigation-drawer>
</template>

<script>
import store from "@/store";
import ConfirmPrompt from "./ConfirmPrompt.vue";

export default {
  components: { ConfirmPrompt },
  data: () => ({
    routes: [
      { title: "Dashboard", path: "/", icon: "dashboard" },
      { title: "Members", path: "/members", icon: "supervisor_account" },
      { title: "Officers", path: "/officers", icon: "verified_user" },
      { title: "Logs", path: "/logs", icon: "assignment" },
      { title: "Help", path: "/help", icon: "help" }
    ],
    confirmTitle: "",
    confirmBody: "",
    confirmDialog: false,
    dialogTrigger: ""
  }),
  computed: {
    currentUser() {
      return "ustmmisg@gmail.com";
    }
  },
  methods: {
    reroute(path) {
      this.$router.push(path).catch(err => {});
    },
    logout() {
      this.$store.commit("loginStatus", false);
      this.reroute("/login");

      // Reset search
      this.$store.commit("updateSearchMembers", "");
      this.$store.commit("updateSearchOfficers", "");
    },
    openDialog(trigger) {
      switch (trigger) {
        case "logout":
          this.confirmTitle = "Logout?";
          this.confirmBody = "Are you sure you want to logout?";
      }
      this.confirmDialog = true;
      this.dialogTrigger = trigger;
    },
    answerDialog(answer) {
      if (answer === "ok") {
        switch (this.dialogTrigger) {
          case "logout":
            this.logout();
        }
      }
      this.confirmDialog = false;
    }
  }
};
</script>

<style scoped>
.dark-mode-icon {
  position: fixed;
  bottom: 15px;
  right: 15px;
}
</style>
