import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import type { NextAuthOptions } from "next-auth";
import type { JWT } from "next-auth/jwt";

/**
 * Função auxiliar para renovar o access token usando o refresh token.
 */
async function refreshAccessToken(token: JWT) {
  try {
    const res = await fetch(`${process.env.API_URL_SERVER_SIDED}/refresh`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ refresh_token: token.refreshtoken }),
    });

    if (!res.ok) throw new Error("Falha ao renovar token");

    const json = await res.json();
    const data = json.data;

    return {
      ...token,
      accesstoken: data.user.accessToken,
      refreshtoken: data.user.refreshtoken ?? token.refreshtoken,
      accessTokenExpires: Date.now() + 60 * 60 * 1000, // 1 hora (ou data.expires_in se existir)
      user: data.user ?? token.user,
    };
  } catch (err) {
    console.error("Erro ao renovar token:", err);
    return { ...token, error: "RefreshAccessTokenError" };
  }
}

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        identificador: { label: "Identificador", type: "text" },
        senha: { label: "Senha", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.identificador || !credentials?.senha) return null;

        const res = await fetch(`${process.env.API_URL_SERVER_SIDED}/login`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            identificador: credentials.identificador,
            senha: credentials.senha,
          }),
        });

        if (!res.ok) return null;

        const json = await res.json();
        const user = json.data.user;

        if (user && user._id) {
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
          };
        }

        return null;
      },
    }),
  ],
  pages: {
    signIn: "/login",
  },
  callbacks: {
    async jwt({ token, user }) {
      // Primeiro login
      if (user) {
        return {
          ...token,
          ...user,
          accessTokenExpires: Date.now() + 60 * 60 * 1000, // 1 hora
        };
      }

      // Token ainda válido
      if (Date.now() < Number(token.accessTokenExpires ?? 0)) {
        return token;
      }

      // Token expirou → tenta renovar
      return await refreshAccessToken(token);
    },

    async session({ session, token }) {
      if (token && session.user) {
        session.user = { ...session.user, ...token };
      }

      // Se o refresh falhou, forçar logout no cliente
      if (token?.error === "RefreshAccessTokenError" && typeof window !== "undefined") {
        window.location.href = "/login";
      }

      return session;
    },
  },
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60, // 30 dias
  },
  secret: process.env.NEXTAUTH_SECRET,
};

const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };
