console.log("Initializing Firebase Functions...");

const { onRequest } = require("firebase-functions/v2/https");
const { onSchedule } = require("firebase-functions/v2/scheduler");
const { randomUUID } = require("crypto");
const logger = require("firebase-functions/logger");
const pug = require("pug");
const axios = require("axios");
const path = require("path");
const admin = require("firebase-admin");
const cors = require("cors")({
  origin: true, // Allow all origins
  allowedHeaders: [
    'Content-Type', 'HX-Current-Url', 'HX-Boosted', 'HX-History-Restore-Request',
    'HX-Trigger', 'HX-Request', 'HX-Target', 'HX-Trigger-Name', 'HX-Prompt'
  ],
});

// Initialize Firebase Admin
admin.initializeApp();
const db = admin.firestore();

// Database reference
const docRef = db.collection("facts").doc("wVxqRwCoIVoDsMqWGqHeHe");

// Log to confirm initialization
logger.info("Cloud Function initialized successfully.");
console.log("Firebase Functions initialized successfully.");

// Scheduled function to update facts
exports.scheduledRun = onSchedule("every day 20:00", async (event) => {
  try {
    const response = await axios.get("https://binaryjazz.us/wp-json/genrenator/v1/genre/");
    const apiResponse = response.data;
    await docRef.set({
      current: apiResponse,
    });
    logger.log("Facts updated successfully!");
  } catch (error) {
    console.error(error);
    logger.error(error, {structuredData: true});
  }
});

// Flash briefing endpoint
exports.flashBriefing = onRequest((request, response) => {
  console.log("Flash Briefing Requested!");

  const flashBriefingData = [
    {
      "uid": randomUUID(),
      "updateDate": new Date().toISOString(),
      "titleText": "What kind of test will I do today?",
      "mainText": "The quick brown fox jumped.",
      "streamUrl": null,
      "redirectionUrl": "https://example.com",
    },
  ];

  response.set("Content-Type", "application/json");
  response.json(flashBriefingData);
});

// Function to render App.pug
exports.renderApp = onRequest((request, response) => {
  console.log("renderApp function triggered");
  try {
    const templatePath = path.join(__dirname, 'views/App.pug');
    console.log(`Attempting to compile template at: ${templatePath}`);
    const template = pug.compileFile(templatePath);
    const markup = template();

    console.log("Template compiled successfully");
    response.writeHead(200, { 'Content-Type': 'text/html' });
    response.end(markup);
  } catch (error) {
    console.error("Error rendering App.pug:", error.message);
    console.error(error.stack);
    response.writeHead(500, { 'Content-Type': 'text/plain' });
    response.end("Internal Server Error: " + error.message);
  }
});

exports.playlists = onRequest((request, response) => {
  const template = pug.compileFile(path.join(__dirname, 'views/Playlists.pug'));
  const markup = template();

  response.writeHead(200, { 'Content-Type': 'text/html' });
  response.end(markup);
});

exports.app = onRequest((request, response) => {
  const template = pug.compileFile(path.join(__dirname, 'views/App.pug'));
  const markup = template();

  response.writeHead(200, { 'Content-Type': 'text/html' });
  response.end(markup);
});

exports.history = onRequest((request, response) => {
  const template = pug.compileFile(path.join(__dirname, 'views/History.pug'));
  const markup = template();
  response.writeHead(200, { 'Content-Type': 'text/html' });
  response.end(markup);
});

exports.newartists = onRequest((request, response) => {
  const template = pug.compileFile(path.join(__dirname, 'views/NewArtists.pug'));
  const markup = template();
  response.writeHead(200, { 'Content-Type': 'text/html' });
  response.end(markup);
});

exports.settings = onRequest((request, response) => {
  const template = pug.compileFile(path.join(__dirname, 'views/Settings.pug'));
  const markup = template();
  response.writeHead(200, { 'Content-Type': 'text/html' });
  response.end(markup);
});

exports.test = onRequest(async (request, response) => {
  cors(request, response, async () => {
    try {
      console.log("Starting genre fetch...");
      // Generate 5 random genres
      const genres = [];
      for (let i = 0; i < 5; i++) {
        console.log(`Fetching genre ${i + 1}...`);
        const res = await axios.get("https://binaryjazz.us/wp-json/genrenator/v1/genre/");
        console.log(`Received genre: ${res.data}`);
        genres.push(res.data);
      }
      
      console.log("Compiling template...");
      const template = pug.compileFile(path.join(__dirname, "views/cardList.pug"));
      console.log("Rendering template with data:", genres);
      const markup = template({ data: genres });
      console.log("Sending response...");
      response.send(markup);
    } catch (error) {
      console.error("Error in test endpoint:", error);
      response.status(500).send(`Error fetching genre data: ${error.message}`);
    }
  });
});
