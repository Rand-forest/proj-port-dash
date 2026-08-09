import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'

import { App } from './App'

describe('App', () => {
  it('confirms that the application is running', () => {
    render(<App />)

    expect(screen.getByRole('main')).toHaveTextContent('MyApp is running.')
  })
})
