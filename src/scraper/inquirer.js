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
    await newPage.goto(link, {waitUntil: 'domcontentloaded', timeout: 0})
    // await newPage.waitForSelector('#article_level_wrap').catch(() => skip = true)

    dataObj["url"] = link
    dataObj["title"] = await newPage.$eval("#art-head-group hgroup > h1.entry-title", (text) => text.textContent).catch(() => skip = true)
    dataObj["date"] = await newPage.$eval("#art-head-group #byline_share div#art_plat", (text) => (
      text.textContent.split('/')[1].trim()
    )).catch(() => skip = true)
    dataObj["snippet"] = await newPage.$eval("#art_body_wrap > #article_content > div:first-child > p:first-of-type", (text) => {
      return text.textContent.replace(/(\s\r\n\t|\n|\r|\t|&nbsp;|<br>|<br \/>)/gm, "").trim()
    }).catch(() => '')
    dataObj["body"] = await newPage.$eval("#art_body_wrap > #article_content > div:first-child", (el) => {
      const childNodes = el.children
      let contents = []
      for (let item of childNodes) {
        if (item.nodeName === 'P') {
          contents.push(item.textContent.replace(/(\s\r\n\t|\n|\r|\t|&nbsp;|<br>|<br \/>)/gm, "").trim())
        }
      }
      return contents.join(' ')
    }).catch(() => skip = true)

    resolve(skip ? undefined : dataObj)
    counter = skip ? counter : counter + 1

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
    data: scrapedData.filter(Boolean),
    count: counter,
  }
}

module.exports = inquirerScraper