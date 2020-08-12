import Vue from "vue";
import Vuex from "vuex";

Vue.use(Vuex);

export default new Vuex.Store({
  state: {
    members: [],
    logs: [],
    isLoggedIn: false,
    currentUser: null,
    isMembership: false,
    searchMembers: "",
    searchOfficers: "",
    memberDialog: false,
    officerDialog: false,
    db: null,
  },
  mutations: {
    // Receive DB at app startup
    receiveDB(state, db) {
      state.db = db;
    },
    syncMembers(state) {
      const tx = state.db.transaction("members");
      const membersOS = tx.objectStore("members");
      const request = membersOS.getAll();
      request.onsuccess = (e) => {
        state.members = e.target.result;
        state.members.sort((a, b) => b.timeJoined - a.timeJoined);
      };
    },
    syncLogs(state) {
      const tx = state.db.transaction("logs");
      const logsOS = tx.objectStore("logs");
      const request = logsOS.getAll();
      request.onsuccess = (e) => {
        state.logs = e.target.result;
        state.logs.sort((a, b) => b.time - a.time);
      };
    },
    updateMembers(state, member) {
      state.members = state.members.filter(
        (filtered) => filtered.id !== member.id
      );
      member.toDelete || state.members.push(member);
      state.members.sort((a, b) => b.timeJoined - a.timeJoined);
    },
    addLog(state, log) {
      state.logs.push(log);
      state.logs.sort((a, b) => b.time - a.time);
    },
    loginStatus(state, status) {
      state.isLoggedIn = status;
    },
    membershipPrivileges(state, status) {
      state.isMembership = status;
    },

    //Toolbar Actions
    updateSearchMembers(state, text) {
      state.searchMembers = text;
    },
    updateSearchOfficers(state, text) {
      state.searchOfficers = text;
    },
    updateMemberDialog(state, value) {
      state.memberDialog = value;
    },
    updateOfficerDialog(state, value) {
      state.officerDialog = value;
    },
    updateDBVersion(state, version) {
      state.dbVersion = version;
    },
  },
});
