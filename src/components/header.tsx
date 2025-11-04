// src/components/header.tsx

"use client";
import Link from "next/link";
import { Navigation } from "./ui/navigation";
import NavLink from "./ui/nav-link";
import * as React from "react";
import { useAuth } from "@/hooks/useAuth";
import { usePathname } from "next/navigation";

interface HeaderLink {
  href: string;
  label: string;
  theme?: 'default' | 'green' | 'purple';
  requiresAuth?: boolean;
  hideWhenAuth?: boolean;
}

export default function Header({ theme, inverted }: { theme?: 'default' | 'green' | 'purple'; inverted?: boolean }) {
  const [open, setOpen] = React.useState(false);
  const [mounted, setMounted] = React.useState(false);
  const [isSecretariaArea, setIsSecretariaArea] = React.useState(false);
  const [isOperadorArea, setIsOperadorArea] = React.useState(false);
  const { isAuthenticated, logout } = useAuth();
  const pathname = usePathname();
  
  React.useEffect(() => {
    setMounted(true);
    
    const isInSecretaria = pathname?.startsWith('/secretaria');
    const isInOperador = pathname?.startsWith('/operador');
    const isInPerfil = pathname === '/perfil';
    
    if (isInSecretaria) {
      sessionStorage.setItem('userArea', 'secretaria');
      setIsSecretariaArea(true);
      setIsOperadorArea(false);
    } else if (isInOperador) {
      sessionStorage.setItem('userArea', 'operador');
      setIsOperadorArea(true);
      setIsSecretariaArea(false);
    } else if (isInPerfil) {
      const userArea = sessionStorage.getItem('userArea');
      if (userArea === 'secretaria') {
        setIsSecretariaArea(true);
        setIsOperadorArea(false);
      } else if (userArea === 'operador') {
        setIsOperadorArea(true);
        setIsSecretariaArea(false);
      } else {
        setIsSecretariaArea(false);
        setIsOperadorArea(false);
      }
    } else {
      sessionStorage.removeItem('userArea');
      setIsSecretariaArea(false);
      setIsOperadorArea(false);
    }
  }, [pathname]);

  let links: HeaderLink[] = [];
  let effectiveTheme = theme;

  if (isSecretariaArea) {
    links = [
      { href: "/secretaria", label: "Pedidos recebidos" },
      { href: "/perfil", label: "Perfil" },
    ];
    effectiveTheme = 'default';
  } else if (isOperadorArea) {
    links = [
      { href: "/operador", label: "Pedidos recebidos" },
      { href: "/perfil", label: "Perfil" },
    ];
    effectiveTheme = 'default';
  } else {
    links = [
      { href: "/", label: "Home" },
      { href: "/pedidosMunicipe", label: "Meus Pedidos", requiresAuth: true },
      { href: "/perfil", label: "Perfil", requiresAuth: true },
      { href: "/login", label: "Login", hideWhenAuth: true },
    ];
  }

  const visibleLinks = mounted ? links.filter(link => {
    if (link.requiresAuth && !isAuthenticated) return false;
    if (link.hideWhenAuth && isAuthenticated) return false;
    return true;
  }) : links.filter(link => !link.requiresAuth);

  const cls = `site-header bg-[var(--global-bg)] border-b ${inverted ? 'site-header--inverted' : ''}`;
  const themeClass = effectiveTheme === 'green' ? 'global-theme-green' : effectiveTheme === 'purple' ? 'global-theme-purple' : '';

  return (
    <header 
      className={`border-b border-[var(--global-separator)]/30 ${cls} ${themeClass}`}
      data-test="header"
    >
      <div className="px-6 sm:px-6 lg:px-40">
        <div className="flex items-center justify-between" style={{ height: 64 }}>
          <div className="flex-shrink-0">
            {mounted && (isSecretariaArea || isOperadorArea) ? (
              <span
                className="font-semibold tracking-wide text-[18px] md:text-[20px] cursor-default"
                style={{ color: 'var(--global-text-primary)' }}
                data-test="header-logo"
              >
                VILHENA+PÚBLICA
              </span>
            ) : (
              <Link
                href="/"
                className="font-semibold tracking-wide text-[18px] md:text-[20px]"
                style={{ color: 'var(--global-text-primary)' }}
                data-test="header-logo"
              >
                VILHENA+PÚBLICA
              </Link>
            )}
          </div>

          <div className="hidden md:block" data-test="header-nav-desktop">
            <nav className="flex items-center gap-4">
              <Navigation>
                {visibleLinks.map((link) => (
                  <NavLink 
                    key={link.href} 
                    href={link.href}
                    data-test={`nav-link-${link.label.toLowerCase().replace(/\s+/g, '-')}`}
                  >
                    {link.label}
                  </NavLink>
                ))}
              </Navigation>
              {mounted && (isAuthenticated || isSecretariaArea || isOperadorArea) && (
                <button
                  onClick={logout}
                  className="ml-2 px-4 py-2 bg-[var(--global-text-primary)]/90 text-white text-sm font-medium rounded-lg hover:bg-[var(--global-text-secondary)] transition-colors cursor-pointer"
                  data-test="header-logout-button"
                >
                  Sair
                </button>
              )}
            </nav>
          </div>

          <div className="md:hidden">
            <button
              aria-label={open ? 'Fechar menu' : 'Abrir menu'}
              aria-expanded={open}
              aria-controls="mobile-menu"
              onClick={() => setOpen((s) => !s)}
              className="inline-flex items-center justify-center p-2 rounded-md focus:outline-none"
              style={{ color: 'var(--global-text-primary)' }}
              data-test="header-mobile-menu-button"
            >
              <svg className={`h-6 w-6`} fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                {open ? (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8h16M4 16h16" />
                )}
              </svg>
            </button>
          </div>
        </div>
      </div>

      <div 
        id="mobile-menu" 
        className="md:hidden" 
        aria-hidden={!open} 
        suppressHydrationWarning
        data-test="header-nav-mobile"
      >
        <div
          className={`transform-origin-top transition-all duration-200 ease-in-out ${open ? 'opacity-100 scale-100 max-h-96' : 'opacity-0 scale-95 max-h-0'} overflow-hidden border-t border-[var(--global-separator)]/30`}
        >
          <div className="px-4 pt-2 pb-4 bg-[var(--global-bg)] shadow-sm">
            <Navigation vertical>
              {visibleLinks.map((link) => (
                <NavLink 
                  key={link.href} 
                  href={link.href}
                  data-test={`nav-link-mobile-${link.label.toLowerCase().replace(/\s+/g, '-')}`}
                >
                  {link.label}
                </NavLink>
              ))}
            </Navigation>
            {mounted && (isAuthenticated || isSecretariaArea || isOperadorArea) && (
              <button
                onClick={logout}
                className="mt-3 w-full px-4 py-2 bg-[var(--global-text-primary)]/90 text-white text-sm font-medium rounded-lg hover:bg-[var(--global-text-secondary)] transition-colors cursor-pointer"
                data-test="header-mobile-logout-button"
              >
                Sair
              </button>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}