import { useState, useEffect } from "react";
import Header from "./components/Header";
import Sidebar from "./components/Sidebar";
import MainContent from "./components/MainContent";

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

  const headerHeight = 64;

  return (
    <div className="min-h-screen flex bg-[#000]">
      {/* Header */}
      <Header headerHeight={headerHeight} sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />

      {/* Sidebar */}
      <Sidebar
        headerHeight={headerHeight}
        sidebarOpen={sidebarOpen}
        setSidebarOpen={setSidebarOpen}
        files={files}
        selectedFile={selectedFile}
        setSelectedFile={setSelectedFile}
        setOpenIndices={setOpenIndices}
        fileTopics={fileTopics}
      />

      {/* Backdrop overlay for mobile when sidebar open */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-90 z-40 md:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Main Content */}
      <MainContent
        headerHeight={headerHeight}
        questionsData={questionsData}
        openIndices={openIndices}
        handleToggle={handleToggle}
      />
    </div>
  );
}

export default App;