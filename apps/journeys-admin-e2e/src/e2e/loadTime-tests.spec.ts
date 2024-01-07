/* eslint-disable playwright/expect-expect */
import { expect, test } from '@playwright/test'
import { chromium } from 'playwright-core'
import { playAudit } from 'playwright-lighthouse'

import { getTeamName } from '../framework/helpers'
import { LandingPage } from '../pages/landing-page'
import { LoginPage } from '../pages/login-page'
import { TopNav } from '../pages/top-nav'

test("Test one page load time", async ({ page, browser }) => {
  // Run this test only if the browser is Chromium
    await browser.startTracing()

    const landingPage = new LandingPage(page)
    await landingPage.goToAdminUrl()
  
    // Using Performanc.mark API
    await page.evaluate(() => (window.performance.mark('Start:FoF')))    
        
    // Test that user actually navigated to the choosen journey
    await expect(page).toHaveURL(/.*admin/)
  
    // Using performance.mark API
    await page.evaluate(() => (window.performance.mark('End:FoF')))
  
    // Get all performance marks
    const getAllMarksJson = await page.evaluate(() => (JSON.stringify(window.performance.getEntriesByType("mark"))))
    const getAllMarks = await JSON.parse(getAllMarksJson)
    console.log('window.performance.getEntriesByType("mark")', getAllMarks)
  
    await browser.stopTracing()
  
    // Test that time taken between Start:FoF and End:FoF is less than 1700ms
    const start = getAllMarks.find((obj) => obj.name === "Start:FoF")?.startTime;
    const end = getAllMarks.find((obj) => obj.name === "End:FoF")?.startTime;
    const diff = (end) - (start);
    console.log("diff", diff);
    expect(diff).toBeLessThan(3000);
})

test('Home page - response time test', async ({ page, browser}) => {
  const landingPage = new LandingPage(page)
  const loginPage = new LoginPage(page)
  const topNav = new TopNav(page)
  await browser.startTracing()
  await landingPage.goToAdminUrl()
  await landingPage.clickSignInWithEmail()

  await loginPage.login()

  // Using Performanc.mark API
  await page.evaluate(() => (window.performance.mark('Start:FoF')))    
    
  // Get team name from env vars compare it with actual team name in the app
  const teamName = await getTeamName()
  await topNav.clickTeamName(teamName)
  expect(await topNav.getTeamName()).toContain(teamName)

  // Using performance.mark API
  await page.evaluate(() => (window.performance.mark('End:FoF')))

  // Get all performance marks
  const getAllMarksJson = await page.evaluate(() => (JSON.stringify(window.performance.getEntriesByType("mark"))))
  const getAllMarks = await JSON.parse(getAllMarksJson)
  console.log('window.performance.getEntriesByType("mark")', getAllMarks)

  await browser.stopTracing()

  // Test that time taken between Start:FoF and End:FoF is less than 1700ms
  const start = getAllMarks.find((obj) => obj.name === "Start:FoF")?.startTime;
  const end = getAllMarks.find((obj) => obj.name === "End:FoF")?.startTime;
  const diff = (end) - (start);
  console.log("diff", diff);
  expect(diff).toBeLessThan(3000);
})