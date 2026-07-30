'use client'

import { useState } from 'react'
import { Eye, EyeOff, Home, LockKeyhole } from 'lucide-react'
import Link from 'next/link'
import { BrandLogo } from '@/components/brand-logo'


interface LoginFormProps {
  onLogin: () => void
}

export function LoginForm({ onLogin }: LoginFormProps) {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
      })

      const data = await response.json()

      if (data.success) {
        onLogin()
      } else {
        setError(data.error || 'Erro ao fazer login')
      }
    } catch {
      setError('Erro de conexão. Tente novamente.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="va-admin-login">
      <div className="va-admin-login-card">
        <BrandLogo />
        <span className="va-admin-login-kicker"><LockKeyhole />Acesso restrito</span>
        <h1>Painel administrativo</h1>
        <p>Entre com as credenciais da equipe para acessar a operação da Villa Aurora.</p>
        <form onSubmit={handleSubmit}>
          <label htmlFor="username">Usuário administrativo
            <input id="username" type="text" value={username} onChange={(event) => setUsername(event.target.value)} placeholder="Digite seu usuário" required autoComplete="username" />
          </label>
          <label htmlFor="password">Senha
            <span className="va-password-field">
              <input id="password" type={showPassword ? 'text' : 'password'} value={password} onChange={(event) => setPassword(event.target.value)} placeholder="Digite sua senha" required autoComplete="current-password" />
              <button type="button" onClick={() => setShowPassword(!showPassword)} aria-label={showPassword ? 'Ocultar senha' : 'Mostrar senha'}>{showPassword ? <EyeOff /> : <Eye />}</button>
            </span>
          </label>
          {error && <div className="va-admin-login-error">{error}</div>}
          <button type="submit" className="va-admin-login-submit" disabled={loading}>{loading ? 'Entrando...' : 'Entrar no painel'}</button>
        </form>
        <small>Sessão protegida · bloqueio após 5 tentativas</small>
        <Link href="/"><Home />Voltar ao site público</Link>
      </div>
    </div>
  )
}
