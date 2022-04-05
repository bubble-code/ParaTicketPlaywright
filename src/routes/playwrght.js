/* eslint-disable quote-props */
const { chromium } = require('playwright')
// const { salonesMallorca } = require('./salonesMallorca')
const { salonesMadrid } = require('./salonesMadrid')
const result = {}

  ; (async () => {
  const browser = await chromium.launch({ headless: false })
  const content = await browser.newContext({
    ignoreHTTPSErrors: true
  })
  const page = await content.newPage()
  for (let i = 0; i < salonesMadrid.length; i++) {
    // const urlActual = salonesMallorca[0]
    const { salon, url, user, pass, money } = salonesMadrid[i]
    await page.goto(url)
    await page.fill('id=mainForm\:useridG\:itbuseridG', user)
    await page.fill('id=mainForm\:passwordG\:itbpasswordG', pass)
    await Promise.all([
      page.waitForNavigation(),
      page.click('button[role="button"]:has-text("Login")')
    ])
    await page.click('id=breadForm\:mbTools_button')
    await Promise.all([
      page.waitForNavigation(),
      page.click('text=Recarga')
    ])

    for (const key in money) {
      result[key.toString()] = await page.textContent(money[key])
    }
    const result2 = {}
    result2[salon] = result
    console.log(result2)
  }
  await browser.close()
})()
