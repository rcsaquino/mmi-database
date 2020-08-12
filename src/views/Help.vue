<template>
  <v-card>
    <v-card-text>
      <ul>
        <li>When installed correctly, this should work even when offline.</li>

        <li>The database is stored locally on this computer.</li>

        <li>Please make it a habit to export the database frequently. Store it somewhere safe to serve as backup.</li>
        <li>The database identifies members using their student number. When importing, imported data will have priority on duplicates.</li>
        <li>
          To install this on a different computer, go to:
          <a
            onclick="window.open('https://mmi-database.web.app')"
          >https://mmi-database.web.app</a>
        </li>
        <li>
          For a minimal and portable registration sheet, go to:
          <a
            onclick="window.open('https://mmi-database.web.app/registration')"
          >https://mmi-database.web.app/registration</a>
        </li>
        <li>
          If you need help, send me an e-mail at
          <a
            onclick="window.open('mailto:rcsaquino.dev@gmail.com')"
          >rcsaquino.dev@gmail.com</a>
        </li>
      </ul>
      <v-divider class="pb-4"></v-divider>
      <p>Version: {{ appVersion }}</p>
      <p>© 2019-{{ new Date().getFullYear() }}</p>
    </v-card-text>
  </v-card>
</template>

<script>
import appInfo from "../../package.json";
export default {
  computed: {
    appVersion() {
      return appInfo.version;
    },
  },
};
</script>

<style scoped>
ul {
  margin-bottom: 15px;
}
li {
  padding-top: 5px;
  padding-bottom: 5px;
}
</style>