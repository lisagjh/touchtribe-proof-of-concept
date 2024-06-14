// Import the Express.js module
import express from "express";

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

// Set the base API endpoint for fetching products
const apiUrl =
  "https://cdn.contentful.com/spaces/x2maf5pkzgmb/environments/master/entries?access_token=VcJDwIe2eizDEjIwdVdDsF7tcQZ-0_uIrcP4BiDULsg&content_type=product&select=fields";

/**
 * Function to resolve the URL of an image asset
 * @param {string} assetId - The ID of the asset
 * @param {Array} assets - The array of assets
 * @returns {string|null} - The URL of the asset or null if not found
 */
function resolveImageUrl(assetId, assets) {
  const asset = assets.find((asset) => asset.sys.id === assetId);
  return asset ? `https:${asset.fields.file.url}` : null;
}

/**
 * Function to aggregate products by title
 * @param {Array} items - The array of product items
 * @param {Array} assets - The array of assets
 * @returns {Array} - The array of aggregated products
 */
function aggregateProductsByTitle(items, assets) {
  const productsMap = {};

  // Loop through each item to aggregate products
  items.forEach((item) => {
    const product = item.fields;
    const { sku, primaryImage, title, description, size } = product;
    const imageUrl = primaryImage
      ? resolveImageUrl(primaryImage.sys.id, assets)
      : null;

    // Check if the product title already exists in the map
    if (!productsMap[title]) {
      // Create a new entry for the product
      productsMap[title] = {
        sku: sku,
        title: title,
        description: description,
        imageUrl: imageUrl,
        sizes: [], // Initialize an empty array for sizes
      };
    }

    // Add the size to the sizes array if it exists
    if (size) {
      productsMap[title].sizes.push(size.sys.id);
    }
  });

  // Convert the map to an array and sort it alphabetically by title
  return Object.values(productsMap).sort((a, b) =>
    a.title.localeCompare(b.title)
  );
}

// Route for the homepage
app.get("/", function (request, response) {
  // Fetch data from the API
  fetchJson(apiUrl).then((apiData) => {
    const assets = apiData.includes.Asset;

    // Aggregate products by title and sort them
    const products = aggregateProductsByTitle(apiData.items, assets);

    response.render("index", {
      products: products,
    });
  });
});

// Start the server on the specified port
const PORT = process.env.PORT || 8000;
app.listen(PORT, function () {
  console.log(`Application started on http://localhost:${PORT}`);
});
