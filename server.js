// Import the Express.js module
import express, { request, response } from "express";

// Import the fetchJson function from a custom helper file
import fetchJson from "./helpers/fetch-json.js";

// Create a new Express app
const app = express();

// Set EJS as the template engine
app.set("view engine", "ejs");
app.set("views", "./views");

// Serve static files from the "public" directory
app.use(express.static("public"));

// Parse URL-encoded request bodies
app.use(express.urlencoded({ extended: true }));

// Set the base API endpoint
const apiUrl =
  "https://cdn.contentful.com/spaces/x2maf5pkzgmb/environments/master/entries?access_token=VcJDwIe2eizDEjIwdVdDsF7tcQZ-0_uIrcP4BiDULsg&content_type=product&select=fields";

// route voor homepage
app.get("/", function (request, response) {
  // Haal alle personen uit de WHOIS API op
  fetchJson(apiUrl).then((apiData) => {
    // deze moet hierstaan omdat op de regel hierboven pas apidata defined word
    const products = apiData.items.map((item) => item.fields);

    response.render("index", {
      products: products,
    });
  });
});

// Start the server
const PORT = process.env.PORT || 8000;
app.listen(PORT, function () {
  console.log(`Application started on http://localhost:${PORT}`);
});
