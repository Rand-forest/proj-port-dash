import { describe, expect, it } from 'vitest'

import { selectCloudflareEnvironment } from './build-cloudflare.mjs'

describe('selectCloudflareEnvironment', () => {
  it('selects Production browser configuration for main', () => {
    expect(
      selectCloudflareEnvironment({
        WORKERS_CI_BRANCH: 'main',
        PROD_SUPABASE_URL: 'https://production.example.test',
        PROD_SUPABASE_PUBLISHABLE_KEY: 'production-key',
        DEV_SUPABASE_URL: 'https://development.example.test',
        DEV_SUPABASE_PUBLISHABLE_KEY: 'development-key',
      }),
    ).toEqual({
      VITE_SUPABASE_URL: 'https://production.example.test',
      VITE_SUPABASE_PUBLISHABLE_KEY: 'production-key',
      VITE_APP_ENV: 'production',
    })
  })

  it.each([['feature/example'], [undefined]])(
    'selects Development browser configuration when the branch is %s',
    (branch) => {
      expect(
        selectCloudflareEnvironment({
          WORKERS_CI_BRANCH: branch,
          DEV_SUPABASE_URL: 'https://development.example.test',
          DEV_SUPABASE_PUBLISHABLE_KEY: 'development-key',
        }),
      ).toEqual({
        VITE_SUPABASE_URL: 'https://development.example.test',
        VITE_SUPABASE_PUBLISHABLE_KEY: 'development-key',
        VITE_APP_ENV: 'development',
      })
    },
  )

  it('reports every missing variable for the selected environment', () => {
    expect(() => selectCloudflareEnvironment({ WORKERS_CI_BRANCH: 'main' })).toThrow(
      'Missing required Cloudflare build variables: PROD_SUPABASE_URL, PROD_SUPABASE_PUBLISHABLE_KEY',
    )
  })
})
