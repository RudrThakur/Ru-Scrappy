const express = require("express");

const cheerio = require("cheerio");

const got = require("got");

const unfluff = require("unfluff");

const jsdom = require("jsdom");

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: false }));

app.post("/api/scrape", (req, res) => {
  const url = req.body.url;

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
        const content = $(element).attr("src");
        const alt = $(element).attr("alt");

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

/**
 * Version 2
 */

app.post("/api/scrape/v2", (req, res) => {
  const url = req.body.url;

  got(url)
    .then((response) => {
      const $ = cheerio.load(response.body);

      const title = $("title").text();

      var text = "";

      /**
       * Remove unwanted tags
       */

      //  Header

      $("header").remove();
      $("#header").remove();
      $(".header").remove();

      // Hyperlinks

      $("a").remove();

      // Aside

      $("aside").remove();

      // Sidebars

      $("#sidebar").remove();
      $(".sidebar").remove();

      // Footer

      $("footer").remove();
      $("#footer").remove();
      $(".footer").remove();

      // Tables

      $("table").remove();
      $(".table").remove();
      $("#table").remove();

      // Iframes

      $("iframe").remove();
      $(".iframe").remove();
      $("#iframe").remove();

      // Images
      
      $("img").remove();
      $(".img").remove();
      $("#img").remove();

      /**
       * Pick Paragraphs
       */

      $("body p").map((index, element) => {
        const content = $(element).text();

        if (content.trim() && content.split(" ").length > 3)
          text = text + " " + content;
      });

      text = text.trim();

      return res.json({
        url: url,
        title: title || "",
        text: text || "",
      });
    })
    .catch((err) => {
      console.log(err);
    });
});

/**
 * use unfluff
 */

app.post("/api/scrape/unfluff", (req, res) => {
  const url = req.body.url;

  got(url).then((response) => {
    const html_content = response.body;

    const content_parsed = unfluff(html_content);

    return res.json(content_parsed);
  });
});

/**
 * use JSDOM
 */

app.post("/api/scrape/jsdom", (req, res) => {
  const url = req.body.url;

  got(url).then((response) => {
    const html_content = response.body;

    const title =
      jsdom.JSDOM.fragment(html_content).querySelector("title").textContent;

    const html_text = jsdom.JSDOM.fragment(html_content).textContent;

    return res.json({
      url: url,
      title: title || "",
      text: html_text || "",
    });
  });
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server listening at port ${PORT}`);
});
