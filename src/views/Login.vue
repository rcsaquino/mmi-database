<template>
  <v-row justify="center" align="center" style="height: 85vh">
    <v-col cols="6">
      <v-card class="pa-4">
        <v-card-title class="mb-4">Login</v-card-title>
        <v-card-text>
          <v-text-field
            label="Username"
            v-model="username"
            @keypress.enter="login()"
            prepend-icon="portrait"
          ></v-text-field>
          <v-text-field
            label="Password"
            type="password"
            v-model="password"
            @keypress.enter="login()"
            prepend-icon="lock_outline"
          ></v-text-field>
        </v-card-text>
        <v-card-actions>
          <div class="flex-grow-1"></div>
          <v-btn text right class="mx-2" :loading="loading" @click="login()">Login</v-btn>
        </v-card-actions>
      </v-card>
    </v-col>
    <v-snackbar color="error" v-model="snackbar" :timeout="1500">{{ snackbarText }}</v-snackbar>
  </v-row>
</template>

<script>
import "@/plugins/hash";

export default {
  data() {
    return {
      username: "",
      password: "",
      loading: false,
      snackbar: false,
      snackbarText: "",
    };
  },
  methods: {
    login() {
      this.loading = true;

      // Set timeout for loading animation lol
      setTimeout(() => {
        // Membership Officer
        if (
          this.username.hash() === "f2d734ea5156ae394da3bcecba004f5e" &&
          this.password.hash() === "5f05cdd0991dbde56029ffb757ef5d05"
        ) {
          this.loading = false;
          this.$store.commit("loginStatus", true);
          this.$store.commit("membershipPrivileges", true);
          this.$router.push("/");

          // Non membership officer
        } else if (
          this.username.hash() === "680b5db06a6207cc025fe7ad86aac312" &&
          this.password.hash() === "2863571133a38ac4ba274fe6592b218a"
        ) {
          this.loading = false;
          this.$store.commit("loginStatus", true);
          this.$router.push("/");

          // Incorrect login credentials
        } else {
          this.loading = false;
          this.snackbarText = "Wrong username or password!";
          this.snackbar = true;
        }
      }, 700);
    },
  },
};
</script>