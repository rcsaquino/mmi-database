import Vue from "vue";
import Router from "vue-router";

//Views
import Login from "./views/Login.vue";
import Dashboard from "./views/Dashboard.vue";
import Members from "./views/Members.vue";
import Officers from "./views/Officers.vue";
import Logs from "./views/Logs.vue";
import Help from "./views/Help.vue";
import Settings from "./views/Settings.vue";
import Registration from "./views/Registration.vue";

// Store
import store from "./store";

Vue.use(Router);

const router = new Router({
  mode: "history",
  base: process.env.BASE_URL,
  routes: [
    {
      path: "/index.html",
      component: Login,
      meta: {
        requiresGuest: true
      }
    },
    {
      path: "/login",
      name: "login",
      component: Login,
      meta: {
        requiresGuest: true
      }
    },
    {
      path: "/",
      name: "dashboard",
      component: Dashboard,
      meta: {
        requiresAuth: true
      }
    },
    {
      path: "/members",
      name: "members",
      component: Members,
      meta: {
        requiresAuth: true
      }
    },
    {
      path: "/officers",
      name: "officers",
      component: Officers,
      meta: {
        requiresAuth: true
      }
    },
    {
      path: "/logs",
      name: "logs",
      component: Logs,
      meta: {
        requiresAuth: true
      }
    },
    {
      path: "/help",
      name: "help",
      component: Help,
      meta: {
        requiresAuth: true
      }
    },
    {
      path: "/settings",
      name: "settings",
      component: Settings,
      meta: {
        requiresAuth: true
      }
    },
    {
      path: "/registration",
      name: "registration",
      component: Registration
    }
  ]
});

router.beforeEach((to, from, next) => {
  if (to.matched.some(record => record.meta.requiresAuth)) {
    if (!store.state.isLoggedIn) {
      next({
        path: "/login",
        query: {
          redirect: to.fullPath
        }
      });
    } else {
      next();
    }
  } else if (to.matched.some(record => record.meta.requiresGuest)) {
    if (store.state.isLoggedIn) {
      next({
        path: "/",
        query: {
          redirect: to.fullPath
        }
      });
    } else {
      next();
    }
  } else {
    next();
  }
});

export default router;
