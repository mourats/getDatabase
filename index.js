const csv = require('csv-parser');  
const fs = require('fs');
const createCsvWriter = require('csv-writer').createObjectCsvWriter;

let players =  [];
let statistics =  [];
let result =  [];

fs.createReadStream('Players.csv')  
  .pipe(csv())
  .on('data', (row) => {
    players.push({...row});
  })
  .on('end', () => {
    console.log('CSV file Players.csv successfully processed');

    fs.createReadStream('Seasons_Stats.csv')  
    .pipe(csv())
    .on('data', (row) => {
        statistics.push({...row});
    })
    .on('end', () => {
      console.log('CSV file Seasons_Stats.csv successfully processed');
      players.forEach(elem => {
        const static = statistics.filter(s =>Number(s.Year) >=  2000).find(static => static.Player === elem.Player);
        if(static){
            let obj = {nome: elem.Player, altura : elem.height, peso: elem.weight, livre: static['FT%'], goals: static['FG%']};
            result.push(obj);
        }
      });
      console.log(result);
      writeCSV(result);
    });
  });



  const  writeCSV = (data) => {
    const csvWriter = createCsvWriter({  
      path: 'result.csv',
      header: [
        {id: 'name', title: 'name'},
        {id: 'altura', title: 'altura'},
        {id: 'peso', title: 'peso'},
        {id: 'livre', title: 'livre'},
        {id: 'goals', title: 'goals'},
      ]
    });

    csvWriter  
    .writeRecords(data)
    .then(()=> console.log('The CSV file was written successfully'));
  }

