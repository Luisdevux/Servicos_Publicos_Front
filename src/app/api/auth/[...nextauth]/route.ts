// src/app/api/auth/[...nextauth]/route.ts

import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import type { NextAuthOptions } from "next-auth";
import type { JWT } from "next-auth/jwt";

// Função auxiliar para renovar o access token usando o refresh token.
async function refreshAccessToken(token: JWT, retryCount = 0): Promise<JWT> {
  const MAX_RETRIES = 2;

  try {
    console.log(`[NextAuth] Tentando renovar token (tentativa ${retryCount + 1}/${MAX_RETRIES + 1})...`);
    
    if (!token.refreshtoken) {
      console.error('[NextAuth] Refresh token não disponível no JWT');
      throw new Error("Refresh token não disponível");
    }

    const res = await fetch(`${process.env.API_URL_SERVER_SIDED}/refresh`, {
      method: "POST",
      headers: { 
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ refresh_token: token.refreshtoken }),
      // Adiciona timeout
      signal: AbortSignal.timeout(10000), // 10 segundos
    });

    if (!res.ok) {
      const errorText = await res.text().catch(() => 'Sem detalhes');
      console.error(`[NextAuth] Erro ${res.status} ao renovar token:`, errorText);
      
      if (res.status === 401 || res.status === 403) {
        console.error('[NextAuth] Refresh token inválido ou expirado');
        throw new Error("Refresh token inválido ou expirado");
      }

      if (retryCount < MAX_RETRIES) {
        const backoffDelay = 1000 * Math.pow(2, retryCount); // Backoff exponencial
        console.warn(`[NextAuth] Tentando novamente em ${backoffDelay}ms...`);
        await new Promise(resolve => setTimeout(resolve, backoffDelay));
        return refreshAccessToken(token, retryCount + 1);
      }

      throw new Error(`Falha ao renovar token após ${MAX_RETRIES + 1} tentativas`);
    }

    const json = await res.json();
    const data = json.data;

    // Backend retorna tokens sob data.user
    const userData = data?.user || data || null;

    if (!userData || !userData.accessToken) {
      console.error('[NextAuth] Formato de resposta inesperado:', json);
      throw new Error('Formato de resposta inesperado ao renovar token');
    }

    console.log('[NextAuth] Token renovado com sucesso');
    console.log('[NextAuth] Novo expiry em:', new Date(Date.now() + 60 * 60 * 1000).toISOString());

    return {
      ...token,
      accesstoken: userData.accessToken,
      refreshtoken: userData.refreshtoken ?? token.refreshtoken,
      accessTokenExpires: Date.now() + 60 * 60 * 1000, // 1 hora
      error: undefined,
      errorDetails: undefined,
    };
  } catch (err) {
    console.error("[NextAuth] Erro ao renovar token:", err);
    return {
      ...token,
      error: "RefreshAccessTokenError",
      errorDetails: err instanceof Error ? err.message : "Unknown error"
    };
  }
}

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        identificador: { label: "Identificador", type: "text" },
        senha: { label: "Senha", type: "password" },
        lembrarDeMim: { label: "Lembrar de mim", type: "text" },
        tipoUsuario: { label: "Tipo de usuário", type: "text" }, // 'municipe' ou 'funcionario'
      },
      async authorize(credentials) {
        if (!credentials?.identificador || !credentials?.senha) {
          console.warn('[NextAuth] Credenciais não fornecidas');
          return null;
        }

        try {
          const res = await fetch(`${process.env.API_URL_SERVER_SIDED}/login`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              identificador: credentials.identificador,
              senha: credentials.senha,
            }),
          });

          // Rate limit específico (429)
          if (res.status === 429) {
            console.warn('[NextAuth] Rate limit detectado');
            // Retorna null e sinaliza rate limit via error no JWT
            return null;
          }

          if (!res.ok) {
            console.warn('[NextAuth] Login falhou:', res.status);
            return null;
          }

          const json = await res.json();
          const user = json.data.user;

          if (user && user._id) {

            const tipoUsuario = credentials.tipoUsuario;
            const nivelAcesso = user.nivel_acesso || {};

            if (tipoUsuario === 'municipe') {
              // Tela de munícipe - apenas permite municipe
              if (!nivelAcesso.municipe) {
                console.warn('[NextAuth] Tentativa de login de não-munícipe na tela de munícipe');
                return null;
              }
            } else if (tipoUsuario === 'funcionario') {
              // Tela de funcionário - apenas permite admin, operador ou secretário
              const isFuncionario = nivelAcesso.administrador || nivelAcesso.operador || nivelAcesso.secretario;
              if (!isFuncionario) {
                console.warn('[NextAuth] Tentativa de login de não-funcionário na tela de funcionário');
                return null;
              }
            }

            console.log('[NextAuth] Login bem-sucedido para usuário:', user._id);
            return {
              id: user._id,
              nome: user.nome ?? "",
              email: user.email ?? "",
              cpf: user.cpf ?? "",
              cnpj: user.cnpj ?? "",
              username: user.username ?? "",
              celular: user.celular ?? "",
              nivel_acesso: user.nivel_acesso ?? {},
              ativo: user.ativo ?? true,
              accesstoken: user.accessToken ?? "",
              refreshtoken: user.refreshtoken ?? "",
              lembrarDeMim: credentials.lembrarDeMim === "true",
            };
          }

          console.warn('[NextAuth] Resposta da API sem dados válidos');
          return null;
        } catch (error) {
          console.error('[NextAuth] Erro no authorize:', error);
          return null;
        }
      },
    }),
  ],
  pages: {
    signIn: "/login",
    error: "/login",
  },
  callbacks: {
    async jwt({ token, user, trigger }): Promise<JWT> {
      // Primeiro login ou update manual
      if (user) {
        console.log('[NextAuth] JWT callback - Novo login para usuário:', user.id);
        return {
          id: user.id,
          nome: user.nome,
          email: user.email,
          cpf: user.cpf,
          cnpj: user.cnpj,
          username: user.username,
          celular: user.celular,
          nivel_acesso: user.nivel_acesso,
          ativo: user.ativo,
          accesstoken: user.accesstoken,
          refreshtoken: user.refreshtoken,
          lembrarDeMim: user.lembrarDeMim,
          accessTokenExpires: Date.now() + 60 * 60 * 1000, // 1 hora
        };
      }

      // Force refresh on update trigger
      if (trigger === "update") {
        console.log('[NextAuth] JWT callback - Forçando refresh do token (trigger: update)');
        return await refreshAccessToken(token);
      }

      // Verifica se já há erro no token
      if (token.error === "RefreshAccessTokenError") {
        console.error('[NextAuth] JWT callback - Token já está em erro, não tentando refresh');
        return token;
      }

      // Token ainda válido - buffer de 10 minutos para renovar
      const timeUntilExpiry = Number(token.accessTokenExpires ?? 0) - Date.now();
      const REFRESH_THRESHOLD = 10 * 60 * 1000; // 10 minutos
      
      if (timeUntilExpiry > REFRESH_THRESHOLD) {
        const minutesRemaining = Math.floor(timeUntilExpiry / (60 * 1000));
        console.log(`[NextAuth] Token ainda válido (${minutesRemaining} minutos restantes)`);
        return token;
      }

      // Token próximo de expirar ou expirado → tenta renovar
      const minutesRemaining = Math.floor(timeUntilExpiry / (60 * 1000));
      console.log(`[NextAuth] Token expirando em ${minutesRemaining} minutos, renovando...`);
      return await refreshAccessToken(token);
    },

    async session({ session, token }) {
      // Se há erro no token, força logout
      if (token?.error === "RefreshAccessTokenError") {
        console.error('[NextAuth] Session callback - Erro no refresh do token');
        console.error('[NextAuth] Detalhes do erro:', token.errorDetails);
        return {
          ...session,
          error: "RefreshAccessTokenError"
        } as typeof session & { error: string };
      }

      if (token && session.user) {
        session.user = {
          id: token.id,
          nome: token.nome,
          email: token.email,
          cpf: token.cpf,
          cnpj: token.cnpj,
          username: token.username,
          celular: token.celular,
          nivel_acesso: token.nivel_acesso,
          ativo: token.ativo,
        };
        
        console.log('[NextAuth] Session atualizada para usuário:', token.id);
      }

      return session;
    },
  },
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60, // 30 dias
  },
  cookies: {
    sessionToken: {
      name: `${process.env.NEXTAUTH_URL?.startsWith('https://') ? '__Secure-' : ''}next-auth.session-token`,
      options: {
        httpOnly: true,
        sameSite: 'lax',
        path: '/',
        // Só usa secure: true se NEXTAUTH_URL for HTTPS
        secure: process.env.NEXTAUTH_URL?.startsWith('https://') ?? false,
        // maxAge será definido dinamicamente com base em lembrarDeMim
      },
    },
  },
  events: {
    async signIn({ user }) {
      // Ao fazer login, verifica se deve usar session cookie ou persistent cookie
      const lembrarDeMim = user.lembrarDeMim;
      console.log('[NextAuth Events] signIn - lembrarDeMim:', lembrarDeMim);

      if (!lembrarDeMim) {
        console.log('[NextAuth Events] Cookie de sessão será usado (expira ao fechar navegador)');
      }
    },
  },
  secret: process.env.NEXTAUTH_SECRET,
  debug: process.env.NODE_ENV === 'development',
};

const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };
