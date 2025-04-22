const {onRequest} = require("firebase-functions/v2/https");
const logger = require("firebase-functions/logger");
const pug = require("pug");
const axios = require("axios");
const cors = require("cors")({
    origin: 'https://fnof-stack.web.app/',
    allowedHeaders: ['Content-Type', 'HX-Current-Url', 'HX-Boosted', 'HX-History-Restore-Request', 'HX-Trigger', 'HX-Request', 'HX-Target', 'HX-Trigger-Name', 'HX-Prompt'],
  });

// Log to confirm initialization
logger.info("Cloud Function initialized successfully.");

exports.test = onRequest(async (request, response) => {
    // Extract query parameters
    const currentEntry = [{
        name: request.query.name || "Unknown",
        major: request.query.major || "Unknown",
        quote: request.query.quote || "No quote provided"
    }];

    // Compile the Pug template and render only the current entry
    let template = pug.compileFile('views/test.pug');
    let markup = template({ data: currentEntry });

    response.writeHead(200, { 'Content-Type': 'text/html' });
    response.end(markup);
});
