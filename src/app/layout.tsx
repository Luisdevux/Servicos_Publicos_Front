import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { QueryProvider } from "@/providers/queryProvider";
import { SessionWrapper } from "@/components/SessionWrapper";
import { GlobalErrorHandler } from "@/components/GlobalErrorHandler";
import { NuqsAdapter } from 'nuqs/adapters/next/app';
import { Toaster } from 'sonner';
import "./globals.css";
import ConditionalLayout from "@/components/layoutCondicionalLogin";

const dadosFooter = {
  endereco: {
    nome: "Centro Administrativo Senador Doutor Teotônio Vilela",
    rua: "Av. Senador Teotônio Vilela, 4177 - Jardim América",
    cidade: "Vilhena - RO",
    cep: "78995-000",
  },
  contato: {
    email: "mailto:gabinete@vilhena.ro.gov.br",
    telefone: "tel:+5693919-7080",
    facebook: "https://www.facebook.com/municipiodevilhena/?locale=pt_BR",
    instagram: "https://www.instagram.com/municipiodevilhena/",
  }
}

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Vilhena + Pública",
  description: "Sistema de Gestão de Serviços Públicos",
  icons: {
    icon: [
      { url: '/favicon.svg', type: 'image/svg+xml' },
    ],
    apple: '/favicon.svg',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR" suppressHydrationWarning data-scroll-behavior="smooth">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
        suppressHydrationWarning
      >
        <Toaster position="top-right" closeButton richColors />
        <NuqsAdapter>
          <SessionWrapper>
            <QueryProvider>
              <GlobalErrorHandler />
              <ConditionalLayout dadosFooter={dadosFooter}>
                {children}
              </ConditionalLayout>
            </QueryProvider>
          </SessionWrapper>
        </NuqsAdapter>
      </body>
    </html>
  );
}