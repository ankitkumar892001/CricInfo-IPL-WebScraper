// const allMatchResultsURL = 'https://www.espncricinfo.com/series/ipl-2020-21-1210595/match-results';
const request = require('request');
const cheerio = require('cheerio');
const {processScorecard} = require('./fullScorecard');



function processAllMatchResultsPage(url) {
    request(url, function (error, response, html) {
        if (error) {
            console.error('error:', error);
        }
        else if (response && response.statusCode != 200) {
            console.log('statusCode:', response.statusCode);
        }
        else {
            console.log('statusCode:', response.statusCode);
            extractEachMatchScoreCardLink(html);
        }
    });
}



function extractEachMatchScoreCardLink(html) {
    let $ = cheerio.load(html);
    let allScoreCardElements = $("a[data-hover='Scorecard']");
    for (let i = 0; i < allScoreCardElements.length; i++) {
        // we have to wrap allScoreCardElements[i] => $(allScoreCardElements[i]) because 
        // .attr() and other functions are defined over $() not allScoreCardElements[i]
        let link = $(allScoreCardElements[i]).attr('href');
        let ScorecardLink = 'https://www.espncricinfo.com' + link;
        console.log("ScorecardLink -" , ScorecardLink);

        processScorecard(ScorecardLink);
    }
}



module.exports = {
    processAllMatchResultsPage,
}
