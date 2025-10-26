// src/components/footer.tsx

import { Mail, Facebook, Instagram, Phone } from "lucide-react";
import Link from "next/link";

interface FooterProps {
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
  theme?: 'default' | 'green' | 'purple';
}

export default function Footer({ endereco, contato, theme = 'default' }: FooterProps) {
  const themeClass = theme === 'green' ? 'global-theme-green' : theme === 'purple' ? 'global-theme-purple' : '';
  
  return (
    <footer className={`border-t border-[var(--global-separator)]/30 bg-[var(--global-bg)] px-6 sm:px-6 lg:px-40 py-4 text-sm text-[var(--global-text-primary)] ${themeClass}`}>
      
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-center">
          <address className="md:flex-1 text-center md:text-left not-italic">
            <p className="font-semibold text-base text-[var(--global-text-secondary)] mb-1">
              {endereco.nome}
            </p>
            <p className="text-[var(--global-text-primary)]">{endereco.rua}</p>
            <p className="text-[var(--global-text-primary)]">
              {endereco.cidade}, {endereco.cep}
            </p>
          </address>
          <div className="md:flex-1 flex flex-col items-center md:items-end gap-3">
            <span className="font-semibold text-base text-[var(--global-text-secondary)]">
              Fale Conosco
            </span>
            <div className="flex gap-4">
              <a
                href={contato.email}
                target="_blank"
                rel="noreferrer"
                className="p-2 rounded-lg bg-[var(--global-accent)]/10 transition-all duration-300 hover:scale-110"
                aria-label="Enviar e-mail para o gabinete"
                title="Enviar e-mail"
              >
                <Mail className="h-5 w-5" />
              </a>
              <a
                href={contato.telefone}
                target="_blank"
                rel="noreferrer"
                className="p-2 rounded-lg bg-[var(--global-accent)]/10 transition-all duration-300 hover:scale-110"
                aria-label="Ligar para o telefone do gabinete"
                title="Ligar"
              >
                <Phone className="h-5 w-5" />
              </a>
              <a
                href={contato.facebook}
                target="_blank"
                rel="noreferrer"
                className="p-2 rounded-lg bg-[var(--global-accent)]/10 transition-all duration-300 hover:scale-110"
                aria-label="Acessar página oficial do Facebook"
                title="Facebook"
              >
                <Facebook className="h-5 w-5" />
              </a>
              <a
                href={contato.instagram}
                target="_blank"
                rel="noreferrer"
                className="p-2 rounded-lg bg-[var(--global-accent)]/10 hover:bg-gradient-to-r transition-all duration-300 hover:scale-110"
                aria-label="Acessar perfil oficial do Instagram"
                title="Instagram"
              >
                <Instagram className="h-5 w-5" />
              </a>
            </div>
          </div>
        </div>
        <div className="border-t border-[var(--global-separator)]/30 mt-4 pt-3">
          <div className="flex flex-col sm:flex-row justify-between items-center gap-2">
            <p className="text-xs text-[var(--global-text-primary)]/90">
              © {new Date().getFullYear()} Vilhena+Pública. Todos os direitos
              reservados.
            </p>
            <div className="flex gap-4 text-xs">
              <Link
                href="/politica-de-privacidade"
                className="text-[var(--global-text-primary)] hover:text-[var(--global-link-hover)] transition-colors underline-offset-2 hover:underline"
              >
                Política de Privacidade
              </Link>
              <Link
                href="/termos-de-uso"
                className="text-[var(--global-text-primary)] hover:text-[var(--global-link-hover)] transition-colors underline-offset-2 hover:underline"
              >
                Termos de Uso
              </Link>
            </div>
          </div>
        </div>
    </footer>
  );
}