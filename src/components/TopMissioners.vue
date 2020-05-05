<template>
  <v-card class="px-1" :loading="isLoading">
    <v-card-title
      class="justify-center font-weight-bold"
    >Most Active Missioners (A.Y. {{ currentAY }})</v-card-title>
    <v-divider></v-divider>
    <div class="top-missioners-container">
      <div>
        <v-card-title>Top 10 Members</v-card-title>
        <v-card-text>
          <ol>
            <li class="mb-2" v-for="member in top_members" :key="member.id">{{ member.fullName }}</li>
          </ol>
        </v-card-text>
      </div>
      <div>
        <v-card-title>Top 5 Officers</v-card-title>
        <v-card-text>
          <ol>
            <li class="mb-2" v-for="member in top_officers" :key="member.id">{{ member.fullName }}</li>
          </ol>
        </v-card-text>
      </div>
    </div>
  </v-card>
</template>
<script>
import store from "@/store";
export default {
  computed: {
    top_members() {
      return store.state.members
        .filter(
          member =>
            member.status === "Active" &&
            member.position === "Member" &&
            member.totalWorkTime > 0
        )
        .sort((a, b) => b.totalWorkTime - a.totalWorkTime)
        .slice(0, 10);
    },
    top_officers() {
      return store.state.members
        .filter(
          member => member.position !== "Member" && member.totalWorkTime > 0
        )
        .sort((a, b) => b.totalWorkTime - a.totalWorkTime)
        .slice(0, 5);
    },
    isLoading() {
      return this.top_members.length < 1 || this.top_officers.length < 1;
    },
    currentAY() {
      return localStorage.getItem("AY");
    }
  }
};
</script>

<style scoped>
.top-missioners-container {
  display: grid;
  grid-template-columns: 6fr 6fr;
  grid-gap: 8px;
  align-items: start;
}
</style>
