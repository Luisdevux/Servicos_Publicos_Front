// src/app/(no-auth)/login/page.tsx

import { redirect } from 'next/navigation';

export default function LoginPage() {
  // Redireciona para a página de login de munícipe por padrão
  redirect('/login/municipe');
}
