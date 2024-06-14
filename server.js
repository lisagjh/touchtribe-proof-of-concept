import express from "express";
import fetchJson from "./helpers/fetch-json.js";

const app = express();

app.set("view engine", "ejs");
app.set("views", "./views");

app.use(express.static("public"));
app.use(express.urlencoded({ extended: true }));

// API URLs to fetch data from Contentful
const apiUrl =
  "https://cdn.contentful.com/spaces/x2maf5pkzgmb/environments/master/entries?access_token=VcJDwIe2eizDEjIwdVdDsF7tcQZ-0_uIrcP4BiDULsg&content_type=configurableProduct";
const apiProductUrl =
  "https://cdn.contentful.com/spaces/x2maf5pkzgmb/environments/master/entries?access_token=VcJDwIe2eizDEjIwdVdDsF7tcQZ-0_uIrcP4BiDULsg&content_type=product";

// Fetch the configurable products from Contentful
const configurableProductsResponse = await fetchJson(apiUrl);
const configurableProducts = configurableProductsResponse.items; // Extract the items array from the response

// Fetch the simple products from Contentful
const simpleProductsResponse = await fetchJson(apiProductUrl);
const simpleProducts = simpleProductsResponse.items; // Extract the items array from the response

// Define the route for the home page
app.get("/", function (request, response) {
  // Combine configurable products with their corresponding simple products
  const combinedProduct = configurableProducts
    .map((config) => {
      // Check if the configurable product has associated simple products
      if (!config.fields.products || config.fields.products.length === 0) {
        return null; // Skip this config if no products are associated
      }

      // Find the corresponding simple product
      const simple = simpleProducts.find(
        (simple) => simple.sys.id == config.fields.products[0].sys.id
      );

      // Return an object combining information from both products
      return {
        id: config.sys.id,
        name: config.fields.title,
        image: simple.fields.primaryImage,
        size: simple.fields.size,
        description: simple.fields.description,
      };
    })
    .filter((item) => item !== null); // Filter out any null entries

  console.log(combinedProduct); // Log the combined product array to the console
  response.render("index", {
    products: combinedProduct, // Pass combinedProduct as 'products' to the EJS template
  });
});

const PORT = process.env.PORT || 8000;
app.listen(PORT, function () {
  console.log(`Application started on http://localhost:${PORT}`);
});
