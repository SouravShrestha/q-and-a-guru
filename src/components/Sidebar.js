const Sidebar = ({ headerHeight, sidebarOpen, setSidebarOpen, files, selectedFile, setSelectedFile, setOpenIndices, fileTopics }) => (
  <nav
    className={`fixed left-0 bottom-0 w-4/5 md:w-1/4 bg-[#171717] md:border-r border-black md:px-6 px-2 py-8
      overflow-y-auto
      transform transition-transform duration-300 ease-in-out z-50
      md:transform-none md:max-w-full
      ${sidebarOpen ? "translate-x-0" : "-translate-x-full"}
    `}
    style={{ top: headerHeight }}
  >
    <div className="flex flex-col gap-3">
      {files.map((file, idx) => (
        <button
          key={file.name}
          className="text-base text-left px-4 py-2 font-regular transition-colors hover:text-[#31b8c6] focus:outline-none tracking-wide leading-6 flex"
          style={{
            color: selectedFile === file.name ? "#31b8c6" : "#fff",
            background: "none",
            fontFamily: 'RobotFlex',
            fontWeight: selectedFile === file.name ? 'bold' : 'normal',
          }}
          onClick={() => {
            setSelectedFile(file.name);
            setOpenIndices([]);
            setSidebarOpen(false);
          }}
        >
            <span className="mr-2">{`${(idx + 1).toString().padStart(2, '0')}`}.</span>
            <span className="">{fileTopics[file.name] || "Loading..."}</span>
        </button>
      ))}
    </div>
  </nav>
);

export default Sidebar;
