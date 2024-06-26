import express from "express";
import fetchJson from "./helpers/fetch-json.js";

const app = express();

app.set("view engine", "ejs");
app.set("views", "./views");

app.use(express.static("public"));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());  // Middleware to parse JSON request body

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

app.locals.productIDs = {};
app.locals.productIDsToImages = {};
app.locals.images = {};

configurableProducts.forEach(function (configurableProduct) {
  app.locals.productIDs[configurableProduct.sys.id] = [];
  configurableProduct.fields.products.forEach(function (product) {
    app.locals.productIDs[configurableProduct.sys.id].push(product.sys.id);
    app.locals.productIDsToImages[product.sys.id] = {};
  });
});

configurableProductsResponse.includes.Entry.forEach(function (entry) {
  app.locals.productIDsToImages[entry.sys.id] =
    entry.fields.primaryImage.sys.id;
  app.locals.images[entry.fields.primaryImage.sys.id] = {};
});

configurableProductsResponse.includes.Asset.forEach(function (asset) {
  app.locals.images[asset.sys.id] = asset.fields.file;
});

// Combine configurable products with their corresponding simple products
const combinedProduct = configurableProducts.map((config) => {
  // Find the corresponding simple product
  const simple = simpleProducts.find(
    (simple) => simple.sys.id == config.fields.products[0].sys.id
  );

  // Return an object combining information from both products
  return {
    id: config.sys.id,
    // TODO: zorg dat je hier toegang hebt tot alle images.. Ooit :) niet deze sprint :(
    image:
      app.locals.images[
        app.locals.productIDsToImages[app.locals.productIDs[config.sys.id][0]]
      ],
    name: config.fields.title,
    size: simple.fields.size,
    description: simple.fields.description,
  };
});

// Define the route for the home page
app.get("/", function (request, response) {

  var lastProduct = combinedProduct[combinedProduct.length - 1];

  response.render("index", {
    products: combinedProduct, // Pass combinedProduct as 'products' to the EJS template
    newProduct: lastProduct,
  });
});

const cartItems = []

app.post("/cart", (request, response)=> {
  const productSku = request.body.sku;
  const product = combinedProduct.find(
    (product) => product.id === productSku
  );

  if (product) {
    const index = cartItems.findIndex((cartItem) => cartItem.id === product.id);
    if (index === -1) {
      cartItems.push(product);
      console.log("product added to cart", product);
    } else {
      cartItems.splice(index, 1);
      console.log("product removed from cart:", productSku)
    }
  }
  response.render('partials/cart', {cartItems: cartItems})
});

const PORT = process.env.PORT || 8000;
app.listen(PORT, function () {
  console.log(`Application started on http://localhost:${PORT}`);
});
