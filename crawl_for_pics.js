//this is me experimenting with scraping data from one of the IU websites.
//the original goal was to transplant data from the PI site to styling inspired from other sites
//within the rvt- ecosystem
const puppeteer = require('puppeteer');
const fs = require('fs');
const url = process.argv[2];

const employeeObjects = {};

const writeFileTokens = (tokens) => {
  let file = fs.createWriteStream('images/imageTokens.js');
  file.on('error', function(err) { console.log('oops'); });
  // tokens.forEach( (v) => { file.write(v + '\n');
  //                     console.log(v) });
  file.write('export const imageTokens = ' + JSON.stringify(tokens) + ';');
  file.end();
}

async function imagesFromRequests(){
  const browser = await puppeteer.launch();
  const page = await browser.newPage();

  let fileTokens = [];
  page.on('response', async (response) => {
    const responseUrl = response.url();
    const src = responseUrl.split('/').slice(-1)[0].split('.')[0];
    //the above solution is atrocious and will be regex-ed
    const matches = /.*\.(jpg)$/.exec(responseUrl);
    // const matches = /.*\.(jpg|png|svg|gif)$/.exec(response.url());
    console.log(matches);
    if (matches && (matches.length === 2)) {
      fileTokens.push(src);
      const extension = matches[1];
      const buffer = await response.buffer();
      fs.writeFileSync(`images/${src}.${extension}`, buffer, 'base64');
    }
  });
//   await page.goto('https://prevention.iu.edu/experts/');
  await page.goto(url);
  await browser.close();
  await writeFileTokens(fileTokens);
};

async function getElementsFromPage(elementToken = '.person', srcUrl = 'https://www.prevention.iu.edu/experts'){
  let browser = await puppeteer.launch();
  let page = await browser.newPage();
  await page.goto(srcUrl);
  return await page.evaluate( () => {
    return document.querySelectorAll(elementToken);
  });
};

function subQuery(parent, token){
  return parent.querySelectorAll(token);
}

async function getElementsAndReturnASubQuery(index = 0){
  const elements = await getElementsFromPage('.person');
  let name = subQuery(elements[index], '.title');
  console.log(name);
}

getElementsAndReturnASubQuery();

// node .\crawl_for_pics.js https://www.prevention.iu.edu/experts 