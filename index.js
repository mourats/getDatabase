const csv = require('csv-parser');  
const fs = require('fs');
const createCsvWriter = require('csv-writer').createObjectCsvWriter;

let players =  [];
let statistics =  [];
let result =  [];

fs.createReadStream('players_v2.csv')  
  .pipe(csv())
  .on('data', (row) => {
    players.push({...row});
  })
  .on('end', () => {
    console.log('CSV file players_v2.csv successfully processed');

    fs.createReadStream('statistics_v2.csv')  
    .pipe(csv())
    .on('data', (row) => {
        statistics.push({...row});
    })
    .on('end', () => {
      console.log('CSV file statistics_v2.csv successfully processed');
      players.forEach(elem => {
        const static = statistics.find(static => static.Player.split('\\')[0] === elem.Name);
        if(static){
          statistics = statistics.filter(elem => elem !== static);
          const validKeys = Object.keys(static).filter(elem => !!static[elem]);
          if(validKeys.length === Object.keys(static).length){
            delete static.Player;
            const obj = {...elem, ...static};
            result.push(obj);
          }
        }
      });
      console.log(result);
      writeCSV(result);
    });
  });



  const  writeCSV = (data) => {
    const csvWriter = createCsvWriter({  
      path: 'result.csv',
      header: Object.keys(data[0]).reduce((accum = [], elem) => {
        accum.push({id: elem, title: elem});
        return accum;
      }, []) 
    });

    csvWriter  
    .writeRecords(data)
    .then(()=> console.log('The CSV file was written successfully'));
  }

