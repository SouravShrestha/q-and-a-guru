const SunIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364-6.364l-.707.707M6.343 17.657l-.707.707M17.657 17.657l-.707-.707M6.343 6.343l-.707-.707M12 7a5 5 0 100 10A5 5 0 0012 7z" />
  </svg>
);

const MoonIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
  </svg>
);

const Header = ({ headerHeight, sidebarOpen, setSidebarOpen, darkMode, toggleDarkMode, onRandomQuestion }) => (
  <header
    className="fixed top-0 left-0 right-0 z-50 px-5 flex items-center justify-between md:px-10 no-print"
    style={{
      height: headerHeight,
      backgroundColor: 'var(--bg-surface)',
      borderBottom: '1px solid var(--border-primary)',
      fontFamily: 'Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace',
    }}
  >
    {/* Left: hamburger + brand */}
    <div className="flex items-center">
      <button
        className="md:hidden focus:outline-none mr-6"
        style={{ color: 'var(--text-primary)' }}
        onClick={() => setSidebarOpen(!sidebarOpen)}
        aria-label="Toggle navigation"
      >
        {sidebarOpen ? (
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        ) : (
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        )}
      </button>
      <div
        className="py-1.5 px-3 rounded border"
        style={{ borderColor: 'var(--text-primary)', backgroundColor: 'var(--bg-base)' }}
      >
        <span className="text-base font-bold" style={{ color: 'var(--text-primary)' }}>.NET</span>
      </div>
    </div>

    {/* Right: theme toggle + random question */}
    <div className="flex items-center gap-3">
      <button
        onClick={toggleDarkMode}
        className="p-2 rounded-full focus:outline-none transition-opacity hover:opacity-70"
        style={{ color: 'var(--text-secondary)', backgroundColor: 'var(--bg-elevated)' }}
        title={darkMode ? 'Switch to light mode' : 'Switch to dark mode'}
        aria-label={darkMode ? 'Switch to light mode' : 'Switch to dark mode'}
      >
        {darkMode ? <SunIcon /> : <MoonIcon />}
      </button>
      <img
        src={require('../assets/images/brain.png')}
        alt="Random Question"
        title="Random question"
        className="w-8 h-8 cursor-pointer hover:scale-110 transition-transform drop-shadow"
        onClick={onRandomQuestion}
      />
    </div>
  </header>
);

export default Header;
