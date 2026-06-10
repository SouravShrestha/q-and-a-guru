import switchToDark from '../assets/images/switch-to-dark.png';
import switchToLight from '../assets/images/switch-to-light.png';
import brainQuiz from '../assets/images/brain.png';
import brainLight from '../assets/images/brain-for-light.png';

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
        style={{ backgroundColor: 'var(--bg-elevated)' }}
        title={darkMode ? 'Switch to light mode' : 'Switch to dark mode'}
        aria-label={darkMode ? 'Switch to light mode' : 'Switch to dark mode'}
      >
        <img
          src={darkMode ? switchToLight : switchToDark}
          alt={darkMode ? 'Switch to light mode' : 'Switch to dark mode'}
          className="w-5 h-5"
        />
      </button>
      <button
        onClick={onRandomQuestion}
        className="p-2 rounded-full focus:outline-none transition-opacity hover:opacity-70"
        style={{ backgroundColor: 'var(--bg-elevated)' }}
        title="Random question"
        aria-label="Random question"
      >
        <img
          src={darkMode ? brainQuiz : brainLight}
          alt="Random Question"
          className="w-5 h-5 drop-shadow cursor-pointer"
        />
      </button>
    </div>
  </header>
);

export default Header;
