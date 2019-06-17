const csv = require("csv-parser");
const fs = require("fs");
const createCsvWriter = require("csv-writer").createObjectCsvWriter;

const crawler = require("crawler-request");
const async = require("async");

let statistics = [];
let valid = [];
let result = [];

fs.createReadStream("statistics_v2.csv")
  .pipe(csv())
  .on("data", row => {
    statistics.push({ ...row });
  })
  .on("end", () => {
    console.log("CSV file statistics_v2.csv successfully processed");
    //.filter((elem, idx) => idx < 100)
    statistics.forEach(elem => {
      const validKeys = Object.keys(elem).filter(item => !!elem[item]);
      if (validKeys.length === Object.keys(elem).length) {
        const obj = { ...elem };
        valid.push(obj);
      }
    });

    async.eachLimit(valid, 5, getDataLink, err => {
      if (err) throw err;

      console.log(valid.length);
      console.log(result.length);
      writeCSV(result);
    });
  });

const getUrl = string => {
  const key = string.Player.split("\\")[1];
  return `https://www.basketball-reference.com/players/${key.substring(
    0,
    1
  )}/${key}.html`;
};

const getDataLink = (object, callback) => {
  const url = getUrl(object);
  console.log(url);
  crawler(url).then(function(response) {
    if (response.text !== null) {
      setHeightAndWeight(response.text, object);
    } else {
      console.log("shit");
    }
    callback();
  });
};

const setHeightAndWeight = (text, object) => {
  object.Name = object.Player.split("\\")[0];
  delete object.Player;

  const height = text.match(/([0-9])+(cm)/)[0];
  object.height = height.substring(0, height.length - 2);

  const weight = text.match(/([0-9])+(kg)/)[0];
  object.weight = weight.substring(0, weight.length - 2);

  result.push(object);
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
