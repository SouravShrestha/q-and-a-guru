const Sidebar = ({
  headerHeight, sidebarOpen, setSidebarOpen,
  files, selectedFile, setSelectedFile,
  setOpenIndices, fileTopics, questionCounts,
}) => (
  <nav
    className={`fixed left-0 bottom-0 w-4/5 md:w-1/4 md:border-r md:px-6 px-2 py-8
      overflow-y-auto transform transition-transform duration-300 ease-in-out z-50
      md:transform-none md:max-w-full no-print
      ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
    `}
    style={{
      top: headerHeight,
      backgroundColor: 'var(--bg-surface)',
      borderColor: 'var(--border-primary)',
    }}
  >
    <div className="flex flex-col gap-1">
      {files.map((file, idx) => {
        const isSelected = selectedFile === file.name;
        const count = questionCounts[file.name];
        return (
          <button
            key={file.name}
            className="text-base text-left px-4 py-2 transition-colors focus:outline-none tracking-wide leading-6 flex items-center justify-between rounded-sm"
            style={{
              color: isSelected ? 'var(--accent)' : 'var(--text-primary)',
              backgroundColor: isSelected ? 'var(--bg-elevated)' : 'transparent',
              fontFamily: 'RobotFlex',
              fontWeight: isSelected ? 'bold' : 'normal',
            }}
            onClick={() => {
              setSelectedFile(file.name);
              setOpenIndices([]);
              setSidebarOpen(false);
            }}
          >
            <span className="flex items-center min-w-0">
              <span className="mr-2 shrink-0">{`${(idx + 1).toString().padStart(2, '0')}`}.</span>
              <span className="truncate">{fileTopics[file.name] || 'Loading…'}</span>
            </span>
            {count !== undefined && (
              <span
                className="text-xs px-1.5 py-0.5 rounded ml-2 shrink-0"
                style={{ backgroundColor: 'var(--bg-elevated)', color: 'var(--text-secondary)' }}
              >
                {count}
              </span>
            )}
          </button>
        );
      })}
    </div>
  </nav>
);

export default Sidebar;
