const csv = require("csv-parser");
const fs = require("fs");
const createCsvWriter = require("csv-writer").createObjectCsvWriter;

const crawler = require("crawler-request");
const async = require("async");

let statistics = [];
const cursor = "cm,";

fs.createReadStream("statistics_v2.csv")
  .pipe(csv())
  .on("data", row => {
    statistics.push({ ...row });
  })
  .on("end", () => {
    console.log("CSV file statistics_v2.csv successfully processed");

    async.eachLimit(
      statistics.filter((elem, idx) => idx < 5),
      10,
      getDataLink,
      err => {
        if (err) throw err;

        //console.log(statistics);
        writeCSV(statistics);
      }
    );
  });

const getUrl = string => {
  return `https://www.basketball-reference.com/players/a/${
    string.Player.split("\\")[1]
  }.html`;
};

const getDataLink = (object, callback) => {
  crawler(getUrl(object)).then(function(response) {
    if (response.text !== null) {
      setHeightAndWeight(response.text, object);
    }
    callback();
  });
};

const setHeightAndWeight = (text, object) => {
  const beginHeight = text.indexOf('cm,');
  const beginWeight = beginHeight + cursor.length;

  console.log(text.slice(beginHeight - 3, beginHeight + 8));
};

const writeCSV = data => {
  const csvWriter = createCsvWriter({
    path: "result.csv", 
    header: Object.keys(data[0]).reduce((accum = [], elem) => {
      accum.push({ id: elem, title: elem });
      return accum;
    }, [])
  });

  csvWriter
    .writeRecords(data)
    .then(() => console.log("The CSV file was written successfully"));
};
