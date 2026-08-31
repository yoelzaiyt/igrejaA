import React, { useState, useEffect, useRef } from 'react';
import { DonationState } from '../types';
import { playTapSound, playSuccessSound } from '../utils/audio';
import NumericKeypad from './NumericKeypad';
import { HeaderClock } from './LiveClock';
import { speakText } from '../utils/tts';
import { BrandConfig } from '../utils/brand';

import { Lang } from '../utils/i18n';
import { saveRegistration } from '../lib/registrations';
import { startAttempt, getOpenAttempt, updateAttempt, clearAttempt } from '../lib/paymentAttempt';

interface DonationViewProps {
  onBack: () => void;
  onGoHome: () => void;
  brand: BrandConfig;
  lang: Lang;
  initialStep?: 'category' | 'value' | 'method';
  initialCategory?: string;
  totemId?: string | null;
  onPaymentInFlightChange?: (inFlight: boolean) => void;
  key?: string;
}

type DebitState = 'connecting' | 'waiting_card' | 'processing' | 'approved' | 'declined' | 'canceled' | 'error';

// Requests to our own serverless functions get a bounded timeout so a hung
// network/provider response surfaces as a recoverable error instead of an
// infinite spinner.
async function fetchWithTimeout(url: string, options: RequestInit, timeoutMs = 15000): Promise<Response> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    return await fetch(url, { ...options, signal: controller.signal });
  } finally {
    clearTimeout(timer);
  }
}

const getCategoryDetails = (icon: string) => {
  switch (icon) {
    case 'payments':
      return {
        hoverBorder: 'hover:border-amber-400/60',
        hoverBg: 'hover:bg-amber-950/40',
        iconColor: 'text-amber-300',
        bgGradient: 'from-amber-500/20',
        bgUrl: 'https://images.unsplash.com/photo-1554415707-6e8cfc93fe23?w=1200&fit=crop&q=80'
      };
    case 'volunteer_activism':
      return {
        hoverBorder: 'hover:border-rose-400/60',
        hoverBg: 'hover:bg-rose-950/40',
        iconColor: 'text-rose-300',
        bgGradient: 'from-rose-500/20',
        bgUrl: 'https://images.unsplash.com/photo-1438232992991-995b7058bbb3?w=1200&fit=crop&q=80'
      };
    case 'public':
      return {
        hoverBorder: 'hover:border-cyan-400/60',
        hoverBg: 'hover:bg-cyan-950/40',
        iconColor: 'text-cyan-300',
        bgGradient: 'from-cyan-500/20',
        bgUrl: 'https://images.unsplash.com/photo-1526778548025-fa2f459cd5c1?w=1200&fit=crop&q=80'
      };
    case 'spa':
      return {
        hoverBorder: 'hover:border-emerald-400/60',
        hoverBg: 'hover:bg-emerald-950/40',
        iconColor: 'text-emerald-300',
        bgGradient: 'from-emerald-500/20',
        bgUrl: 'https://images.unsplash.com/photo-1488521787991-ed7bbaae773c?w=1200&fit=crop&q=80'
      };
    case 'local_car_wash':
      return {
        hoverBorder: 'hover:border-blue-400/60',
        hoverBg: 'hover:bg-blue-950/40',
        iconColor: 'text-blue-300',
        bgGradient: 'from-blue-500/20',
        bgUrl: 'https://images.unsplash.com/photo-1607860108855-64acf2078ed9?w=1200&fit=crop&q=80'
      };
    case 'wash':
      return {
        hoverBorder: 'hover:border-indigo-400/60',
        hoverBg: 'hover:bg-indigo-950/40',
        iconColor: 'text-indigo-300',
        bgGradient: 'from-indigo-500/20',
        bgUrl: 'https://images.unsplash.com/photo-1520340356584-f9917d1ecc6f?w=1200&fit=crop&q=80'
      };
    case 'auto_clean_detail':
      return {
        hoverBorder: 'hover:border-teal-400/60',
        hoverBg: 'hover:bg-teal-950/40',
        iconColor: 'text-teal-300',
        bgGradient: 'from-teal-500/20',
        bgUrl: 'https://images.unsplash.com/photo-1601362840469-81e4df86527e?w=1200&fit=crop&q=80'
      };
    case 'credit_card':
      return {
        hoverBorder: 'hover:border-purple-400/60',
        hoverBg: 'hover:bg-purple-950/40',
        iconColor: 'text-purple-300',
        bgGradient: 'from-purple-500/20',
        bgUrl: 'https://images.unsplash.com/photo-1563013544-824ae1d704d3?w=1200&fit=crop&q=80'
      };
    case 'emoji_events':
      return {
        hoverBorder: 'hover:border-yellow-400/60',
        hoverBg: 'hover:bg-yellow-950/40',
        iconColor: 'text-yellow-300',
        bgGradient: 'from-yellow-500/20',
        bgUrl: 'https://images.unsplash.com/photo-1508098682722-e99c43a406b2?w=1200&fit=crop&q=80'
      };
    case 'construction':
      return {
        hoverBorder: 'hover:border-orange-400/60',
        hoverBg: 'hover:bg-orange-950/40',
        iconColor: 'text-orange-300',
        bgGradient: 'from-orange-500/20',
        bgUrl: 'https://images.unsplash.com/photo-1544698310-74ea9d1c8258?w=1200&fit=crop&q=80'
      };
    default:
      return {
        hoverBorder: 'hover:border-slate-400/60',
        hoverBg: 'hover:bg-slate-800/40',
        iconColor: 'text-slate-350',
        bgGradient: 'from-slate-500/20',
        bgUrl: 'https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?w=1200&fit=crop&q=80'
      };
  }
};

export default function DonationView({ onBack, onGoHome, brand, lang, initialStep, initialCategory, totemId, onPaymentInFlightChange }: DonationViewProps) {
  const [state, setState] = useState<DonationState>(() => {
    // Resume an open payment attempt after a refresh — reuses the same
    // mpPaymentId/QR/idempotency key instead of minting a second charge.
    const open = getOpenAttempt(brand.id);
    if (open) {
      return {
        category: open.category,
        value: open.value,
        customValue: '',
        step: open.step,
        paymentMethod: open.method,
        mpPaymentId: open.mpPaymentId,
        mpQrCode: open.mpQrCode,
        mpQrCodeBase64: open.mpQrCodeBase64,
        idempotencyKey: open.idempotencyKey,
      };
    }
    return {
      category: initialCategory || '',
      value: 0,
      customValue: '',
      step: initialStep || 'category'
    };
  });

  const [pixTimer, setPixTimer] = useState(300);
  const [copied, setCopied] = useState(false);
  const [hoveredCategoryBg, setHoveredCategoryBg] = useState<string | null>(null);
  const [pixLoading, setPixLoading] = useState(false);
  const [pixError, setPixError] = useState('');
  const [pixExpired, setPixExpired] = useState(false);
  const [pixAttemptNonce, setPixAttemptNonce] = useState(0);
  const firedPixKeyRef = useRef<string | null>(null);
  const [checkingNow, setCheckingNow] = useState(false);
  const [cardError, setCardError] = useState('');
  const [cardProcessing, setCardProcessing] = useState(false);
  const [cardAttemptNonce, setCardAttemptNonce] = useState(0);
  const [brickReady, setBrickReady] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [totemPendingMessage, setTotemPendingMessage] = useState(false);
  const [successCountdown, setSuccessCountdown] = useState(20);
  // Which methods this church has enabled — defaults to all three while
  // loading so the Método step never flashes empty.
  const [enabledMethods, setEnabledMethods] = useState<Array<'pix' | 'credit' | 'debit'>>(['pix', 'credit', 'debit']);

  useEffect(() => {
    let cancelled = false;
    fetch(`/api/enabled-methods?churchId=${encodeURIComponent(brand.id)}`)
      .then((res) => res.json())
      .then((data) => {
        if (!cancelled && Array.isArray(data?.methods)) setEnabledMethods(data.methods);
      })
      .catch(() => {
        // Keep the all-methods default — never block the journey over this.
      });
    return () => {
      cancelled = true;
    };
  }, [brand.id]);

  // Debit ("card" step) — honest simulated state machine, no real
  // terminal/Mercado Pago Point integration yet.
  const [debitState, setDebitState] = useState<DebitState>('connecting');
  const [debitContributionId, setDebitContributionId] = useState<string | null>(null);
  const [debitAttemptNonce, setDebitAttemptNonce] = useState(0);

  // Tells App.tsx's InactivityTimer to suspend auto-reset while a payment is
  // in flight — a shopper reading a QR/paying via their own phone often
  // isn't touching the touchscreen, and shouldn't get bumped to Home for it.
  useEffect(() => {
    const inFlight = state.step === 'confirmation' || state.step === 'pix' || state.step === 'mp_card' || state.step === 'card';
    onPaymentInFlightChange?.(inFlight);
  }, [state.step]);

  useEffect(() => {
    return () => {
      onPaymentInFlightChange?.(false);
    };
  }, []);

  useEffect(() => {
    if (totemId) setTotemPendingMessage(false);
  }, [totemId]);

  // Load the Mercado Pago SDK once, when the real credit-card step is reached.
  useEffect(() => {
    if (state.step !== 'mp_card') return;

    setCardError('');
    setBrickReady(false);

    const publicKey = import.meta.env.VITE_MERCADOPAGO_PUBLIC_KEY;
    if (!publicKey) {
      setCardError('Mercado Pago não configurado (chave pública ausente).');
      return;
    }

    let cancelled = false;
    let brickController: { unmount?: () => void } | null = null;

    const mount = async () => {
      if (!(window as any).MercadoPago) {
        await new Promise<void>((resolve, reject) => {
          const existing = document.getElementById('mp-sdk-script');
          if (existing) {
            existing.addEventListener('load', () => resolve());
            return;
          }
          const script = document.createElement('script');
          script.id = 'mp-sdk-script';
          script.src = 'https://sdk.mercadopago.com/js/v2';
          script.onload = () => resolve();
          script.onerror = () => reject(new Error('Falha ao carregar SDK do Mercado Pago'));
          document.head.appendChild(script);
        });
      }
      if (cancelled) return;

      const mp = new (window as any).MercadoPago(publicKey, { locale: 'pt-BR' });
      const bricksBuilder = mp.bricks();

      brickController = await bricksBuilder.create('cardPayment', 'mp-card-brick-container', {
        initialization: { amount: state.value },
        customization: {
          visual: { style: { theme: 'default' } },
          paymentMethods: { maxInstallments: 1 },
        },
        callbacks: {
          onReady: () => {
            if (!cancelled) setBrickReady(true);
          },
          onError: (error: unknown) => {
            console.error('Mercado Pago Brick error:', error);
            if (!cancelled) setCardError('Erro no formulário de cartão. Tente novamente.');
          },
          onSubmit: (cardFormData: any) => {
            return new Promise<void>((resolve, reject) => {
              setCardProcessing(true);
              setCardError('');
              fetchWithTimeout('/api/create-payment', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                  method: 'credit',
                  amount: state.value,
                  description: `${state.category} - ${brand.name}`,
                  category: state.category,
                  brandId: brand.id,
                  card: cardFormData,
                  idempotencyKey: state.idempotencyKey,
                  totemId,
                }),
              })
                .then((res) => res.json())
                .then((data) => {
                  setCardProcessing(false);
                  if (data.status === 'approved') {
                    setState((prev) => ({ ...prev, mpPaymentId: data.id }));
                    handleCompletePayment();
                    resolve();
                  } else {
                    setCardError(
                      data.status === 'rejected'
                        ? 'Pagamento recusado pela operadora do cartão. Tente outro cartão.'
                        : `Pagamento não aprovado (${data.status_detail || data.status || 'erro'}).`
                    );
                    reject();
                  }
                })
                .catch((err) => {
                  console.error(err);
                  setCardProcessing(false);
                  setCardError(
                    err?.name === 'AbortError'
                      ? 'Tempo esgotado ao processar o pagamento. Tente novamente.'
                      : 'Falha de conexão ao processar o pagamento.'
                  );
                  reject();
                });
            });
          },
        },
      });
    };

    mount().catch((err) => {
      console.error(err);
      if (!cancelled) setCardError('Não foi possível carregar o formulário de pagamento.');
    });

    return () => {
      cancelled = true;
      brickController?.unmount?.();
    };
  }, [state.step, cardAttemptNonce]);

  // Real PIX charge: create it with Mercado Pago as soon as this step opens
  // (or when "Tentar Novamente" bumps pixAttemptNonce after an error/expiry).
  useEffect(() => {
    if (state.step !== 'pix') return;
    // A resumed attempt (post-refresh) already has a QR — don't mint a new one.
    if (state.mpQrCode) return;
    // React StrictMode (dev only) mounts, cleans up, and remounts this
    // effect for the SAME idempotencyKey — the `cancelled` flag below stops
    // the stale response from being applied, but the real fetch still goes
    // out twice. Mercado Pago's own duplicate-request guard (independent of
    // our idempotencyKey) then rejects the second one with a 423 — and
    // since network timing decides which response "wins", that error can
    // end up on the request StrictMode actually kept, so no QR ever shows
    // even though the charge succeeded. Skip re-firing for an idempotencyKey
    // this component instance already fired a request for.
    if (firedPixKeyRef.current === state.idempotencyKey) return;
    firedPixKeyRef.current = state.idempotencyKey ?? null;

    let cancelled = false;
    setPixTimer(300);
    setPixError('');
    setPixExpired(false);
    setPixLoading(true);
    speakText(`Gerando código PIX no valor de R$ ${state.value.toFixed(2)}.`);

    (async () => {
      try {
        const res = await fetchWithTimeout('/api/create-payment', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            method: 'pix',
            amount: state.value,
            description: `${state.category} - ${brand.name}`,
            category: state.category,
            brandId: brand.id,
            idempotencyKey: state.idempotencyKey,
            totemId,
          }),
        });
        const data = await res.json();
        if (cancelled) return;
        if (!res.ok || !data.qr_code) {
          setPixError('Não foi possível gerar o PIX agora. Tente novamente.');
          setPixLoading(false);
          return;
        }
        setState((prev) => ({
          ...prev,
          mpPaymentId: data.id,
          mpQrCode: data.qr_code,
          mpQrCodeBase64: data.qr_code_base64,
        }));
        updateAttempt({ mpPaymentId: data.id, mpQrCode: data.qr_code, mpQrCodeBase64: data.qr_code_base64 });
        setPixLoading(false);
        speakText('Código PIX pronto. Aponte o celular ou copie a chave para pagar.');
      } catch (e: any) {
        if (!cancelled) {
          console.error(e);
          setPixError(
            e?.name === 'AbortError'
              ? 'Tempo esgotado ao gerar o PIX. Tente novamente.'
              : 'Falha de conexão ao gerar o PIX.'
          );
          setPixLoading(false);
        }
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [state.step, pixAttemptNonce]);

  // Countdown display for the real PIX expiration window. Hits 0 -> expired
  // state with explicit retry/cancel actions, instead of freezing forever.
  useEffect(() => {
    if (state.step !== 'pix' || pixLoading || pixExpired) return;

    const timer = setInterval(() => {
      setPixTimer((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          setPixExpired(true);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [state.step, pixLoading, pixExpired]);

  // Poll Mercado Pago for real confirmation instead of a fake timer. Stops
  // once expired — the webhook (primary source of truth) and the manual
  // recheck button remain available for a shopper who paid right at the wire.
  useEffect(() => {
    if (state.step !== 'pix' || !state.mpPaymentId || pixExpired) return;

    const poll = setInterval(async () => {
      try {
        const res = await fetch(`/api/check-payment?id=${state.mpPaymentId}&brandId=${encodeURIComponent(brand.id)}`);
        const data = await res.json();
        if (data.status === 'approved') {
          clearInterval(poll);
          handleCompletePayment();
        }
      } catch (e) {
        console.error('Falha ao checar status do PIX:', e);
      }
    }, 4000);

    return () => clearInterval(poll);
  }, [state.step, state.mpPaymentId, pixExpired]);

  const handleRetryPix = () => {
    playTapSound();
    // If there was already a charge (expired PIX, not a creation failure),
    // void it at the provider instead of leaving it pending forever while a
    // fresh one is minted.
    if (state.mpPaymentId) {
      void fetch('/api/cancel-payment', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: state.mpPaymentId, brandId: brand.id }),
      }).catch(() => {});
    }
    clearAttempt();
    const attempt = startAttempt({ brandId: brand.id, category: state.category, value: state.value, method: 'pix', step: 'pix' });
    setState((prev) => ({ ...prev, mpPaymentId: undefined, mpQrCode: undefined, mpQrCodeBase64: undefined, idempotencyKey: attempt.idempotencyKey }));
    setPixExpired(false);
    setPixError('');
    setPixAttemptNonce((n) => n + 1);
  };

  const handleCancelPix = () => {
    playTapSound();
    // Fire-and-forget: void the charge at Mercado Pago and mark the ledger
    // row canceled right away, instead of leaving it pending for ~5 min
    // until it expires on its own. Never blocks the return to Home.
    if (state.mpPaymentId) {
      void fetch('/api/cancel-payment', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: state.mpPaymentId, brandId: brand.id }),
      }).catch(() => {});
    }
    clearAttempt();
    onGoHome();
  };

  const handleRetryCard = () => {
    playTapSound();
    setCardError('');
    setCardAttemptNonce((n) => n + 1);
  };

  const handleCheckNow = async () => {
    if (!state.mpPaymentId) return;
    setCheckingNow(true);
    playTapSound();
    try {
      const res = await fetch(`/api/check-payment?id=${state.mpPaymentId}`);
      const data = await res.json();
      if (data.status === 'approved') {
        handleCompletePayment();
      } else {
        speakText('Ainda não identificamos o pagamento. Aguarde alguns segundos após pagar.');
      }
    } catch (e) {
      console.error(e);
    } finally {
      setCheckingNow(false);
    }
  };

  // Debit — no real terminal/Mercado Pago Point integration yet. Runs as an
  // honest, clearly-labeled simulation with a real state machine (matching
  // the spec's Conectando/Aguardando/Processando/Aprovado/Recusado/
  // Cancelado/Erro), and still writes one ledger row per attempt via
  // api/simulate-debit.js — the old fake 6s auto-approve wrote nothing.
  useEffect(() => {
    if (state.step !== 'card') return;

    let cancelled = false;
    setDebitState('connecting');
    setDebitContributionId(null);

    (async () => {
      try {
        const res = await fetchWithTimeout('/api/simulate-debit', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ action: 'start', category: state.category, amount: state.value, brandId: brand.id, totemId }),
        });
        const data = await res.json();
        if (!cancelled && data?.id) setDebitContributionId(data.id);
      } catch (e) {
        console.error('Falha ao registrar tentativa de débito simulada:', e);
      }
      if (cancelled) return;
      speakText(`Aguardando pagamento no cartão de débito no valor de R$ ${state.value.toFixed(2)}. Por favor, insira ou aproxime o seu cartão na maquininha.`);
      const t = setTimeout(() => {
        if (!cancelled) setDebitState('waiting_card');
      }, 1200);
      return () => clearTimeout(t);
    })();

    return () => {
      cancelled = true;
    };
  }, [state.step, debitAttemptNonce]);

  const resolveDebit = async (outcome: 'approved' | 'declined' | 'canceled' | 'error') => {
    setDebitState(outcome === 'canceled' ? 'canceled' : 'processing');
    if (debitContributionId) {
      try {
        await fetchWithTimeout('/api/simulate-debit', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ action: 'resolve', id: debitContributionId, outcome }),
        });
      } catch (e) {
        console.error('Falha ao resolver tentativa de débito simulada:', e);
      }
    }
    if (outcome === 'approved') {
      playSuccessSound();
      handleCompletePayment();
    } else {
      setDebitState(outcome);
    }
  };

  const handleDebitCancel = () => {
    playTapSound();
    void resolveDebit('canceled');
    onGoHome();
  };

  const handleDebitRetry = () => {
    playTapSound();
    setDebitAttemptNonce((n) => n + 1);
  };

  const formatTimer = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const handleCopyKey = () => {
    if (!state.mpQrCode) return;
    playSuccessSound();
    navigator.clipboard.writeText(state.mpQrCode);
    setCopied(true);
    speakText('Chave Copiada');
    setTimeout(() => setCopied(false), 3000);
  };

  const categories = brand.id === 'imocarwash' ? [
    { title: lang === 'en' ? 'Simple Wash' : lang === 'es' ? 'Lavado Simple' : lang === 'de' ? 'Einfache Wäsche' : 'Lavagem Simples', icon: 'local_car_wash', desc: lang === 'en' ? 'Exterior wash with soap and water drying.' : lang === 'es' ? 'Lavado exterior con jabón y secado de agua.' : lang === 'de' ? 'Außenwäsche mit Seife und Trocknung.' : 'Lavagem externa com água, shampoo e secagem rápida.' },
    { title: lang === 'en' ? 'Triple Wash' : lang === 'es' ? 'Lavado Triple' : lang === 'de' ? 'Triple-Wäsche' : 'Lavagem Tripla', icon: 'wash', desc: lang === 'en' ? 'Exterior wash, underbody protection and hot wax.' : lang === 'es' ? 'Lavado exterior, protección de bajos y cera caliente.' : lang === 'de' ? 'Außenwäsche, Unterbodenschutz und Heißwachs.' : 'Lavagem externa completa com proteção de chassi e cera quente.' },
    { title: lang === 'en' ? 'Ultra HD Premium (Ceramic XTR)' : lang === 'es' ? 'Ultra HD Premium (Ceramic XTR)' : lang === 'de' ? 'Ultra HD Premium (Ceramic XTR)' : 'Ultra HD Premium (Ceramic XTR)', icon: 'auto_clean_detail', desc: lang === 'en' ? 'Our best wash with Ceramic XTR coating protection and tyre shine.' : lang === 'es' ? 'Nuestro mejor lavado con Ceramic XTR y abrillantador de neumáticos.' : lang === 'de' ? 'Unsere beste Wäsche mit Ceramic XTR Lackschutz und Reifenpflege.' : 'Nossa melhor lavagem com película protetora Ceramic XTR e brilho de pneus.' },
    { title: lang === 'en' ? 'IMO Card Reload' : lang === 'es' ? 'Recarga de Tarjeta IMO' : lang === 'de' ? 'IMO-Karte aufladen' : 'Recarga de Cartão IMO', icon: 'credit_card', desc: lang === 'en' ? 'Add balance to your customer loyalty card for future washes.' : lang === 'es' ? 'Añada saldo a su tarjeta de fidelización para futuros lavados.' : lang === 'de' ? 'Guthaben auf Ihre Kundenkarte für zukünftige Wäschen laden.' : 'Adicione saldo ao seu cartão de fidelidade IMO para futuras lavagens.' }
  ] : brand.id === 'ymcactx' ? [
    { title: 'Mensalidade Geral', icon: 'payments', desc: 'Mensalidade padrão de treinamento e uso da quadra.' },
    { title: 'Inscrição em Torneio', icon: 'emoji_events', desc: 'Taxa de inscrição para copas locais, uniformes e taxas de arbitragem.' },
    { title: 'Bolsas Esportivas', icon: 'volunteer_activism', desc: 'Fundo para subsidiar mensalidades e uniformes de atletas carentes.' },
    { title: 'Manutenção de Quadra', icon: 'construction', desc: 'Apoio para melhoria de cestas, bolas e infraestrutura do ginásio.' }
  ] : brand.type === 'synagogue' ? [
    { title: 'Tsedaká Geral', icon: 'payments', desc: 'Contribuição regular para os custos e preces da sinagoga.' },
    { title: 'Estudos e Shabat', icon: 'volunteer_activism', desc: 'Oferta voluntária para festividades de Cabalat Shabat e shiurim.' },
    { title: 'Auxílio de Israel', icon: 'public', desc: 'Apoio direto a projetos humanitários e de assistência em Israel.' },
    { title: 'Ação Social (Chesed)', icon: 'spa', desc: 'Distribuição de cestas kosher e auxílio aos necessitados locais.' }
  ] : [
    { title: 'Dízimo', icon: 'payments', desc: 'Devolução regular de comunhão financeira de dízimo.' },
    { title: 'Oferta', icon: 'volunteer_activism', desc: 'Oferta voluntária para sustentação da casa e dos cultos.' },
    { title: 'Missões', icon: 'public', desc: 'Sustento direto aos nossos missionários no sertão e no exterior.' },
    { title: 'Projetos Sociais', icon: 'spa', desc: 'Sustentação de cestas básicas e assistência comunitária.' }
  ];

  const presetValues = [20, 50, 100, 200];

  const handleSelectCategory = (cat: string) => {
    playTapSound();
    setState((prev) => ({ ...prev, category: cat, step: 'value' }));
  };

  const handleSelectPreset = (val: number) => {
    playSuccessSound();
    setState((prev) => ({ ...prev, value: val, customValue: '', step: 'method' }));
  };

  const handleCustomValueKeyPress = (char: string) => {
    if (char === 'BACKSPACE') {
      setState((prev) => ({ ...prev, customValue: prev.customValue.slice(0, -1) }));
      return;
    }
    if (char === 'CLEAR') {
      setState((prev) => ({ ...prev, customValue: '' }));
      return;
    }
    
    // limit custom value length
    if (state.customValue.length < 7) {
      setState((prev) => ({ ...prev, customValue: prev.customValue + char }));
    }
  };

  const handleCustomValueConfirm = () => {
    const val = parseFloat(state.customValue);
    if (isNaN(val) || val <= 0) {
      alert('Por favor, informe um valor numérico válido.');
      return;
    }
    playSuccessSound();
    setState((prev) => ({ ...prev, value: val, step: 'method' }));
  };

  const handleCompletePayment = () => {
    // Save registration to localStorage
    const methodLabel = state.paymentMethod === 'pix' ? 'PIX' : state.paymentMethod === 'credit' ? 'Crédito' : 'Débito';
    const newReg = {
      id: `donation_${Date.now()}`,
      name: `Contribuição no Valor de R$ ${state.value.toFixed(2)}`,
      phone: '-',
      email: '-',
      type: `${brand.termDonation}: ${state.category} (${methodLabel}${state.mpPaymentId ? ` - MP#${state.mpPaymentId}` : ''})`,
      brandId: brand.id,
      date: new Date().toISOString()
    };

    void saveRegistration(newReg);
    clearAttempt();

    playSuccessSound();
    setSuccessCountdown(20);
    setState((prev) => ({ ...prev, step: 'success' }));
  };

  const handleConfirmPayment = () => {
    if (submitting) return;
    if (!totemId) {
      // create-payment/simulate-debit now require a bound totemId — don't
      // navigate into a step that would just fail at the network call.
      // App.tsx is already retrying resolution in the background; this
      // message clears itself the next time the shopper taps Confirmar.
      setTotemPendingMessage(true);
      return;
    }
    playSuccessSound();
    const method = state.paymentMethod;
    const nextStep = method === 'pix' ? 'pix' : method === 'credit' ? 'mp_card' : 'card';

    if (method === 'pix' || method === 'credit') {
      setSubmitting(true);
      const attempt = startAttempt({
        brandId: brand.id,
        category: state.category,
        value: state.value,
        method,
        step: nextStep as 'pix' | 'mp_card',
      });
      setState((prev) => ({ ...prev, step: nextStep, idempotencyKey: attempt.idempotencyKey }));
      // The guard only needs to cover the click itself — once the step
      // actually changes, the per-step creation effects take over.
      setTimeout(() => setSubmitting(false), 500);
    } else {
      setState((prev) => ({ ...prev, step: nextStep }));
    }
  };

  // Auto-return to Home after a safe reading window, alongside the existing
  // manual "Voltar ao Início" button (kept, unchanged).
  useEffect(() => {
    if (state.step !== 'success') return;
    const timer = setInterval(() => {
      setSuccessCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          onGoHome();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [state.step]);

  const handleGoBack = () => {
    playTapSound();
    if (state.step === 'value') setState(prev => ({ ...prev, step: 'category' }));
    else if (state.step === 'method') setState(prev => ({ ...prev, step: 'value' }));
    else if (state.step === 'confirmation') setState(prev => ({ ...prev, step: 'method' }));
    else if (state.step === 'pix' || state.step === 'card' || state.step === 'mp_card') setState(prev => ({ ...prev, step: 'confirmation' }));
    else onBack();
  };

  const STEP_ORDER: DonationState['step'][] = ['category', 'value', 'method', 'confirmation', 'pix', 'success'];
  const stepLabels = ['Operação', 'Valor', 'Pagamento', 'Confirmação', 'Cobrança', 'Concluído'];
  const currentStepIndex = (() => {
    if (state.step === 'card' || state.step === 'mp_card') return 4; // agrupa com "pix" (índice da etapa "Cobrança")
    const idx = STEP_ORDER.indexOf(state.step);
    return idx === -1 ? 0 : idx;
  })();

  return (
    <div className={`relative bg-brand-light text-[#191c1e] flex flex-col overflow-x-hidden font-sans submodule-view ${
      state.step === 'category' ? 'h-screen overflow-hidden' : 'min-h-screen justify-between'
    }`}>
      
      {/* Dynamic client-specific identity background */}
      <div 
        className="absolute inset-0 z-0 bg-cover bg-center bg-no-repeat opacity-[0.35] pointer-events-none transition-all duration-700"
        style={{ backgroundImage: `url(${hoveredCategoryBg || brand.bgUrl})`, filter: 'blur(3px)' }}
      />
      <div 
        className="absolute inset-0 z-0 backdrop-blur-lg pointer-events-none" 
        style={{
          background: `linear-gradient(135deg, rgba(var(--color-brand-red-rgb), 0.08) 0%, rgba(255, 255, 255, 0.85) 60%, rgba(244, 246, 248, 0.95) 100%)`
        }}
      />

      <header className="fixed top-0 left-0 w-full z-45 bg-white/90 backdrop-blur-md px-4 sm:px-6 md:px-10 py-3 md:py-4 border-b border-[#eceef1] flex items-center justify-between gap-4 shadow-sm relative z-10">
        <div className="min-w-0 flex flex-col gap-0.5">
          <p className="text-brand-red text-sm sm:text-base md:text-lg font-extrabold uppercase tracking-widest leading-none">
            {brand.termDonations}
          </p>
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-brand-dark leading-tight truncate">
            {brand.id === 'imocarwash' || brand.id === 'ymcactx'
              ? `${brand.termDonations} ${brand.name}`
              : `Contribuições ${brand.name}`}
          </h1>
        </div>

        <div className="shrink-0">
          <HeaderClock />
        </div>
      </header>

      {/* Progress indicator — hidden on the fullscreen category grid */}
      {state.step !== 'category' && (
        <div className="fixed top-[64px] sm:top-[76px] md:top-[84px] left-0 w-full z-40 bg-white/80 backdrop-blur-md border-b border-slate-200 px-4 sm:px-6 md:px-10 py-2.5 flex items-center justify-center gap-1.5 sm:gap-2.5">
          {stepLabels.map((label, idx) => (
            <React.Fragment key={label}>
              <div className="flex items-center gap-1.5 shrink-0">
                <span
                  className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-black transition-colors ${
                    idx < currentStepIndex
                      ? 'bg-emerald-500 text-white'
                      : idx === currentStepIndex
                      ? 'bg-brand-red text-white'
                      : 'bg-slate-200 text-slate-500'
                  }`}
                >
                  {idx < currentStepIndex ? '✓' : idx + 1}
                </span>
                <span
                  className={`text-[10px] sm:text-xs font-black uppercase tracking-wider hidden sm:inline ${
                    idx === currentStepIndex ? 'text-brand-red' : idx < currentStepIndex ? 'text-emerald-600' : 'text-slate-400'
                  }`}
                >
                  {label}
                </span>
              </div>
              {idx < stepLabels.length - 1 && (
                <div className={`w-4 sm:w-8 h-0.5 rounded-full shrink-0 ${idx < currentStepIndex ? 'bg-emerald-400' : 'bg-slate-200'}`} />
              )}
            </React.Fragment>
          ))}
        </div>
      )}

      {/* Main interactive area */}
      <main className={`flex-grow relative z-10 w-full flex flex-col ${
        state.step === 'category'
          ? 'pt-[5.5rem] md:pt-[6rem] pb-24 px-1 min-h-0'
          : 'pt-36 md:pt-40 pb-32 px-6 md:px-20 max-w-[1550px] mx-auto justify-center'
      }`}>
        
        {/* STEP 1: CATEGORY SELECTION */}
        {state.step === 'category' && (
          <div className="flex-1 grid grid-cols-2 grid-rows-2 gap-1 w-full h-full min-h-0 animate-fade-in">
            {categories.map((cat) => {
              const styles = getCategoryDetails(cat.icon);
              return (
                <button
                  key={cat.title}
                  type="button"
                  onClick={() => handleSelectCategory(cat.title)}
                  onMouseEnter={() => setHoveredCategoryBg(styles.bgUrl)}
                  onMouseLeave={() => setHoveredCategoryBg(null)}
                  className={`h-full w-full bg-slate-900/90 hover:bg-slate-900/40 backdrop-blur-2xl border border-white/10 ${styles.hoverBorder} ${styles.hoverBg} text-white rounded-lg p-4 md:p-6 flex flex-col justify-center items-center text-center cursor-pointer active:scale-[0.98] transition-all duration-300 shadow-lg relative overflow-hidden group`}
                >
                  <div 
                    className="absolute inset-0 z-0 bg-cover bg-center bg-no-repeat opacity-[0.08] group-hover:opacity-[0.22] transition-opacity duration-500 pointer-events-none"
                    style={{ backgroundImage: `url(${styles.bgUrl})`, filter: 'blur(1px)' }}
                  />
                  <div className={`absolute inset-0 bg-gradient-to-tr ${styles.bgGradient} to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none`} />
                  
                  <span className={`material-symbols-outlined !text-[72px] md:!text-[96px] lg:!text-[120px] ${styles.iconColor} group-hover:scale-110 transition-transform duration-500 drop-shadow-md z-10 mb-3 md:mb-4`}>
                    {cat.icon}
                  </span>
                  
                  <div className="text-center z-10 space-y-2 md:space-y-3 px-2">
                    <span className="text-3xl md:text-5xl lg:text-6xl font-black uppercase tracking-wider block text-white transition-colors duration-300 break-words drop-shadow-md leading-tight">
                      {cat.title}
                    </span>
                    <span className="text-lg md:text-2xl lg:text-3xl font-semibold text-white/85 block max-w-[90%] mx-auto leading-snug">
                      {cat.desc}
                    </span>
                  </div>

                  <div className="absolute -right-4 -bottom-4 opacity-[0.07] group-hover:opacity-[0.18] text-white transition-all duration-500 group-hover:rotate-12 group-hover:scale-125 z-0 pointer-events-none">
                    <span className="material-symbols-outlined !text-[180px] md:!text-[240px]">{cat.icon}</span>
                  </div>
                </button>
              );
            })}
          </div>
        )}


        {/* STEP 2: CHOOSE VALUE PRESET OR CUSTOM VALUE */}
        {state.step === 'value' && (
          <div className="space-y-6 animate-fade-in justify-center">
            <header className="text-center max-w-xl mx-auto">
              <span className="bg-brand-red/10 text-brand-red text-sm font-black tracking-widest px-3 py-1.5 rounded-full uppercase border border-brand-red/20">
                {state.category}
              </span>
              <h2 className="text-2xl md:text-3xl font-black text-brand-dark mt-3">
                Escolha o valor da contribuição
              </h2>
            </header>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-5xl mx-auto items-stretch">
              
              {/* Presets col */}
              <div className="space-y-3 flex flex-col justify-center">
                <span className="text-xs uppercase tracking-widest font-black text-slate-600 block text-center mb-1">
                  Valores Prontos
                </span>

                <div className="grid grid-cols-2 gap-4">
                  {presetValues.map((v) => (
                    <button
                      key={v}
                      type="button"
                      onClick={() => handleSelectPreset(v)}
                      className="key-tap relative overflow-hidden h-24 bg-white/95 hover:bg-white text-brand-dark hover:text-brand-red border-2 border-slate-200 hover:border-brand-red rounded-2xl text-2xl font-black flex items-center justify-center shadow-sm cursor-pointer transition-all hover:scale-[1.05] active:scale-[0.95] duration-200"
                    >
                      <div 
                        className="absolute inset-0 z-0 bg-cover bg-center bg-no-repeat opacity-[0.08] pointer-events-none"
                        style={{ backgroundImage: `url(${brand.bgUrl})`, filter: 'blur(1px)' }}
                      />
                      <span className="relative z-10">R$ {v}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Custom input with virtual keyboard */}
              <div className="relative overflow-hidden bg-white/90 backdrop-blur-md rounded-3xl p-8 border border-slate-200 flex flex-col justify-between space-y-4 shadow-sm">
                <div 
                  className="absolute inset-0 z-0 bg-cover bg-center bg-no-repeat opacity-[0.12] pointer-events-none"
                  style={{ backgroundImage: `url(${brand.bgUrl})`, filter: 'blur(2px)' }}
                />
                <div className="relative z-10 text-center">
                  <span className="text-xs uppercase tracking-widest font-black text-slate-500 block mb-1">
                    Valor Personalizado
                  </span>
                  
                  <div className="bg-white rounded-xl py-3 px-4 text-2xl font-black border border-slate-350 text-slate-800 tracking-tight flex items-center justify-center min-h-[58px] shadow-inner">
                    R$ {state.customValue || '0'}
                  </div>
                </div>

                {/* Reusable Keypad integration */}
                <div className="relative z-10 w-full">
                  <NumericKeypad 
                    onKeyPress={handleCustomValueKeyPress} 
                    onConfirm={handleCustomValueConfirm} 
                    confirmLabel="Confirmar Valor"
                  />
                </div>

                <p className="relative z-10 text-[10px] text-center text-slate-550 font-black">
                  Digite somente números sem pontos ou vírgulas
                </p>
              </div>

            </div>
          </div>
        )}

        {/* STEP 2.5: SELECT PAYMENT METHOD */}
        {state.step === 'method' && (
          <div className="space-y-6 animate-fade-in text-center max-w-5xl mx-auto">
            <header className="max-w-xl mx-auto">
              <span className="bg-brand-red/10 text-brand-red text-sm font-black tracking-widest px-3 py-1.5 rounded-full uppercase border border-brand-red/20">
                R$ {state.value.toFixed(2)} - {state.category}
              </span>
              <h2 className="text-3xl font-black text-brand-dark mt-3">
                Selecione a forma de pagamento
              </h2>
            </header>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4">
              {/* PIX Method */}
              {enabledMethods.includes('pix') && (
              <button
                type="button"
                onClick={() => {
                  playSuccessSound();
                  setState(prev => ({ ...prev, step: 'confirmation', paymentMethod: 'pix' }));
                }}
                className="relative overflow-hidden bg-white/95 hover:bg-white rounded-2xl p-8 border-2 border-slate-200 hover:border-brand-red cursor-pointer transition-all flex flex-col items-center text-center justify-between shadow-sm group hover:scale-[1.05] active:scale-[0.96] transition-all duration-300 min-h-[300px]"
              >
                <div 
                  className="absolute inset-0 z-0 bg-cover bg-center bg-no-repeat opacity-[0.08] pointer-events-none"
                  style={{ backgroundImage: `url(${brand.bgUrl})`, filter: 'blur(1px)' }}
                />
                <div className="relative z-10 w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mb-4 shrink-0">
                  <span className="material-symbols-outlined !text-4xl font-black">qr_code_2</span>
                </div>
                <div className="relative z-10 flex-grow">
                  <h3 className="font-extrabold text-2xl text-brand-dark mb-2 group-hover:text-brand-red transition-colors">PIX</h3>
                  <p className="text-sm text-slate-500 font-semibold leading-relaxed">
                    Pagamento instantâneo com QR Code ou Chave Copia e Cola.
                  </p>
                </div>
                <div className="relative z-10 mt-6 font-black text-sm uppercase text-slate-450 group-hover:text-brand-red tracking-wider shrink-0">
                  Selecionar PIX →
                </div>
              </button>
              )}

              {/* Credit Card Method (real Mercado Pago charge) */}
              {enabledMethods.includes('credit') && (
              <button
                type="button"
                onClick={() => {
                  playSuccessSound();
                  setState(prev => ({ ...prev, step: 'confirmation', paymentMethod: 'credit' }));
                }}
                className="relative overflow-hidden bg-white/95 hover:bg-white rounded-2xl p-8 border-2 border-slate-200 hover:border-brand-red cursor-pointer transition-all flex flex-col items-center text-center justify-between shadow-sm group hover:scale-[1.05] active:scale-[0.96] transition-all duration-300 min-h-[300px]"
              >
                <div 
                  className="absolute inset-0 z-0 bg-cover bg-center bg-no-repeat opacity-[0.08] pointer-events-none"
                  style={{ backgroundImage: `url(${brand.bgUrl})`, filter: 'blur(1px)' }}
                />
                <div className="relative z-10 w-16 h-16 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center mb-4 shrink-0">
                  <span className="material-symbols-outlined !text-4xl font-black">credit_card</span>
                </div>
                <div className="relative z-10 flex-grow">
                  <h3 className="font-extrabold text-2xl text-brand-dark mb-2 group-hover:text-brand-red transition-colors">Crédito</h3>
                  <p className="text-sm text-slate-500 font-semibold leading-relaxed">
                    Pague com seu cartão de crédito digitando os dados na tela, com segurança.
                  </p>
                </div>
                <div className="relative z-10 mt-6 font-black text-sm uppercase text-slate-450 group-hover:text-brand-red tracking-wider shrink-0">
                  Pagar no Crédito →
                </div>
              </button>
              )}

              {/* Debit Card Method */}
              {enabledMethods.includes('debit') && (
              <button
                type="button"
                onClick={() => {
                  playSuccessSound();
                  setState(prev => ({ ...prev, step: 'confirmation', paymentMethod: 'debit' }));
                }}
                className="relative overflow-hidden bg-white/95 hover:bg-white rounded-2xl p-8 border-2 border-slate-200 hover:border-brand-red cursor-pointer transition-all flex flex-col items-center text-center justify-between shadow-sm group hover:scale-[1.05] active:scale-[0.96] transition-all duration-300 min-h-[300px] md:col-span-2"
              >
                <div 
                  className="absolute inset-0 z-0 bg-cover bg-center bg-no-repeat opacity-[0.08] pointer-events-none"
                  style={{ backgroundImage: `url(${brand.bgUrl})`, filter: 'blur(1px)' }}
                />
                <div className="relative z-10 w-16 h-16 rounded-full bg-amber-100 text-amber-600 flex items-center justify-center mb-4 shrink-0">
                  <span className="material-symbols-outlined !text-4xl font-black">contactless</span>
                </div>
                <div className="relative z-10 flex-grow">
                  <h3 className="font-extrabold text-2xl text-brand-dark mb-2 group-hover:text-brand-red transition-colors">Débito</h3>
                  <p className="text-sm text-slate-500 font-semibold leading-relaxed">
                    Pagamento imediato em débito. Aproxime ou insira o seu cartão.
                  </p>
                </div>
                <div className="relative z-10 mt-6 font-black text-sm uppercase text-slate-450 group-hover:text-brand-red tracking-wider shrink-0">
                  Pagar no Débito →
                </div>
              </button>
              )}

              {enabledMethods.length === 0 && (
                <div className="md:col-span-2 text-center py-12 border-2 border-dashed border-slate-300 rounded-2xl text-slate-500 font-semibold text-sm">
                  Nenhuma forma de pagamento disponível no momento. Procure um responsável.
                </div>
              )}
            </div>
          </div>
        )}

        {/* STEP 2.6: CONFIRMATION */}
        {state.step === 'confirmation' && (
          <div className="space-y-6 animate-fade-in text-center max-w-lg mx-auto">
            <header className="max-w-xl mx-auto">
              <span className="bg-brand-red/10 text-brand-red text-sm font-black tracking-widest px-3 py-1.5 rounded-full uppercase border border-brand-red/20">
                Revise antes de continuar
              </span>
              <h2 className="text-3xl font-black text-brand-dark mt-3">Confirmar Contribuição</h2>
            </header>

            <div className="relative overflow-hidden bg-white/95 rounded-3xl p-8 border-2 border-slate-200 shadow-lg text-left space-y-5">
              <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                <span className="text-xs font-black uppercase tracking-wider text-slate-450">Categoria</span>
                <span className="text-lg font-extrabold text-brand-dark">{state.category}</span>
              </div>
              <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                <span className="text-xs font-black uppercase tracking-wider text-slate-450">Valor</span>
                <span className="text-2xl font-black text-brand-red">R$ {state.value.toFixed(2)}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs font-black uppercase tracking-wider text-slate-450">Forma de Pagamento</span>
                <span className="text-lg font-extrabold text-brand-dark flex items-center gap-2">
                  <span className="material-symbols-outlined !text-xl">
                    {state.paymentMethod === 'pix' ? 'qr_code_2' : state.paymentMethod === 'credit' ? 'credit_card' : 'contactless'}
                  </span>
                  {state.paymentMethod === 'pix' ? 'PIX' : state.paymentMethod === 'credit' ? 'Crédito' : 'Débito'}
                </span>
              </div>
            </div>

            <button
              type="button"
              onClick={handleConfirmPayment}
              disabled={submitting}
              className="w-full h-16 text-white font-black rounded-2xl flex items-center justify-center gap-3 cursor-pointer shadow-md active:scale-[0.98] transition-transform text-lg disabled:opacity-60 disabled:cursor-not-allowed"
              style={{
                background: `linear-gradient(135deg, ${brand.primaryColor} 0%, ${brand.primaryColorHover} 100%)`,
                boxShadow: `0 10px 25px ${brand.primaryColor}55`
              }}
            >
              <span className={`material-symbols-outlined !text-2xl ${submitting ? 'animate-spin' : ''}`}>
                {submitting ? 'progress_activity' : 'check_circle'}
              </span>
              <span>{submitting ? 'Confirmando...' : 'Confirmar e Continuar'}</span>
            </button>
            {totemPendingMessage && (
              <p className="text-xs font-bold text-amber-600 text-center">
                Identificando o totem, aguarde um instante e toque em Confirmar novamente.
              </p>
            )}
          </div>
        )}

        {/* STEP 3: PIX QR CODE DISPLAY AND SIMULATE */}
        {state.step === 'pix' && (
          <div className="space-y-6 animate-fade-in text-center max-w-3xl mx-auto">
            <header className="space-y-2">
              <span className="text-xs uppercase tracking-widest font-black text-slate-500 block">PIX Facilitado</span>
              <h2 className="text-2xl font-black text-brand-dark">Aproxime o Celular</h2>
              <div className="text-xl font-extrabold text-brand-red bg-brand-red/10 rounded-full px-6 py-2.5 inline-block border border-brand-red/30 shadow-sm">
                Valor: R$ {state.value.toFixed(2)} ({state.category})
              </div>
            </header>

            {/* Simulated PIX QR display */}
            <div className="relative overflow-hidden bg-white/90 backdrop-blur-md rounded-3xl p-6 border-2 border-slate-200 shadow-lg flex flex-col items-center">
              <div 
                className="absolute inset-0 z-0 bg-cover bg-center bg-no-repeat opacity-[0.12] pointer-events-none"
                style={{ backgroundImage: `url(${brand.bgUrl})`, filter: 'blur(2px)' }}
              />
              <div className="relative z-10 flex flex-col items-center w-full">
                {pixLoading && (
                  <div className="w-80 h-80 md:w-96 md:h-96 flex flex-col items-center justify-center gap-3 text-slate-500">
                    <span className="material-symbols-outlined !text-5xl animate-spin">progress_activity</span>
                    <span className="text-xs font-black uppercase tracking-wider">Gerando PIX real...</span>
                  </div>
                )}

                {!pixLoading && pixError && (
                  <div className="w-80 h-80 md:w-96 md:h-96 flex flex-col items-center justify-center gap-4 text-red-500 text-center px-4">
                    <span className="material-symbols-outlined !text-5xl">error</span>
                    <span className="text-xs font-bold">{pixError}</span>
                  </div>
                )}

                {!pixLoading && !pixError && pixExpired && (
                  <div className="w-80 h-80 md:w-96 md:h-96 flex flex-col items-center justify-center gap-4 text-slate-500 text-center px-4">
                    <span className="material-symbols-outlined !text-5xl text-amber-500">schedule</span>
                    <span className="text-sm font-black text-slate-700">O código PIX expirou</span>
                    <span className="text-xs font-semibold">Gere um novo código para continuar.</span>
                  </div>
                )}

                {!pixLoading && !pixError && !pixExpired && state.mpQrCodeBase64 && (
                  <div className="relative w-80 h-80 md:w-96 md:h-96 group border-2 border-brand-red/20 rounded-2xl overflow-hidden p-1 shadow-inner bg-slate-50">
                    <img
                      className="w-full h-full object-contain rounded-xl pointer-events-none opacity-90"
                      src={`data:image/png;base64,${state.mpQrCodeBase64}`}
                      alt="PIX QR Code"
                    />
                    {/* Scan line overlay */}
                    <div className="absolute left-0 w-full h-1 bg-brand-red scan-line rounded-full opacity-80" />
                  </div>
                )}

                {/* Countdown timer display */}
                {!pixLoading && !pixError && !pixExpired && (
                  <div className="mt-4 flex items-center justify-center gap-2 text-slate-700 bg-slate-100 border border-slate-200 px-4 py-2 rounded-xl">
                    <span className="material-symbols-outlined text-brand-red !text-lg animate-spin">autorenew</span>
                    <span className="text-xs font-black uppercase tracking-wider">O código expira em:</span>
                    <span className="text-sm font-extrabold text-brand-red font-mono">{formatTimer(pixTimer)}</span>
                  </div>
                )}

                {/* Copy paste button */}
                {!pixLoading && !pixError && !pixExpired && state.mpQrCode && (
                  <div className="mt-4 w-full">
                    <button
                      type="button"
                      onClick={handleCopyKey}
                      className="w-full h-12 bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-300 rounded-xl font-bold flex items-center justify-center gap-2 cursor-pointer transition-colors active:scale-95 text-xs uppercase tracking-wider"
                    >
                      <span className="material-symbols-outlined !text-base">content_copy</span>
                      <span>{copied ? 'Chave Copiada!' : 'Copiar Chave PIX Copia e Cola'}</span>
                    </button>
                  </div>
                )}

                {!pixExpired && !pixError && (
                  <p className="text-xs text-slate-500 font-semibold mt-4 leading-relaxed">
                    Abra o aplicativo do seu banco, selecione a opção "Pagar com PIX/QR Code" e aponte para o código acima para concluir. A confirmação é automática.
                  </p>
                )}

                {/* Retry/cancel — shown on error or expiry, so the user is never stuck */}
                {(pixError || pixExpired) && !pixLoading && (
                  <div className="mt-2 w-full grid grid-cols-2 gap-3">
                    <button
                      type="button"
                      onClick={handleRetryPix}
                      className="h-14 bg-emerald-600 hover:bg-emerald-700 text-white font-black rounded-xl flex items-center justify-center gap-2 cursor-pointer active:scale-95 transition-transform text-sm uppercase tracking-wider"
                    >
                      <span className="material-symbols-outlined !text-lg">refresh</span>
                      <span>Tentar Novamente</span>
                    </button>
                    <button
                      type="button"
                      onClick={handleCancelPix}
                      className="h-14 bg-slate-200 hover:bg-slate-300 text-slate-700 font-black rounded-xl flex items-center justify-center gap-2 cursor-pointer active:scale-95 transition-transform text-sm uppercase tracking-wider"
                    >
                      <span className="material-symbols-outlined !text-lg">close</span>
                      <span>Cancelar</span>
                    </button>
                  </div>
                )}
              </div>
            </div>

            {!pixLoading && !pixError && !pixExpired && (
              <button
                type="button"
                onClick={handleCheckNow}
                disabled={checkingNow}
                className="w-full h-16 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-60 text-white font-black rounded-2xl flex items-center justify-center gap-3 cursor-pointer shadow-md active:scale-[0.98] transition-transform text-lg"
              >
                <span className={`material-symbols-outlined !text-2xl ${checkingNow ? 'animate-spin' : ''}`}>
                  {checkingNow ? 'progress_activity' : 'refresh'}
                </span>
                <span>{checkingNow ? 'Verificando...' : 'Já Paguei, Verificar Agora'}</span>
              </button>
            )}
          </div>
        )}

        {/* STEP 3.5: DEBIT — honest simulation (no real terminal/MP Point yet) */}
        {state.step === 'card' && (
          <div className="space-y-6 animate-fade-in text-center max-w-3xl mx-auto">
            <header className="space-y-2">
              <span className="text-xs uppercase tracking-widest font-black text-slate-500 block">
                Pagamento em Cartão de Débito
              </span>
              <h2 className="text-2xl font-black text-brand-dark">Aproxime ou Insira o Cartão</h2>
              <div className="text-xl font-extrabold text-brand-red bg-brand-red/10 rounded-full px-6 py-2.5 inline-block border border-brand-red/30 shadow-sm">
                Valor: R$ {state.value.toFixed(2)} ({state.category})
              </div>
            </header>

            {/* Persistent, unmissable notice — this never charges a real card */}
            <div className="bg-amber-100 border-2 border-amber-300 text-amber-800 rounded-xl px-4 py-2.5 text-xs font-black uppercase tracking-wider inline-flex items-center gap-2 mx-auto">
              <span className="material-symbols-outlined !text-lg">science</span>
              <span>Simulação — sem integração real de maquininha</span>
            </div>

            {/* Card Machine visual */}
            <div className="relative overflow-hidden bg-white/90 backdrop-blur-md rounded-3xl p-8 border-2 border-slate-200 shadow-lg flex flex-col items-center space-y-6">
              <div
                className="absolute inset-0 z-0 bg-cover bg-center bg-no-repeat opacity-[0.12] pointer-events-none"
                style={{ backgroundImage: `url(${brand.bgUrl})`, filter: 'blur(2px)' }}
              />
              <div className="relative z-10 flex flex-col items-center w-full space-y-6">
                <div className="relative w-48 h-48 flex items-center justify-center">
                  <div className="absolute inset-0 bg-brand-red/5 rounded-full animate-ping opacity-30 animate-duration-3000" />
                  <div className="relative w-36 h-36 bg-slate-800 text-white rounded-2xl p-4 shadow-xl border border-slate-700 flex flex-col justify-between">
                    <div className="bg-emerald-950 text-emerald-400 font-mono text-[10px] p-2 rounded border border-emerald-900 text-left space-y-1 shadow-inner min-h-[50px]">
                      <div className="flex justify-between">
                        <span>VALOR:</span>
                        <span>R$ {state.value.toFixed(2)}</span>
                      </div>
                      <div className="animate-pulse flex items-center gap-1 mt-1 text-[9px] text-emerald-300">
                        <span className="material-symbols-outlined !text-[10px]">contactless</span>
                        <span>{debitState === 'connecting' ? 'CONECTANDO...' : debitState === 'processing' ? 'PROCESSANDO...' : 'APROXIME OU INSIRA'}</span>
                      </div>
                    </div>
                    <div className="grid grid-cols-3 gap-1 pt-2">
                      {[1,2,3,4,5,6,7,8,9].map(n => (
                        <div key={n} className="w-full h-1.5 bg-slate-700 rounded-[2px]" />
                      ))}
                      <div className="h-1.5 bg-red-600 rounded-[2px]" />
                      <div className="h-1.5 bg-amber-500 rounded-[2px]" />
                      <div className="h-1.5 bg-emerald-600 rounded-[2px]" />
                    </div>
                  </div>
                  <div className="absolute -bottom-2 -right-2 bg-brand-red text-white p-3 rounded-full shadow-lg border-2 border-white animate-bounce">
                    <span className="material-symbols-outlined !text-2xl">contactless</span>
                  </div>
                </div>

                {/* Status by debit state */}
                {debitState === 'connecting' && (
                  <div className="flex items-center justify-center gap-2 text-slate-700 bg-slate-100 border border-slate-200 px-5 py-3 rounded-2xl w-full">
                    <span className="material-symbols-outlined text-brand-red !text-xl animate-spin">progress_activity</span>
                    <span className="text-xs font-black uppercase tracking-wider">Conectando ao terminal...</span>
                  </div>
                )}
                {debitState === 'waiting_card' && (
                  <div className="flex items-center justify-center gap-2 text-slate-700 bg-slate-100 border border-slate-200 px-5 py-3 rounded-2xl w-full">
                    <span className="material-symbols-outlined text-brand-red !text-xl animate-pulse">sync_saved_locally</span>
                    <span className="text-xs font-black uppercase tracking-wider">Aguardando cartão...</span>
                  </div>
                )}
                {debitState === 'processing' && (
                  <div className="flex items-center justify-center gap-2 text-slate-700 bg-slate-100 border border-slate-200 px-5 py-3 rounded-2xl w-full">
                    <span className="material-symbols-outlined text-brand-red !text-xl animate-spin">progress_activity</span>
                    <span className="text-xs font-black uppercase tracking-wider">Processando...</span>
                  </div>
                )}
                {(debitState === 'declined' || debitState === 'error' || debitState === 'canceled') && (
                  <div className="flex items-center justify-center gap-2 text-red-600 bg-red-50 border border-red-200 px-5 py-3 rounded-2xl w-full">
                    <span className="material-symbols-outlined !text-xl">error</span>
                    <span className="text-xs font-black uppercase tracking-wider">
                      {debitState === 'declined' ? 'Recusado' : debitState === 'error' ? 'Erro no terminal' : 'Cancelado'}
                    </span>
                  </div>
                )}

                <p className="text-xs text-slate-500 font-semibold leading-relaxed">
                  Utilize o leitor de cartões integrado na lateral do totem. Como não há maquininha real conectada nesta versão, use os controles abaixo (uso da equipe) para simular o resultado.
                </p>
              </div>
            </div>

            {debitState === 'waiting_card' && (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <button
                  type="button"
                  onClick={() => resolveDebit('approved')}
                  className="h-16 bg-emerald-600 hover:bg-emerald-700 text-white font-black rounded-2xl flex items-center justify-center gap-2 cursor-pointer shadow-md active:scale-[0.98] transition-transform text-sm uppercase tracking-wider"
                >
                  <span className="material-symbols-outlined !text-xl">check_circle</span>
                  <span>Simular Aprovado</span>
                </button>
                <button
                  type="button"
                  onClick={() => resolveDebit('declined')}
                  className="h-16 bg-amber-500 hover:bg-amber-600 text-white font-black rounded-2xl flex items-center justify-center gap-2 cursor-pointer shadow-md active:scale-[0.98] transition-transform text-sm uppercase tracking-wider"
                >
                  <span className="material-symbols-outlined !text-xl">cancel</span>
                  <span>Simular Recusado</span>
                </button>
                <button
                  type="button"
                  onClick={() => resolveDebit('error')}
                  className="h-16 bg-slate-500 hover:bg-slate-600 text-white font-black rounded-2xl flex items-center justify-center gap-2 cursor-pointer shadow-md active:scale-[0.98] transition-transform text-sm uppercase tracking-wider"
                >
                  <span className="material-symbols-outlined !text-xl">error</span>
                  <span>Simular Erro</span>
                </button>
              </div>
            )}

            {(debitState === 'declined' || debitState === 'error') && (
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={handleDebitRetry}
                  className="h-14 bg-emerald-600 hover:bg-emerald-700 text-white font-black rounded-xl flex items-center justify-center gap-2 cursor-pointer active:scale-95 transition-transform text-sm uppercase tracking-wider"
                >
                  <span className="material-symbols-outlined !text-lg">refresh</span>
                  <span>Tentar Novamente</span>
                </button>
                <button
                  type="button"
                  onClick={handleDebitCancel}
                  className="h-14 bg-slate-200 hover:bg-slate-300 text-slate-700 font-black rounded-xl flex items-center justify-center gap-2 cursor-pointer active:scale-95 transition-transform text-sm uppercase tracking-wider"
                >
                  <span className="material-symbols-outlined !text-lg">close</span>
                  <span>Cancelar</span>
                </button>
              </div>
            )}

            {(debitState === 'connecting' || debitState === 'waiting_card') && (
              <button
                type="button"
                onClick={handleDebitCancel}
                className="w-full h-14 bg-slate-200 hover:bg-slate-300 text-slate-700 font-black rounded-xl flex items-center justify-center gap-2 cursor-pointer active:scale-95 transition-transform text-sm uppercase tracking-wider"
              >
                <span className="material-symbols-outlined !text-lg">close</span>
                <span>Cancelar</span>
              </button>
            )}
          </div>
        )}

        {/* STEP 3.6: REAL MERCADO PAGO CREDIT CARD PAYMENT */}
        {state.step === 'mp_card' && (
          <div className="space-y-6 animate-fade-in text-center max-w-md mx-auto">
            <header className="space-y-2">
              <span className="text-xs uppercase tracking-widest font-black text-slate-500 block">Pagamento Real no Cartão de Crédito</span>
              <h2 className="text-2xl font-black text-brand-dark">Preencha os Dados do Cartão</h2>
              <div className="text-xl font-extrabold text-brand-red bg-brand-red/10 rounded-full px-6 py-2.5 inline-block border border-brand-red/30 shadow-sm">
                Valor: R$ {state.value.toFixed(2)} ({state.category})
              </div>
            </header>

            <div className="relative overflow-hidden bg-white rounded-3xl p-4 md:p-6 border-2 border-slate-200 shadow-lg text-left">
              {cardError && (
                <div className="mb-4 space-y-3">
                  <div className="flex items-center gap-2 text-red-600 bg-red-50 border border-red-200 rounded-xl px-4 py-3 text-sm font-bold">
                    <span className="material-symbols-outlined !text-xl">error</span>
                    <span>{cardError}</span>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <button
                      type="button"
                      onClick={handleRetryCard}
                      className="h-12 bg-emerald-600 hover:bg-emerald-700 text-white font-black rounded-xl flex items-center justify-center gap-2 cursor-pointer active:scale-95 transition-transform text-xs uppercase tracking-wider"
                    >
                      <span className="material-symbols-outlined !text-base">refresh</span>
                      <span>Tentar Novamente</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => { playTapSound(); clearAttempt(); onGoHome(); }}
                      className="h-12 bg-slate-200 hover:bg-slate-300 text-slate-700 font-black rounded-xl flex items-center justify-center gap-2 cursor-pointer active:scale-95 transition-transform text-xs uppercase tracking-wider"
                    >
                      <span className="material-symbols-outlined !text-base">close</span>
                      <span>Cancelar</span>
                    </button>
                  </div>
                </div>
              )}

              {cardProcessing && (
                <div className="mb-4 flex items-center gap-2 text-slate-600 bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm font-bold">
                  <span className="material-symbols-outlined !text-xl animate-spin">progress_activity</span>
                  <span>Processando pagamento...</span>
                </div>
              )}

              {!brickReady && !cardError && (
                <div className="flex items-center justify-center gap-2 text-slate-500 py-10">
                  <span className="material-symbols-outlined !text-3xl animate-spin">progress_activity</span>
                  <span className="text-sm font-bold">Carregando formulário seguro...</span>
                </div>
              )}

              <div id="mp-card-brick-container" />
            </div>

            <p className="text-xs text-slate-500 font-semibold leading-relaxed">
              Pagamento processado diretamente pelo Mercado Pago. Os dados do cartão não passam pelo servidor do totem.
            </p>
          </div>
        )}

        {/* STEP 4: SUCCESS CONGRATS BIBLICAL QUOTE */}
        {state.step === 'success' && (
          <div className="relative overflow-hidden space-y-6 text-center animate-fade-in max-w-3xl mx-auto p-10 md:p-12 rounded-3xl bg-white/90 backdrop-blur-md shadow-xl border border-white/60">
            {/* Background image related to client virtual identity inside card */}
            <div 
              className="absolute inset-0 z-0 bg-cover bg-center bg-no-repeat opacity-[0.15] pointer-events-none"
              style={{ backgroundImage: `url(${brand.bgUrl})`, filter: 'blur(2px)' }}
            />
            <div className="relative z-10 space-y-6 flex flex-col items-center w-full">
              <div className="w-24 h-24 bg-brand-red rounded-full flex items-center justify-center mx-auto text-white shadow-md">
                <span className="material-symbols-outlined !text-5xl font-black animate-pulse">favorite</span>
              </div>

              <div className="space-y-2">
                <h2 className="text-3xl font-black text-brand-dark tracking-tight">Muito Obrigado!</h2>
                <p className="text-base text-slate-600 font-semibold">
                  {brand.id === 'imocarwash'
                    ? 'Obrigado por lavar conosco! Seu pagamento foi confirmado e a cancela foi liberada. Siga as instruções da pista.'
                    : brand.id === 'ymcactx'
                    ? 'Agradecemos o seu pagamento! O seu acesso às instalações esportivas e atividades foi registrado com sucesso.'
                    : brand.type === 'synagogue'
                    ? 'Sua tsedaká apoia os estudos da Torá, os serviços diários e as ações de auxílio social da nossa comunidade.'
                    : `Sua generosidade faz a igreja de Cristo crescer e transbordar amor e bênçãos em nossa região de ${brand.campusName}.`}
                </p>
              </div>

              {/* Comprovante */}
              <div className="w-full bg-slate-50 border-2 border-dashed border-slate-200 rounded-2xl p-5 text-left space-y-2.5">
                <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 text-center mb-1">Comprovante</p>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-slate-500 font-bold">Categoria</span>
                  <span className="text-slate-800 font-extrabold">{state.category}</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-slate-500 font-bold">Valor</span>
                  <span className="text-brand-red font-black">R$ {state.value.toFixed(2)}</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-slate-500 font-bold">Forma de Pagamento</span>
                  <span className="text-slate-800 font-extrabold">
                    {state.paymentMethod === 'pix' ? 'PIX' : state.paymentMethod === 'credit' ? 'Crédito' : 'Débito'}
                  </span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-slate-500 font-bold">Data e Hora</span>
                  <span className="text-slate-800 font-extrabold">{new Date().toLocaleString('pt-BR')}</span>
                </div>
                {state.mpPaymentId && (
                  <div className="flex items-center justify-between text-sm pt-2 border-t border-slate-200">
                    <span className="text-slate-500 font-bold">Código da Transação</span>
                    <span className="text-slate-600 font-mono text-xs">{state.mpPaymentId}</span>
                  </div>
                )}
              </div>

              {/* Snippet graphic style card */}
              {brand.id === 'imocarwash' ? (
                <div className="bg-white/80 rounded-2xl p-6 border border-slate-200 italic text-slate-500 shadow-sm w-full text-center">
                  "A lavagem de carros mais popular do mundo. Proteja o seu veículo dos sinais de envelhecimento."
                  <p className="font-extrabold text-brand-dark text-xs uppercase tracking-wider mt-3">Garantia de Qualidade</p>
                </div>
              ) : brand.id === 'ymcactx' ? (
                <div className="bg-white/80 rounded-2xl p-6 border border-slate-200 italic text-slate-500 shadow-sm w-full text-center">
                  "Desenvolvendo caráter, liderança e espírito de equipe através do esporte."
                  <p className="font-extrabold text-brand-dark text-xs uppercase tracking-wider mt-3">YMCA Central Texas</p>
                </div>
              ) : brand.type === 'synagogue' ? (
                <div className="bg-white/80 rounded-2xl p-6 border border-slate-200 italic text-slate-500 shadow-sm w-full text-center">
                  "Abra a sua mão para o seu irmão, para o seu pobre e para o seu necessitado na sua terra."
                  <p className="font-extrabold text-brand-dark text-xs uppercase tracking-wider mt-3">Deuteronômio 15:11</p>
                </div>
              ) : (
                <div className="bg-white/80 rounded-2xl p-6 border border-slate-200 italic text-slate-500 shadow-sm w-full text-center">
                  "Cada um dê conforme determinou em seu coração, não com pesar ou por obrigação, pois Deus ama a quem dá com alegria."
                  <p className="font-extrabold text-brand-dark text-xs uppercase tracking-wider mt-3">2 Coríntios 9:7</p>
                </div>
              )}

              <button
                type="button"
                onClick={onGoHome}
                className="h-16 px-12 text-white font-bold rounded-full shadow-lg hover:scale-105 active:scale-95 transition-all cursor-pointer text-base uppercase tracking-wider shrink-0 border border-white/10"
                style={{
                  background: `linear-gradient(135deg, ${brand.primaryColor} 0%, ${brand.primaryColorHover} 100%)`,
                  boxShadow: `0 4px 12px ${brand.primaryColor}40`
                }}
              >
                Voltar ao Início
              </button>

              <p className="text-[10px] uppercase tracking-widest font-bold text-slate-400">
                Voltando ao início em {successCountdown}s
              </p>
            </div>
          </div>
        )}

      </main>

      {/* Floating Back Button (Bottom Right) */}
      <button
        type="button"
        onClick={handleGoBack}
        className="fixed bottom-8 right-6 md:right-20 z-50 flex items-center gap-3 text-white font-black px-12 h-20 rounded-2xl transition-all duration-200 cursor-pointer hover:scale-105 active:scale-95 text-xl md:text-2xl shadow-xl border border-white/10"
        style={{
          background: `linear-gradient(135deg, ${brand.primaryColor} 0%, ${brand.primaryColorHover} 100%)`,
          boxShadow: `0 10px 25px ${brand.primaryColor}55`
        }}
      >
        <span className="material-symbols-outlined !text-3xl font-black">arrow_back</span>
        <span>Voltar</span>
      </button>

      {/* Spacing empty footer padding footer */}
      {state.step !== 'category' && <footer className="h-28 w-full" />}

    </div>
  );
}
