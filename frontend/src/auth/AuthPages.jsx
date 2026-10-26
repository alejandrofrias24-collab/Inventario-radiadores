import { useState } from 'react';
import { Link, Navigate, useNavigate } from 'react-router-dom';
import { login, register } from '../api/auth.js';
import { useAuth } from './AuthContext.jsx';
import './auth.css';

function AuthPage({ mode }) {
  const isRegister = mode === 'register';
  const { session, acceptSession } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ nombre: '', email: '', password: '' });
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  if (session) return <Navigate to="/inventario" replace />;

  async function submit(event) {
    event.preventDefault();
    setError('');
    setBusy(true);
    try {
      const result = isRegister ? await register(form) : await login({ email: form.email, password: form.password });
      acceptSession(result);
      navigate('/inventario', { replace: true });
    } catch (submitError) {
      setError(submitError.message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <main className="auth-screen">
      <section className="auth-card">
        <a className="auth-brand" href="/login"><span className="auth-brand-mark">▦</span><span><strong>radiadores</strong><small>GESTIÓN DE REPUESTOS</small></span></a>
        <div className="auth-heading"><span className="auth-eyebrow">CATÁLOGO DE REPUESTOS</span><h1>{isRegister ? 'Crea tu cuenta' : 'Bienvenido de nuevo'}</h1><p>{isRegister ? 'Regístrate para administrar tu inventario de radiadores.' : 'Inicia sesión para acceder al inventario.'}</p></div>
        <form className="auth-form" onSubmit={submit}>
          {isRegister && <label>Nombre completo<input autoComplete="name" value={form.nombre} onChange={(event) => setForm({ ...form, nombre: event.target.value })} minLength="2" maxLength="120" required /></label>}
          <label>Correo electrónico<input type="email" autoComplete="email" value={form.email} onChange={(event) => setForm({ ...form, email: event.target.value })} maxLength="254" required /></label>
          <label>Contraseña<input type="password" autoComplete={isRegister ? 'new-password' : 'current-password'} value={form.password} onChange={(event) => setForm({ ...form, password: event.target.value })} minLength="8" maxLength="72" required /><small>Mínimo 8 caracteres.</small></label>
          {error && <div className="auth-error" role="alert">{error}</div>}
          <button className="auth-submit" disabled={busy}>{busy ? 'Procesando…' : isRegister ? 'Crear cuenta' : 'Iniciar sesión'}</button>
        </form>
        <p className="auth-switch">{isRegister ? '¿Ya tienes cuenta?' : '¿Aún no tienes cuenta?'} <Link to={isRegister ? '/login' : '/registro'}>{isRegister ? 'Inicia sesión' : 'Regístrate'}</Link></p>
      </section>
      <p className="auth-foot">Inventario de radiadores · Acceso seguro</p>
    </main>
  );
}

export function LoginPage() { return <AuthPage mode="login" />; }
export function RegisterPage() { return <AuthPage mode="register" />; }
