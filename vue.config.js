module.exports = {
  pwa: {
    name: "MMI Database",
    workboxPluginMode: "InjectManifest",
    workboxOptions: {
      swSrc: "src/service-worker.js"
    }
  }
};
