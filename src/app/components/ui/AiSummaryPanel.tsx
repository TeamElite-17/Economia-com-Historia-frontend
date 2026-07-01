import { useState, useRef, useEffect } from 'react';
import {
  Sparkles,
  Loader2,
  AlertCircle,
  CheckCircle2,
  Clock,
  X,
  RefreshCw,
} from 'lucide-react';
import { summariseContent, type ContentType, type SummaryResult } from '../../data/geminiService';

interface AiSummaryPanelProps {
  contentType: ContentType;
  title: string;
  description: string;
  body?: string;
  mediaUrl?: string;
}

type PanelState = 'idle' | 'loading' | 'done' | 'error';

export function AiSummaryPanel({ contentType, title, description, body, mediaUrl }: AiSummaryPanelProps) {
  const [open, setOpen] = useState(false);
  const [state, setState] = useState<PanelState>('idle');
  const [result, setResult] = useState<SummaryResult | null>(null);
  const [errorMsg, setErrorMsg] = useState('');
  const panelRef = useRef<HTMLDivElement>(null);
  const btnRef = useRef<HTMLButtonElement>(null);

  /* Fecha ao clicar fora */
  useEffect(() => {
    if (!open) return;
    const handler = (e: MouseEvent) => {
      if (
        panelRef.current && !panelRef.current.contains(e.target as Node) &&
        btnRef.current && !btnRef.current.contains(e.target as Node)
      ) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [open]);

  const handleOpen = () => {
    setOpen(v => !v);
    /* Arranca o resumo automaticamente na primeira abertura */
    if (!open && state === 'idle') {
      handleSummarise();
    }
  };

  const handleSummarise = async () => {
    if (state === 'loading') return;
    setState('loading');
    setErrorMsg('');
    try {
      const data = await summariseContent({ type: contentType, title, description, body, mediaUrl });
      setResult(data);
      setState('done');
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : 'Erro desconhecido.');
      setState('error');
    }
  };

  const typeLabel =
    contentType === 'article' ? 'artigo' :
      contentType === 'video' ? 'vídeo' : 'podcast';

  return (
    <div className="ai-summary-wrapper" style={{ position: 'relative', display: 'inline-block' }}>

      {/* ── Botão ícone ── */}
      <button
        ref={btnRef}
        id="ai-summarise-button"
        onClick={handleOpen}
        title="Resumir com IA"
        aria-label="Resumir com IA"
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          width: 52,
          height: 52,
          borderRadius: '50%',
          border: 'none',
          cursor: 'pointer',
          background: open
            ? 'linear-gradient(135deg, #7B1D2D, #C9A84C)'
            : 'linear-gradient(135deg, rgba(123,29,45,0.12), rgba(201,168,76,0.12))',
          color: open ? '#fff' : '#7B1D2D',
          boxShadow: open ? '0 6px 20px rgba(123,29,45,0.40)' : '0 2px 10px rgba(123,29,45,0.15)',
          transition: 'all 0.25s cubic-bezier(0.34,1.56,0.64,1)',
          transform: open ? 'scale(1.08)' : 'scale(1)',
          flexShrink: 0,
        }}
      >
        {state === 'loading' && open
          ? <Loader2 size={22} className="animate-spin" />
          : <Sparkles size={22} />
        }
      </button>

      {/* ── Painel popup ── */}
      {open && (
        <div
          ref={panelRef}
          role="dialog"
          aria-label="Resumo com IA"
          style={{
            position: 'absolute',
            top: 'calc(100% + 10px)',
            right: 0,
            width: 480,
            maxWidth: '92vw',
            borderRadius: 18,
            overflow: 'hidden',
            boxShadow: '0 24px 70px rgba(0,0,0,0.20), 0 6px 20px rgba(123,29,45,0.14)',
            background: '#fff',
            border: '1px solid rgba(123,29,45,0.1)',
            zIndex: 999,
            animation: 'aiPanelIn 0.22s cubic-bezier(0.34,1.56,0.64,1)',
          }}
        >
          {/* Header */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '16px 18px',
              background: 'linear-gradient(135deg, #7B1D2D 0%, #9E2A3E 60%, #C9A84C 100%)',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <div
                style={{
                  width: 30, height: 30, borderRadius: '50%',
                  background: 'rgba(255,255,255,0.18)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}
              >
                <Sparkles size={16} color="#fff" />
              </div>
              <span style={{ color: '#fff', fontWeight: 600, fontSize: 15 }}>
                Resumo com IA
              </span>
              <span style={{
                fontSize: 11, fontWeight: 600,
                padding: '3px 9px', borderRadius: 99,
                background: 'rgba(201,168,76,0.35)', color: '#fde68a',
              }}>
                Beta
              </span>
            </div>
            <button
              onClick={() => setOpen(false)}
              aria-label="Fechar"
              style={{
                background: 'rgba(255,255,255,0.15)',
                border: 'none', cursor: 'pointer',
                borderRadius: '50%', width: 28, height: 28,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                color: '#fff', transition: 'background 0.2s',
              }}
              onMouseEnter={e => (e.currentTarget.style.background = 'rgba(255,255,255,0.3)')}
              onMouseLeave={e => (e.currentTarget.style.background = 'rgba(255,255,255,0.15)')}
            >
              <X size={13} />
            </button>
          </div>

          {/* Body */}
          <div style={{ padding: '18px 20px', maxHeight: 560, overflowY: 'auto' }}>

            {/* Loading */}
            {state === 'loading' && (
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10, padding: '18px 0' }}>
                <div style={{ position: 'relative' }}>
                  <Loader2 size={32} className="animate-spin" style={{ color: '#7B1D2D' }} />
                </div>
                <p style={{ fontSize: 14, color: '#6b7280', margin: 0 }}>
                  A analisar o {typeLabel} com Gemini…
                </p>
                <div style={{ display: 'flex', gap: 4 }}>
                  {[0, 1, 2].map(i => (
                    <span
                      key={i}
                      className="animate-bounce"
                      style={{
                        width: 6, height: 6, borderRadius: '50%',
                        background: '#7B1D2D', display: 'inline-block',
                        animationDelay: `${i * 150}ms`,
                      }}
                    />
                  ))}
                </div>
              </div>
            )}

            {/* Error */}
            {state === 'error' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                <div style={{
                  display: 'flex', alignItems: 'flex-start', gap: 10,
                  padding: '10px 12px', borderRadius: 10, background: '#FEF2F2',
                }}>
                  <AlertCircle size={16} color="#ef4444" style={{ flexShrink: 0, marginTop: 1 }} />
                  <div>
                    <p style={{ fontSize: 14, fontWeight: 600, color: '#b91c1c', margin: 0 }}>
                      Não foi possível gerar o resumo
                    </p>
                    <p style={{ fontSize: 14, color: '#dc2626', margin: '2px 0 0' }}>{errorMsg}</p>
                  </div>
                </div>
                <button
                  onClick={handleSummarise}
                  style={{
                    display: 'flex', alignItems: 'center', gap: 6,
                    padding: '8px 14px', borderRadius: 99, fontSize: 14,
                    fontWeight: 500, cursor: 'pointer', border: '1px solid rgba(123,29,45,0.3)',
                    background: 'transparent', color: '#7B1D2D',
                    alignSelf: 'flex-start', transition: 'background 0.2s',
                  }}
                  onMouseEnter={e => (e.currentTarget.style.background = '#F5E8EB')}
                  onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
                >
                  <RefreshCw size={12} /> Tentar novamente
                </button>
              </div>
            )}

            {/* Done */}
            {state === 'done' && result && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>

                {/* Resumo */}
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 6 }}>
                    <CheckCircle2 size={13} color="#0ea5e9" />
                    <span style={{ fontSize: 13, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', color: '#9ca3af' }}>
                      Resumo
                    </span>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 4, marginLeft: 'auto', color: '#9ca3af' }}>
                      <Clock size={13} />
                      <span style={{ fontSize: 13 }}>{result.readingTime}</span>
                    </div>
                  </div>
                  <p style={{ fontSize: 17, color: '#374151', lineHeight: 1.75, margin: 0 }}>
                    {result.summary}
                  </p>
                </div>

                {/* Pontos-chave */}
                {result.keyPoints.length > 0 && (
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 8 }}>
                      <Sparkles size={12} color="#C9A84C" />
                      <span style={{ fontSize: 13, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', color: '#9ca3af' }}>
                        Pontos-chave
                      </span>
                    </div>
                    <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: 8 }}>
                      {result.keyPoints.map((pt, i) => (
                        <li key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: 8 }}>
                          <span
                            style={{
                              flexShrink: 0, width: 18, height: 18, borderRadius: '50%',
                              display: 'flex', alignItems: 'center', justifyContent: 'center',
                              fontSize: 14, fontWeight: 700, color: '#fff',
                              background: 'linear-gradient(135deg, #7B1D2D, #C9A84C)',
                              marginTop: 1,
                            }}
                          >
                            {i + 1}
                          </span>
                          <span style={{ fontSize: 16, color: '#374151', lineHeight: 1.7 }}>{pt}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Rodapé */}
                <div style={{
                  display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                  paddingTop: 10, borderTop: '1px solid rgba(0,0,0,0.06)',
                }}>
                  <p style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 11, color: '#9ca3af', margin: 0 }}>
                    <Sparkles size={11} /> Gerado por Google Gemini AI
                  </p>
                  <button
                    onClick={handleSummarise}
                    style={{
                      display: 'flex', alignItems: 'center', gap: 4,
                      fontSize: 10, color: '#9ca3af', background: 'none',
                      border: 'none', cursor: 'pointer', textDecoration: 'underline',
                      transition: 'color 0.2s',
                    }}
                    onMouseEnter={e => (e.currentTarget.style.color = '#6b7280')}
                    onMouseLeave={e => (e.currentTarget.style.color = '#9ca3af')}
                  >
                    <RefreshCw size={10} /> Regenerar
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Animação de entrada do painel */}
      <style>{`
        @keyframes aiPanelIn {
          from { opacity: 0; transform: translateY(-8px) scale(0.96); }
          to   { opacity: 1; transform: translateY(0)   scale(1); }
        }
      `}</style>
    </div>
  );
}
