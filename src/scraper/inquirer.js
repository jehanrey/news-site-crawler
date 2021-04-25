async function inquirerScraper ({
  browser,
  page,
  counter,
  scrapedData,
}) {
  await page.waitForSelector("#___gcse_2")

  let pagePromise = (link) => new Promise(async (resolve, _reject) => {
    let skip = false
    let dataObj = {}
    let newPage = await browser.newPage()
    console.log(`navigating to ${link}...`)
    await newPage.goto(link)

    dataObj["title"] = await newPage.$eval("#art-head-group hgroup > h1.entry-title", (text) => text.textContent).catch(() => skip = true)
    dataObj["date"] = await newPage.$eval("#art-head-group #byline_share div#art_plat", (text) => text.textContent).catch(() => skip = true)
    // dataObj["snippet"] = await newPage.$eval(".page-content > p", (text) => {
    //   return text.textContent.split('--')[1] ? text.textContent.split('--')[1].trim() : text.textContent.split('--')[0].trim()
    // }).catch(async () => {
    //   dataObj["snippet"] = await newPage.$eval(".page-content > div", (text) => {
    //     return text.textContent.split('--')[1] ? text.textContent.split('--')[1].trim() : text.textContent.split('--')[0].trim()
    //   })
    // })
    // dataObj["body"] = await newPage.$eval(".page-content", (el) => {
    //   const childNodes = el.children
    //   let contents = []
    //   for (let item of childNodes) {
    //     if (item.nodeName === 'P' || item.nodeName === 'DIV') {
    //       contents.push(item.textContent.replace(/(\s\r\n\t|\n|\r|\t|&nbsp;|<br>|<br \/>)/gm, "").trim())
    //     }
    //   }
    //   return contents.join(' ')
    // })

    resolve(skip ? undefined : dataObj)
    counter = counter + 1

    await newPage.close()
  })

  let urls = await page.$$eval(".gsc-expansionArea > div.gsc-webResult.gsc-result .gsc-thumbnail-inside > div.gs-title", (links) => {
    links = links.map((el) => el.querySelector("a.gs-title").href)
    return links
  })

  for (link in urls) {
    let currentPageData = await pagePromise(urls[link])
    scrapedData.push(currentPageData)
  }

  let isLastPage = false
  let lastPage = false
  try {
    await page.waitForSelector(".gsc-cursor")
    lastPage = await page.$eval('.gsc-cursor > div:last-child.gsc-cursor-current-page', (a) => a.textContent)
    isLastPage = !!lastPage
  } catch {
    isLastPage = false
  }

  if (!isLastPage) {
    await page.waitForSelector(".gsc-cursor")
    const nextPageSelector = '.gsc-cursor > .gsc-cursor-current-page + .gsc-cursor-page'
    await page.click(nextPageSelector)
    return inquirerScraper({
      browser,
      page,
      counter,
      scrapedData,
    })
  }

  await page.close()

  return {
    data: scrapedData,
    count: counter,
  }
}

module.exports = inquirerScraper