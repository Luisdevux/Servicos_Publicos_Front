import "next-auth";

declare module "next-auth" {
  
  interface Session {
    user: {
      id: string;
      nome: string;
      email: string;
      cpf?: string;
      cnpj?: string;
      username?: string;
      celular: string;
      nivel_acesso: {
        municipe?: boolean;
        operador?: boolean;
        secretario?: boolean;
        administrador?: boolean;
      };
      ativo: boolean;
      accesstoken: string;
      refreshtoken: string;
    };
  }

  interface User {
    id: string;
    nome: string;
    email: string;
    cpf?: string;
    cnpj?: string;
    username?: string;
    celular: string;
    nivel_acesso: {
      municipe?: boolean;
      operador?: boolean;
      secretario?: boolean;
      administrador?: boolean;
    };
    ativo: boolean;
    accesstoken: string;
    refreshtoken: string;
  }

}

declare module "next-auth/jwt" {
  interface JWT {
    id: string;
    nome: string;
    email: string;
    cpf?: string;
    cnpj?: string;
    username?: string;
    celular: string;
    nivel_acesso: {
      municipe?: boolean;
      operador?: boolean;
      secretario?: boolean;
      administrador?: boolean;
    };
    ativo: boolean;
    accesstoken: string;
    refreshtoken: string;
    accessTokenExpires?: number;
    error?: string;
  }
}
