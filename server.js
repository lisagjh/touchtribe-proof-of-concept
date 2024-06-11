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

// Set the base API endpoint
const apiUrl =
  "https://cdn.contentful.com/spaces/x2maf5pkzgmb/environments/master/entries?access_token=VcJDwIe2eizDEjIwdVdDsF7tcQZ-0_uIrcP4BiDULsg&content_type=configurableProduct";

// Helper function to resolve linked entries
function resolveLinks(items, includes) {
  // Create a map to store entries by their ID for quick lookup
  const entryMap = {};
  includes.Entry.forEach((entry) => {
    entryMap[entry.sys.id] = entry;
  });

  // Create a map to store assets (images) by their ID for quick lookup
  const assetMap = {};
  includes.Asset.forEach((asset) => {
    assetMap[asset.sys.id] = asset;
  });

  // Iterate through each item (configurable product)
  items.forEach((item) => {
    // Replace product links with the actual product entries
    item.fields.products =
      item.fields.products && Array.isArray(item.fields.products)
        ? item.fields.products.map((productLink) => {
            // Get the product entry from the entry map using the link ID
            const product = entryMap[productLink.sys.id];
            // If the product has a primary image, resolve the image link to an actual asset
            if (product && product.fields.primaryImage) {
              const imageId = product.fields.primaryImage.sys.id;
              product.fields.primaryImage = assetMap[imageId];
            }
            // Return the resolved product entry
            return product;
          })
        : [];
  });

  // Return the items with resolved links
  return items;
}

// Route for the homepage
app.get("/", function (request, response) {
  // Fetch data from the Contentful API
  fetchJson(apiUrl).then((apiData) => {
    console.log(apiData);
    // Resolve links in the fetched data
    const products = resolveLinks(apiData.items, apiData.includes);

    // Sort products alphabetically by their name (assuming `product.fields.name` is the name field)
    products.sort((a, b) => {
      if (a.fields.name < b.fields.name) {
        return -1;
      }
      if (a.fields.name > b.fields.name) {
        return 1;
      }
      return 0;
    });

    // Initialize a variable to hold the newest product
    let newestProduct = null;
    if (products.length > 0) {
      // Assume the first product is the newest initially
      newestProduct = products[0];
      // Loop through the products to find the one with the most recent updatedAt timestamp
      for (let i = 1; i < products.length; i++) {
        const currentTimestamp = new Date(products[i].sys.updatedAt);
        const newestTimestamp = new Date(newestProduct.sys.updatedAt);
        if (currentTimestamp > newestTimestamp) {
          newestProduct = products[i];
        }
      }
    }

    // Render the 'index' template with the products and the newest product
    response.render("index", {
      products: products,
      newestProduct: newestProduct,
    });
  });
});

// Start the server
const PORT = process.env.PORT || 8000;
app.listen(PORT, function () {
  console.log(`Application started on http://localhost:${PORT}`);
});