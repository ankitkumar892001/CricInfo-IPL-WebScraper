// const fullScorecardURL = "https://www.espncricinfo.com/series/ipl-2020-21-1210595/mumbai-indians-vs-chennai-super-kings-1st-match-1216492/full-scorecard";
const request = require("request");
const cheerio = require("cheerio");
const fs = require("fs");
const path = require("path");
const xlsx = require("xlsx");



function processScorecard(url) {
    request(url, function callbackFunction(error, response, html) {
        if (error) {
            console.error('error:', error);
        }
        else if (response && response.statusCode != 200) {
            console.log('statusCode:', response.statusCode);
        }
        else {
            console.log('statusCode:', response.statusCode);
            extractMatchDetails(html);
        }
    });
}



function extractMatchDetails(html) {
    let $ = cheerio.load(html);
    
    // iplSeason
    let ipl = $('a[data-hover="Indian Premier League"].d-block').text();
    let season = $('#main-container > div:nth-child(1) > div > div.container > div.row > div.col-16.col-md-16.col-lg-12.main-content-x > div.match-body > div.match-scorecard-page > div:nth-child(4) > div.table-responsive > table > tbody > tr:nth-child(4) > td:nth-child(2) > a').text()
    let iplSeason = ipl+" "+ season.replace(/\//g, '-');

    // date venue result
    let descriptionElement = $(".event .description");
    let stringArray = descriptionElement.text().split(",");
    let date = stringArray[2].trim();
    let venue = stringArray[1].trim();
    let result = $(".event .status-text").text();

    // innings = 2 (divs)
    let innings = $(".card.content-block.match-scorecard-table>.Collapsible");
    
    for (let i = 0; i < innings.length; i++) {
        let teamName = $(innings[i]).find("h5").text();     // = Mumbai Indians INNINGS (20 overs maximum)
        teamName = teamName.split("INNINGS")[0].trim();     // = Mumbai Indians

        let opponentIndex = i == 0 ? 1 : 0;
        let opponentName = $(innings[opponentIndex]).find("h5").text();     // = Chennai Super Kings INNINGS (target: 163 runs from 20 overs)
        opponentName = opponentName.split("INNINGS")[0].trim();     // = Chennai Super Kings
        
        let currentInning = $(innings[i]);

        if(i == 0){
            console.log(`${teamName} vs ${opponentName} | ${date} | ${venue} | ${result}`);
        }
        
        if(i==0) console.log("\n1st Innings");
        else console.log("\n2nd Innings");

        let allRows = currentInning.find(".table.batsman tbody tr");
        
        for (let j = 0; j < allRows.length; j++) {
            let allCols = $(allRows[j]).find("td");
            let isWorthy = $(allCols[0]).hasClass("batsman-cell");
            if (isWorthy == true) {
                // playerName runs balls fours sixes
                let playerName = $(allCols[0]).text().trim();
                let runs = $(allCols[2]).text().trim();
                let balls = $(allCols[3]).text().trim();
                let fours = $(allCols[5]).text().trim();
                let sixes = $(allCols[6]).text().trim();
                let sr = $(allCols[7]).text().trim();
                console.log(`${playerName} ${runs} ${balls} ${fours} ${sixes} ${sr}`);
                processPlayer(playerName, teamName, runs, balls, fours, sixes, sr, opponentName, date, venue, result, iplSeason);
            }
        }
    }
    console.log("\n============================================================================================================================\n");
}


function processPlayer(playerName, teamName, runs, balls, fours, sixes, sr, opponentName, date, venue, result, iplSeason) {
    
    let playerObject = {
        teamName,
        playerName,
        runs,
        balls,
        fours,
        sixes,
        sr,
        opponentName,
        date,
        venue,
        result
    }
    
    let teamPath = path.join(__dirname, iplSeason , teamName);
    // create Directory if it doesn't exists
    directoryCreator(teamPath);
    

    let playerPath = path.join(teamPath, playerName + ".xlsx");
    // returns the content(in the form of array[rows]) if the file exists otherwise an empty array 
    // the 2nd argument is the sheet name which is same as playerName
    let content = excelReader(playerPath, playerName);
    

    // add new row to the sheet
    content.push(playerObject);
    

    // replace the old sheet with the updated one 
    // the 2nd argument is the sheet name which is same as playerName
    excelWriter(playerPath, content, playerName);
}



function directoryCreator(filePath) {
    if (fs.existsSync(filePath) == false) {
        fs.mkdirSync(filePath);
    }
}



function excelReader(playerPath, sheetName) {
    if (fs.existsSync(playerPath) == false) {
        return [];
    }

    // player workbook
    let wb = xlsx.readFile(playerPath);
    // get worksheet(same as playerName) from player workbook
    let excelData = wb.Sheets[sheetName];
    // sheet to json 
    let ans = xlsx.utils.sheet_to_json(excelData);
    // array of objects
    return ans;
}



function excelWriter(playerPath, json, sheetName) {
    // create workbook
    let newWB = xlsx.utils.book_new();
    // create worksheet
    let newWS = xlsx.utils.json_to_sheet(json);
    // append sheet inside workbook
    xlsx.utils.book_append_sheet(newWB, newWS, sheetName);
    // create excel file  
    xlsx.writeFile(newWB, playerPath);
}



module.exports = {
    processScorecard,
}

