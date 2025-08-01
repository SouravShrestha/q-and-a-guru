import { useState, useEffect } from "react";
import Header from "./components/Header";
import Sidebar from "./components/Sidebar";
import MainContent from "./components/MainContent";

function App() {
  const [openIndices, setOpenIndices] = useState([]);
  const [selectedFile, setSelectedFile] = useState("https://cdn.jsdelivr.net/gh/SouravShrestha/q-and-a-guru@main/data/oops.json");
  const [questionsData, setQuestionsData] = useState({ topic: '', questions: [] });
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [answerRevealed, setAnswerRevealed] = useState(false);
  const [allQuestionsCache, setAllQuestionsCache] = useState(null);

  // List of files from GitHub API
  const [files, setFiles] = useState([]);
  const [fileTopics, setFileTopics] = useState({});

  // State for random question modal
  const [randomQuestion, setRandomQuestion] = useState(null);
  const [showRandomModal, setShowRandomModal] = useState(false);

  // Fetch file list from GitHub API
  useEffect(() => {
    fetch('https://api.github.com/repos/SouravShrestha/q-and-a-guru/contents/data')
      .then((res) => res.json())
      .then(async (data) => {
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
        // Fetch all questions and cache them immediately
        try {
          const responses = await Promise.all(
            sortedFiles.map(file => fetch(file.name).then(res => res.json()).catch(() => null))
          );
          const allQuestions = [];
          responses.forEach((data, idx) => {
            if (data && Array.isArray(data.questions)) {
              data.questions.forEach(q => {
                allQuestions.push({ ...q, topic: data.topic || sortedFiles[idx].filename });
              });
            }
          });
          setAllQuestionsCache(allQuestions);
        } catch {
          setAllQuestionsCache([]);
        }
      });
  }, []);

  // Helper to fetch all questions from all files in parallel
  const fetchAllQuestions = async () => {
    if (allQuestionsCache) return allQuestionsCache;
    if (!files.length) return [];
    try {
      const responses = await Promise.all(
        files.map(file => fetch(file.name).then(res => res.json()).catch(() => null))
      );
      const allQuestions = [];
      responses.forEach((data, idx) => {
        if (data && Array.isArray(data.questions)) {
          data.questions.forEach(q => {
            allQuestions.push({ ...q, topic: data.topic || files[idx].filename });
          });
        }
      });
      setAllQuestionsCache(allQuestions);
      return allQuestions;
    } catch {
      return [];
    }
  };

  // Handler for random question button
  const handleRandomQuestion = async () => {
    const allQuestions = await fetchAllQuestions();
    if (allQuestions.length) {
      const randomIdx = Math.floor(Math.random() * allQuestions.length);
      setRandomQuestion(allQuestions[randomIdx]);
      setShowRandomModal(true);
      setAnswerRevealed(false);
    } else {
      setRandomQuestion({ question: 'Error fetching random question.', answer: '', topic: '' });
      setShowRandomModal(true);
      setAnswerRevealed(false);
    }
  };

   // Helper to get next random question
  const showNextRandomQuestion = async () => {
    const allQuestions = await fetchAllQuestions();
    if (allQuestions.length) {
      let randomIdx;
      // Avoid showing the same question again
      do {
        randomIdx = Math.floor(Math.random() * allQuestions.length);
      } while (allQuestions[randomIdx].question === randomQuestion?.question && allQuestions.length > 1);
      setRandomQuestion(allQuestions[randomIdx]);
      setAnswerRevealed(false);
    } else {
      setRandomQuestion({ question: 'Error fetching random question.', answer: '', topic: '' });
      setAnswerRevealed(false);
    }
  };

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

  // Prevent background scroll when modal is open
  useEffect(() => {
    if (showRandomModal || sidebarOpen) {
      document.body.classList.add('overflow-hidden');
    } else {
      document.body.classList.remove('overflow-hidden');
    }
    return () => {
      document.body.classList.remove('overflow-hidden');
    };
  }, [showRandomModal, sidebarOpen]);

  return (
    <div className="min-h-screen flex bg-[#000]">
      {/* Header */}
      <div className="fixed w-full z-40">
        <Header
          headerHeight={headerHeight}
          sidebarOpen={sidebarOpen}
          setSidebarOpen={setSidebarOpen}
        />
        {/* Random Question Image Button */}
        <div className="absolute right-5 top-4 z-50">
          <img
            src={require("./assets/images/brain.png")}
            alt="Random Question"
            title="Show Random Question"
            className="w-8 h-8 cursor-pointer hover:scale-110 transition-transform drop-shadow"
            onClick={handleRandomQuestion}
          />
        </div>
      </div>

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
          className="fixed inset-0 bg-black bg-opacity-90 z-30 md:hidden"
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

      {/* Random Question Modal */}
      {showRandomModal && randomQuestion && (
        <div className="fixed inset-0 flex items-center justify-center z-50">
          {/* Modal backdrop */}
          <div
            className="fixed inset-0 bg-black bg-opacity-90"
            onClick={() => setShowRandomModal(false)}
          />
          <div className="bg-[#171717] rounded-sm border border-[#404040] p-6 max-w-lg w-full mx-4 relative">
            <button
              className="absolute top-2 right-4 text-gray-500 hover:text-gray-200 text-xl md:text-base"
              onClick={() => setShowRandomModal(false)}
            >
              &times;
            </button>
            <h4 className="text-sm mb-2 text-white">
              {randomQuestion.topic || "Random Question"}
            </h4>
            <div className="text-xl mb-4 text-[#31b8c6]">
              {randomQuestion.question}
            </div>
            {randomQuestion.answer && (
              <div className="relative mt-2">
                {!answerRevealed ? (
                  <div
                    className="absolute -inset-5 flex items-center justify-center bg-[#222] bg-opacity-0 rounded cursor-pointer select-none backdrop-blur-sm"
                    style={{ zIndex: 2 }}
                    onClick={() => setAnswerRevealed(true)}
                    title="Tap to reveal answer"
                  >
                    <span className="text-white text-base font-medium px-4 py-2">👀 Tap to reveal answer</span>
                  </div>
                ) : null}
                <div className={`text-white transition-opacity duration-300 ${answerRevealed ? 'opacity-100' : 'opacity-40'} ${!answerRevealed ? 'blur-sm' : ''}`}>{randomQuestion.answer}</div>
              </div>
            )}
            <div
              className="text-base text-[#31b8c6] mt-10 inset-2 text-right font-medium cursor-pointer hover:text-[#2699a6] w-fit float-right"
              onClick={showNextRandomQuestion}
              title="Shuffle to next random question"
            >
              shuffle ∞
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;