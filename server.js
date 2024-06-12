import express from "express";
import fetchJson from "./helpers/fetch-json.js";

const app = express();

app.set("view engine", "ejs");
app.set("views", "./views");

app.use(express.static("public"));
app.use(express.urlencoded({ extended: true }));

const apiUrl =
  "https://cdn.contentful.com/spaces/x2maf5pkzgmb/environments/master/entries?access_token=VcJDwIe2eizDEjIwdVdDsF7tcQZ-0_uIrcP4BiDULsg&content_type=configurableProduct";

const productsData = await fetchJson(apiUrl);

const imageData = productsData.items.map((item) => {
  const products = item.fields.products.map((productLink) => {
    const product = productsData.includes.Entry.find(
      (entry) => entry.sys.id === productLink.sys.id
    );
    const imageId = product.fields.primaryImage.sys.id;
    const imageUrl = productsData.includes.Asset.find(
      (asset) => asset.sys.id === imageId
    ).fields.file.url;

    return {
      title: product.fields.title,
      imageUrl: `https:${imageUrl}`,
    };
  });

  return { products };
});

app.get("/", function (request, response) {
  console.log(imageData)
  response.render("index", {
    products: productsData.data,
    items: imageData,
  });
});

const PORT = process.env.PORT || 8000;
app.listen(PORT, function () {
  console.log(`Application started on http://localhost:${PORT}`);
});