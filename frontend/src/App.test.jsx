// @vitest-environment jsdom
import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { AuthProvider } from './auth/AuthContext.jsx';
import { LoginPage } from './auth/AuthPages.jsx';

describe('LoginPage', () => {
  it('muestra los campos de acceso y el enlace de registro', () => {
    localStorage.clear();
    render(<MemoryRouter><AuthProvider><LoginPage /></AuthProvider></MemoryRouter>);
    expect(screen.getByRole('heading', { name: 'Bienvenido de nuevo' })).toBeTruthy();
    expect(screen.getByLabelText('Correo electrónico')).toBeTruthy();
    expect(screen.getByLabelText('Contraseña')).toBeTruthy();
    expect(screen.getByRole('link', { name: 'Regístrate' }).getAttribute('href')).toBe('/registro');
  });
});
