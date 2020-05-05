<template>
  <div class="main-container">
    <div class="points-container">
      <TimeInOut />
      <UpdatePoints />
    </div>
    <TopMissioners />
  </div>
</template>

<script>
import store from "@/store";
import TimeInOut from "@/components/TimeInOut.vue";
import UpdatePoints from "@/components/UpdatePoints.vue";
import TopMissioners from "@/components/TopMissioners.vue";

export default {
  components: {
    TimeInOut,
    UpdatePoints,
    TopMissioners
  }
};
</script>

<style scoped>
.main-container {
  display: grid;
  grid-template-columns: 6fr 6fr;
  grid-gap: 15px;
  margin: 15px;
  align-items: start;
}
.points-container {
  display: grid;
  grid-gap: 15px;
}
</style>