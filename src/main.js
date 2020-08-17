import Vue from "vue";
import App from "./App.vue";
import router from "./router";
import store from "./store";
import "./registerServiceWorker";

// CSS
import 'material-design-icons-iconfont/dist/material-design-icons.css'
import 'typeface-roboto/index.css';

// Vuetify
import Vuetify from "vuetify/lib";
import theme from "./plugins/vuetifyTheme";
import { Scroll } from "vuetify/lib/directives";

Vue.config.productionTip = false;

Vue.use(Vuetify, {
  directives: {
    Scroll
  }
});

new Vue({
  vuetify: new Vuetify(theme),
  router,
  store,
  render: h => h(App)
}).$mount("#app");
