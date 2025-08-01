import { useState, useEffect } from "react";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { oneDark } from "react-syntax-highlighter/dist/esm/styles/prism";

function App() {
  const [openIndices, setOpenIndices] = useState([]);
  const [selectedFile, setSelectedFile] = useState("https://cdn.jsdelivr.net/gh/SouravShrestha/q-and-a-guru@main/data/oops.json");
  const [questionsData, setQuestionsData] = useState({ topic: '', questions: [] });
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // List of files from GitHub API
  const [files, setFiles] = useState([]);
  const [fileTopics, setFileTopics] = useState({});

  // Fetch file list from GitHub API
  useEffect(() => {
    fetch('https://api.github.com/repos/SouravShrestha/q-and-a-guru/contents/data')
      .then((res) => res.json())
      .then((data) => {
        const jsonFiles = data.filter(f => f.name.endsWith('.json'));
        const fileObjs = jsonFiles.map(f => ({
          name: f.download_url,
          filename: f.name
        }));
        // Sort files by filename
        const sortedFiles = [...fileObjs].sort((a, b) => a.filename.localeCompare(b.filename));
        setFiles(sortedFiles);
        // Fetch topics for each file
        sortedFiles.forEach(file => {
          fetch(file.name)
            .then(res => res.json())
            .then(data => {
              setFileTopics(prev => ({ ...prev, [file.name]: data.topic || file.filename }));
            })
            .catch(() => {
              setFileTopics(prev => ({ ...prev, [file.name]: file.filename }));
            });
        });
        // Always highlight the first menu item by default
        if (sortedFiles.length > 0) {
          setSelectedFile(sortedFiles[0].name);
        }
      });
  }, []);

  // Fetch questions data for selected file
  useEffect(() => {
    if (!selectedFile) return;
    setQuestionsData({ topic: '', questions: [] });
    fetch(selectedFile)
      .then((res) => res.json())
      .then((data) => setQuestionsData(data))
      .catch(() => setQuestionsData({ topic: 'Error loading data', questions: [] }));
  }, [selectedFile]);

  const handleToggle = (idx) => {
    setOpenIndices((prev) =>
      prev.includes(idx)
        ? prev.filter((i) => i !== idx)
        : [...prev, idx]
    );
  };

  const headerHeight = 120;

  return (
    <div className="min-h-screen flex bg-[#191a1a]">
      {/* Header */}
      <header
        className="fixed top-0 left-0 right-0 z-50 px-6 bg-[#191a1a] flex flex-col pt-10"
        style={{ height: headerHeight, fontFamily: 'Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace' }}
      >
        <div className="flex items-center justify-start">
          {/* Hamburger menu button - only on mobile, toggles to cross icon, now on left */}
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
          <div>
            <span className="block text-sm text-[#31b8c6] font-regular">.NET Fullstack</span>
            <span className="block text-white font-regular">Frequent Interview Questions</span>
          </div>
        </div>
      </header>

      {/* Sidebar */}
      <nav
        className={`fixed left-0 bottom-0 md:w-1/5 bg-[#191a1a] md:border-r border-gray-700 md:px-6 px-2 py-4
          overflow-y-auto
          transform transition-transform duration-300 ease-in-out z-50
          md:transform-none md:w-1/5 md:max-w-full
          ${sidebarOpen ? "translate-x-0" : "-translate-x-full"}
        `}
        style={{ fontFamily: 'Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace', top: headerHeight}}
      >
        <div className="flex flex-col gap-3">
          {files.map((file, idx) => (
            <button
              key={file.name}
              className="text-sm text-left px-4 py-2 font-regular transition-colors hover:text-[#31b8c6] focus:outline-none"
              style={{
                color: selectedFile === file.name ? "#31b8c6" : "#fff",
                background: "none",
                fontFamily: 'Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace',
              }}
              onClick={() => {
                setSelectedFile(file.name);
                setOpenIndices([]);
                setSidebarOpen(false); // close sidebar on mobile after selection
              }}
            >
              {`${idx + 1}) ${fileTopics[file.name] || "Loading..."}`}
            </button>
          ))}
        </div>
      </nav>

      {/* Backdrop overlay for mobile when sidebar open */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-40 md:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Main Content */}
      <main
        className="flex-1 flex flex-col p-6 pt-0 overflow-y-auto "
        style={{
          backgroundColor: "transparent",
          fontFamily: 'Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace',
          marginTop: `calc(${headerHeight}px + 20px)`,
          marginLeft: typeof window !== 'undefined' && window.innerWidth >= 768 ? '20%' : 0
        }}
      >
        {questionsData.questions.map((q, idx) => (
          <div
            key={q.id || idx}
            className="mb-8 text-white"
          >
            <button
              onClick={() => handleToggle(idx)}
              className="flex justify-between items-start w-full md:px-4 py-3 text-base font-medium focus:outline-none text-left"
              style={{ color: openIndices.includes(idx) ? '#31b8c6' : undefined }}
            >
              <span className="mr-8 leading-wide">
              {`${idx + 1}) ${q.question}`}</span>
              <span className="md:ml-2">{openIndices.includes(idx) ? "-" : "+"}</span>
            </button>
            {openIndices.includes(idx) && (
              <div
                className="md:px-4 py-3 text-gray-300 cursor-pointer"
                onClick={() => handleToggle(idx)}
              >
                <div>{q.answer}</div>
                {q.example && (
                  <SyntaxHighlighter
                    language="csharp"
                    style={oneDark}
                    customStyle={{
                      marginTop: '1rem',
                      marginBottom: 0,
                      padding: '1rem',
                      borderRadius: '0.3rem',
                      fontSize: '0.85rem',
                      lineHeight: '2',
                      overflowX: 'wrap',
                    }}
                    showLineNumbers={true}
                  >
                    {q.example}
                  </SyntaxHighlighter>
                )}
              </div>
            )}
          </div>
        ))}
      </main>
    </div>
  );
}

export default App;