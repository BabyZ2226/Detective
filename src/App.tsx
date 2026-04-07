import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Search, ScrollText, UserSearch, AlertCircle, CheckCircle2, RotateCcw, Loader2, Sparkles, BookOpen, Flag, ChevronLeft, ChevronRight, History, Save, FolderOpen } from 'lucide-react';
import { STORY_DATA as FALLBACK_STORY } from './constants';
import { GameState, Choice, StoryNode, Difficulty, CaseInfo, HistoryEntry } from './types';
import { generateDetectiveCase } from './services/geminiService';
import { TypewriterText } from './components/TypewriterText';

export default function App() {
  const [gameState, setGameState] = useState<GameState>({
    currentNodeId: 'inicio',
    inventory: [],
    flags: [],
    history: []
  });
  const [storyData, setStoryData] = useState<Record<string, StoryNode>>(FALLBACK_STORY);
  const [caseInfo, setCaseInfo] = useState<CaseInfo>({ title: "El Enigma del Filósofo", description: "Un misterio clásico.", totalClues: 4 });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [difficulty, setDifficulty] = useState<Difficulty>('normal');
  const [loadingMsgIndex, setLoadingMsgIndex] = useState(0);
  const [toastMsg, setToastMsg] = useState<{title: string, desc: string} | null>(null);
  const [currentClueIndex, setCurrentClueIndex] = useState(0);
  const [hasSave, setHasSave] = useState(false);

  const SAVE_KEY = 'detective_save_data';

  useEffect(() => {
    setHasSave(!!localStorage.getItem(SAVE_KEY));
  }, []);

  const saveGame = () => {
    const saveData = {
      gameState,
      storyData,
      caseInfo
    };
    localStorage.setItem(SAVE_KEY, JSON.stringify(saveData));
    setHasSave(true);
    setToastMsg({ title: "Partida Guardada", desc: "Tu progreso ha sido guardado exitosamente." });
  };

  const loadGame = () => {
    const saved = localStorage.getItem(SAVE_KEY);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (parsed.gameState && parsed.storyData && parsed.caseInfo) {
          setGameState(parsed.gameState);
          setStoryData(parsed.storyData);
          setCaseInfo(parsed.caseInfo);
          setToastMsg({ title: "Partida Cargada", desc: "Has retomado tu investigación." });
        }
      } catch (e) {
        console.error("Error loading game", e);
        setToastMsg({ title: "Error", desc: "No se pudo cargar la partida guardada." });
      }
    }
  };

  useEffect(() => {
    if (gameState.inventory.length > 0) {
      setCurrentClueIndex(gameState.inventory.length - 1);
    }
  }, [gameState.inventory.length]);

  const loadingMessages = [
    "Construyendo una red de mentiras...",
    "Escondiendo pistas en la escena del crimen...",
    "Entrenando a los sospechosos para mentir...",
    "Formulando acertijos mortales...",
    "Preparando la sala de interrogatorios..."
  ];

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isLoading) {
      interval = setInterval(() => {
        setLoadingMsgIndex((prev) => (prev + 1) % loadingMessages.length);
      }, 2000);
    } else {
      setLoadingMsgIndex(0);
    }
    return () => clearInterval(interval);
  }, [isLoading]);

  const loadNewCase = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const newCase = await generateDetectiveCase(difficulty);
      
      if (!newCase || !newCase.storyData || Object.keys(newCase.storyData).length === 0) {
        throw new Error("La IA generó un caso vacío.");
      }

      setStoryData(newCase.storyData);
      setCaseInfo({ 
        title: newCase.caseTitle, 
        description: newCase.caseDescription,
        totalClues: newCase.totalClues || 5
      });
      
      const firstNodeId = newCase.storyData['inicio'] ? 'inicio' : 
                          newCase.storyData['Inicio'] ? 'Inicio' : 
                          Object.keys(newCase.storyData)[0];

      setGameState({
        currentNodeId: firstNodeId,
        inventory: [],
        flags: [],
        history: []
      });
    } catch (err) {
      console.error(err);
      setError("No se pudo conectar con la IA. Usando caso de respaldo.");
      setStoryData(FALLBACK_STORY);
      setGameState({
        currentNodeId: 'inicio',
        inventory: [],
        flags: [],
        history: []
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Initial load
  useEffect(() => {
    // Optional: load a new case on start
    // loadNewCase();
  }, []);

  const currentNode = storyData[gameState.currentNodeId] || storyData['inicio'] || Object.values(storyData)[0];

  const handleChoice = (choice: Choice) => {
    // Check if required clues are present
    if (choice.requiredClues) {
      const hasAllClues = choice.requiredClues.every(clue => 
        gameState.inventory.includes(clue)
      );
      if (!hasAllClues) return;
    }

    // Check if required flags are present
    if (choice.requiredFlags) {
      const hasAllFlags = choice.requiredFlags.every(flag => 
        gameState.flags.includes(flag)
      );
      if (!hasAllFlags) return;
    }

    // Check if forbidden flags are present
    if (choice.forbiddenFlags) {
      const hasForbiddenFlag = choice.forbiddenFlags.some(flag => 
        gameState.flags.includes(flag)
      );
      if (hasForbiddenFlag) return;
    }

    const newInventory = [...gameState.inventory];
    if (choice.unlockClue && !newInventory.includes(choice.unlockClue)) {
      newInventory.push(choice.unlockClue);
      setToastMsg({ title: "Nueva Pista", desc: choice.unlockClue });
    }

    const newFlags = [...gameState.flags];
    if (choice.setFlag && !newFlags.includes(choice.setFlag)) {
      newFlags.push(choice.setFlag);
      if (!choice.unlockClue) {
        setToastMsg({ title: "Deducción", desc: choice.setFlag.replace(/_/g, ' ') });
      }
    }

    if (toastMsg) {
      setTimeout(() => setToastMsg(null), 3000);
    }

    const newHistory = [...gameState.history];
    let resultText = "";
    if (choice.unlockClue && choice.setFlag) {
      resultText = `Pista: ${choice.unlockClue} | Deducción: ${choice.setFlag.replace(/_/g, ' ')}`;
    } else if (choice.unlockClue) {
      resultText = `Pista: ${choice.unlockClue}`;
    } else if (choice.setFlag) {
      resultText = `Deducción: ${choice.setFlag.replace(/_/g, ' ')}`;
    }

    newHistory.push({
      action: choice.text,
      result: resultText || undefined
    });

    setGameState({
      currentNodeId: choice.nextNode,
      inventory: newInventory,
      flags: newFlags,
      history: newHistory
    });
  };

  const resetGame = () => {
    setGameState({
      currentNodeId: 'inicio',
      inventory: [],
      flags: [],
      history: []
    });
  };

  useEffect(() => {
    if (toastMsg) {
      const timer = setTimeout(() => setToastMsg(null), 3000);
      return () => clearTimeout(timer);
    }
  }, [toastMsg]);

  const isVictory = gameState.currentNodeId === 'victoria';
  const isDerrota = gameState.currentNodeId === 'derrota';

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-6 text-center">
        <motion.div 
          animate={{ rotate: 360 }}
          transition={{ repeat: Infinity, duration: 2, ease: "linear" }}
          className="mb-6"
        >
          <Sparkles className="w-16 h-16 text-amber-500" />
        </motion.div>
        <h2 className="text-2xl font-bold text-slate-100 mb-2">Generando Nuevo Enigma...</h2>
        <p className="text-slate-400 max-w-md h-6 transition-opacity duration-300">
          {loadingMessages[loadingMsgIndex]}
        </p>
        <Loader2 className="w-8 h-8 text-amber-500/50 animate-spin mt-8" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-200 font-sans selection:bg-amber-500/30">
      {/* Header */}
      <header className="border-b border-slate-800 bg-slate-900/50 backdrop-blur-md sticky top-0 z-10">
        <div className="max-w-5xl mx-auto px-6 py-4 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-amber-500/10 rounded-lg">
              <Search className="w-6 h-6 text-amber-500" />
            </div>
            <div>
              <h1 className="text-xl font-bold tracking-tight text-slate-100">
                Detective: <span className="text-amber-500">{caseInfo.title}</span>
              </h1>
              {error && <span className="text-[10px] text-red-500 uppercase font-bold tracking-tighter">{error}</span>}
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div className="hidden md:flex items-center bg-slate-800/50 rounded-lg p-1 border border-slate-700">
              {(['fácil', 'normal', 'difícil'] as Difficulty[]).map((d) => (
                <button
                  key={d}
                  onClick={() => setDifficulty(d)}
                  className={`px-3 py-1 text-[10px] uppercase font-bold tracking-widest rounded-md transition-all ${
                    difficulty === d 
                      ? 'bg-amber-500 text-slate-950 shadow-lg' 
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  {d}
                </button>
              ))}
            </div>
            
            <div className="flex items-center gap-1 border-r border-slate-800 pr-4 mr-1">
              <button 
                onClick={saveGame}
                className="p-2 hover:bg-slate-800 rounded-full transition-colors text-slate-400 hover:text-amber-500"
                title="Guardar Partida"
              >
                <Save className="w-5 h-5" />
              </button>
              {hasSave && (
                <button 
                  onClick={loadGame}
                  className="p-2 hover:bg-slate-800 rounded-full transition-colors text-slate-400 hover:text-amber-500"
                  title="Cargar Partida"
                >
                  <FolderOpen className="w-5 h-5" />
                </button>
              )}
            </div>

            <button 
              onClick={loadNewCase}
              className="flex items-center gap-2 px-4 py-2 bg-amber-500/10 hover:bg-amber-500/20 text-amber-500 rounded-lg transition-all text-sm font-bold border border-amber-500/20"
              title="Generar nuevo caso con IA"
            >
              <Sparkles className="w-4 h-4" />
              <span>Nuevo Caso</span>
            </button>
            <button 
              onClick={resetGame}
              className="p-2 hover:bg-slate-800 rounded-full transition-colors text-slate-400 hover:text-slate-100"
              title="Reiniciar Caso Actual"
            >
              <RotateCcw className="w-5 h-5" />
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-6 py-8 grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left & Center: Story and Actions */}
        <div className="lg:col-span-2 space-y-6">
          {/* Story Panel */}
          <section className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-2xl relative">
            {/* Background Image */}
            <div 
              className="absolute inset-0 opacity-10 bg-cover bg-center mix-blend-luminosity transition-all duration-1000"
              style={{ backgroundImage: `url(https://picsum.photos/seed/${caseInfo.imageKeyword || 'detective_noir'}/800/600)` }}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-slate-900/80 to-slate-900/40" />

            <div className="p-1 bg-gradient-to-r from-amber-500/20 via-slate-800 to-amber-500/20 relative z-10"></div>
            <div className="p-8 min-h-[300px] flex flex-col justify-center relative z-10">
              <AnimatePresence mode="wait">
                <motion.div
                  key={gameState.currentNodeId}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.3 }}
                  className="space-y-6"
                >
                  {isVictory && <CheckCircle2 className="w-12 h-12 text-green-500 mx-auto" />}
                  {isDerrota && <AlertCircle className="w-12 h-12 text-red-500 mx-auto" />}
                  
                  <p className="text-lg leading-relaxed text-slate-300 first-letter:text-4xl first-letter:font-bold first-letter:text-amber-500 first-letter:mr-3 first-letter:float-left">
                    <TypewriterText text={currentNode?.text || "Cargando historia..."} speed={15} />
                  </p>
                </motion.div>
              </AnimatePresence>
            </div>
          </section>

          {/* Actions Panel */}
          <section className="space-y-4">
            <div className="flex items-center gap-2 text-slate-400 text-sm font-medium uppercase tracking-wider mb-2">
              <UserSearch className="w-4 h-4" />
              <span>Acciones Disponibles</span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {currentNode?.choices.map((choice, index) => {
                const cluesLocked = choice.requiredClues && !choice.requiredClues.every(c => gameState.inventory.includes(c));
                const flagsLocked = choice.requiredFlags && !choice.requiredFlags.every(f => gameState.flags.includes(f));
                const forbiddenLocked = choice.forbiddenFlags && choice.forbiddenFlags.some(f => gameState.flags.includes(f));
                
                const isLocked = cluesLocked || flagsLocked || forbiddenLocked;
                
                return (
                  <motion.button
                    key={index}
                    whileHover={!isLocked ? { scale: 1.02, x: 4 } : {}}
                    whileTap={!isLocked ? { scale: 0.98 } : {}}
                    onClick={() => handleChoice(choice)}
                    disabled={isLocked}
                    className={`
                      p-4 rounded-xl border text-left transition-all duration-200 flex items-center justify-between group
                      ${isLocked 
                        ? 'bg-slate-900/50 border-slate-800 text-slate-600 cursor-not-allowed opacity-50' 
                        : 'bg-slate-900 border-slate-800 hover:border-amber-500/50 hover:bg-slate-800 text-slate-200'
                      }
                    `}
                  >
                    <span className="font-medium">{choice.text}</span>
                    {!isLocked && (
                      <motion.span 
                        initial={{ opacity: 0, x: -5 }}
                        whileHover={{ opacity: 1, x: 0 }}
                        className="text-amber-500"
                      >
                        →
                      </motion.span>
                    )}
                    {isLocked && (
                      <span className="text-xs text-slate-700 italic">
                        {cluesLocked ? 'Faltan pistas' : 'Requisitos no cumplidos'}
                      </span>
                    )}
                  </motion.button>
                );
              })}
            </div>
          </section>
        </div>

        {/* Right: Inventory */}
        <aside className="space-y-6">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl sticky top-24">
            <div className="flex items-center gap-2 text-amber-500 font-bold uppercase tracking-widest text-xs mb-4">
              <BookOpen className="w-4 h-4" />
              <span>Libreta del Detective</span>
            </div>

            {/* Progress Bar */}
            {caseInfo.totalClues && (
              <div className="mb-6">
                <div className="flex justify-between text-xs text-slate-400 mb-1">
                  <span>Progreso de Pistas</span>
                  <span>{gameState.inventory.length} / {caseInfo.totalClues}</span>
                </div>
                <div className="w-full bg-slate-800 rounded-full h-1.5">
                  <div 
                    className="bg-amber-500 h-1.5 rounded-full transition-all duration-500" 
                    style={{ width: `${Math.min(100, (gameState.inventory.length / caseInfo.totalClues) * 100)}%` }}
                  ></div>
                </div>
              </div>
            )}
            
            <div className="space-y-4">
              <div>
                <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2 flex items-center gap-2">
                  <ScrollText className="w-3 h-3" /> Evidencias
                </h3>
                {gameState.inventory.length === 0 ? (
                  <div className="py-4 text-center border border-dashed border-slate-800 rounded-lg">
                    <p className="text-slate-600 text-xs italic">Sin pistas aún...</p>
                  </div>
                ) : (
                  <div>
                    <div className="relative bg-slate-800/50 border border-slate-700 rounded-lg p-3 flex items-center justify-between min-h-[80px]">
                      <button 
                        onClick={() => setCurrentClueIndex(prev => Math.max(0, prev - 1))}
                        disabled={currentClueIndex === 0}
                        className="p-1.5 text-slate-400 hover:text-amber-500 hover:bg-slate-800 rounded-md disabled:opacity-30 disabled:hover:text-slate-400 disabled:hover:bg-transparent transition-all"
                      >
                        <ChevronLeft className="w-5 h-5" />
                      </button>
                      
                      <div className="flex-1 text-center px-2 overflow-hidden">
                        <AnimatePresence mode="wait">
                          <motion.div
                            key={currentClueIndex}
                            initial={{ opacity: 0, x: 10 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -10 }}
                            transition={{ duration: 0.2 }}
                            className="flex flex-col items-center gap-2"
                          >
                            <div className="w-2 h-2 rounded-full bg-amber-500 shadow-[0_0_8px_rgba(245,158,11,0.5)]" />
                            <span className="text-sm text-slate-200 font-medium leading-snug">
                              {gameState.inventory[currentClueIndex]}
                            </span>
                          </motion.div>
                        </AnimatePresence>
                      </div>

                      <button 
                        onClick={() => setCurrentClueIndex(prev => Math.min(gameState.inventory.length - 1, prev + 1))}
                        disabled={currentClueIndex === gameState.inventory.length - 1}
                        className="p-1.5 text-slate-400 hover:text-amber-500 hover:bg-slate-800 rounded-md disabled:opacity-30 disabled:hover:text-slate-400 disabled:hover:bg-transparent transition-all"
                      >
                        <ChevronRight className="w-5 h-5" />
                      </button>
                    </div>
                    <div className="text-center mt-2 text-[10px] text-slate-500 font-medium tracking-widest uppercase">
                      Pista {currentClueIndex + 1} de {gameState.inventory.length}
                    </div>
                  </div>
                )}
              </div>

              {gameState.flags.length > 0 && (
                <div>
                  <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2 flex items-center gap-2 mt-6">
                    <Flag className="w-3 h-3" /> Deducciones
                  </h3>
                  <ul className="space-y-2">
                    <AnimatePresence>
                      {gameState.flags.map((flag, idx) => (
                        <motion.li 
                          key={idx}
                          initial={{ opacity: 0, x: -10 }}
                          animate={{ opacity: 1, x: 0 }}
                          className="bg-slate-800/30 border border-slate-800 rounded-lg p-2 text-xs text-slate-400 capitalize"
                        >
                          {flag.replace(/_/g, ' ')}
                        </motion.li>
                      ))}
                    </AnimatePresence>
                  </ul>
                </div>
              )}
            </div>

            {gameState.history.length > 0 && (
              <div className="mt-6 pt-6 border-t border-slate-800">
                <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-4 flex items-center gap-2">
                  <History className="w-3 h-3" /> Línea de Investigación
                </h3>
                <div className="relative pl-3 border-l border-slate-700 space-y-4 max-h-[200px] overflow-y-auto pr-2 [&::-webkit-scrollbar]:w-1 [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:bg-slate-700 [&::-webkit-scrollbar-thumb]:rounded-full">
                  <AnimatePresence>
                    {gameState.history.map((entry, idx) => (
                      <motion.div 
                        key={idx}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="relative"
                      >
                        <div className={`absolute -left-[17px] top-1.5 w-2 h-2 rounded-full ring-4 ring-slate-900 ${idx === gameState.history.length - 1 ? 'bg-amber-500 shadow-[0_0_8px_rgba(245,158,11,0.5)]' : 'bg-slate-600'}`} />
                        <p className="text-xs text-slate-300 leading-snug">{entry.action}</p>
                        {entry.result && (
                          <p className="text-[10px] text-amber-500/80 mt-1 font-medium">{entry.result}</p>
                        )}
                      </motion.div>
                    ))}
                  </AnimatePresence>
                </div>
              </div>
            )}

            <div className="mt-8 pt-6 border-t border-slate-800">
              <p className="text-xs text-slate-500 leading-relaxed italic">
                {caseInfo.description}
              </p>
            </div>
          </div>
        </aside>

      </main>

      {/* Toast Notification */}
      <AnimatePresence>
        {toastMsg && (
          <motion.div
            initial={{ opacity: 0, y: 50, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.9 }}
            className="fixed bottom-6 right-6 bg-slate-800 border border-amber-500/30 shadow-2xl rounded-xl p-4 flex items-start gap-3 z-50 max-w-sm"
          >
            <div className="p-2 bg-amber-500/10 rounded-full shrink-0">
              <Sparkles className="w-5 h-5 text-amber-500" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-slate-200">{toastMsg.title}</h4>
              <p className="text-xs text-slate-400 mt-1 capitalize">{toastMsg.desc}</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Footer Decoration */}
      <footer className="max-w-5xl mx-auto px-6 py-12 text-center">
        <div className="inline-flex items-center gap-2 px-4 py-2 bg-slate-900 border border-slate-800 rounded-full text-xs text-slate-500">
          <span>Hecho con IA y deducción</span>
          <span className="w-1 h-1 rounded-full bg-slate-700"></span>
          <span>V 2.0</span>
        </div>
      </footer>
    </div>
  );
}
