import { expect } from '@playwright/test'
import { Page } from 'playwright-core'

export class OnboardingPages {
  readonly page: Page

  constructor(page: Page) {
    this.page = page
  }

  async fillEmail(email: string): Promise<void> {
    this.page.getByRole('button', { name: 'Sign in with email' })
    await this.page.getByLabel('Email').fill(email)

    const inputLocator = this.page.getByLabel('Email')
    const emailValue = await inputLocator.inputValue()

    await expect(emailValue).toContain(email)
  }

  async fillPassword(password: string): Promise<void> {
    await this.page.getByLabel('Choose password').fill(password)
  }

  async createUser(
    email: string,
    firstAndLastName: string,
    password: string
  ): Promise<void> {
    await this.fillEmail(email)
    await this.page.getByRole('button', { name: 'Next' }).click()
    await this.page.getByLabel('First & last name').click()
    await this.page.getByLabel('First & last name').fill(firstAndLastName)
    await this.fillPassword(password)
    await this.page.getByRole('button', { name: 'Save' }).click()

    await this.page
      .getByLabel('I agree with listed above conditions and requirements')
      .check()
    await this.page.getByRole('button', { name: 'Next' }).click()
  }

  async fillOnboardingForm(teamName: string, legalName: string): Promise<void> {
    await this.page.locator('input[name="nsStage"]').click()
    await this.page.locator('input[name="nsStage"]').fill('NS - Stage - Answer')
    await this.page.locator('#ZtEx_m-Hg').click()
    await this.page.locator('#ZtEx_m-Hg').fill('Question-edit answer')
    await this.page.getByRole('button', { name: 'Next' }).click()

    await this.page.click('textarea#lWcpw1ey7[name="onboarding"]')
    await this.page.fill(
      'textarea#lWcpw1ey7[name="onboarding"]',
      'onboarding long question - answer'
    )

    await this.page.getByRole('button', { name: 'Next' }).click()
    await this.page.check('input[type="radio"][value="Option 1"]')
    await this.page.getByRole('button', { name: 'Next' }).click()
    await this.page.check('input[type="checkbox"][value="Option 1"]')
    await this.page.check('input[type="checkbox"][value="Option 2"]')
    await this.page.getByRole('button', { name: 'Next' }).click()
    await this.page.click('input[type="text"][id="title"]')
    await this.page.fill('input[type="text"][id="title"]', teamName)

    await this.page.click('input[type="text"][id="publicTitle"]')
    await this.page.fill('input[type="text"][id="publicTitle"]', legalName)

    await this.page.getByRole('button', { name: 'Create' }).click()

    await this.page.getByRole('button', { name: 'Skip' }).click()
  }
}
