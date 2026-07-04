import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { useEffect, useState, type FormEvent } from 'react'
import { useAuth } from '@/lib/auth-context'
import { supabase } from '@/lib/supabase'

export const Route = createFileRoute('/auth')({
  component: AuthPage,
})

function traduzErro(msg: string) {
  if (msg.includes('Invalid login credentials'))
    return 'E-mail ou senha incorretos.'
  if (msg.includes('User already registered'))
    return 'Já existe uma conta com esse e-mail.'
  if (msg.includes('Password should be at least'))
    return 'A senha precisa ter pelo menos 6 caracteres.'
  return msg
}

function AuthPage() {
  const { session, loading } = useAuth()
  const navigate = useNavigate()

  const [mode, setMode] = useState<'login' | 'signup'>('login')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [signupMessage, setSignupMessage] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)

  // Se já estiver logado (ex: voltou pra /auth por engano), manda pro app
  useEffect(() => {
    if (!loading && session) {
      navigate({ to: '/app' })
    }
  }, [loading, session, navigate])

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setError(null)
    setSignupMessage(null)
    setSubmitting(true)

    if (mode === 'login') {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })
      if (error) setError(traduzErro(error.message))
    } else {
      const { error } = await supabase.auth.signUp({ email, password })
      if (error) {
        setError(traduzErro(error.message))
      } else {
        setSignupMessage(
          'Conta criada! Verifique seu e-mail para confirmar antes de entrar.'
        )
      }
    }

    setSubmitting(false)
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-base px-4">
      <div className="w-full max-w-sm">
        <h1 className="text-2xl font-semibold text-navy-950 text-center mb-1">
          Bora pra Vida
        </h1>
        <p className="text-gray-500 text-center mb-6">
          {mode === 'login' ? 'Entre na sua conta' : 'Crie sua conta'}
        </p>

        <form
          onSubmit={handleSubmit}
          className="bg-white rounded-xl ring-1 ring-black/5 p-6 flex flex-col gap-4"
        >
          <label className="flex flex-col gap-1 text-sm text-gray-700">
            E-mail
            <input
              type="email"
              required
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="rounded-lg border border-gray-200 px-3 py-2 outline-none focus:ring-2 focus:ring-navy-600"
            />
          </label>

          <label className="flex flex-col gap-1 text-sm text-gray-700">
            Senha
            <input
              type="password"
              required
              minLength={6}
              autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="rounded-lg border border-gray-200 px-3 py-2 outline-none focus:ring-2 focus:ring-navy-600"
            />
          </label>

          {error && <p className="text-sm text-red-600">{error}</p>}
          {signupMessage && (
            <p className="text-sm text-positive">{signupMessage}</p>
          )}

          <button
            type="submit"
            disabled={submitting}
            className="bg-navy-600 hover:bg-navy-950 transition-colors text-white rounded-lg py-2 font-medium disabled:opacity-60"
          >
            {submitting ? 'Aguarde…' : mode === 'login' ? 'Entrar' : 'Criar conta'}
          </button>
        </form>

        <button
          onClick={() => {
            setMode(mode === 'login' ? 'signup' : 'login')
            setError(null)
            setSignupMessage(null)
          }}
          className="mt-4 text-sm text-navy-600 hover:text-navy-950 w-full text-center"
        >
          {mode === 'login' ? 'Não tem conta? Criar uma' : 'Já tem conta? Entrar'}
        </button>
      </div>
    </div>
  )
}
