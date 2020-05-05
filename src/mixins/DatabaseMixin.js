import store from "@/store";

export default {
  // FOR MAINTENANCE
  data: () => ({
    memberSetLimit: 50,
    logSetLimit: 100,
    memberModel: {
      // Details
      id: "",
      fName: "",
      mName: "",
      lName: "",
      fullName: "",
      section: "",
      contact: "",
      email: "",
      position: "Member",
      position2: "Junior Member",
      status: "Inactive",
      timeJoined: 0,

      //Work related
      points: 0,
      isWorking: false,
      lastTimeIn: 0,
      totalWorkTime: 0
    }
  }),

  methods: {
    // Object Store
    getOS(os, permission) {
      const db = store.state.db;
      const tx = db.transaction(
        os,
        permission == "rw" ? "readwrite" : "readonly"
      );
      return tx.objectStore(os);
    },
    db_import(data) {
      // Restore Members
      const membersOS = this.getOS("members", "rw");
      let newMembers = 0;
      let duplicateMembers = 0;
      data.members.forEach(member => {
        //Required to have at least the first and last name
        if (member.fName && member.lName) {
          this.update_member_props(member);
          // Check for duplicates
          store.state.members.some(oldMember => oldMember.id === member.id)
            ? duplicateMembers++
            : newMembers++;
          membersOS.put(member);
        }
      });

      // Restore Logs
      const logsOS = this.getOS("logs", "rw");
      let newLogs = 0;
      data.logs.forEach(log => {
        logsOS.put(log);
        newLogs++;
      });

      // Create log, dontExport === true
      this.db_create_log(
        `Imported ${newMembers} new ${
          newMembers === 1 ? "member" : "members"
        } and ${newLogs} ${
          newLogs === 1 ? "log" : "logs"
        }. Replaced ${duplicateMembers} ${
          duplicateMembers === 1 ? "duplicate member" : "duplicate members"
        }.`,
        true
      );

      // Update store
      this.$store.commit("syncMembers");
      this.$store.commit("syncLogs");

      // Return success message
      return `Importing complete!`;
    },
    db_update_members(member) {
      this.update_member_props(member);
      const membersOS = this.getOS("members", "rw");
      membersOS.put(member);
      this.$store.commit("updateMembers", member);
    },
    db_delete_member(member) {
      member.toDelete = true;
      const membersOS = this.getOS("members", "rw");
      membersOS.delete(member.id);
      this.$store.commit("updateMembers", member);
    },
    update_member_props(member) {
      const expectedKeys = Object.keys(this.memberModel);
      const memberKeys = Object.keys(member);

      // Add keys from the model
      expectedKeys.forEach(key => {
        !memberKeys.includes(key) && (member[key] = this.memberModel[key]);
      });

      // Delete obsolete keys
      memberKeys.forEach(key => {
        !expectedKeys.includes(key) && delete member[key];
      });

      // Always define full name to cover changed names
      member.fullName = `${member.lName}, ${member.fName} ${member.mName}`.trim();

      // Set time joined for new members
      !member.timeJoined && (member.timeJoined = Date.now());
    },
    db_create_log(message, dontExport) {
      // Init Variables
      let log = {};
      // Add time
      log.time = Date.now();
      //Set if for export
      dontExport ? (log.dontExport = true) : (log.dontExport = false);
      // Compose log
      log.text = `${new Date(log.time)
        .toISOString()
        .slice(0, 10)} | ${new Date().toLocaleTimeString(
        log.time
      )}: ${message}`;
      // Add ID
      log.id =
        Math.random()
          .toString(36)
          .substring(2) + Date.now().toString(36);
      // Add to store & db
      const logsOS = this.getOS("logs", "rw");
      logsOS.add(log);
      this.$store.commit("addLog", log);
    },
    db_clear_members() {
      const membersOS = this.getOS("members", "rw");
      membersOS.clear();
      this.$store.commit("syncMembers");
    },
    db_clear_logs() {
      const logsOS = this.getOS("logs", "rw");
      logsOS.clear();
      this.$store.commit("syncLogs");
    },
    start_new_AY() {
      // Grammar stuff
      const currentAY = localStorage.getItem("AY").split("-");
      const currentYear = new Date().getFullYear();
      let grammar;
      if (currentAY[0] < currentYear) {
        grammar = "Started";
      } else {
        grammar = "Restarted";
      }
      const newAY = `${currentYear}-${currentYear + 1}`;
      // Set new AY
      localStorage.setItem("AY", newAY);
      // Create log, dontExport === true
      this.db_create_log(`${grammar} A.Y. ${newAY}`, true);
    }
  }
};
