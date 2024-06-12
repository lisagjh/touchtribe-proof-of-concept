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

const productUrl =
  "https://cdn.contentful.com/spaces/x2maf5pkzgmb/environments/master/entries?access_token=VcJDwIe2eizDEjIwdVdDsF7tcQZ-0_uIrcP4BiDULsg&select=fields&content_type=product";

const sizeUrl =
  "https://cdn.contentful.com/spaces/x2maf5pkzgmb/environments/master/entries?access_token=VcJDwIe2eizDEjIwdVdDsF7tcQZ-0_uIrcP4BiDULsg&select=fields&content_type=size";

// Function to fetch image data from the Contentful API
async function fetchImageData() {
  try {
    const productData = await fetchJson(productUrl);
    const imageData = productData.items.map((item) => {
      const imageId = item.fields.primaryImage.sys.id;
      const imageUrl = item.includes.Asset.find(
        (asset) => asset.sys.id === imageId
      ).fields.file.url;
      return {
        title: item.fields.title,
        imageUrl: `https:${imageUrl}`,
      };
    });
    return imageData;
  } catch (error) {
    console.error("Error fetching image data:", error);
    throw error;
  }
}

// Function to fetch configurable product data from the Contentful API
async function fetchProductData() {
  try {
    const productData = await fetchJson(apiUrl);
    return productData;
  } catch (error) {
    console.error("Error fetching product data:", error);
    throw error;
  }
}

app.get("/", function (request, response) {
  Promise.all([fetchJson(apiUrl)]).then((productData) => {
    response.render("index", { products: productData });
  });
});

// Start the server
const PORT = process.env.PORT || 8000;
app.listen(PORT, function () {
  console.log(`Application started on http://localhost:${PORT}`);
});
