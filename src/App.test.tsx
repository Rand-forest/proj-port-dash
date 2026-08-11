import { cleanup, fireEvent, render, screen } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'

import { App } from './App'

describe('App', () => {
  afterEach(() => {
    cleanup()
    vi.unstubAllEnvs()
  })

  it('shows the project overview and key stakeholder information', () => {
    render(<App />)

    expect(screen.getByRole('heading', { name: 'Good morning, Alex' })).toBeVisible()
    expect(screen.getByText('Overall progress')).toBeVisible()
    expect(screen.getByRole('heading', { name: 'Upcoming milestones' })).toBeVisible()
    expect(screen.getByRole('heading', { name: 'Needs attention' })).toBeVisible()
  })

  it('supports switching the active navigation section', () => {
    render(<App />)

    const milestonesButton = screen.getByRole('button', { name: 'Milestones' })
    fireEvent.click(milestonesButton)

    expect(milestonesButton).toHaveClass('active')
  })

  it('displays the environment banner in development', () => {
    vi.stubEnv('VITE_APP_ENV', 'development')

    render(<App />)

    expect(screen.getByText('DEVELOPMENT ENVIRONMENT')).toBeVisible()
  })

  it('does not display the environment banner in production', () => {
    vi.stubEnv('VITE_APP_ENV', 'production')

    render(<App />)

    expect(screen.queryByText('DEVELOPMENT ENVIRONMENT')).not.toBeInTheDocument()
  })
})
