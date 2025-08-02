import React, { useState } from "react";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { oneDark } from "../styles/one-dark";

const MainContent = ({ headerHeight, questionsData, openIndices, handleToggle }) => {
  const [searchTerm, setSearchTerm] = useState("");
  React.useEffect(() => {
    setSearchTerm("");
  }, [questionsData]);
  const searchInputRef = React.useRef(null);
  const filteredQuestions = questionsData.questions.filter(q =>
    q.question.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (q.answer && q.answer.toLowerCase().includes(searchTerm.toLowerCase()))
  );
  return (
    <main
      className="flex-1 flex flex-col overflow-y-auto "
      style={{
        backgroundColor: "transparent",
        fontFamily: "RobotFlex",
        marginTop: headerHeight,
        marginLeft:
          typeof window !== "undefined" && window.innerWidth >= 768 ? "25%" : 0,
      }}
    >
      <div className="px-5 pt-4 pb-4 bg-[#171717] sticky top-0 z-10 border-b border-black flex-row items-center">
        <div className="flex items-center">
          <span className="absolute pl-4 pointer-events-none">🥷🏻</span>
          <input
            ref={searchInputRef}
            type="text"
            className="w-full px-4 pl-12 py-2 rounded bg-black text-white border border-[#404040] focus:outline-none focus:border-[#31b8c6]"
            placeholder="find in this document.."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{ fontFamily: "RobotFlex" }}
          />

          {openIndices.length > 0 && (
            <span
              className="text-white ml-4 text-2xl cursor-pointer select-none"
              role="button"
              tabIndex={0}
              aria-label="Collapse all"
              onClick={() => {
                filteredQuestions.forEach((_, idx) => {
                  if (openIndices.includes(idx)) handleToggle(idx);
                });
              }}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  filteredQuestions.forEach((_, idx) => {
                    if (openIndices.includes(idx)) handleToggle(idx);
                  });
                }
              }}
            >
              –
            </span>
          )}
        </div>

        {searchTerm && (
          <span className="text-sm pr-2 text-gray-500 whitespace-nowrap mt-4 block text-right">
            {filteredQuestions.length} search result
            {filteredQuestions.length !== 1 ? "s" : ""}
          </span>
        )}
      </div>
      {filteredQuestions.map((q, idx) => {
        // Helper to highlight searchTerm in text
        const highlightText = (text) => {
          if (!searchTerm) return text;
          const regex = new RegExp(
            `(${searchTerm.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")})`,
            "gi"
          );
          const parts = String(text).split(regex);
          return parts.map((part, i) =>
            regex.test(part) ? (
              <mark
                key={i}
                style={{
                  background: "#31b8c6",
                  color: "#000",
                  borderRadius: "1px",
                  padding: "0 2px",
                }}
              >
                {part}
              </mark>
            ) : (
              part
            )
          );
        };
        return (
          <div
            key={q.id || idx}
            className="text-white px-5 border-b border-black py-4"
            style={{ backgroundColor: "#171717" }}
          >
            <button
              onClick={() => handleToggle(idx)}
              className="flex justify-between items-start w-full md:px-4 py-3 text-base font-medium focus:outline-none text-left tracking-wide leading-7"
              style={{
                color: openIndices.includes(idx) ? "#31b8c6" : undefined,
              }}
            >
              <span className="mr-8 leading-wide flex">
                <span className="mr-2">{idx + 1}.</span>
                <span className="">{highlightText(q.question)}</span>
              </span>
              <span className="md:ml-2 text-xl">
                {openIndices.includes(idx) ? "–" : "+"}
              </span>
            </button>
            {openIndices.includes(idx) && (
              <div className="md:px-4 py-3 cursor-pointer">
              <div className="tracking-wide leading-7 mb-4">
                {String(q.answer)
                  .split(/\r?\n/)
                  .map((line, i, arr) => (
                    <span key={i}>
                      {highlightText(line)}
                      {i < arr.length - 1 && <br />}
                    </span>
                  ))}
              </div>
                {q.example && (
                  <SyntaxHighlighter
                    language="csharp"
                    style={oneDark}
                    customStyle={{
                      marginTop: "1rem",
                      marginBottom: 0,
                      padding: "1rem",
                      borderRadius: "0.3rem",
                      fontSize: "0.85rem",
                      lineHeight: "2",
                      overflowX: "wrap",
                      backgroundColor: "#000",
                    }}
                    showLineNumbers={false}
                  >
                    {q.example}
                  </SyntaxHighlighter>
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
