'use client';

import Link from 'next/link';
import { Home, Search, ArrowLeft } from 'lucide-react';

export default function NotFound() {
  return (
    <div data-not-found-page="true" className="min-h-screen bg-linear-to-br from-blue-50 via-white to-blue-100 flex items-center justify-center px-4 sm:px-6 lg:px-8">
      <div className="max-w-2xl w-full text-center">
        <div className="relative mb-8">
          <h1 className="text-9xl md:text-[200px] font-bold text-transparent bg-clip-text bg-linear-to-r from-[#337695] to-[#2c5f7a] animate-pulse">
            404
          </h1>
          <div className="absolute inset-0 blur-3xl opacity-20 bg-linear-to-r from-[#337695] to-[#2c5f7a] -z-10"></div>
        </div>

        <div className="space-y-4 mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-[#2c5f7a]">
            Ops! Página não encontrada
          </h2>
          <p className="text-lg text-[#2c5f7a]/80 max-w-md mx-auto">
            A página que você está procurando não existe ou foi movida para outro endereço.
          </p>
        </div>

        <div className="mb-12 flex justify-center">
          <div className="relative">
            <div className="w-32 h-32 bg-linear-to-br from-[#337695] to-[#2c5f7a] rounded-full opacity-20 blur-xl absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2"></div>
            <Search className="w-24 h-24 text-[#337695]/30 relative z-10" strokeWidth={1.5} />
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
          <Link
            href="/"
            className="inline-flex items-center gap-2 px-6 py-3 bg-[#337695] hover:bg-[#2c5f7a] text-white font-semibold rounded-lg shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 group"
          >
            <Home className="w-5 h-5 group-hover:rotate-12 transition-transform" />
            Voltar para Início
          </Link>
          
          <button
            onClick={() => window.history.back()}
            className="inline-flex items-center gap-2 px-6 py-3 bg-white text-[#2c5f7a] font-semibold rounded-lg shadow-md hover:shadow-lg transition-all duration-300 hover:scale-105 border border-[#337695]/30 hover:border-[#337695] group"
          >
            <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
            Página Anterior
          </button>
        </div>

        <div className="mt-12 border-t border-[#337695]/20"></div>

        <div className="mt-12 text-xs text-[#2c5f7a]/50">
          Vilhena + Pública © {new Date().getFullYear()}
        </div>
      </div>
    </div>
  );
}
