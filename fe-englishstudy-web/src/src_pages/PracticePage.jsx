import React, { useState, useMemo, useEffect, useRef } from 'react';
import { 
  Gamepad2, BookOpen, Brain, HelpCircle, 
  History, BarChart2, Search, CheckSquare, X, Play, Clock, 
  RotateCcw, Target, Trophy, Flame, ChevronRight, Volume2, Heart, ArrowLeft, CheckCircle2, XCircle, ArrowRight, Lightbulb
} from 'lucide-react';
import StatusBadge from '../src_components/StatusBadge';
import FilterBox from '../src_components/FilterBox';
import VocabResultList from '../src_components/VocabResultList';
import { playAudio } from '../src_utils/audio';
import { initGame, finishGame } from '../src_utils/services/practiceService';
import { fetchVocabReview } from '../src_utils/services/userService';


const STATUS_OPTIONS = [
  { id: 'NEW', name: 'Chưa học' }, { id: 'LEARNING', name: 'Đang học' }, { id: 'MASTERED', name: 'Đã thuộc' },
];


export default function PracticePage({ onBack, initialFilters }) {
  const [activeMode, setActiveMode] = useState('collection'); 
  const [activeTab, setActiveTab] = useState('history'); 
  const [instructionGame, setInstructionGame] = useState(null); 

  const [selectedCollections, setSelectedCollections] = useState([]);
  const [selectedTopics, setSelectedTopics] = useState([]);
  const [selectedLessons, setSelectedLessons] = useState([]);
  const [selectedStatuses, setSelectedStatuses] = useState([]);
  const [wordCount, setWordCount] = useState(20);

  const [collections, setCollections] = useState([]);
  const [topics, setTopics] = useState([]);

  const [smartReviewWords, setSmartReviewWords] = useState([]);
  const [isSmartLoading, setIsSmartLoading] = useState(false);

  const [gameSettings, setGameSettings] = useState({
    timePerQuestion: 15,
    autoNext: true,
    autoNextDelay: 2
  });

  const [activeGame, setActiveGame] = useState(null); 
  const [quizState, setQuizState] = useState('playing'); 
  const [currentQIndex, setCurrentQIndex] = useState(0);
  const [timeLeft, setTimeLeft] = useState(15);
  const [selectedAns, setSelectedAns] = useState(null);
  const [quizLog, setQuizLog] = useState([]); 

  const [matchLives, setMatchLives] = useState(5);
  const [matchItems, setMatchItems] = useState([]);
  const [selectedMatch, setSelectedMatch] = useState(null);
  const [matchedIds, setMatchedIds] = useState([]);
  const [matchFeedback, setMatchFeedback] = useState(null);
  const [matchErrors, setMatchErrors] = useState({});

  const [listenInput, setListenInput] = useState('');
  const [hintsUsed, setHintsUsed] = useState(0);
  const [revealedIndices, setRevealedIndices] = useState([]);

  const [quizData, setQuizData] = useState([]);
  const [hasSubmittedResult, setHasSubmittedResult] = useState(false);
  const [favoriteIds, setFavoriteIds] = useState([]);
  const [historyLogView, setHistoryLogView] = useState(null); 
  const feedbackRef = useRef(null);

  useEffect(() => {
    if (selectedAns !== null || matchFeedback !== null) {
      setTimeout(() => {
        feedbackRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }, 100);
    }
  }, [selectedAns, matchFeedback]);

  const toggleFavorite = (id) => {
    setFavoriteIds(prev => 
      prev.includes(id) ? prev.filter(fId => fId !== id) : [...prev, id]
    );
  };

  useEffect(() => {
    if (initialFilters) {
      setActiveMode(initialFilters.mode);
      if (initialFilters.mode === 'collection') {
        setSelectedCollections([initialFilters.collectionId]);
        setSelectedTopics([]); setSelectedLessons([]);
      } else if (initialFilters.mode === 'topic') {
        setSelectedTopics([initialFilters.topicId]);
        setSelectedLessons([initialFilters.lessonId]);
        setSelectedCollections([]);
      } else if (initialFilters.mode === 'smart') {
        setSelectedCollections([]); setSelectedTopics([]); setSelectedLessons([]);
      }
      setSelectedStatuses([]); 
    }
  }, [initialFilters]);

  useEffect(() => {
    let cancelled = false;
    const run = async () => {
      if (activeMode !== 'smart') return;
      setIsSmartLoading(true);
      try {
        const res = await fetchVocabReview();
        const list = Array.isArray(res) ? res : (res?.items ?? res?.data ?? []);
        if (!cancelled && Array.isArray(list)) {
          setSmartReviewWords(list);
        }
      } catch {
        if (!cancelled) setSmartReviewWords([]);
      } finally {
        if (!cancelled) setIsSmartLoading(false);
      }
    };
    run();
    return () => { cancelled = true; };
  }, [activeMode]);

  const availableLessons = useMemo(() => {
    return topics.filter(t => selectedTopics.includes(t.id)).flatMap(t => t.lessons ?? []);
  }, [selectedTopics, topics]);

  const availableCount = useMemo(() => {
    let total = 0;
    if (activeMode === 'collection') {
      const selected = collections.filter(c => selectedCollections.includes(c.id));
      total = selected.reduce((sum, c) => sum + (c.wordCount || 50), 0);
    } else if (activeMode === 'topic') {
      const selected = availableLessons.filter(l => selectedLessons.includes(l.id));
      total = selected.reduce((sum, l) => sum + (l.wordCount || 20), 0);
    } else {
      total = smartReviewWords.length;
    }
    if (selectedStatuses.length > 0 && selectedStatuses.length < 3) {
      total = Math.floor(total * (selectedStatuses.length / 3));
    }
    return total;
  }, [activeMode, selectedCollections, selectedLessons, selectedStatuses, availableLessons, smartReviewWords.length, collections]);

  const avgDifficulty = useMemo(() => {
    if (activeMode === 'topic' && selectedLessons.length > 0) {
      const selectedL = availableLessons.filter(l => selectedLessons.includes(l.id));
      const totalDiff = selectedL.reduce((sum, l) => sum + (l.difficulty || 3), 0);
      return totalDiff / selectedL.length;
    }
    return 3; 
  }, [activeMode, selectedLessons, availableLessons]);

  useEffect(() => {
    setWordCount(availableCount);
  }, [availableCount]);

  useEffect(() => {
    let timer;
    const isPlayingMatch = activeGame === 'match' && quizState === 'playing' && matchFeedback === null;
    const isPlayingQuiz = activeGame === 'quiz' && quizState === 'playing' && selectedAns === null;
    const isPlayingListen = activeGame === 'listen' && quizState === 'playing' && selectedAns === null;

    if ((isPlayingQuiz || isPlayingMatch || isPlayingListen) && timeLeft > 0) {
      timer = setInterval(() => setTimeLeft(prev => prev - 1), 1000);
    } else if (timeLeft === 0 && (isPlayingQuiz || isPlayingMatch || isPlayingListen)) {
      if (activeGame === 'quiz') handleAnswer(-1); 
      else if (activeGame === 'match') setMatchLives(0); 
      else if (activeGame === 'listen') handleListenSubmit(true); 
    }
    return () => clearInterval(timer);
  }, [activeGame, quizState, selectedAns, matchFeedback, timeLeft]);


  const getDynamicPoints = (baseModifier) => {
    const timeBonus = (30 - gameSettings.timePerQuestion) * 0.5;
    const diffBonus = avgDifficulty * 2;
    const rawScore = baseModifier * (10 + diffBonus + timeBonus);
    return Math.round(rawScore);
  };

  const handleAnswer = (index) => {
    if (selectedAns !== null) return; 
    setSelectedAns(index);
    const currentQ = quizData[currentQIndex];
    const isCorrect = index === currentQ.correct;
    
    let points = 0;
    if (isCorrect) {
      let basePoints = getDynamicPoints(1); 
      let statusMultiplier = 1;
      if (currentQ.status === 'NEW') statusMultiplier = 1.2; 
      else if (currentQ.status === 'LEARNING') statusMultiplier = 1.0; 
      else if (currentQ.status === 'MASTERED') statusMultiplier = 0.5; 
      
      points = Math.round(basePoints * statusMultiplier);
    }
    
    setQuizLog(prev => [...prev, { q: currentQ, isCorrect, pointsEarned: points }]);
  };

  const handleNextQuestion = () => {
    if (currentQIndex < quizData.length - 1) { 
      setCurrentQIndex(prev => prev + 1); setSelectedAns(null); 
      setListenInput(''); setHintsUsed(0); setRevealedIndices([]); 
      setTimeLeft(gameSettings.timePerQuestion || 15); 
    } 
    else { setQuizState('result'); }
  };

  const handleRetryGame = (gameId) => {
    setQuizState('playing'); setCurrentQIndex(0); setSelectedAns(null); setQuizLog([]);
    setHasSubmittedResult(false);
    if (gameId === 'match') {
      setMatchLives(5); setMatchedIds([]); setSelectedMatch(null); setMatchFeedback(null); setMatchErrors({});
      setTimeLeft((gameSettings.timePerQuestion || 15) * quizData.length); 
      const items = [];
      quizData.forEach(q => {
        items.push({ id: q.id, text: q.word, type: 'word' });
        items.push({ id: q.id, text: q.meaning, type: 'meaning' });
      });
      setMatchItems(items.sort(() => Math.random() - 0.5));
    } else if (gameId === 'listen') {
      setListenInput(''); setHintsUsed(0); setRevealedIndices([]);
      setTimeLeft(gameSettings.timePerQuestion || 15);
    } else {
      setTimeLeft(gameSettings.timePerQuestion || 15);
    }
  };

  // KIỂM TRA ĐIỀU KIỆN TRƯỚC KHI VÀO GAME 
  const handleStartGame = (gameId) => {
    // Kiểm tra bộ lọc cho chế độ "Bộ từ vựng"
    if (activeMode === 'collection' && selectedCollections.length === 0) {
      alert("Vui lòng chọn ít nhất một Bộ từ vựng để bắt đầu ôn tập!");
      return;
    }
    // Kiểm tra bộ lọc cho chế độ "Chủ đề"
    if (activeMode === 'topic' && (selectedTopics.length === 0 || selectedLessons.length === 0)) {
      alert("Vui lòng chọn ít nhất một Chủ đề và một Bài học để bắt đầu ôn tập!");
      return;
    }
    // Kiểm tra số lượng từ vựng sẵn sàng
    if (availableCount === 0) {
      alert("Không có từ vựng nào thỏa mãn điều kiện lọc. Vui lòng chọn lại!");
      return;
    }

    if (gameId === 'quiz' || gameId === 'match' || gameId === 'listen') {
      (async () => {
        try {
          const initPayload = {
            mode: activeMode,
            collectionIds: selectedCollections,
            topicIds: selectedTopics,
            lessonIds: selectedLessons,
            statuses: selectedStatuses,
            limit: wordCount,
            // Smart mode: truyền danh sách vocab cần ôn (nếu backend hỗ trợ)
            vocabIds: activeMode === 'smart'
              ? smartReviewWords
                  .map(w => w.id ?? w.vocabId ?? w.vocab_id)
                  .filter(Boolean)
              : undefined
          };
          const questions = await initGame(gameId, initPayload);
          const list = Array.isArray(questions) ? questions : (questions?.items ?? questions?.data ?? []);
          if (Array.isArray(list) && list.length > 0) {
            const mapped = list.map((q, idx) => ({
              id: q.id ?? q.questionId ?? q.question_id ?? idx + 1,
              word: q.word ?? q.term ?? q.vocabulary?.word ?? '',
              pronunciation: q.pronunciation ?? q.vocabulary?.pronunciation ?? '',
              type: q.type ?? q.word_type ?? q.vocabulary?.word_type ?? '',
              meaning: q.meaning ?? q.vocabulary?.meaning ?? '',
              example: q.example ?? q.vocabulary?.example ?? '',
              options: q.options ?? q.choices ?? [],
              correct: q.correct ?? q.correctIndex ?? q.correct_index ?? 0,
              isFavorite: false,
              status: q.status ?? 'NEW'
            }));
            setQuizData(mapped);
            setFavoriteIds([]);
          } else {
            setQuizData([]);
          }
        } catch {
          setQuizData([]);
        } finally {
          setActiveGame(gameId);
          handleRetryGame(gameId);
        }
      })();
    } else {
      alert("Tính năng này đang được phát triển!");
    }
  };

  // GAME NỐI TỪ 
  const handleMatchClick = (item) => {
    if (selectedMatch === null) {
      setSelectedMatch(item); 
    } else {
      if (selectedMatch.id === item.id && selectedMatch.type !== item.type) {
        // NỐI ĐÚNG
        setMatchedIds(prev => [...prev, item.id]);
        const currentQ = quizData.find(q => q.id === item.id);
        setMatchFeedback(currentQ);
        
        let basePoints = getDynamicPoints(1.2); 
        let statusMultiplier = currentQ.status === 'NEW' ? 1.2 : currentQ.status === 'MASTERED' ? 0.5 : 1.0;
        let points = Math.round(basePoints * statusMultiplier);
        let originalPoints = points;
        let deduction = 0;
        
        // Trừ điểm dựa trên số lần sai
        const errors = matchErrors[item.id] || 0;
        if (errors > 0) {
          deduction = Math.round(points * 0.2) * errors; // Trừ 20% mỗi lần sai
          points = Math.max(0, points - deduction);
        }

        setQuizLog(prev => [...prev, { q: currentQ, isCorrect: true, pointsEarned: points, originalPoints, deduction, errors }]);
        setSelectedMatch(null);
      } else if (selectedMatch.id === item.id && selectedMatch.type === item.type) {
        setSelectedMatch(null); 
      } else {
        // NỐI SAI
        setMatchLives(prev => prev - 1);
        setSelectedMatch(null);
        
        // Ghi nhận số lần sai cho cả 2 từ liên quan
        setMatchErrors(prev => ({
          ...prev,
          [selectedMatch.id]: (prev[selectedMatch.id] || 0) + 1,
          [item.id]: (prev[item.id] || 0) + 1
        }));
      }
    }
  };

  const handleMatchNext = () => {
    setMatchFeedback(null);
    if (matchedIds.length === quizData.length) {
      setQuizState('result'); 
    }
  };

  // GAME NGHE - VIẾT 
  const handleListenSubmit = (isTimeout = false) => {
    if (selectedAns !== null) return;
    const currentQ = quizData[currentQIndex];
    const isCorrect = !isTimeout && listenInput.trim().toLowerCase() === currentQ.word.toLowerCase();
    
    setSelectedAns(isCorrect ? 1 : 0); 
    let points = isCorrect ? Math.round(getDynamicPoints(1.5) * (currentQ.status === 'NEW' ? 1.2 : currentQ.status === 'MASTERED' ? 0.5 : 1.0)) : 0;
    setQuizLog(prev => [...prev, { q: currentQ, isCorrect, pointsEarned: points }]);
  };

  const handleUseHint = () => {
    const word = quizData[currentQIndex].word;
    if (hintsUsed >= 3 || revealedIndices.length >= word.length) return;
    
    let unrevealed = [];
    for(let i=0; i<word.length; i++) {
        if(word[i] !== ' ' && word[i] !== '-' && !revealedIndices.includes(i)) unrevealed.push(i);
    }
    if(unrevealed.length > 0) {
        const randomIdx = unrevealed[Math.floor(Math.random() * unrevealed.length)];
        setRevealedIndices(prev => [...prev, randomIdx]);
        setHintsUsed(prev => prev + 1);
    }
  };

  const getMaskedWord = (word) => {
    if (hintsUsed === 0) return "";
    let masked = "";
    for(let i=0; i<word.length; i++) {
        if (word[i] === ' ' || word[i] === '-') masked += word[i] + " ";
        else if (revealedIndices.includes(i)) masked += word[i] + " ";
        else masked += "_ ";
    }
    return masked.trim();
  };

  const getMaskedExample = (example, word) => {
    if (!example) return "";
    const regex = new RegExp(word, 'gi');
    return example.replace(regex, "______");
  };

  useEffect(() => {
    // Xử lý khi Hết Mạng 
    if (activeGame === 'match' && matchLives === 0 && quizState === 'playing') {
      const allFailedLogs = quizData.map(q => ({ q, isCorrect: false, pointsEarned: 0 }));
      setQuizLog(allFailedLogs);
      setQuizState('result');
    }
  }, [matchLives, activeGame, quizState, quizData]);

  useEffect(() => {
    if (!activeGame) return;
    if (quizState !== 'result') return;
    if (hasSubmittedResult) return;
    if (quizLog.length === 0) return;

    const totalScore = quizLog.reduce((sum, log) => sum + (log.pointsEarned || 0), 0);
    const correctCount = quizLog.filter(l => l.isCorrect).length;
    const finishPayload = {
      mode: activeMode,
      totalScore,
      correctCount,
      totalQuestions: quizLog.length,
      details: quizLog.map(l => ({
        questionId: l.q?.id,
        isCorrect: l.isCorrect,
        pointsEarned: l.pointsEarned ?? 0
      }))
    };

    setHasSubmittedResult(true);
    finishGame(activeGame, finishPayload).catch(() => {});
  }, [activeGame, quizState, quizLog, hasSubmittedResult, activeMode]);


  // GIAO DIỆN GAME TRẮC NGHIỆM
  if (activeGame === 'quiz') {
    const currentQ = quizData[currentQIndex];
    const correctAnswers = quizLog.filter(log => log.isCorrect).length;
    const totalScore = quizLog.reduce((sum, log) => sum + (log.pointsEarned || 0), 0); 
    
    let resultMessage = "";
    if (correctAnswers === quizData.length) resultMessage = "Hoàn hảo! Bạn thật xuất sắc! 🎉";
    else if (correctAnswers >= quizData.length / 2) resultMessage = "Khá lắm! Hãy tiếp tục phát huy nhé! 💪";
    else resultMessage = "Đừng nản chí! Hãy ôn tập lại và thử sức lần nữa! 📚";

    return (
      <div className="min-h-screen bg-gray-50 pb-20 p-6 animate-in fade-in duration-300">
        <div className="max-w-3xl mx-auto space-y-6">
          
          {quizState === 'playing' && (
            <div className="bg-white rounded-3xl p-8 shadow-sm border border-gray-100">
              <div className="flex justify-between items-center mb-6">
                <span className="text-gray-500 font-bold">Câu {currentQIndex + 1} / {quizData.length}</span>
                <button onClick={() => setActiveGame(null)} className="text-gray-400 hover:text-red-500 font-bold flex items-center gap-1">
                  <X size={20}/> Thoát
                </button>
              </div>
              <div className="w-full bg-gray-100 h-3 rounded-full mb-8 overflow-hidden">
                <div className="bg-cyan-500 h-full transition-all duration-300" style={{ width: `${((currentQIndex) / quizData.length) * 100}%` }}></div>
              </div>

              <div className="flex flex-col items-center mb-8">
                <div className={`w-16 h-16 rounded-full flex items-center justify-center text-2xl font-black mb-4 border-4 transition-colors ${timeLeft <= 5 ? 'border-red-500 text-red-500' : 'border-cyan-500 text-cyan-600'}`}>
                  {timeLeft}
                </div>
                <h2 className="text-3xl font-extrabold text-gray-800 text-center">
                  Nghĩa của từ <span className="text-cyan-600">"{currentQ.word}"</span> là gì?
                </h2>
              </div>

              <div className="grid grid-cols-2 gap-4">
                {currentQ.options.map((opt, idx) => {
                  let btnStyle = "bg-white border-2 border-gray-200 text-gray-700 hover:border-cyan-500 hover:bg-cyan-50";
                  if (selectedAns !== null) {
                    if (idx === currentQ.correct) btnStyle = "bg-green-100 border-2 border-green-500 text-green-800"; 
                    else if (idx === selectedAns) btnStyle = "bg-red-100 border-2 border-red-500 text-red-800"; 
                    else btnStyle = "bg-gray-50 border-2 border-gray-200 text-gray-400 opacity-50"; 
                  }
                  return (
                    <button 
                      key={idx} 
                      onClick={() => handleAnswer(idx)}
                      disabled={selectedAns !== null}
                      className={`p-5 rounded-2xl text-lg font-bold transition-all text-left ${btnStyle}`}
                    >
                      {opt}
                    </button>
                  );
                })}
              </div>

              {selectedAns !== null && (
                <div ref={feedbackRef} className={`mt-8 p-6 rounded-2xl border-2 ${selectedAns === currentQ.correct ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'} animate-in fade-in zoom-in-95`}>
                  <h3 className={`text-3xl font-black mb-4 ${selectedAns === currentQ.correct ? 'text-green-600' : 'text-red-600'}`}>
                    {selectedAns === currentQ.correct ? 'Tuyệt vời!' : 'Sai rồi!'}
                  </h3>
                  
                  <div className="bg-white p-5 rounded-xl border border-gray-100 shadow-sm flex justify-between items-start">
                    <div>
                      <h4 className="text-2xl font-bold text-gray-900">{currentQ.word}</h4>
                      <div className="flex items-center gap-3 text-gray-500 mt-1 mb-3">
                        <span>{currentQ.pronunciation}</span>
                        <span className="px-2 py-0.5 bg-gray-100 rounded text-sm font-semibold">{currentQ.type}</span>
                        <StatusBadge status={currentQ.status} />
                      </div>
                      <p className="text-cyan-800 font-medium text-lg mb-2">{currentQ.meaning}</p>
                      {currentQ.example && (
                        <p className="text-gray-600 italic text-sm">VD: "{currentQ.example}"</p>
                      )}
                    </div>
                    <div className="flex gap-2">
                      <button onClick={() => playAudio(currentQ.word)} className="p-2 bg-gray-100 rounded-full hover:bg-cyan-100 text-cyan-700 transition-colors">
                        <Volume2 size={24} />
                      </button>
                      <button 
                        onClick={() => toggleFavorite(currentQ.id)}
                        className="p-2 bg-gray-100 rounded-full hover:bg-red-50 transition-colors"
                      >
                        <Heart size={24} className={favoriteIds.includes(currentQ.id) ? "fill-red-500 text-red-500" : "text-gray-400"} />
                      </button>
                    </div>
                  </div>

                  <div className="mt-6 flex justify-end">
                    <button onClick={handleNextQuestion} className="px-8 py-3 bg-cyan-600 hover:bg-cyan-700 text-white font-bold rounded-xl shadow-md transition-colors flex items-center gap-2">
                      Tiếp tục <ArrowRight size={20}/>
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

          {quizState === 'result' && (
            <div className="bg-white rounded-3xl p-10 shadow-sm border border-gray-100 text-center animate-in zoom-in-95">
              <div className="w-24 h-24 bg-yellow-100 text-yellow-500 rounded-full flex items-center justify-center mx-auto mb-6">
                <Trophy size={48} />
              </div>
              <h2 className="text-3xl font-black text-gray-800 mb-2">Hoàn thành bài tập!</h2>
              <p className="text-gray-500 mb-8">{resultMessage}</p>
              
              <div className="flex justify-center gap-8 mb-10">
                <div className="bg-gray-50 p-6 rounded-2xl min-w-[150px]">
                  <p className="text-gray-500 font-bold mb-1">Số câu đúng</p>
                  <p className="text-4xl font-black text-green-600">{correctAnswers}<span className="text-2xl text-gray-400">/{quizData.length}</span></p>
                </div>
                <div className="bg-cyan-50 p-6 rounded-2xl min-w-[150px]">
                  <p className="text-cyan-700 font-bold mb-1">Tổng điểm</p>
                  <p className="text-4xl font-black text-cyan-600">+{totalScore}</p>
                </div>
              </div>

              <div className="flex flex-col gap-3 max-w-sm mx-auto">
                <button onClick={() => setQuizState('detail')} className="w-full py-4 bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold rounded-2xl transition-colors">
                  Xem chi tiết lượt chơi
                </button>
                <div className="flex gap-3">
                  <button onClick={handleRetryGame} className="flex-1 py-4 bg-cyan-50 hover:bg-cyan-100 text-cyan-700 font-bold rounded-2xl transition-colors flex justify-center items-center gap-2">
                    <RotateCcw size={20}/> Chơi lại
                  </button>
                  <button onClick={() => setActiveGame(null)} className="flex-1 py-4 bg-cyan-600 hover:bg-cyan-700 text-white font-bold rounded-2xl shadow-lg transition-colors">
                    Thoát
                  </button>
                </div>
              </div>
            </div>
          )}

          {quizState === 'detail' && (
            <div className="bg-white rounded-3xl p-8 shadow-sm border border-gray-100 animate-in slide-in-from-right">
              <div className="flex items-center mb-8">
                <button onClick={() => setQuizState('result')} className="p-2 hover:bg-gray-100 rounded-lg text-gray-500 mr-4"><ArrowLeft size={24}/></button>
                <h2 className="text-2xl font-black text-gray-800">Chi tiết lượt chơi</h2>
              </div>
              <div className="mt-8">
                <VocabResultList logs={quizLog} favoriteIds={favoriteIds} onToggleFavorite={toggleFavorite} />
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }

  // GIAO DIỆN GAME NỐI TỪ 
  if (activeGame === 'match') {
    const correctAnswers = quizLog.filter(log => log.isCorrect).length;
    const totalScore = quizLog.reduce((sum, log) => sum + (log.pointsEarned || 0), 0); 
    
    let resultMessage = "";
    if (correctAnswers === quizData.length) resultMessage = "Hoàn hảo! Bạn tinh mắt quá! 🎉";
    else if (matchLives === 0) resultMessage = "Rất tiếc! Bạn đã hết mạng. Hãy thử lại nhé! 💔";
    else resultMessage = "Khá lắm! Hãy tiếp tục luyện tập nhé! 💪";

    return (
      <div className="min-h-screen bg-gray-50 pb-20 p-6 animate-in fade-in duration-300">
        <div className="max-w-3xl mx-auto space-y-6">
          
          {quizState === 'playing' && (
            <div className="bg-white rounded-3xl p-8 shadow-sm border border-gray-100">
              <div className="flex justify-between items-center mb-6">
                <span className="text-gray-500 font-bold">Tiến độ: {matchedIds.length} / {quizData.length}</span>
                <button onClick={() => setActiveGame(null)} className="text-gray-400 hover:text-red-500 font-bold flex items-center gap-1">
                  <X size={20}/> Thoát
                </button>
              </div>
              <div className="w-full bg-gray-100 h-3 rounded-full mb-8 overflow-hidden">
                <div className="bg-purple-500 h-full transition-all duration-300" style={{ width: `${(matchedIds.length / quizData.length) * 100}%` }}></div>
              </div>

              <div className="flex justify-between items-end mb-8 border-b border-gray-100 pb-6">
                <div className="flex flex-col items-center">
                  <span className="text-gray-400 font-bold text-sm mb-2">Thời gian</span>
                  <div className={`w-14 h-14 rounded-full flex items-center justify-center text-xl font-black border-4 transition-colors ${timeLeft <= 10 ? 'border-red-500 text-red-500' : 'border-purple-500 text-purple-600'}`}>
                    {timeLeft}
                  </div>
                </div>
                <div className="flex flex-col items-center">
                  <span className="text-gray-400 font-bold text-sm mb-2">Mạng ({matchLives}/5)</span>
                  <div className="flex gap-1">
                    {[1, 2, 3, 4, 5].map(heart => (
                      <Heart key={heart} size={28} className={heart <= matchLives ? "fill-red-500 text-red-500" : "text-gray-200"} />
                    ))}
                  </div>
                </div>
              </div>

              {!matchFeedback ? (
                <div className="grid grid-cols-2 gap-4">
                  {matchItems.map((item, idx) => {
                    if (matchedIds.includes(item.id)) {
                       return <div key={idx} className="p-5 rounded-2xl border-2 border-dashed border-gray-200 bg-gray-50/50 opacity-0 transition-all duration-500 pointer-events-none"></div>; 
                    }
                    const isSelected = selectedMatch && selectedMatch.id === item.id && selectedMatch.type === item.type;
                    
                    return (
                      <button 
                        key={idx} 
                        onClick={() => handleMatchClick(item)}
                        className={`p-5 rounded-2xl text-lg font-bold transition-all text-center border-2 ${
                          isSelected 
                            ? 'bg-purple-100 border-purple-500 text-purple-800 shadow-md scale-105' 
                            : 'bg-white border-gray-200 text-gray-700 hover:border-purple-300 hover:bg-purple-50 hover:shadow-sm'
                        }`}
                      >
                        {item.text}
                      </button>
                    );
                  })}
                </div>
              ) : (
                <div ref={feedbackRef} className={`mt-4 p-6 rounded-2xl border-2 bg-green-50 border-green-200 animate-in zoom-in-95`}>
                  <h3 className={`text-3xl font-black mb-4 text-green-600`}>Chính xác!</h3>
                  <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm flex justify-between items-start">
                    <div>
                      <h4 className="text-2xl font-bold text-gray-900">{matchFeedback.word}</h4>
                      <div className="flex items-center gap-3 text-gray-500 mt-1 mb-2 text-sm">
                        <span>{matchFeedback.pronunciation}</span>
                        <span className="px-2 py-0.5 bg-white border border-green-200 rounded text-xs font-semibold">{matchFeedback.type}</span>
                        <StatusBadge status={matchFeedback.status} />
                      </div>
                      <p className="text-base text-green-800 font-medium">{matchFeedback.meaning}</p>
                      {matchFeedback.example && <p className="text-gray-600 italic text-sm mt-1">VD: "{matchFeedback.example}"</p>}
                    </div>
                    <div className="flex gap-2">
                      <button onClick={() => playAudio(matchFeedback.word)} className="p-2 bg-white rounded-full hover:bg-green-100 text-green-700 transition-colors shadow-sm"><Volume2 size={18}/></button>
                      <button onClick={() => toggleFavorite(matchFeedback.id)} className="p-2 bg-white rounded-full hover:bg-green-100 transition-colors shadow-sm">
                        <Heart size={18} className={favoriteIds.includes(matchFeedback.id) ? "fill-red-500 text-red-500" : "text-gray-400"}/>
                      </button>
                    </div>
                  </div>
                  <div className="mt-6 flex justify-end">
                    <button onClick={handleMatchNext} className="px-8 py-3 bg-green-600 hover:bg-green-700 text-white font-bold rounded-xl shadow-md transition-colors flex items-center gap-2">
                      Tiếp tục <ArrowRight size={20}/>
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

          {quizState === 'result' && (
            <div className="bg-white rounded-3xl p-10 shadow-sm border border-gray-100 text-center animate-in zoom-in-95">
              <div className="w-24 h-24 bg-purple-100 text-purple-600 rounded-full flex items-center justify-center mx-auto mb-6">
                <Trophy size={48} />
              </div>
              <h2 className="text-3xl font-black text-gray-800 mb-2">Hoàn thành bài tập!</h2>
              <p className="text-gray-500 mb-8">{resultMessage}</p>
              
              <div className="flex justify-center gap-8 mb-10">
                <div className="bg-gray-50 p-6 rounded-2xl min-w-[150px]">
                  <p className="text-gray-500 font-bold mb-1">Số câu đúng</p>
                  <p className="text-4xl font-black text-green-600">{correctAnswers}<span className="text-2xl text-gray-400">/{quizData.length}</span></p>
                </div>
                <div className="bg-purple-50 p-6 rounded-2xl min-w-[150px]">
                  <p className="text-purple-700 font-bold mb-1">Tổng điểm</p>
                  <p className="text-4xl font-black text-purple-600">+{totalScore}</p>
                </div>
              </div>

              <div className="flex flex-col gap-3 max-w-sm mx-auto">
                <button onClick={() => setQuizState('detail')} className="w-full py-4 bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold rounded-2xl transition-colors">
                  Xem chi tiết lượt chơi
                </button>
                <div className="flex gap-3">
                  <button onClick={() => handleRetryGame('match')} className="flex-1 py-4 bg-purple-50 hover:bg-purple-100 text-purple-700 font-bold rounded-2xl transition-colors flex justify-center items-center gap-2">
                    <RotateCcw size={20}/> Chơi lại
                  </button>
                  <button onClick={() => setActiveGame(null)} className="flex-1 py-4 bg-purple-600 hover:bg-purple-700 text-white font-bold rounded-2xl shadow-lg transition-colors">
                    Thoát
                  </button>
                </div>
              </div>
            </div>
          )}

          {quizState === 'detail' && (
            <div className="bg-white rounded-3xl p-8 shadow-sm border border-gray-100 animate-in slide-in-from-right">
              <div className="flex items-center mb-8">
                <button onClick={() => setQuizState('result')} className="p-2 hover:bg-gray-100 rounded-lg text-gray-500 mr-4"><ArrowLeft size={24}/></button>
                <h2 className="text-2xl font-black text-gray-800">Chi tiết lượt chơi</h2>
              </div>
              <div className="mt-8">
                <VocabResultList logs={quizLog} favoriteIds={favoriteIds} onToggleFavorite={toggleFavorite} />
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }

  // GIAO DIỆN GAME NGHE - VIẾT 
  if (activeGame === 'listen') {
    const currentQ = quizData[currentQIndex];
    const correctAnswers = quizLog.filter(log => log.isCorrect).length;
    const totalScore = quizLog.reduce((sum, log) => sum + (log.pointsEarned || 0), 0); 
    
    let resultMessage = correctAnswers === quizData.length ? "Tuyệt đỉnh! Đôi tai của bạn quá nhạy bén! 🎧" : correctAnswers >= quizData.length / 2 ? "Làm tốt lắm! Hãy tiếp tục luyện nghe nhé! 💪" : "Đừng nản chí! Nghe nhiều sẽ quen thôi! 📚";

    return (
      <div className="min-h-screen bg-gray-50 pb-20 p-6 animate-in fade-in duration-300">
        <div className="max-w-3xl mx-auto space-y-6">
          
          {quizState === 'playing' && (
            <div className="bg-white rounded-3xl p-8 shadow-sm border border-gray-100">
              {/* Header */}
              <div className="flex justify-between items-center mb-6">
                <span className="text-gray-500 font-bold">Câu {currentQIndex + 1} / {quizData.length}</span>
                <button onClick={() => setActiveGame(null)} className="text-gray-400 hover:text-red-500 font-bold flex items-center gap-1"><X size={20}/> Thoát</button>
              </div>
              <div className="w-full bg-gray-100 h-3 rounded-full mb-8 overflow-hidden">
                <div className="bg-orange-500 h-full transition-all duration-300" style={{ width: `${((currentQIndex) / quizData.length) * 100}%` }}></div>
              </div>

              {/* Box câu hỏi */}
              <div className="flex flex-col items-center mb-8 border-b border-gray-100 pb-8">
                <div className={`w-14 h-14 rounded-full flex items-center justify-center text-xl font-black mb-6 border-4 transition-colors ${timeLeft <= 5 ? 'border-red-500 text-red-500' : 'border-orange-500 text-orange-600'}`}>{timeLeft}</div>
                
                <button onClick={() => playAudio(currentQ.word)} className="w-24 h-24 bg-orange-100 text-orange-600 rounded-full flex items-center justify-center shadow-sm hover:scale-105 hover:bg-orange-200 transition-all mb-6">
                  <Volume2 size={48} />
                </button>
                
                <span className="px-3 py-1 bg-gray-100 rounded-lg text-sm font-bold text-gray-500 mb-4">{currentQ.type}</span>
                {currentQ.example && (
                  <p className="text-xl text-gray-700 font-medium text-center italic max-w-lg">"{getMaskedExample(currentQ.example, currentQ.word)}"</p>
                )}
                
                <div className="mt-4 h-8 text-2xl font-black tracking-widest text-orange-600 uppercase">
                  {getMaskedWord(currentQ.word)}
                </div>
              </div>

              {/* Box nhập liệu */}
              <div className="flex flex-col gap-4">
                <input 
                  type="text" 
                  autoFocus
                  disabled={selectedAns !== null}
                  value={listenInput}
                  onChange={(e) => setListenInput(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleListenSubmit(false)}
                  placeholder="Nhập từ bạn nghe được..."
                  className="w-full p-5 text-center text-2xl font-bold bg-gray-50 border-2 border-gray-200 rounded-2xl focus:bg-white focus:border-orange-500 focus:ring-4 focus:ring-orange-500/20 outline-none transition-all disabled:opacity-50"
                />
                <div className="flex justify-between">
                  <button 
                    onClick={handleUseHint}
                    disabled={hintsUsed >= 3 || selectedAns !== null}
                    className="px-6 py-3 bg-yellow-50 text-yellow-600 font-bold rounded-xl hover:bg-yellow-100 border border-yellow-200 transition-colors flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <Lightbulb size={20} /> Gợi ý ({3 - hintsUsed})
                  </button>
                  <button 
                    onClick={() => handleListenSubmit(false)}
                    disabled={listenInput.trim().length === 0 || selectedAns !== null}
                    className="px-10 py-3 bg-orange-500 hover:bg-orange-600 text-white font-bold rounded-xl shadow-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Kiểm tra
                  </button>
                </div>
              </div>

              {/* Feedback */}
              {selectedAns !== null && (
                <div ref={feedbackRef} className={`mt-8 p-6 rounded-2xl border-2 ${selectedAns === 1 ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'} animate-in fade-in zoom-in-95`}>
                  <h3 className={`text-3xl font-black mb-4 ${selectedAns === 1 ? 'text-green-600' : 'text-red-600'}`}>{selectedAns === 1 ? 'Tuyệt vời!' : `Sai rồi! Đáp án là: ${currentQ.word}`}</h3>
                  <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm flex justify-between items-start">
                    <div>
                      <h4 className="text-2xl font-bold text-gray-900">{currentQ.word}</h4>
                      <div className="flex items-center gap-3 text-gray-500 mt-1 mb-3">
                        <span>{currentQ.pronunciation}</span><span className="px-2 py-0.5 bg-gray-100 rounded text-sm font-semibold">{currentQ.type}</span>
                        <StatusBadge status={currentQ.status} />
                      </div>
                      <p className="text-orange-800 font-medium text-lg mb-2">{currentQ.meaning}</p>
                      {currentQ.example && <p className="text-gray-600 italic text-sm">VD: "{currentQ.example}"</p>}
                    </div>
                    <div className="flex gap-2">
                      <button onClick={() => playAudio(currentQ.word)} className="p-2 bg-gray-100 rounded-full hover:bg-orange-100 text-orange-700 transition-colors"><Volume2 size={24} /></button>
                      <button onClick={() => toggleFavorite(currentQ.id)} className="p-2 bg-gray-100 rounded-full hover:bg-red-50 transition-colors">
                        <Heart size={24} className={favoriteIds.includes(currentQ.id) ? "fill-red-500 text-red-500" : "text-gray-400"} />
                      </button>
                    </div>
                  </div>
                  <div className="mt-6 flex justify-end">
                    <button onClick={handleNextQuestion} className="px-8 py-3 bg-orange-600 hover:bg-orange-700 text-white font-bold rounded-xl shadow-md transition-colors flex items-center gap-2">Tiếp tục <ArrowRight size={20}/></button>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Result & Detail Screens */}
          {quizState === 'result' && (
            <div className="bg-white rounded-3xl p-10 shadow-sm border border-gray-100 text-center animate-in zoom-in-95">
              <div className="w-24 h-24 bg-orange-100 text-orange-500 rounded-full flex items-center justify-center mx-auto mb-6"><Trophy size={48} /></div>
              <h2 className="text-3xl font-black text-gray-800 mb-2">Hoàn thành bài tập!</h2><p className="text-gray-500 mb-8">{resultMessage}</p>
              <div className="flex justify-center gap-8 mb-10">
                <div className="bg-gray-50 p-6 rounded-2xl min-w-[150px]"><p className="text-gray-500 font-bold mb-1">Số câu đúng</p><p className="text-4xl font-black text-green-600">{correctAnswers}<span className="text-2xl text-gray-400">/{quizData.length}</span></p></div>
                <div className="bg-orange-50 p-6 rounded-2xl min-w-[150px]"><p className="text-orange-700 font-bold mb-1">Tổng điểm</p><p className="text-4xl font-black text-orange-600">+{totalScore}</p></div>
              </div>
              <div className="flex flex-col gap-3 max-w-sm mx-auto">
                <button onClick={() => setQuizState('detail')} className="w-full py-4 bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold rounded-2xl transition-colors">Xem chi tiết lượt chơi</button>
                <div className="flex gap-3">
                  <button onClick={() => handleRetryGame('listen')} className="flex-1 py-4 bg-orange-50 hover:bg-orange-100 text-orange-700 font-bold rounded-2xl transition-colors flex justify-center items-center gap-2"><RotateCcw size={20}/> Chơi lại</button>
                  <button onClick={() => setActiveGame(null)} className="flex-1 py-4 bg-orange-600 hover:bg-orange-700 text-white font-bold rounded-2xl shadow-lg transition-colors">Thoát</button>
                </div>
              </div>
            </div>
          )}

          {quizState === 'detail' && (
            <div className="bg-white rounded-3xl p-8 shadow-sm border border-gray-100 animate-in slide-in-from-right">
              <div className="flex items-center mb-8"><button onClick={() => setQuizState('result')} className="p-2 hover:bg-gray-100 rounded-lg text-gray-500 mr-4"><ArrowLeft size={24}/></button><h2 className="text-2xl font-black text-gray-800">Chi tiết lượt chơi</h2></div>
              <div className="mt-8"><VocabResultList logs={quizLog} favoriteIds={favoriteIds} onToggleFavorite={toggleFavorite} /></div>
            </div>
          )}
        </div>
      </div>
    );
  }

  // GIAO DIỆN CHÍNH 
  return (
    <div className="min-h-screen bg-slate-50 p-8 pb-20">
      <div className="max-w-6xl mx-auto space-y-8">
        
        {/* HEADER */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-black text-cyan-950 flex items-center gap-3">
              <Gamepad2 className="text-[#0e7490]" size={32} /> Khu vực Luyện tập
            </h1>
            <p className="text-gray-500 mt-2 font-medium">Tùy chỉnh bộ lọc và chọn game để bắt đầu ôn tập.</p>
          </div>
        </div>

        {/* CHỌN CHẾ ĐỘ */}
        <div className="bg-white p-2 rounded-2xl shadow-sm border border-gray-100 flex gap-2">
          {[
            { id: 'collection', icon: BookOpen, label: 'Bộ từ vựng' },
            { id: 'topic', icon: CheckSquare, label: 'Chủ đề' },
            { id: 'smart', icon: Brain, label: 'Ôn tập thông minh' }
          ].map(mode => (
            <button
              key={mode.id}
              onClick={() => setActiveMode(mode.id)}
              className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl font-bold transition-all ${
                activeMode === mode.id ? 'bg-cyan-600 text-white shadow-md' : 'text-gray-500 hover:bg-gray-50'
              }`}
            >
              <mode.icon size={20} /> {mode.label}
            </button>
          ))}
        </div>

        {/* KHUNG BỘ LỌC */}
        {activeMode !== 'smart' && (
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
            <h2 className="text-lg font-bold text-cyan-950 mb-4">Thiết lập dữ liệu học</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {activeMode === 'collection' ? (
                <>
                  <FilterBox title="Chọn Bộ từ vựng" options={MOCK_COLLECTIONS} selectedIds={selectedCollections} onChange={setSelectedCollections} placeholder="Tìm bộ từ..." />
                  <FilterBox title="Trạng thái từ vựng" options={STATUS_OPTIONS} selectedIds={selectedStatuses} onChange={setSelectedStatuses} placeholder="Tìm trạng thái..." />
                  <div className="bg-gray-50 rounded-xl p-5 border border-gray-200 flex flex-col justify-center items-center">
                    <label className="font-bold text-cyan-900 mb-4">Số lượng từ muốn ôn (Tối thiểu 20)</label>
                    <input 
                      type="number" min="20" max={availableCount} value={wordCount} 
                      onChange={e => {
                        const val = parseInt(e.target.value);
                        setWordCount(val > availableCount ? availableCount : val);
                      }}
                      className="w-32 text-center text-3xl font-black text-cyan-700 bg-white border-2 border-cyan-200 rounded-xl py-3 focus:border-cyan-500 outline-none"
                    />
                    <p className="text-[10px] text-gray-400 mt-2 italic">Tối đa: {availableCount} từ</p>
                  </div>
                </>
              ) : (
                <>
                  <FilterBox title="Chọn Chủ đề" options={MOCK_TOPICS} selectedIds={selectedTopics} onChange={setSelectedTopics} placeholder="Tìm chủ đề..." />
                  <FilterBox title="Chọn Bài học" options={availableLessons} selectedIds={selectedLessons} onChange={setSelectedLessons} placeholder="Tìm bài học..." />
                  <div className="space-y-6">
                    <FilterBox title="Trạng thái từ vựng" options={STATUS_OPTIONS} selectedIds={selectedStatuses} onChange={setSelectedStatuses} placeholder="Tìm trạng thái..." />
                  </div>
                </>
              )}
            </div>
            
            {activeMode === 'topic' && (
              <div className="mt-6 flex items-center justify-between bg-cyan-50 p-4 rounded-xl border border-cyan-100">
                 <span className="font-bold text-cyan-800">Số lượng từ vựng cần chọn:</span>
                 {selectedLessons.length === 1 ? (
                   <span className="px-4 py-1.5 bg-white rounded-lg font-bold text-gray-600 border border-cyan-200 shadow-sm">
                     Cố định theo bài học ({availableCount} từ)
                   </span>
                 ) : (
                   <div className="flex items-center gap-3">
                     <span className="text-sm text-cyan-700">Tùy chỉnh:</span>
                     <input 
                       type="number" min="20" max={availableCount} 
                       value={wordCount} 
                       onChange={e => {
                         const val = parseInt(e.target.value);
                         setWordCount(val > availableCount ? availableCount : val);
                       }} 
                       className="w-24 px-3 py-1.5 rounded-lg border border-cyan-200 outline-none text-center font-bold" 
                     />
                   </div>
                 )}
              </div>
            )}
          </div>
        )}
        {activeMode === 'smart' && (
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
            <h2 className="text-lg font-bold text-cyan-950 mb-2">Ôn tập thông minh</h2>
            <p className="text-gray-500 font-medium">
              Hệ thống sẽ lấy danh sách từ bạn cần ôn tập để tạo bài luyện phù hợp.
            </p>
            {isSmartLoading && (
              <div className="mt-4 text-sm font-bold text-gray-400">
                Đang tải danh sách từ cần ôn...
              </div>
            )}
          </div>
        )}

        {/* CHỌN GAME */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
          <div className="flex justify-between items-center mb-6 pb-4 border-b border-gray-100">
            <div className="flex items-center gap-4">
              <h2 className="text-xl font-black text-cyan-950">Chọn Game</h2>
            </div>
            <div className="px-4 py-2 bg-[#84cc16]/10 text-[#65a30d] rounded-xl font-bold border border-[#84cc16]/20 transition-all">
              Sẵn sàng: {availableCount} từ vựng
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              { id: 'quiz', name: 'Trắc nghiệm', icon: CheckSquare, color: 'bg-blue-50 text-blue-600 border-blue-200 hover:border-blue-500', baseModifier: 1 },
              { id: 'match', name: 'Nối từ', icon: Gamepad2, color: 'bg-purple-50 text-purple-600 border-purple-200 hover:border-purple-500', baseModifier: 1.2 },
              { id: 'listen', name: 'Nghe - Viết', icon: () => <div className="font-bold text-2xl">🎧</div>, color: 'bg-orange-50 text-orange-600 border-orange-200 hover:border-orange-500', baseModifier: 1.5 }
            ].map(game => (
              <div key={game.id} className={`relative flex flex-col items-center p-8 rounded-2xl border-2 transition-all cursor-pointer group ${game.color} hover:-translate-y-1 hover:shadow-xl`}>
                <button 
                  onClick={(e) => { e.stopPropagation(); setInstructionGame(game); }}
                  className="absolute top-4 right-4 p-1.5 text-gray-400 hover:text-cyan-600 bg-white rounded-full shadow-sm z-10" 
                  title="Hướng dẫn chơi"
                >
                  <HelpCircle size={20} />
                </button>
                <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center shadow-sm mb-4">
                  {typeof game.icon === 'function' ? <game.icon /> : <game.icon size={40} />}
                </div>
                <h3 className="text-xl font-black mb-4">{game.name}</h3>

                <button 
                  onClick={(e) => {
                    e.stopPropagation();
                    handleStartGame(game.id); 
                  }}
                  className="mb-6 px-6 py-2 bg-white text-cyan-700 font-bold rounded-xl shadow-sm border border-gray-100 hover:bg-cyan-600 hover:text-white hover:shadow-md hover:scale-105 hover:border-cyan-600 transition-all duration-200 flex items-center gap-2"
                >
                  <Play size={18} /> Chơi ngay
                </button>

                <span className="mt-auto px-4 py-1.5 bg-white/60 rounded-lg text-sm font-bold backdrop-blur-sm border border-white transition-all">
                  +{getDynamicPoints(game.baseModifier)} điểm / câu
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* LỊCH SỬ & THỐNG KÊ */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="flex border-b border-gray-100">
            <button onClick={() => setActiveTab('history')} className={`flex-1 flex items-center justify-center gap-2 py-4 font-bold text-lg transition-colors ${activeTab === 'history' ? 'border-b-2 border-cyan-600 text-cyan-700 bg-cyan-50/30' : 'text-gray-500 hover:bg-gray-50'}`}>
              <History size={20} /> Lịch sử chơi
            </button>
            <button onClick={() => setActiveTab('stats')} className={`flex-1 flex items-center justify-center gap-2 py-4 font-bold text-lg transition-colors ${activeTab === 'stats' ? 'border-b-2 border-cyan-600 text-cyan-700 bg-cyan-50/30' : 'text-gray-500 hover:bg-gray-50'}`}>
              <BarChart2 size={20} /> Thống kê
            </button>
          </div>

          <div className="p-6">
            {activeTab === 'history' ? (
              <div className="space-y-4">
                {[1, 2, 3].map(i => (
                  <div key={i} className="flex items-center justify-between p-4 border border-gray-100 rounded-xl hover:bg-gray-50 transition-colors">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-blue-100 text-blue-600 rounded-xl flex items-center justify-center"><CheckSquare size={24}/></div>
                      <div>
                        <h4 className="font-bold text-cyan-950">Trắc nghiệm từ vựng</h4>
                        <div className="flex items-center gap-3 text-xs text-gray-500 mt-1">
                          <span className="flex items-center gap-1"><Clock size={12}/> 14:30 - 14:45 (Hôm nay)</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-6">
                       <div className="text-center">
                         <div className="text-sm font-bold text-green-600">18 Đúng</div>
                         <div className="text-sm font-bold text-red-500">2 Sai</div>
                       </div>
                       <div className="w-px h-8 bg-gray-200"></div>
                       <div className="text-center w-20">
                         <div className="text-xs text-gray-500 uppercase font-bold">Điểm</div>
                         <div className="text-lg font-black text-yellow-600">+180</div>
                       </div>
                       <button 
                        onClick={() => setHistoryLogView(quizLog.length > 0 ? quizLog : quizData.map((q, idx) => ({ q, isCorrect: idx % 2 === 0, pointsEarned: idx % 2 === 0 ? 15 : 0 })))} 
                         className="px-4 py-2 bg-white border border-gray-200 text-cyan-700 font-bold rounded-lg hover:bg-cyan-50 transition-colors text-sm"
                       >
                         Chi tiết
                       </button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="space-y-8">
                <div className="grid grid-cols-4 gap-6">
                  {[
                    { label: 'Số lượt chơi', value: '42', icon: Play, color: 'text-blue-600', bg: 'bg-blue-50' },
                    { label: 'Độ chính xác', value: '85%', icon: Target, color: 'text-green-600', bg: 'bg-green-50' },
                    { label: 'Tổng điểm', value: '4,520', icon: Trophy, color: 'text-yellow-600', bg: 'bg-yellow-50' },
                    { label: 'Kỷ lục cao nhất', value: '450', icon: Flame, color: 'text-orange-600', bg: 'bg-orange-50' }
                  ].map((stat, i) => (
                    <div key={i} className="p-5 border border-gray-100 rounded-2xl bg-white shadow-sm flex items-center gap-4">
                      <div className={`w-12 h-12 rounded-full flex items-center justify-center ${stat.bg} ${stat.color}`}>
                        <stat.icon size={24} />
                      </div>
                      <div>
                        <div className="text-sm font-bold text-gray-400">{stat.label}</div>
                        <div className={`text-2xl font-black ${stat.color}`}>{stat.value}</div>
                      </div>
                    </div>
                  ))}
                </div>
                
                <div>
                  <h3 className="font-bold text-lg text-cyan-900 mb-4">Chi tiết theo Trò chơi</h3>
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="bg-gray-50 border-y border-gray-200 text-gray-500 text-sm">
                        <th className="py-3 px-4 font-bold">Trò chơi</th>
                        <th className="py-3 px-4 font-bold text-center">Số lượt</th>
                        <th className="py-3 px-4 font-bold text-center">Độ chính xác</th>
                        <th className="py-3 px-4 font-bold text-center">Tổng điểm</th>
                        <th className="py-3 px-4 font-bold text-center">Điểm cao nhất</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr className="border-b border-gray-100 hover:bg-gray-50/50">
                        <td className="py-4 px-4 font-bold text-cyan-900 flex items-center gap-2"><CheckSquare size={18} className="text-blue-500"/> Trắc nghiệm</td>
                        <td className="py-4 px-4 text-center font-medium">25</td>
                        <td className="py-4 px-4 text-center font-bold text-green-600">88%</td>
                        <td className="py-4 px-4 text-center font-bold text-yellow-600">2,500</td>
                        <td className="py-4 px-4 text-center font-bold text-orange-500">250</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        </div>

      </div>

      {/* Modal Cài đặt Game + icon bánh răng đã được loại bỏ theo yêu cầu mới */}

      {/* HƯỚNG DẪN TRÒ CHƠI */}
      {instructionGame && (
        <div className="fixed inset-0 bg-black/60 z-[300] flex items-center justify-center p-4 backdrop-blur-sm">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="p-6 text-center">
              <div className="w-20 h-20 bg-cyan-50 text-cyan-600 rounded-full flex items-center justify-center mx-auto mb-4 border-4 border-white shadow-md text-3xl">
                {instructionGame.id === 'quiz' ? '📝' : instructionGame.id === 'match' ? '🧩' : '🎧'}
              </div>
              <h3 className="text-2xl font-black text-cyan-950 mb-4">Cách chơi: {instructionGame.name}</h3>
              <div className="text-left space-y-4 text-gray-600 font-medium">
                {instructionGame.id === 'quiz' && (
                  <ul className="list-disc pl-5 space-y-2">
                    <li>Hệ thống sẽ đưa ra một từ tiếng Anh/Nghĩa.</li>
                    <li>Bạn có 4 đáp án để lựa chọn.</li>
                    <li>Chọn đáp án đúng nhất trong thời gian quy định.</li>
                  </ul>
                )}
                {instructionGame.id === 'match' && (
                  <ul className="list-disc pl-5 space-y-2">
                    <li>Nối các cặp Từ tiếng Anh và Nghĩa tiếng Việt tương ứng.</li>
                    <li>Lần lượt click vào 2 ô để ghép cặp.</li>
                    <li>Ghép đúng toàn bộ trong thời gian ngắn nhất để đạt điểm cao.</li>
                  </ul>
                )}
                {instructionGame.id === 'listen' && (
                  <ul className="list-disc pl-5 space-y-2">
                    <li>Nghe âm thanh phát ra của từ vựng.</li>
                    <li>Nhập chính xác từ bạn nghe được vào ô trống.</li>
                    <li>Gợi ý sẽ xuất hiện nếu bạn nhập sai nhiều lần.</li>
                  </ul>
                )}
              </div>
            </div>
            <div className="p-4 bg-gray-50 border-t border-gray-100 flex justify-center">
              <button 
                onClick={() => setInstructionGame(null)} 
                className="px-10 py-3 bg-cyan-600 text-white font-bold rounded-2xl hover:bg-cyan-700 shadow-lg transition-all"
              >
                Đã rõ!
              </button>
            </div>
          </div>
        </div>
      )}

      {/* LỊCH SỬ CHI TIẾT */}
      {historyLogView && (
        <div className="fixed inset-0 bg-cyan-950/60 z-[300] flex items-center justify-center p-4 backdrop-blur-sm">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-3xl max-h-[90vh] overflow-hidden flex flex-col animate-in zoom-in-95 duration-200">
            <div className="flex justify-between items-center p-6 border-b border-gray-100 bg-gray-50/50">
              <h3 className="text-2xl font-black text-cyan-950 flex items-center gap-2"><History size={24}/> Chi tiết lượt chơi trước</h3>
              <button onClick={() => setHistoryLogView(null)} className="text-gray-400 hover:text-red-500 hover:bg-red-50 p-2 rounded-full transition-colors"><X size={24}/></button>
            </div>
            <div className="p-8 overflow-y-auto">
              <VocabResultList logs={historyLogView} favoriteIds={favoriteIds} onToggleFavorite={toggleFavorite} />
            </div>
          </div>
        </div>
      )}

        

    </div>
  );
}