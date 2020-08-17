<template>
  <div>
    <!-- Show if app is installed or in registration -->
    <v-app v-if="isInstalled || inRegistration || devMode">
      <AppBar />
      <Sidebar v-if="isLoggedIn" />
      <v-content>
        <transition name="fade">
          <router-view />
        </transition>
      </v-content>
    </v-app>

    <!-- Show if app is NOT installed -->
    <div v-else>
      <p>Medical Missions Inc.</p>
      <p>Please install to continue...</p>
      <p>Need help? Email: rcsaquino.dev@gmail.com</p>
    </div>
  </div>
</template>

<script>
import AppBar from "@/components/AppBar.vue";
import Sidebar from "@/components/Sidebar.vue";
import store from "@/store";
import DatabaseMixin from "@/mixins/DatabaseMixin";
import appInfo from "../package.json";

export default {
  name: "App",

  mixins: [DatabaseMixin],

  components: { AppBar, Sidebar },

  computed: {
    isLoggedIn() {
      return store.state.isLoggedIn;
    },
    isInstalled() {
      const isInstalled =
        window.matchMedia("(display-mode: standalone)").matches ||
        window.navigator.standalone ||
        document.referrer.includes("android-app://");
      return isInstalled;
    },
    devMode() {
      return process.env.NODE_ENV !== "production";
    },
    inRegistration() {
      return this.$route.path === "/registration";
    },
  },

  created() {
    // Initialize Theme
    const isDarkMode = JSON.parse(localStorage.getItem("darkMode"));
    if (isDarkMode !== null) {
      this.$vuetify.theme.dark = isDarkMode;
    }

    // Add event listener if app is not installed
    if (!this.isInstalled) {
      window.addEventListener("appinstalled", (evt) => {
        // Force reload to re-render components
        location.reload();
      });
    }

    // Only open database if installed or in dev mode
    if (this.isInstalled || this.devMode) {
      // Initialize Database
      let db;
      const request = indexedDB.open("MMI_Database", 1);

      // Upgrade needed
      request.onupgradeneeded = (e) => {
        db = e.target.result;

        // Initial Version
        if (e.oldVersion < 1) {
          // Create object stores
          db.createObjectStore("members", { keyPath: "id" });
          db.createObjectStore("logs", { keyPath: "id" });
        }
      };

      request.onsuccess = (e) => {
        // Store database
        this.$store.commit("receiveDB", e.target.result);

        // Start new A.Y. if localStorage is empty
        if (!localStorage.getItem("AY")) {
          localStorage.setItem("AY", 1);
          this.start_new_AY();
        }

        // Sync store
        this.$store.commit("syncMembers");
        this.$store.commit("syncLogs");
      };

      request.onerror = (e) => {
        alert(
          `Database error! Try connecting to the internet and press F5 to update. If this does not work, please contact developer for help.\n\n${e.target.error}`
        );
      };
    }
  },
};
</script>

<style scoped>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.25s ease-in-out, transform 0.25s ease;
}
.fade-enter-active {
  transition-delay: 0.25s;
}
.fade-leave-to,
.fade-enter {
  opacity: 0;
  transform: translateY(-70vh);
}
.fade-enter-to,
.fade-leave {
  opacity: 1;
  transform: translateY(0px);
}
</style>

<style>
.clickable {
  cursor: pointer;
}
div ul li button:focus {
  outline: 0;
}
.scroll {
  overflow-y: auto;
}
.marker {
  background-color: darkblue;
}
.border {
  border-style: solid;
  border-width: 1px;
}
</style>
