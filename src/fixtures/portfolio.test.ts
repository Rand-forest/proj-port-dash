import { describe, expect, it } from 'vitest'
import { portfolioFixture } from './portfolio'
import { DEPARTMENTS, RAID_TYPES } from '../types/portfolio'

describe('portfolioFixture', () => {
  it('contains representative portfolio values', () => {
    expect(new Set(portfolioFixture.projects.map(({ department }) => department))).toEqual(new Set(DEPARTMENTS))
    expect(new Set(portfolioFixture.raidItems.map(({ type }) => type))).toEqual(new Set(RAID_TYPES))
    expect(portfolioFixture.projects.map(({ projectType }) => projectType)).toEqual(expect.arrayContaining(['Key Project', 'BAU Project']))
    expect(portfolioFixture.activities.some(({ startDate, endDate }) => startDate.slice(0, 4) !== endDate.slice(0, 4))).toBe(true)
  })

  it('demonstrates required project-level currencies without FX conversion', () => {
    const currencyCodes = portfolioFixture.projects.map(({ currencyCode }) => currencyCode)

    expect(new Set(currencyCodes).size).toBeGreaterThanOrEqual(3)
    expect(currencyCodes).toEqual(expect.arrayContaining(['SGD', 'USD', 'EUR']))
    expect(currencyCodes.every((currencyCode) => /^[A-Z]{3}$/.test(currencyCode))).toBe(true)
  })

  it('has valid fixture relationships and no real email domain', () => {
    const projectIds = new Set(portfolioFixture.projects.map(({ id }) => id))
    const activityIds = new Set(portfolioFixture.activities.map(({ id }) => id))
    const raidIds = new Set(portfolioFixture.raidItems.map(({ id }) => id))

    expect(portfolioFixture.activities.every(({ projectId }) => projectIds.has(projectId))).toBe(true)
    expect(portfolioFixture.tasks.every(({ projectId }) => projectIds.has(projectId))).toBe(true)
    expect(portfolioFixture.raidItems.every(({ projectId }) => projectIds.has(projectId))).toBe(true)
    expect(portfolioFixture.activityComments.every(({ activityId }) => activityIds.has(activityId))).toBe(true)
    expect(portfolioFixture.raidComments.every(({ raidItemId }) => raidIds.has(raidItemId))).toBe(true)
    expect([...portfolioFixture.activityComments, ...portfolioFixture.raidComments].every(({ authorEmailSnapshot }) => authorEmailSnapshot.endsWith('@example.invalid'))).toBe(true)
  })
})
