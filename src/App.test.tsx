import { cleanup, render, screen } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'

import { App } from './App'

describe('App', () => {
  afterEach(() => {
    cleanup()
    vi.unstubAllEnvs()
  })

  it('confirms that the application is running', () => {
    render(<App />)

    expect(screen.getByRole('main')).toHaveTextContent('MyApp is running.')
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
