import React, { useState, useEffect } from 'react';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { oneDark } from '../styles/one-dark';

const DIFFICULTY_COLORS = {
  easy:   { bg: '#14532d', color: '#86efac' },
  medium: { bg: '#78350f', color: '#fcd34d' },
  hard:   { bg: '#7f1d1d', color: '#fca5a5' },
};

// Left margin is handled by the `md:ml-[25%]` class (matching the sidebar's
// md:w-1/4 width) so it stays in sync on resize / orientation change rather
// than being measured once in JS at render time.
const mainStyle = (headerHeight) => ({
  backgroundColor: 'transparent',
  fontFamily: 'RobotFlex',
  marginTop: headerHeight,
});

const MAIN_CLASS = 'flex-1 flex flex-col overflow-y-auto md:ml-[25%] min-w-0';

const Skeleton = ({ headerHeight }) => (
  <main className={MAIN_CLASS} style={mainStyle(headerHeight)}>
    <div
      className="px-5 pt-4 pb-4 sticky top-0 z-10"
      style={{ backgroundColor: 'var(--bg-surface)', borderBottom: '1px solid var(--border-primary)' }}
    >
      <div className="h-10 rounded animate-pulse" style={{ backgroundColor: 'var(--bg-elevated)' }} />
    </div>
    {[...Array(7)].map((_, i) => (
      <div
        key={i}
        className="px-5 py-5 animate-pulse"
        style={{ borderBottom: '1px solid var(--border-primary)', backgroundColor: 'var(--bg-surface)' }}
      >
        <div className="flex justify-between items-center gap-4">
          <div className="h-5 rounded flex-1" style={{ backgroundColor: 'var(--bg-elevated)', maxWidth: '70%' }} />
          <div className="h-5 w-5 rounded shrink-0" style={{ backgroundColor: 'var(--bg-elevated)' }} />
        </div>
      </div>
    ))}
  </main>
);

const ErrorState = ({ error, onRetry, headerHeight }) => (
  <main
    className={`${MAIN_CLASS} items-center justify-center text-center px-8`}
    style={mainStyle(headerHeight)}
  >
    <div className="text-5xl mb-4">⚠️</div>
    <p className="text-lg font-medium mb-2" style={{ color: 'var(--text-primary)' }}>Failed to load topic</p>
    <p className="text-sm mb-6" style={{ color: 'var(--text-secondary)' }}>{error}</p>
    <button
      className="px-6 py-2 rounded font-medium transition-opacity hover:opacity-80"
      style={{ backgroundColor: 'var(--accent)', color: '#000' }}
      onClick={onRetry}
    >
      Try again
    </button>
  </main>
);

const highlightText = (text, term) => {
  if (!term) return text;
  const escaped = term.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const regex = new RegExp(`(${escaped})`, 'gi');
  const parts = String(text).split(regex);
  return parts.map((part, i) =>
    regex.test(part) ? (
      <mark key={i} style={{ background: 'var(--accent)', color: '#000', borderRadius: '1px', padding: '0 2px' }}>
        {part}
      </mark>
    ) : part
  );
};

const MainContent = ({
  headerHeight,
  questionsData,
  openIndices,
  setOpenIndices,
  handleToggle,
  isLoading,
  error,
  onRetry,
  bookmarks,
  toggleBookmark,
  selectedFile,
  allQuestionsCache,
  searchInputRef,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [searchAllTopics, setSearchAllTopics] = useState(false);
  const [showBookmarkedOnly, setShowBookmarkedOnly] = useState(false);
  const [copiedKey, setCopiedKey] = useState(null);

  // Reset search (but not bookmark filter) when topic changes
  useEffect(() => {
    setSearchTerm('');
    setDebouncedSearch('');
    setSearchAllTopics(false);
  }, [questionsData]);

  // Debounce search input by 250ms
  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(searchTerm), 250);
    return () => clearTimeout(timer);
  }, [searchTerm]);

  const handleCopy = (text, key) => {
    navigator.clipboard.writeText(text).then(() => {
      setCopiedKey(key);
      setTimeout(() => setCopiedKey(null), 2000);
    }).catch(() => {});
  };

  // Cross-topic search uses allQuestionsCache when enabled
  const sourceQuestions = searchAllTopics && debouncedSearch && allQuestionsCache
    ? allQuestionsCache
    : questionsData.questions;

  // Enrich with a stable key and original index so filter & render stay consistent
  const enriched = sourceQuestions.map((q, origIdx) => ({
    ...q,
    _key: `${q.fileUrl || selectedFile}::${q.id ?? origIdx}`,
    _origIdx: origIdx,
    _isCross: !!(searchAllTopics && debouncedSearch && allQuestionsCache),
  }));

  const filteredQuestions = enriched.filter(q => {
    const matchesSearch = !debouncedSearch
      || q.question.toLowerCase().includes(debouncedSearch.toLowerCase())
      || (q.answer && q.answer.toLowerCase().includes(debouncedSearch.toLowerCase()));
    const matchesBookmark = !showBookmarkedOnly || bookmarks.includes(q._key);
    return matchesSearch && matchesBookmark;
  });

  const allExpanded = filteredQuestions.length > 0
    && filteredQuestions.every((_, idx) => openIndices.includes(idx));

  const toggleExpandAll = () => {
    setOpenIndices(allExpanded ? [] : filteredQuestions.map((_, idx) => idx));
  };

  if (isLoading) return <Skeleton headerHeight={headerHeight} />;
  if (error) return <ErrorState error={error} onRetry={onRetry} headerHeight={headerHeight} />;

  return (
    <main className={MAIN_CLASS} style={mainStyle(headerHeight)}>
      {/* ── Search bar ── */}
      <div
        className="px-5 pt-4 pb-3 sticky top-0 z-10 no-print"
        style={{ backgroundColor: 'var(--bg-surface)', borderBottom: '1px solid var(--border-primary)' }}
      >
        <div className="flex items-center gap-2">
          {/* Search input */}
          <div className="relative flex-1">
            <span className="absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none select-none">🥷🏻</span>
            <input
              ref={searchInputRef}
              type="text"
              className="w-full pl-12 pr-4 py-2 rounded focus:outline-none"
              style={{
                backgroundColor: 'var(--bg-input)',
                color: 'var(--text-primary)',
                border: '1px solid var(--border-secondary)',
                fontFamily: 'RobotFlex',
                transition: 'border-color 0.15s',
              }}
              onFocus={e => (e.target.style.borderColor = 'var(--accent)')}
              onBlur={e => (e.target.style.borderColor = 'var(--border-secondary)')}
              placeholder={searchAllTopics ? 'search all topics…  (/)' : 'find in this topic…  (/)'}
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
            />
          </div>

          {/* Bookmark filter toggle */}
          <button
            onClick={() => setShowBookmarkedOnly(v => !v)}
            className="p-2 rounded text-lg transition-colors focus:outline-none"
            style={{
              color: showBookmarkedOnly ? '#facc15' : 'var(--border-secondary)',
              backgroundColor: showBookmarkedOnly ? 'var(--bg-elevated)' : 'transparent',
            }}
            title={showBookmarkedOnly ? 'Show all questions' : 'Show bookmarked only'}
            aria-label={showBookmarkedOnly ? 'Show all questions' : 'Show bookmarked only'}
          >
            ★
          </button>

          {/* Expand / Collapse all */}
          {filteredQuestions.length > 0 && (
            <button
              className="p-2 text-xl font-medium focus:outline-none hover:opacity-70 transition-opacity"
              style={{ color: 'var(--text-primary)' }}
              onClick={toggleExpandAll}
              title={allExpanded ? 'Collapse all' : 'Expand all'}
              aria-label={allExpanded ? 'Collapse all' : 'Expand all'}
            >
              {allExpanded ? '–' : '+'}
            </button>
          )}
        </div>

        {/* Sub-row: cross-topic toggle / result count / topic info */}
        <div className="flex items-center justify-between mt-2 min-h-[1.4rem]">
          {debouncedSearch && allQuestionsCache ? (
            <button
              className="text-xs px-2 py-0.5 rounded transition-colors focus:outline-none"
              style={{
                color: searchAllTopics ? 'var(--accent)' : 'var(--text-secondary)',
                border: `1px solid ${searchAllTopics ? 'var(--accent)' : 'var(--border-secondary)'}`,
              }}
              onClick={() => setSearchAllTopics(v => !v)}
            >
              {searchAllTopics ? '✓ All topics' : 'Search all topics'}
            </button>
          ) : (
            <span className="text-xs" style={{ color: 'var(--text-secondary)' }}>
              {questionsData.topic && `${questionsData.topic} · `}
              {questionsData.questions.length} question{questionsData.questions.length !== 1 ? 's' : ''}
            </span>
          )}
          {debouncedSearch && (
            <span className="text-xs" style={{ color: 'var(--text-secondary)' }}>
              {filteredQuestions.length} result{filteredQuestions.length !== 1 ? 's' : ''}
            </span>
          )}
        </div>
      </div>

      {/* ── Empty state ── */}
      {filteredQuestions.length === 0 && (
        <div className="flex flex-col items-center justify-center py-20 text-center px-8">
          <div className="text-5xl mb-4">{showBookmarkedOnly ? '★' : '🔍'}</div>
          <p className="text-lg font-medium mb-2" style={{ color: 'var(--text-primary)' }}>
            {showBookmarkedOnly && !debouncedSearch
              ? 'No bookmarks yet'
              : 'No matches found'}
          </p>
          <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
            {showBookmarkedOnly && !debouncedSearch
              ? 'Tap ★ on any question to bookmark it for review'
              : debouncedSearch
                ? 'Try different keywords or enable "Search all topics"'
                : 'Select a topic from the sidebar'}
          </p>
        </div>
      )}

      {/* ── Question list ── */}
      {filteredQuestions.map((q, idx) => {
        const isOpen = openIndices.includes(idx);
        const starred = bookmarks.includes(q._key);
        const diffColor = q.difficulty ? DIFFICULTY_COLORS[q.difficulty.toLowerCase()] : null;

        return (
          <div
            key={q._key}
            style={{
              backgroundColor: 'var(--bg-surface)',
              borderBottom: '1px solid var(--border-primary)',
              color: 'var(--text-primary)',
            }}
            className="px-5 py-4"
          >
            <div className="flex items-start gap-1">
              {/* Bookmark star */}
              <button
                className="mt-4 text-base shrink-0 focus:outline-none transition-colors leading-none"
                style={{ color: starred ? '#facc15' : 'var(--border-secondary)' }}
                onClick={() => toggleBookmark(q._key)}
                title={starred ? 'Remove bookmark' : 'Bookmark this question'}
                aria-label={starred ? 'Remove bookmark' : 'Bookmark this question'}
              >
                ★
              </button>

              {/* Question toggle */}
              <button
                onClick={() => handleToggle(idx)}
                className="flex-1 flex justify-between items-start md:px-4 py-3 text-base font-medium focus:outline-none text-left tracking-wide leading-7"
                style={{ color: isOpen ? 'var(--accent)' : 'var(--text-primary)' }}
              >
                <span className="mr-6 flex flex-wrap items-baseline gap-x-2 gap-y-1">
                  <span className="shrink-0">{idx + 1}.</span>
                  <span>{highlightText(q.question, debouncedSearch)}</span>
                  {/* Cross-topic source label */}
                  {q._isCross && q.topic && (
                    <span
                      className="text-xs px-1.5 py-0.5 rounded shrink-0"
                      style={{ backgroundColor: 'var(--bg-elevated)', color: 'var(--accent)' }}
                    >
                      {q.topic}
                    </span>
                  )}
                  {/* Difficulty badge */}
                  {diffColor && (
                    <span
                      className="text-xs px-1.5 py-0.5 rounded shrink-0 font-medium"
                      style={{ backgroundColor: diffColor.bg, color: diffColor.color }}
                    >
                      {q.difficulty}
                    </span>
                  )}
                </span>
                <span className="md:ml-2 text-xl shrink-0">{isOpen ? '–' : '+'}</span>
              </button>
            </div>

            {/* Answer + code */}
            {isOpen && (
              <div className="md:px-4 py-3">
                <div className="tracking-wide leading-7 mb-4" style={{ color: 'var(--text-primary)' }}>
                  {String(q.answer).split(/\r?\n/).map((line, i, arr) => (
                    <span key={i}>
                      {highlightText(line, debouncedSearch)}
                      {i < arr.length - 1 && <br />}
                    </span>
                  ))}
                </div>

                {q.example && (
                  <div className="relative">
                    <button
                      className="absolute top-3 right-3 z-10 text-xs px-2 py-1 rounded transition-opacity hover:opacity-80 focus:outline-none"
                      style={{
                        backgroundColor: 'var(--bg-elevated)',
                        color: 'var(--accent)',
                        border: '1px solid var(--border-secondary)',
                      }}
                      onClick={() => handleCopy(q.example, `${idx}-code`)}
                      aria-label="Copy code"
                    >
                      {copiedKey === `${idx}-code` ? '✓ Copied' : 'Copy'}
                    </button>
                    <SyntaxHighlighter
                      language="csharp"
                      style={oneDark}
                      customStyle={{
                        marginTop: '1rem',
                        marginBottom: 0,
                        padding: '1rem',
                        paddingTop: '2.5rem',
                        borderRadius: '0.3rem',
                        fontSize: '0.85rem',
                        lineHeight: '2',
                        overflowX: 'auto',
                        backgroundColor: 'var(--bg-code)',
                      }}
                      showLineNumbers={false}
                    >
                      {q.example}
                    </SyntaxHighlighter>
                  </div>
                )}
              </div>
            )}
          </div>
        );
      })}
    </main>
  );
};

export default MainContent;
