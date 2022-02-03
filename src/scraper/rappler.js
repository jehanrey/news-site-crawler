async function rapplerScraper ({
  browser,
  page,
  counter,
  scrapedData,
}) {
  await page.waitForSelector('#primary')
  page.setDefaultNavigationTimeout(0)

  let pagePromise = (link) => new Promise(async (resolve, _reject) => {
    let skip  = false
    let dataObj = {}
    let newPage = await browser.newPage()
    newPage.setDefaultNavigationTimeout(0)
    await newPage.goto(link)
    await newPage.waitForSelector('.article-main-section')

    dataObj["url"] = link
    dataObj["title"] = await newPage.$eval("h1.post-single__title", (text) => text.textContent).catch(() => skip = true)
    dataObj["date"] = await newPage.$eval("span.posted-on > time", (text) => text.textContent).catch(() => skip = true)
    dataObj["snippet"] = await newPage.$eval('div.post-single__summary > em', (text) => {
      return text.textContent.trim()
    }).catch(() => '')
    dataObj["body"] = await newPage.$$eval('.post-single__content.entry-content > p', (paragraphs) => {
      const retVal = paragraphs.map(({ textContent }) => textContent)
      return retVal.join(' ')
    }).catch(() => skip = true)

    resolve(skip ? undefined : dataObj)
    counter = skip ? counter : counter + 1

    await newPage.close()
  })

  await page.evaluate(() => {
    const modal = document.querySelector('.tp-modal')
    if (modal) modal.parentNode.removeChild(modal)
    const backdrop = document.querySelector('.tp-backdrop.tp-active')
    if (backdrop) backdrop.parentNode.removeChild(backdrop)
  });

  let loadMoreExists = false
  let loadMoreButton = ''
  try {
    loadMoreButton = await page.$eval('.pagination', (a) => a.textContent)
    loadMoreExists = !!loadMoreButton
  } catch (err) {
    loadMoreExists = false
  }

  if (loadMoreExists) {
    const loadMoreSelector = '.pagination__link.pagination__load-more'
    try { await page.click(loadMoreSelector) } catch (error) {}
    await page.waitFor(2000); // time for scrolling
    return rapplerScraper({
      browser,
      page,
      counter,
      scrapedData,
    })
  }

  let urls = await page.$$eval('.post.type-post.status-publish', (links) => {
    // let retVal = links.filter((el) => {
    //   const stringVal = el.querySelector('h2 > a').textContent
    //   const keywords = ['grab', 'asia', 'news', 'philippines']
    //   let conditionMet = false
    //   keywords.forEach((word) => {
    //     if (stringVal.toLowerCase().includes(word)) {
    //       conditionMet = true
    //     }
    //   })
    //   return conditionMet
    // })
    // return retVal.map((el) => el.querySelector("h2 > a").href)
    links = links.map((el) => el.querySelector("h2 > a").href)
    return links
  })

  for (link in urls) {
    let currentPageData = await pagePromise(urls[link])
    scrapedData.push(currentPageData)
  }

  await page.close()

  return {
    data: scrapedData.filter(Boolean),
    count: counter,
  }
}

module.exports = rapplerScraper