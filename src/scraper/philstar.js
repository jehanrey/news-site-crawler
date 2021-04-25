async function philstarScraper ({
  browser,
  page,
  counter,
  scrapedData,
}) {
  await page.waitForSelector(".zoomd-widget-content-wrapper")

  // let pagePromise = (link) => new Promise(async (resolve, _reject) => {
  //   let dataObj = {}
  //   let newPage = await browser.newPage()
  //   await newPage.goto(link)

  //   dataObj["title"] = await newPage.$eval(".page-header > h1", (text) => text.textContent)
  //   dataObj["date"] = await newPage.$eval(".page-header .date", (text) => text.textContent)
  //   dataObj["snippet"] = await newPage.$eval(".page-content > p", (text) => {
  //     return text.textContent.split('--')[1] ? text.textContent.split('--')[1].trim() : text.textContent.split('--')[0].trim()
  //   }).catch(async () => {
  //     dataObj["snippet"] = await newPage.$eval(".page-content > div", (text) => {
  //       return text.textContent.split('--')[1] ? text.textContent.split('--')[1].trim() : text.textContent.split('--')[0].trim()
  //     })
  //   })
  //   dataObj["body"] = await newPage.$eval(".page-content", (el) => {
  //     const childNodes = el.children
  //     let contents = []
  //     for (let item of childNodes) {
  //       if (item.nodeName === 'P' || item.nodeName === 'DIV') {
  //         contents.push(item.textContent.replace(/(\s\r\n\t|\n|\r|\t|&nbsp;|<br>|<br \/>)/gm, "").trim())
  //       }
  //     }
  //     return contents.join(' ')
  //   })

  //   resolve(dataObj)
  //   counter = counter + 1

  //   await newPage.close()
  // })

  let urls = await page.$$eval(".articles > .article > .media-body", (links) => {
    links = links.map((el) => el.querySelector("h3 > a").href)
    return links
  })

  // for (link in urls) {
  //   let currentPageData = await pagePromise(urls[link])
  //   scrapedData.push(currentPageData)
  // }

  // let nextButtonExist = false
  // let nextButton = ''
  // try {
  //   nextButton = await page.$eval(".pagination-area > .pagination > li:nth-last-child(2):not(.disabled) > a", (a) => a.textContent.replace(/(\r\n\t|\n|\r|\t)/gm, "").trim())
  //   nextButtonExist = nextButton == '›'
  // } catch (err) {
  //   nextButtonExist = false
  // }

  // if (nextButtonExist) {
  //   await page.click(".pagination-area > .pagination > li:nth-last-child(2):not(.disabled) > a")
  //   return philstarScraper({
  //     browser,
  //     page,
  //     counter,
  //     scrapedData,
  //   })
  // }

  await page.close()

  return scrapedData
}

module.exports = philstarScraper