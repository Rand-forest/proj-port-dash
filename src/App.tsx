export function App() {
  const isDevelopment = import.meta.env.VITE_APP_ENV === 'development'

  return (
    <>
      {isDevelopment && (
        <div className="environment-banner">DEVELOPMENT ENVIRONMENT</div>
      )}
      <main>MyApp is running.</main>
    </>
  )
}
