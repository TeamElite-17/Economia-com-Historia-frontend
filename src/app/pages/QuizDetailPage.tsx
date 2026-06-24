import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router';
import { CheckCircle, XCircle, ChevronRight, Trophy, RotateCcw, Clock, HelpCircle, ArrowLeft } from 'lucide-react';
import { QUIZZES } from '../data/mockData';
import { useAuth } from '../context/AuthContext';
import confetti from 'canvas-confetti';

type Phase = 'intro' | 'quiz' | 'result';

export function QuizDetailPage() {
  const { id } = useParams();
  const { isLoggedIn, openLogin, completeQuiz } = useAuth();

  const quiz = QUIZZES.find(q => q.id === id);
  const [phase, setPhase] = useState<Phase>('intro');
  const [currentQ, setCurrentQ] = useState(0);
  const [selected, setSelected] = useState<number | null>(null);
  const [answers, setAnswers] = useState<(number | null)[]>([]);
  const [showExplanation, setShowExplanation] = useState(false);

  const score = answers.filter((a, i) => quiz && a === quiz.questions[i].correctIndex).length;
  const percentage = quiz ? Math.round((score / quiz.questions.length) * 100) : 0;

  // Fire confetti when result phase starts and score is good
  useEffect(() => {
    if (phase === 'result' && percentage >= 80) {
      confetti({
        particleCount: 120,
        spread: 80,
        origin: { y: 0.6 },
        colors: ['#7B1D2D', '#C9A84C', '#5C8A6E', '#D64E12'],
      });
    }
  }, [phase, percentage]);

  if (!quiz) return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="text-center">
        <h2 className="text-gray-700 mb-2">Quiz não encontrado</h2>
        <Link to="/quiz" className="text-sm" style={{ color: '#7B1D2D' }}>Voltar aos quizzes</Link>
      </div>
    </div>
  );

  if (!isLoggedIn) {
    return (
      <div className="flex items-center justify-center min-h-[60vh] px-4">
        <div className="text-center max-w-sm">
          <div className="w-16 h-16 rounded-2xl mx-auto mb-4 flex items-center justify-center" style={{ backgroundColor: '#F5E8EB' }}>
            <HelpCircle size={32} style={{ color: '#7B1D2D' }} />
          </div>
          <h2 className="text-gray-900 mb-2">{quiz.title}</h2>
          <p className="text-sm text-gray-500 mb-6">Para fazer este quiz precisas de ter uma conta. É gratuito e rápido!</p>
          <button onClick={openLogin} className="px-8 py-3 rounded-full text-white font-medium" style={{ backgroundColor: '#7B1D2D' }}>
            Entrar para jogar
          </button>
        </div>
      </div>
    );
  }

  const question = quiz.questions[currentQ];

  const handleSelect = (idx: number) => {
    if (selected !== null) return;
    setSelected(idx);
    setShowExplanation(true);
  };

  const handleNext = () => {
    const newAnswers = [...answers, selected];
    setAnswers(newAnswers);
    if (currentQ + 1 < quiz.questions.length) {
      setCurrentQ(currentQ + 1);
      setSelected(null);
      setShowExplanation(false);
    } else {
      completeQuiz(quiz.id, percentage);
      setPhase('result');
    }
  };

  const handleReset = () => {
    setPhase('intro');
    setCurrentQ(0);
    setSelected(null);
    setAnswers([]);
    setShowExplanation(false);
  };

  if (phase === 'intro') {
    return (
      <div className="max-w-2xl mx-auto px-4 py-10">
        <Link to="/quiz" className="flex items-center gap-2 text-sm text-gray-500 hover:text-gray-700 mb-8">
          <ArrowLeft size={16} /> Todos os quizzes
        </Link>
        <div className="bg-white rounded-3xl overflow-hidden shadow-sm">
          <div className="relative h-48 overflow-hidden">
            <img src={quiz.thumbnail} alt={quiz.title} className="w-full h-full object-cover" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
            <div className="absolute bottom-4 left-4">
              <span className="px-2.5 py-1 rounded-full text-xs font-medium" style={{ backgroundColor: '#F5E8EB', color: '#7B1D2D' }}>
                {quiz.category}
              </span>
            </div>
          </div>
          <div className="p-8">
            <h1 className="text-gray-900 mb-3" style={{ fontSize: '1.25rem' }}>{quiz.title}</h1>
            <p className="text-sm text-gray-600 mb-6">{quiz.description}</p>
            <div className="grid grid-cols-3 gap-4 mb-8">
              <div className="text-center p-3 rounded-2xl" style={{ backgroundColor: '#F5E8EB' }}>
                <div className="font-bold" style={{ color: '#7B1D2D' }}>{quiz.questions.length}</div>
                <div className="text-xs text-gray-500 mt-1">Perguntas</div>
              </div>
              <div className="text-center p-3 rounded-2xl" style={{ backgroundColor: '#F5E8EB' }}>
                <div className="font-bold" style={{ color: '#7B1D2D' }}>{quiz.estimatedTime}</div>
                <div className="text-xs text-gray-500 mt-1">Tempo estimado</div>
              </div>
              <div className="text-center p-3 rounded-2xl" style={{ backgroundColor: '#F5E8EB' }}>
                <div className="font-bold capitalize" style={{ color: '#7B1D2D' }}>
                  {quiz.difficulty === 'facil' ? 'Fácil' : quiz.difficulty === 'medio' ? 'Médio' : 'Difícil'}
                </div>
                <div className="text-xs text-gray-500 mt-1">Dificuldade</div>
              </div>
            </div>
            <button
              onClick={() => setPhase('quiz')}
              className="w-full py-3.5 rounded-2xl text-white font-semibold transition-all hover:opacity-90"
              style={{ backgroundColor: '#7B1D2D' }}
            >
              Começar Quiz
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (phase === 'result') {
    const getGrade = () => {
      if (percentage >= 80) return { label: 'Excelente!', color: '#5C8A6E', desc: 'Dominas este tema! Continua assim.' };
      if (percentage >= 60) return { label: 'Bom trabalho!', color: '#C9A84C', desc: 'Boa base, mas há margem para melhorar.' };
      return { label: 'Continua a estudar', color: '#D64E12', desc: 'Revê os conteúdos e tenta novamente!' };
    };
    const grade = getGrade();

    return (
      <div className="max-w-2xl mx-auto px-4 py-10">
        <div className="bg-white rounded-3xl p-8 shadow-sm text-center mb-6">
          <div className="w-20 h-20 rounded-full mx-auto mb-4 flex items-center justify-center" style={{ backgroundColor: grade.color + '20' }}>
            <Trophy size={36} style={{ color: grade.color }} />
          </div>
          <h2 className="text-gray-900 mb-2" style={{ fontSize: '1.5rem' }}>{grade.label}</h2>
          <p className="text-gray-500 text-sm mb-6">{grade.desc}</p>
          <div className="flex items-center justify-center gap-8 mb-6">
            <div>
              <div className="text-4xl font-bold" style={{ color: grade.color }}>{score}/{quiz.questions.length}</div>
              <div className="text-xs text-gray-500 mt-1">Respostas corretas</div>
            </div>
            <div className="w-px h-12 bg-gray-100" />
            <div>
              <div className="text-4xl font-bold" style={{ color: grade.color }}>{percentage}%</div>
              <div className="text-xs text-gray-500 mt-1">Pontuação</div>
            </div>
          </div>
          {/* Progress bar */}
          <div className="h-3 bg-gray-100 rounded-full overflow-hidden mb-8">
            <div className="h-full rounded-full transition-all" style={{ width: `${percentage}%`, backgroundColor: grade.color }} />
          </div>

          {/* Per-question review */}
          <div className="text-left space-y-3 mb-8">
            <h3 className="font-semibold text-gray-900 text-sm">Revisão das respostas</h3>
            {quiz.questions.map((q, i) => {
              const isCorrect = answers[i] === q.correctIndex;
              return (
                <div key={q.id} className="p-3 rounded-xl" style={{ backgroundColor: isCorrect ? '#EBF3EE' : '#FEF0E6' }}>
                  <div className="flex items-start gap-2 mb-1">
                    {isCorrect
                      ? <CheckCircle size={16} style={{ color: '#5C8A6E' }} className="flex-shrink-0 mt-0.5" />
                      : <XCircle size={16} style={{ color: '#D64E12' }} className="flex-shrink-0 mt-0.5" />
                    }
                    <p className="text-xs font-medium text-gray-800">{q.question}</p>
                  </div>
                  {!isCorrect && (
                    <p className="text-xs ml-6 mb-1" style={{ color: '#5C8A6E' }}>
                      Resposta correcta: {q.options[q.correctIndex]}
                    </p>
                  )}
                  <p className="text-xs text-gray-600 ml-6 italic">{q.explanation}</p>
                </div>
              );
            })}
          </div>

          <div className="flex gap-3">
            <button
              onClick={handleReset}
              className="flex-1 flex items-center justify-center gap-2 py-3 rounded-2xl border text-sm font-medium text-gray-700 hover:bg-gray-50 transition-all"
              style={{ borderColor: '#E5E7EB' }}
            >
              <RotateCcw size={16} /> Tentar de novo
            </button>
            <Link
              to="/quiz"
              className="flex-1 flex items-center justify-center py-3 rounded-2xl text-sm font-medium text-white transition-all"
              style={{ backgroundColor: '#7B1D2D' }}
            >
              Outros quizzes
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // Quiz phase
  const progress = (currentQ / quiz.questions.length) * 100;
  return (
    <div className="max-w-2xl mx-auto px-4 py-10">
      {/* Progress bar */}
      <div className="mb-6">
        <div className="flex items-center justify-between text-sm text-gray-500 mb-2">
          <span>Pergunta {currentQ + 1} de {quiz.questions.length}</span>
          <span className="flex items-center gap-1"><Clock size={13} /> {quiz.estimatedTime}</span>
        </div>
        <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
          <div
            className="h-full rounded-full transition-all duration-500"
            style={{ width: `${progress}%`, backgroundColor: '#7B1D2D' }}
          />
        </div>
      </div>

      <div className="bg-white rounded-3xl p-6 md:p-8 shadow-sm">
        <h2 className="text-gray-900 mb-6 leading-snug" style={{ fontSize: '1.1rem' }}>{question.question}</h2>

        <div className="space-y-3 mb-6">
          {question.options.map((opt, idx) => {
            let style: React.CSSProperties = { border: '2px solid #E5E7EB', color: '#374151' };
            if (selected !== null) {
              if (idx === question.correctIndex) {
                style = { border: '2px solid #5C8A6E', backgroundColor: '#EBF3EE', color: '#2E5C3E' };
              } else if (idx === selected && selected !== question.correctIndex) {
                style = { border: '2px solid #D64E12', backgroundColor: '#FEF0E6', color: '#8B3410' };
              }
            } else {
              style = { border: '2px solid #E5E7EB', color: '#374151', cursor: 'pointer' };
            }

            return (
              <button
                key={idx}
                onClick={() => handleSelect(idx)}
                className="w-full text-left px-4 py-3.5 rounded-2xl text-sm transition-all flex items-center gap-3 hover:border-[#7B1D2D]"
                style={style}
                disabled={selected !== null}
              >
                <span
                  className="w-7 h-7 rounded-full flex-shrink-0 flex items-center justify-center text-xs font-bold"
                  style={{
                    backgroundColor:
                      selected !== null && idx === question.correctIndex
                        ? '#5C8A6E'
                        : selected === idx && idx !== question.correctIndex
                          ? '#D64E12'
                          : '#F0EBE8',
                    color:
                      selected !== null && (idx === question.correctIndex || idx === selected)
                        ? 'white'
                        : '#7B1D2D',
                  }}
                >
                  {String.fromCharCode(65 + idx)}
                </span>
                <span className="flex-1">{opt}</span>
                {selected !== null && idx === question.correctIndex && (
                  <CheckCircle size={16} className="flex-shrink-0" style={{ color: '#5C8A6E' }} />
                )}
                {selected !== null && idx === selected && idx !== question.correctIndex && (
                  <XCircle size={16} className="flex-shrink-0" style={{ color: '#D64E12' }} />
                )}
              </button>
            );
          })}
        </div>

        {showExplanation && (
          <div className="p-4 rounded-2xl mb-4" style={{ backgroundColor: '#F5E8EB' }}>
            <p className="text-sm font-medium mb-1" style={{ color: '#7B1D2D' }}>Explicação</p>
            <p className="text-sm text-gray-700">{question.explanation}</p>
          </div>
        )}

        {selected !== null && (
          <button
            onClick={handleNext}
            className="w-full flex items-center justify-center gap-2 py-3.5 rounded-2xl text-white font-semibold transition-all hover:opacity-90"
            style={{ backgroundColor: '#7B1D2D' }}
          >
            {currentQ + 1 < quiz.questions.length ? 'Próxima pergunta' : 'Ver resultado'}
            <ChevronRight size={18} />
          </button>
        )}
      </div>
    </div>
  );
}
