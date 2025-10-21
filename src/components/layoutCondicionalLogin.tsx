// src/components/ConditionalLayout.tsx
'use client';

import { usePathname } from 'next/navigation';
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
  
  // Rotas onde não devemos mostrar header e footer
  const hideHeaderFooter = pathname?.startsWith('/login') || pathname?.startsWith('/cadastro');

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
