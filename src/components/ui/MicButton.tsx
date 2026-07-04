import { useEffect, useRef, useState } from 'react'

interface Props {
  onResult: (transcript: string) => void
  className?: string
}

function getSpeechRecognitionCtor(): any {
  if (typeof window === 'undefined') return null
  return (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition || null
}

/**
 * Botão de microfone genérico. Usa a Web Speech API nativa do navegador
 * (sem custo de API externa). Chrome/Edge têm bom suporte; Firefox não
 * suporta — nesse caso o botão fica desabilitado com uma dica explicando.
 */
export function MicButton({ onResult, className }: Props) {
  const [listening, setListening] = useState(false)
  const [supported, setSupported] = useState(true)
  const recognitionRef = useRef<any>(null)

  useEffect(() => {
    setSupported(!!getSpeechRecognitionCtor())
  }, [])

  useEffect(() => {
    return () => {
      recognitionRef.current?.stop()
    }
  }, [])

  function handleClick() {
    const SpeechRecognitionCtor = getSpeechRecognitionCtor()
    if (!SpeechRecognitionCtor) {
      setSupported(false)
      return
    }

    if (listening) {
      recognitionRef.current?.stop()
      return
    }

    const recognition = new SpeechRecognitionCtor()
    recognition.lang = 'pt-BR'
    recognition.continuous = false
    recognition.interimResults = false

    recognition.onstart = () => setListening(true)
    recognition.onend = () => setListening(false)
    recognition.onerror = () => setListening(false)
    recognition.onresult = (event: any) => {
      const transcript = event.results?.[0]?.[0]?.transcript
      if (transcript) onResult(transcript)
    }

    recognitionRef.current = recognition
    recognition.start()
  }

  if (!supported) {
    return (
      <button
        type="button"
        disabled
        title="Seu navegador não suporta captura por voz (funciona no Chrome e Edge)"
        className={`text-gray-300 cursor-not-allowed shrink-0 ${className ?? ''}`}
      >
        🎤
      </button>
    )
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      title={listening ? 'Ouvindo… clique pra parar' : 'Ditar por voz'}
      className={`shrink-0 transition-colors ${
        listening ? 'text-red-600 animate-pulse' : 'text-navy-600 hover:text-navy-950'
      } ${className ?? ''}`}
    >
      🎤
    </button>
  )
}
