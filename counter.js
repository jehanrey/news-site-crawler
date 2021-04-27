const fs = require('fs')

const getClosestSource = (filename) => {
  if (filename.includes('inquirer')) return 'inquirer'
  else if (filename.includes('philippine-news-agency') || filename.includes('pna')) return 'philippine-news-agency'
  else if (filename.includes('rappler')) return 'rappler'
}

const fetchFileCount = () => {
  try {
    const files = fs.readdirSync('./output-ivy')
    let retVal = []
    files.forEach(async (file) => {
      const dataBuffer = await fs.readFileSync(`./output-ivy/${file}`)
      const source = getClosestSource(file)
      const dataJSON = dataBuffer.toString()
      const data = JSON.parse(dataJSON)
      console.log(`${file}: ${data[source].length}`)
      retVal.push({ file, count: data[source].length })
    })
    return retVal
  } catch(err) {
    return []
  }
}

const count = fetchFileCount()

console.log({ count })