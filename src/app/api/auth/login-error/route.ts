import { NextRequest, NextResponse } from 'next/server';

let lastLoginError: string | null = null;

export async function POST(request: NextRequest) {
  const { error } = await request.json();
  lastLoginError = error;
  return NextResponse.json({ ok: true });
}

export async function GET() {
  const error = lastLoginError;
  lastLoginError = null; // Limpa após ler
  return NextResponse.json({ error });
}
