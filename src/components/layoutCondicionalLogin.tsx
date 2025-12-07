// src/components/ConditionalLayout.tsx

'use client';

import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';
import Header from '@/components/header';
import Footer from '@/components/footer';

interface ConditionalLayoutProps {
  children: React.ReactNode;
  dadosFooter: {
    endereco: {
      nome: string;
      rua: string;
      cidade: string;
      cep: string;
    };
    contato: {
      email: string;
      telefone: string;
      facebook: string;
      instagram: string;
    };
  };
}

export default function ConditionalLayout({ children, dadosFooter }: ConditionalLayoutProps) {
  const pathname = usePathname();
  const [is404, setIs404] = useState(false);

  useEffect(() => {
    // Detecta se é uma página 404 verificando se o children contém o marcador
    const hasNotFoundMarker = document.querySelector('[data-not-found-page="true"]');
    setIs404(!!hasNotFoundMarker);
  }, [pathname, children]);
  
  // Rotas onde não devemos mostrar header e footer
  const hideHeaderFooter = 
    pathname?.startsWith('/login') || 
    pathname?.startsWith('/cadastro') || 
    pathname?.startsWith('/esqueci-senha') || 
    pathname?.startsWith('/nova-senha') || 
    pathname?.startsWith('/verificar-email') || 
    pathname?.startsWith('/aguardando-verificacao') || 
    pathname?.startsWith('/admin') || 
    pathname?.startsWith('/admin/dashboard') ||
    is404;
    
  if (hideHeaderFooter) {
    return <>{children}</>;
  }

  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="flex-1">
        {children}
      </main>
      <Footer endereco={dadosFooter.endereco} contato={dadosFooter.contato} />
    </div>
  );
}
