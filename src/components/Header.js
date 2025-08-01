const Header = ({ headerHeight, sidebarOpen, setSidebarOpen }) => (
  <header
    className="fixed top-0 left-0 right-0 z-50 px-5 bg-[#171717] flex flex-col pt-3.5 border-b border-black md:px-10"
    style={{ height: headerHeight, fontFamily: 'Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace' }}
  >
    <div className="flex items-center justify-start">
      <button
        className="md:hidden text-white focus:outline-none mr-6"
        onClick={() => setSidebarOpen(!sidebarOpen)}
        aria-label="Toggle navigation"
      >
        {sidebarOpen ? (
          <svg
            className="w-6 h-6"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        ) : (
          <svg
            className="w-6 h-6"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        )}
      </button>
      <div className="bg-black py-1.5 px-3 border border-white rounded">
        <span className="block text-base text-white font-bold">.NET</span>
      </div>
    </div>
  </header>
);

export default Header;
