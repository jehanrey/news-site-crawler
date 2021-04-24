const fs = require('fs')

function writeFile (jsonData, filename = 'default') {
  fs.writeFile(`${filename}.json`, JSON.stringify(jsonData), 'utf8', function(err) {
    if(err) {
      return console.log(err)
    }
    console.log(`The data has been scraped and saved successfully! View it at './${filename}.json'`)
  })
}

module.exports = writeFile