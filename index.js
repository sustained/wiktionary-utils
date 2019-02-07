const fs = require("fs");
const path = require("path");
const axios = require("axios");
const cheerio = require("cheerio");

const BASE_URL = "https://sv.wiktionary.org/wiki/";

/*
    The words we'll be scraping today.
*/
const scrapeList = [
  "be",
  "bedja",
  "begrava",
  "besluta",
  "betala",
  "binda",
  "bita",
  "bjuda",
  "bli",
  "bliva",
  "bringa",
  "brinna",
  "brista",
  "bryta",
  "bära",
  "böra",
  "dimpa",
  "dra",
  "draga",
  "dricka",
  "driva",
  "drypa",
  "duga",
  "dväljas",
  "dyka",
  "dö",
  "dölja",
  "falla",
  "fara",
  "finna",
  "finnas",
  "fisa",
  "flyga",
  "flyta",
  "fnysa",
  "frysa",
  "få",
  "förgäta",
  "förnimma",
  "försvinna",
  "förtälja",
  "gala",
  "ge",
  "giva",
  "gitta",
  "gjuta",
  "glida",
  "glädja",
  "gnida",
  "gripa",
  "gråta",
  "gå",
  "göra",
  "ha",
  "hava",
  "heta",
  "hinna",
  "hugga",
  "hålla",
  "häva",
  "klicka",
  "klinga",
  "kliva",
  "klyva",
  "knipa",
  "knyta",
  "komma",
  "krypa",
  "kunna",
  "kvida",
  "kväda",
  "kvälja",
  "le",
  "leva",
  "lida",
  "ligga",
  "ljuga",
  "ljuda",
  "ljuta",
  "lyda",
  "lyss",
  "låta",
  "lägga",
  "löpa",
  "mala",
  "mysa",
  "måsta",
  "niga",
  "njuta",
  "nypa",
  "nysa",
  "pipa",
  "pysa",
  "rida",
  "rinna",
  "riva",
  "ryka",
  "rysa",
  "ryta",
  "se",
  "simma",
  "sitta",
  "sjunga",
  "sjuda",
  "sjunka",
  "skilja",
  "skina",
  "skita",
  "skjuta",
  "skola",
  "skrida",
  "skrika",
  "skriva",
  "skryta",
  "skälva",
  "skära",
  "slinka",
  "slinta",
  "slippa",
  "slita",
  "sluka",
  "sluta",
  "slå",
  "slåss",
  "smita",
  "smyga",
  "smälla",
  "smälta",
  "smörja",
  "snika",
  "snyta",
  "sova",
  "spinna",
  "spricka",
  "sprida",
  "springa",
  "spritta",
  "spörja",
  "sticka",
  "stinga",
  "stiga",
  "stinka",
  "stjäla",
  "strida",
  "stryka",
  "strypa",
  "stupa",
  "stå",
  "städja",
  "stödja",
  "stöda",
  "suga",
  "supa",
  "svida",
  "svika",
  "svinna",
  "svälja",
  "svälta",
  "svära",
  "svärja",
  "säga",
  "sälja",
  "sätta",
  "ta",
  "taga",
  "tiga",
  "tjuta",
  "tryta",
  "tvinga",
  "tåla",
  "töras",
  "tordas",
  "vara",
  "varda",
  "veta",
  "vetta",
  "vika",
  "vilja",
  "vina",
  "vinna",
  "vrida",
  "välja",
  "vänja",
  "växa"
];

function scrape(word) {
  axios.get(BASE_URL + word).then(
    response => {
      if (response.status === 200) {
        parseHTML(word, response.data);
      }
    },
    error => console.log(error)
  );
}

function parseCell(item) {
  item = item.trim();

  if (item.indexOf(",") !== -1)
    return item.split(",").map(i => parseCell(i.trim()));
  else if (item.indexOf(" ") !== -1)
    return item.split(" ").map(i => parseCell(i.trim()));
  else if (item.indexOf("(") !== -1)
    return item
      .replace(/[(]+/g, "")
      .replace(/[)]+/g, "")
      .trim();
  else if (item.trim() === "–") return false;
  else return item.trim();
}

function parseHTML(word, html) {
  const $ = cheerio.load(html);

  const conjugations = [];

  $("table.grammar")
    .filter(
      [
        ".template-sv-verb-r",
        ".template-sv-verb-ar",
        ".template-sv-verb-as",
        ".template-sv-verb-er",
        ".template-sv-verb-r-ejpass",
        ".template-sv-verb-ar-ejpass",
        ".template-sv-verb-er-ejpass"
      ].join(",")
    )
    .each(function(i) {
      var tg = $(this);

      conjugations[i] = {
        active: {},
        passive: {},
        participle: {}
      };

      conjugations[i].active.infinitive = parseCell(
        tg
          .find("th:contains(Infinitiv)")
          .next()
          .text()
      );
      conjugations[i].active.present = parseCell(
        tg
          .find("th:contains(Presens)")
          .eq(0)
          .next()
          .text()
      );
      conjugations[i].active.past = parseCell(
        tg
          .find("th:contains(Preteritum)")
          .next()
          .text()
      );
      conjugations[i].active.supine = parseCell(
        tg
          .find("th:contains(Supinum)")
          .next()
          .text()
      );
      conjugations[i].active.imperative = parseCell(
        tg
          .find("th:contains(Imperativ)")
          .next()
          .text()
      );

      if (tg.find("th:contains(Passiv)").length) {
        conjugations[i].passive.infinitive = parseCell(
          tg
            .find("th:contains(Infinitiv)")
            .next()
            .next()
            .text()
        );
        conjugations[i].passive.present = parseCell(
          tg
            .find("th:contains(Presens)")
            .next()
            .next()
            .text()
        );
        conjugations[i].passive.past = parseCell(
          tg
            .find("th:contains(Preteritum)")
            .next()
            .next()
            .text()
        );
        conjugations[i].passive.supine = parseCell(
          tg
            .find("th:contains(Supinum)")
            .next()
            .next()
            .text()
        );
        conjugations[i].passive.imperative = parseCell(
          tg
            .find("th:contains(Imperativ)")
            .next()
            .next()
            .text()
        );
      } else conjugations[i].passive = false;

      conjugations[i].participle.present = parseCell(
        tg
          .find("th:contains(Presens)")
          .eq(1)
          .next()
          .text()
      );
      conjugations[i].participle.past = parseCell(
        tg
          .find("th:contains(Perfekt)")
          .next()
          .text()
      );
    });

  console.log(
    "Scraped " +
      conjugations.length +
      " conjugations for the word " +
      word +
      "."
  );
  writeFile(word, conjugations);
}

function writeFile(word, conjugations) {
  fs.writeFile(
    path.join(__dirname, "output", word + ".json"),
    JSON.stringify(conjugations.length, null, 4),
    function() {
      console.log("Wrote the conjugations for the word " + word + " to disc.");
    }
  );
}

let scraping = 0;
let interval;

interval = setInterval(function() {
  if (++scraping >= scrapeList.length) {
    clearInterval(interval);
    console.log("Scraping complete.");
  } else {
    scrape(scrapeList[scraping]);
  }
}, Math.max(2000, Math.random() * 5000));
