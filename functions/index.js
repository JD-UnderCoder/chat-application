const path = require("path");
const next = require("next");
const { onRequest } = require("firebase-functions/v2/https");
const { initializeApp } = require("firebase-admin/app");

initializeApp();

const appDir = path.resolve(__dirname, "..");
const nextApp = next({
  dev: false,
  dir: appDir,
  conf: { distDir: ".next" },
});
const handle = nextApp.getRequestHandler();

exports.nextServer = onRequest(
  {
    region: "us-central1",
    memory: "1GiB",
    timeoutSeconds: 60,
    maxInstances: 10,
  },
  async (req, res) => {
    await nextApp.prepare();
    return handle(req, res);
  }
);
