<template>
  <v-card max-height="91vh" class="scroll pa-2" id="scroll-target">
    <v-simple-table v-scroll:#scroll-target="onScroll">
      <tbody>
        <tr v-for="log in logs" :key="log.id">
          <td width="195">{{ log.text.split("M:").shift() + "M" }}</td>
          <td>{{ log.text.split(":").pop() }}</td>
        </tr>
      </tbody>
    </v-simple-table>
  </v-card>
</template>

<script>
import store from "@/store";

export default {
  data: () => ({
    logsLoaded: 25,
    totalLogs: 0
  }),
  methods: {
    onScroll(e) {
      const loadAmount = Math.round(e.target.scrollTop / 35) + 25;
      this.totalLogs > loadAmount
        ? (this.logsLoaded = loadAmount)
        : (this.logsLoaded = this.totalLogs);
    }
  },
  computed: {
    logs() {
      let sortedLogs = [];

      store.state.logs.forEach(log => {
        // Format log date
        const logHour = log.text
          .split("| ")
          .pop()
          .split(":")
          .shift();
        if (logHour.length === 1) {
          const newLogHour = `0${logHour}`;
          log.text = log.text.replace(`| ${logHour}`, `| ${newLogHour}`);
        }

        // Push to Sorted Logs
        sortedLogs.push(log);
      });

      this.totalLogs = sortedLogs.length;
      return sortedLogs.slice(0, this.logsLoaded);
    }
  }
};
</script>