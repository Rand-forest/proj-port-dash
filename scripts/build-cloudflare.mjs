import { spawnSync } from 'node:child_process'
import { fileURLToPath } from 'node:url'

export function selectCloudflareEnvironment(environment) {
  const isProduction = environment.WORKERS_CI_BRANCH === 'main'
  const prefix = isProduction ? 'PROD' : 'DEV'
  const urlName = `${prefix}_SUPABASE_URL`
  const keyName = `${prefix}_SUPABASE_PUBLISHABLE_KEY`
  const missing = [urlName, keyName].filter((name) => !environment[name]?.trim())

  if (missing.length > 0) {
    throw new Error(
      `Missing required Cloudflare build variable${missing.length === 1 ? '' : 's'}: ${missing.join(', ')}`,
    )
  }

  return {
    VITE_SUPABASE_URL: environment[urlName],
    VITE_SUPABASE_PUBLISHABLE_KEY: environment[keyName],
    VITE_APP_ENV: isProduction ? 'production' : 'development',
  }
}

function runBuild() {
  let selectedEnvironment

  try {
    selectedEnvironment = selectCloudflareEnvironment(process.env)
  } catch (error) {
    console.error(`Cloudflare build configuration error: ${error.message}`)
    process.exitCode = 1
    return
  }

  const result = spawnSync('npm', ['run', 'build'], {
    env: { ...process.env, ...selectedEnvironment },
    stdio: 'inherit',
    shell: process.platform === 'win32',
  })

  if (result.error) {
    console.error(`Unable to start the Vite build: ${result.error.message}`)
    process.exitCode = 1
    return
  }

  process.exitCode = result.status ?? 1
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  runBuild()
}
