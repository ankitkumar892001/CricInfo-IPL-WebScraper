const homePageURL = 'https://www.espncricinfo.com/series/ipl-2020-21-1210595';  //2020
// const homePageURL = 'https://www.espncricinfo.com/series/ipl-2019-1165643';     //2019
// const homePageURL = 'https://www.espncricinfo.com/series/ipl-2018-1131611';     //2018
const request = require('request');
const cheerio = require('cheerio');
const fs = require('fs');
const path = require('path');
const {processAllMatchResultsPage} = require('./allMatchResults');



// used REQUEST module to send the request(URL) and receive the response(html)
request(homePageURL, function (error, response, html) {
    if(error){
        console.error('error:', error);
    }
    else if(response && response.statusCode != 200){
        console.log('statusCode:', response.statusCode);
    }
    else{
        console.log('statusCode:', response.statusCode);
        extractViewAllResultsLink(html);    
    }
});



function extractViewAllResultsLink(html) {
    // cherrio returns a function($) which accepts css selectors and returns an object for that element 
    let $ = cheerio.load(html);
    // .attr property of that object, returns the href attribute of the element 
    let anchorElement = $('a[data-hover="View All Results"]');
    let link = anchorElement.attr('href');
    let viewAllResultsLink = 'https://www.espncricinfo.com' + link;
    console.log('viewAllResultsLink - ', viewAllResultsLink);

    processAllMatchResultsPage(viewAllResultsLink);

    let ipl = $('.jsx-4014027759 .header-title').text();
    const iplSeason = ipl.replace(/\//g, '-');
    const filePath = path.join(__dirname, iplSeason);
    directoryCreator(filePath);
}



function directoryCreator(filePath){
    if (fs.existsSync(filePath) == false) {
        fs.mkdirSync(filePath);
    }
}
