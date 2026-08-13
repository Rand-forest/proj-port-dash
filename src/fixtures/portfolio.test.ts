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

  it('defines deterministic project display order explicitly', () => {
    const sortOrders = portfolioFixture.projects.map(({ sortOrder }) => sortOrder)

    expect(sortOrders).toEqual([0, 1, 2, 3])
    expect(sortOrders.every((sortOrder) => Number.isInteger(sortOrder) && sortOrder >= 0)).toBe(true)
    expect(new Set(sortOrders).size).toBe(sortOrders.length)
  })

  it('preserves legacy Gantt fractions for boundary and span parity cases', () => {
    const [crossYear, endBoundary, startBoundary, sameMonth, exactDateOnly] = portfolioFixture.activities

    expect(startBoundary).toMatchObject({ legacyStartYear: 2026, legacyStartMonth: 1, legacyDuration: 1 })
    expect((endBoundary?.legacyStartMonth ?? 0) + (endBoundary?.legacyDuration ?? 0)).toBeCloseTo(2)
    expect(Math.floor((sameMonth?.legacyStartMonth ?? 0) + (sameMonth?.legacyDuration ?? 0))).toBe(Math.floor(sameMonth?.legacyStartMonth ?? 0))
    expect((crossYear?.legacyStartMonth ?? 0) + (crossYear?.legacyDuration ?? 0)).toBeGreaterThan(12)
    expect(crossYear).toMatchObject({ legacyStartYear: 2025, legacyStartMonth: 11.5, legacyDuration: 0.8 })
    expect(exactDateOnly).toMatchObject({ legacyStartYear: null, legacyStartMonth: null, legacyDuration: null })
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
