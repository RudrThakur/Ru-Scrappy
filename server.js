const express = require("express");

const cheerio = require("cheerio");

const got = require("got");

const app = express();

const url =
  "https://www.indiatoday.in/coronavirus-outbreak/vaccine-updates/story/bharat-biotech-covaxin-effectively-neutralises-delta-variant-covid-top-us-research-institute-1820978-2021-06-30";

app.get("/", (req, res) => {
  got(url)
    .then((response) => {
      const $ = cheerio.load(response.body);

      const title = $("title").text();

      /**
       * Pick Headings
       */

      const headlines = [];

      $("h1, h2, h3, h4, h5, h6").map((index, element) => {
        const tag = element.name;
        const content = $(element).text();

        content.trim() && // No Whitespaces
          content.split(" ").length > 3 && // More than 2 words
          headlines.push({
            tag: tag,
            content: content,
          });
      });

      /**
       * Pick Paragraphs
       */

      const paragraphs = [];

      $("body p").map((index, element) => {
        const tag = element.name;
        const content = $(element).text();

        content.trim() &&
          content.split(" ").length > 3 &&
          paragraphs.push({
            tag: tag,
            content: content,
          });
      });

      /**
       * Pick Images
       */
      const images = [];

      $("body img").map((index, element) => {
        const tag = element.name;
        const content = $(element).attr('src');
        const alt = $(element).attr('alt');
        
        images.push({
          tag: tag,
          content: content,
          alt: alt,
        });
      });

      return res.json({
        url: url,
        title: title || "",
        headlines: headlines || "",
        paragraphs: paragraphs || "",
        images: images || "",
      });
    })
    .catch((err) => {
      console.log(err);
    });
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server listening at port ${PORT}`);
});
