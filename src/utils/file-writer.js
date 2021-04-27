const fs = require('fs')
const path = require('path')

function writeFile (jsonData, {
  context = 'default',
  keyword = 'default',
}) {
  const outputPath = path.join(__dirname + '../../../output/')
  const filename = `${context}-${keyword}`
  fs.writeFile(`${outputPath}/${filename}.json`, JSON.stringify(jsonData), 'utf8', function(err) {
    if(err) {
      return console.log(err)
    }
    console.log(`The data has been scraped and saved successfully! View it at './${filename}.json'`)
  })
}

module.exports = writeFile