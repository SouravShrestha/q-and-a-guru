import { useState, useEffect, useRef, useCallback } from 'react';
import Header from './components/Header';
import Sidebar from './components/Sidebar';
import MainContent from './components/MainContent';
import { GITHUB_API_URL } from './config';

function App() {
  // ── Theme ──────────────────────────────────────────────────────
  const [darkMode, setDarkMode] = useState(() => localStorage.getItem('qa-theme') !== 'light');

  useEffect(() => {
    document.documentElement.classList.toggle('light-mode', !darkMode);
    localStorage.setItem('qa-theme', darkMode ? 'dark' : 'light');
  }, [darkMode]);

  // ── File list ──────────────────────────────────────────────────
  const [files, setFiles] = useState([]);
  const [fileTopics, setFileTopics] = useState({});
  const [questionCounts, setQuestionCounts] = useState({});
  const [filesLoading, setFilesLoading] = useState(true);
  const [filesError, setFilesError] = useState(null);
  const [retryKey, setRetryKey] = useState(0);

  // ── Selected topic ─────────────────────────────────────────────
  const [selectedFile, setSelectedFile] = useState(null);
  const [questionsData, setQuestionsData] = useState({ topic: '', questions: [] });
  const [topicLoading, setTopicLoading] = useState(false);
  const [topicError, setTopicError] = useState(null);
  const [topicRetryKey, setTopicRetryKey] = useState(0);

  // ── UI ─────────────────────────────────────────────────────────
  const [openIndices, setOpenIndices] = useState([]);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // ── Bookmarks ──────────────────────────────────────────────────
  const [bookmarks, setBookmarks] = useState(() => {
    try { return JSON.parse(localStorage.getItem('qa-bookmarks') || '[]'); }
    catch { return []; }
  });

  const toggleBookmark = useCallback((key) => {
    setBookmarks(prev => {
      const next = prev.includes(key) ? prev.filter(k => k !== key) : [...prev, key];
      localStorage.setItem('qa-bookmarks', JSON.stringify(next));
      return next;
    });
  }, []);

  // ── Random question ────────────────────────────────────────────
  const [allQuestionsCache, setAllQuestionsCache] = useState(null);
  const [randomQuestion, setRandomQuestion] = useState(null);
  const [showRandomModal, setShowRandomModal] = useState(false);
  const [answerRevealed, setAnswerRevealed] = useState(false);
  const [randomSeen, setRandomSeen] = useState(0);

  // Stable ref so the keyboard handler never becomes stale
  const showNextRef = useRef(null);

  const showNextRandomQuestion = useCallback(() => {
    const allQ = allQuestionsCache || [];
    if (!allQ.length) return;
    let idx;
    do { idx = Math.floor(Math.random() * allQ.length); }
    while (allQ[idx]?.question === randomQuestion?.question && allQ.length > 1);
    setRandomQuestion(allQ[idx]);
    setAnswerRevealed(false);
    setRandomSeen(n => n + 1);
  }, [allQuestionsCache, randomQuestion]);

  useEffect(() => { showNextRef.current = showNextRandomQuestion; }, [showNextRandomQuestion]);

  const handleRandomQuestion = () => {
    const allQ = allQuestionsCache || [];
    if (!allQ.length) return;
    const idx = Math.floor(Math.random() * allQ.length);
    setRandomQuestion(allQ[idx]);
    setShowRandomModal(true);
    setAnswerRevealed(false);
    setRandomSeen(n => n + 1);
  };

  // ── Search ref (for `/` keyboard shortcut) ─────────────────────
  const searchInputRef = useRef(null);

  // ── Load all files ─────────────────────────────────────────────
  useEffect(() => {
    setFilesLoading(true);
    setFilesError(null);
    fetch(GITHUB_API_URL)
      .then(res => {
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        return res.json();
      })
      .then(async (data) => {
        const sortedFiles = data
          .filter(f => f.name.endsWith('.json'))
          .map(f => ({ name: f.download_url, filename: f.name }))
          .sort((a, b) => a.filename.localeCompare(b.filename));

        setFiles(sortedFiles);
        setFilesLoading(false);

        // Deep-link: honour ?topic= query param on initial load
        const params = new URLSearchParams(window.location.search);
        const topicParam = params.get('topic');
        const initial = topicParam
          ? (sortedFiles.find(f => f.filename === topicParam) || sortedFiles[0])
          : sortedFiles[0];
        if (initial) setSelectedFile(initial.name);

        // Fetch all topic data in parallel to populate sidebar counts +
        // build the cross-topic search cache
        const responses = await Promise.all(
          sortedFiles.map(f => fetch(f.name).then(r => r.json()).catch(() => null))
        );
        const topicsMap = {};
        const countsMap = {};
        const allQuestions = [];
        responses.forEach((d, idx) => {
          if (!d) return;
          const key = sortedFiles[idx].name;
          topicsMap[key] = d.topic || sortedFiles[idx].filename;
          countsMap[key] = d.questions?.length ?? 0;
          (d.questions || []).forEach(q =>
            allQuestions.push({ ...q, topic: d.topic || sortedFiles[idx].filename, fileUrl: key })
          );
        });
        setFileTopics(topicsMap);
        setQuestionCounts(countsMap);
        setAllQuestionsCache(allQuestions);
      })
      .catch(err => {
        setFilesError(err.message);
        setFilesLoading(false);
      });
  }, [retryKey]);

  // ── Load selected topic ────────────────────────────────────────
  useEffect(() => {
    if (!selectedFile) return;
    setTopicLoading(true);
    setTopicError(null);
    setQuestionsData({ topic: '', questions: [] });
    setOpenIndices([]);
    fetch(selectedFile)
      .then(res => {
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        return res.json();
      })
      .then(data => { setQuestionsData(data); setTopicLoading(false); })
      .catch(err => { setTopicError(err.message); setTopicLoading(false); });
  }, [selectedFile, topicRetryKey]);

  // ── URL deep linking ───────────────────────────────────────────
  useEffect(() => {
    if (!selectedFile || !files.length) return;
    const file = files.find(f => f.name === selectedFile);
    if (file) {
      const params = new URLSearchParams(window.location.search);
      params.set('topic', file.filename);
      window.history.replaceState({}, '', `?${params.toString()}`);
    }
  }, [selectedFile, files]);

  // ── Keyboard shortcuts ─────────────────────────────────────────
  useEffect(() => {
    const handleKey = (e) => {
      if (e.key === 'Escape') { setShowRandomModal(false); setSidebarOpen(false); }
      if (e.key === '/' && !e.ctrlKey && !e.metaKey) {
        const tag = document.activeElement?.tagName?.toLowerCase();
        if (tag !== 'input' && tag !== 'textarea') {
          e.preventDefault();
          searchInputRef.current?.focus();
        }
      }
      if (showRandomModal) {
        if (e.key === 'ArrowRight') showNextRef.current?.();
        if (e.key === 'ArrowLeft') setAnswerRevealed(true);
      }
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [showRandomModal]);

  // ── Scroll lock ────────────────────────────────────────────────
  useEffect(() => {
    document.body.classList.toggle('overflow-hidden', showRandomModal || sidebarOpen);
    return () => document.body.classList.remove('overflow-hidden');
  }, [showRandomModal, sidebarOpen]);

  const handleToggle = (idx) => {
    setOpenIndices(prev => prev.includes(idx) ? prev.filter(i => i !== idx) : [...prev, idx]);
  };

  const headerHeight = 64;

  return (
    <div className="min-h-screen flex" style={{ backgroundColor: 'var(--bg-base)' }}>
      {/* ── Header ── */}
      <div className="fixed w-full z-40">
        <Header
          headerHeight={headerHeight}
          sidebarOpen={sidebarOpen}
          setSidebarOpen={setSidebarOpen}
          darkMode={darkMode}
          toggleDarkMode={() => setDarkMode(d => !d)}
          onRandomQuestion={handleRandomQuestion}
        />
      </div>

      {/* ── Sidebar ── */}
      <Sidebar
        headerHeight={headerHeight}
        sidebarOpen={sidebarOpen}
        setSidebarOpen={setSidebarOpen}
        files={files}
        selectedFile={selectedFile}
        setSelectedFile={setSelectedFile}
        setOpenIndices={setOpenIndices}
        fileTopics={fileTopics}
        questionCounts={questionCounts}
      />

      {/* Mobile backdrop */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-90 z-30 md:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* ── Main content ── */}
      <MainContent
        headerHeight={headerHeight}
        questionsData={questionsData}
        openIndices={openIndices}
        setOpenIndices={setOpenIndices}
        handleToggle={handleToggle}
        isLoading={topicLoading || filesLoading}
        error={topicError || (filesError ? `Could not load topics: ${filesError}` : null)}
        onRetry={() => {
          if (filesError) setRetryKey(k => k + 1);
          else setTopicRetryKey(k => k + 1);
        }}
        bookmarks={bookmarks}
        toggleBookmark={toggleBookmark}
        selectedFile={selectedFile}
        allQuestionsCache={allQuestionsCache}
        searchInputRef={searchInputRef}
      />

      {/* ── Random question modal ── */}
      {showRandomModal && randomQuestion && (
        <div className="fixed inset-0 flex items-end sm:items-center justify-center z-50">
          {/* Backdrop */}
          <div
            className="fixed inset-0"
            style={{ backgroundColor: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(4px)' }}
            onClick={() => setShowRandomModal(false)}
          />

          {/* Modal card — full-width sheet on mobile, centred card on sm+ */}
          <div
            className="relative w-full sm:max-w-lg mx-0 sm:mx-4 rounded-t-2xl sm:rounded border p-6"
            style={{
              backgroundColor: 'var(--bg-surface)',
              borderColor: 'var(--border-secondary)',
              maxHeight: '85vh',
              overflowY: 'auto',
              zIndex: 10,
            }}
          >
            {/* Close */}
            <button
              className="absolute top-3 right-4 text-2xl leading-none hover:opacity-70 focus:outline-none"
              style={{ color: 'var(--text-secondary)' }}
              onClick={() => setShowRandomModal(false)}
              aria-label="Close"
            >
              &times;
            </button>

            {/* Topic label + progress */}
            <div className="flex justify-between items-center mb-4 pr-6">
              <span
                className="text-xs px-2 py-1 rounded font-medium"
                style={{ backgroundColor: 'var(--bg-elevated)', color: 'var(--accent)' }}
              >
                {randomQuestion.topic || 'Random'}
              </span>
              <span className="text-xs" style={{ color: 'var(--text-secondary)' }}>
                {randomSeen} seen · {allQuestionsCache?.length ?? 0} total
              </span>
            </div>

            {/* Question */}
            <div className="text-xl leading-8 mb-6" style={{ color: 'var(--accent)' }}>
              {randomQuestion.question}
            </div>

            {/* Answer with blur-reveal */}
            {randomQuestion.answer && (
              <div className="relative">
                {!answerRevealed && (
                  <div
                    className="absolute inset-0 flex items-center justify-center rounded cursor-pointer backdrop-blur-sm"
                    style={{ zIndex: 2 }}
                    onClick={() => setAnswerRevealed(true)}
                  >
                    <span
                      className="text-base font-medium px-4 py-2 rounded"
                      style={{ color: 'var(--text-primary)', backgroundColor: 'var(--bg-elevated)' }}
                    >
                      👀 Tap to reveal answer
                    </span>
                  </div>
                )}
                <div
                  className={`leading-7 transition-all duration-300 select-${answerRevealed ? 'text' : 'none'}`}
                  style={{
                    color: 'var(--text-primary)',
                    opacity: answerRevealed ? 1 : 0.15,
                    filter: answerRevealed ? 'none' : 'blur(6px)',
                    pointerEvents: answerRevealed ? 'auto' : 'none',
                  }}
                >
                  {randomQuestion.answer}
                </div>
              </div>
            )}

            {/* Footer */}
            <div
              className="flex justify-between items-center mt-10 pt-4"
              style={{ borderTop: '1px solid var(--border-primary)' }}
            >
              <span className="text-xs" style={{ color: 'var(--text-secondary)' }}>
                ← reveal · → next
              </span>
              <button
                className="text-base font-medium hover:opacity-70 transition-opacity focus:outline-none"
                style={{ color: 'var(--accent)' }}
                onClick={showNextRandomQuestion}
                title="Next random question"
              >
                shuffle ∞
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
