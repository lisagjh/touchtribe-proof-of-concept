import express from "express";
import fetchJson from "./helpers/fetch-json.js";

const app = express();

app.set("view engine", "ejs");
app.set("views", "./views");

app.use(express.static("public"));
app.use(express.urlencoded({ extended: true }));

const apiUrl =
  "https://cdn.contentful.com/spaces/x2maf5pkzgmb/environments/master/entries?access_token=VcJDwIe2eizDEjIwdVdDsF7tcQZ-0_uIrcP4BiDULsg";

const confData = await fetchJson(apiUrl + "&content_type=configurableProduct");
const productData = await fetchJson(apiUrl + "&content_type=product");
const sizeData = await fetchJson(apiUrl + "&content_type=size");

// route voor homepage
app.get("/", function (request, response) {
  // Haal alle personen uit de WHOIS API op
  fetchJson(apiUrl).then((apiData) => {
    response.render("index", {
      configured: confData.data,
      products: productData.data,
      sizes: sizeData.data,
    });
  });
});

const PORT = process.env.PORT || 8000;
app.listen(PORT, function () {
  console.log(`Application started on http://localhost:${PORT}`);
});
