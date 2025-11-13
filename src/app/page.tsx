'use client';

import Image from "next/image";
import { useAuth } from '@/hooks/useAuth';
import Link from "next/link";
import { useRouter } from 'next/navigation';

export default function Home() {
  const { isLoading, isAuthenticated } = useAuth();
  const router = useRouter();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-linear-to-br from-blue-50 to-cyan-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-global-accent border-t-transparent mx-auto"></div>
          <p className="mt-6 text-global-text-primary font-medium">Carregando...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white" data-test="pagina-inicial">
      <section className="relative w-full overflow-hidden min-h-[50vh]" data-test="secao-hero">
        <div className="absolute inset-0 bg-linear-to-br from-[#2d6c85] via-global-accent to-[#4a9bb8]">
          <div className="absolute inset-0 opacity-10">
            <svg className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
              <defs>
                <pattern id="hero-grid" width="60" height="60" patternUnits="userSpaceOnUse">
                  <circle cx="30" cy="30" r="2" fill="white"/>
                  <circle cx="0" cy="0" r="1" fill="white"/>
                  <circle cx="60" cy="0" r="1" fill="white"/>
                  <circle cx="0" cy="60" r="1" fill="white"/>
                  <circle cx="60" cy="60" r="1" fill="white"/>
                </pattern>
              </defs>
              <rect width="100%" height="100%" fill="url(#hero-grid)"/>
            </svg>
          </div>
          <div className="absolute top-32 left-32 w-16 h-16 border-2 border-white/20 rounded-lg rotate-12"></div>
          <div className="absolute bottom-40 right-40 w-12 h-12 border-2 border-white/20 rounded-full"></div>
        </div>

        <div className="relative z-10 pt-20 md:pt-32 pb-36 md:pb-48">
          <div className="px-6 sm:px-6 lg:px-40 grid md:grid-cols-2 gap-12 lg:gap-16 items-center">
            <div className="text-white space-y-8">
              <h1 className="text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-bold leading-tight" data-test="titulo-principal">
                Vilhena<span className="text-cyan-200">+</span>
                <br />
                Pública
              </h1>
              <p className="text-xl md:text-2xl text-white/90 leading-relaxed" data-test="descricao-principal">
                O Vilhena+Pública foi desenvolvido para manter você conectado com a cidade de Vilhena - RO. Os moradores podem solicitar atendimentos de forma rápida e segura.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 pt-4" data-test="botoes-hero">
                {isAuthenticated ? (
                  <div className="space-y-4">
                    <p className="text-lg text-white/80">
                      Bem-vindo de volta! Escolha um serviço abaixo para fazer uma nova solicitação.
                    </p>
                    <a 
                      href="#servicos"
                      className="inline-block text-center px-10 py-4 bg-white text-global-accent font-bold rounded-lg shadow-xl hover:shadow-2xl hover:scale-105 transition-all duration-300"
                      data-test="botao-ver-servicos"
                    >
                      Ver Serviços Disponíveis
                    </a>
                  </div>
                ) : (
                  <>
                    <Link 
                      href="/cadastro"
                      className="text-center px-10 py-4 bg-white text-global-accent font-bold rounded-lg shadow-xl hover:shadow-2xl hover:scale-105 transition-all duration-300"
                      data-test="botao-comece-agora"
                    >
                      Comece Agora
                    </Link>
                    <Link 
                      href="/login"
                      className="text-center px-10 py-4 bg-transparent text-white font-bold rounded-lg border-2 border-white hover:bg-white hover:text-global-accent transition-all duration-300"
                      data-test="botao-ja-tenho-conta"
                    >
                      Já tenho conta
                    </Link>
                  </>
                )}
              </div>
            </div>

            <div className="hidden md:flex items-center justify-end -mt-16" data-test="composicao-visual-hero">
              <div className="relative w-96 h-[400px] flex items-center justify-center">   
                <svg className="absolute w-96 h-96 opacity-35" style={{ zIndex: -1 }}>
                  <circle cx="192" cy="192" r="140" fill="none" stroke="white" strokeWidth="1" strokeDasharray="3 8" />
                  <circle cx="192" cy="192" r="100" fill="none" stroke="white" strokeWidth="0.5" />
                </svg>

                <div className="absolute w-28 h-28 flex items-center justify-center">
                  <svg className="w-28 h-28 text-white/50" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z" />
                  </svg>
                </div>

              </div>
            </div>
          </div>
        </div>

        <div className="absolute bottom-0 left-0 w-full">
          <svg viewBox="0 0 1440 120" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-auto relative z-10" style={{ transform: 'translateY(1px)' }}>
            <path d="M0 80L60 73.3C120 67 240 53 360 46.7C480 40 600 40 720 43.3C840 47 960 53 1080 46.7C1200 40 1320 20 1380 10L1440 0V120H1380C1320 120 1200 120 1080 120C960 120 840 120 720 120C600 120 480 120 360 120C240 120 120 120 60 120H0V80Z" fill="white"/>
          </svg>
        </div>
      </section>

      <section id="servicos" className="pt-18 pb-32 px-6 sm:px-6 lg:px-40 bg-linear-to-b from-gray-50 to-blue-100/20 relative" data-test="secao-servicos">
        <div className="text-center mb-16">
          <div className="inline-block px-4 py-2 bg-global-accent/10 rounded-full mb-4">
            <span className="text-sm font-semibold text-global-accent uppercase tracking-wider">Serviços Disponíveis</span>
          </div>
          <h2 className="text-4xl md:text-5xl font-bold text-global-text-secondary mb-4" data-test="titulo-servicos">
            Como podemos ajudar?
          </h2>
          <p className="text-lg text-global-text-primary/70 max-w-2xl mx-auto" data-test="descricao-servicos">
            Escolha a categoria do seu problema e nos conte o que está acontecendo
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8" data-test="grid-servicos">
          {[
            {
              icon: "/homeIconeColeta.svg",
              label: "Coleta",
              href: "/demanda/coleta",
              description: "Solicite coleta de lixo, resíduos e limpeza de áreas públicas."
            },
            {
              icon: "/homeIconeIluminacao.svg",
              label: "Iluminação Pública",
              href: "/demanda/iluminação",
              description: "Reporte problemas em postes, lâmpadas queimadas e falta de luz."
            },
            {
              icon: "/homeIconeDog.svg",
              label: "Animais",
              href: "/demanda/animais",
              description: "Informe sobre animais abandonados, feridos ou em situação de risco."
            },
            {
              icon: "/homeIconeArvores.svg",
              label: "Árvores",
              href: "/demanda/arvores",
              description: "Solicite poda, remoção ou avaliação de árvores em locais públicos."
            },
            {
              icon: "/homeIconePavimento.svg",
              label: "Pavimentação",
              href: "/demanda/pavimentação",
              description: "Reporte buracos, rachaduras e outros problemas no asfalto."
            },
            {
              icon: "/homeIconeSaneamento.svg",
              label: "Saneamento",
              href: "/demanda/saneamento",
              description: "Informe sobre vazamentos de esgoto, bueiros entupidos, drenagem ou qualquer serviço realcionado."
            },
          ].map((service) => (
            <div
              key={service.label}
              className="group relative bg-white/60 backdrop-blur-sm rounded-2xl p-6 border border-gray-200/50 transition-all duration-300 shadow-lg hover:shadow-2xl hover:border-global-accent/50 hover:-translate-y-2 cursor-pointer overflow-hidden"
              data-test={`card-servico-${service.label.toLowerCase()}`}
              onClick={() => {
                if (isAuthenticated) {
                  router.push(service.href);
                } else {
                  router.push('/login');
                }
              }}
            >
                <div className="absolute -top-8 -right-8 w-32 h-32 bg-linear-to-br from-global-accent to-[#4a9bb8] rounded-full opacity-10 group-hover:opacity-20 group-hover:scale-125 transition-all duration-500"></div>
                <div className="relative z-10 flex flex-col h-full">
                    <div className="shrink-0 mb-5">
                        <div className="w-14 h-14 bg-linear-to-br from-global-accent to-[#4a9bb8] rounded-2xl flex items-center justify-center group-hover:scale-110 group-hover:rotate-6 transition-all duration-300 shadow-lg">
                            <div className="w-8 h-8 relative">
                                <Image
                                    src={service.icon}
                                    alt={service.label}
                                    fill
                                    sizes="32px"
                                    className="filter brightness-0 invert object-contain"
                                />
                            </div>
                        </div>
                    </div>
                    <div className="grow">
                        <h3 className="text-xl font-bold text-global-text-secondary mb-2 group-hover:text-global-accent transition-colors duration-300" data-test={`titulo-servico-${service.label.toLowerCase()}`}>
                          {service.label}
                        </h3>
                        <p className="text-sm text-global-text-primary/70 leading-relaxed" data-test={`descricao-servico-${service.label.toLowerCase()}`}>
                          {service.description}
                        </p>
                    </div>
                    <div className="mt-6">
                        <div className="inline-flex items-center font-semibold text-global-accent transition-all duration-300">
                            <span className="text-sm">Solicitar Serviço</span>
                            <svg className="w-5 h-5 ml-2 transform group-hover:translate-x-1 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 8l4 4m0 0l-4 4m4-4H3"></path>
                            </svg>
                        </div>
                    </div>
                </div>
            </div>
          ))}
        </div>
      </section>

      <div className="relative h-px bg-linear-to-r from-transparent via-gray-200 to-transparent"></div>

      <section className="pt-24 pb-32 px-6 sm:px-6 lg:px-40 bg-linear-to-b from-gray-50/50 to-white relative" data-test="secao-como-funciona">
        <div className="text-center mb-20">
          <div className="inline-block px-4 py-2 bg-global-accent/10 rounded-full mb-4">
            <span className="text-sm font-semibold text-global-accent uppercase tracking-wider">Processo Simples</span>
          </div>
          <h2 className="text-4xl md:text-5xl font-bold text-global-text-secondary mb-6" data-test="titulo-como-funciona">
            Como Funciona
          </h2>
          <p className="text-lg md:text-xl text-global-text-primary/70 max-w-3xl mx-auto leading-relaxed" data-test="descricao-como-funciona">
            Três passos simples para fazer a diferença na sua cidade. 
            Reporte problemas de forma rápida e acompanhe tudo em tempo real.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8 mb-16 max-w-6xl mx-auto" data-test="grid-passos">
          {[
            {
              number: "1",
              title: "Tire uma foto",
              description: "Registre o problema com uma foto clara do local",
              icon: (
                <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
              )
            },
            {
              number: "2",
              title: "Descreva o problema",
              description: "Adicione detalhes sobre a localização e a situação",
              icon: (
                <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                </svg>
              )
            },
            {
              number: "3",
              title: "Acompanhe",
              description: "Receba atualizações e acompanhe a resolução em tempo real",
              icon: (
                <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
                </svg>
              )
            },
          ].map((step, index) => (
            <div key={step.number} className="relative group" data-test={`card-passo-${step.number}`}>
              {index < 2 && (
                <div className="hidden md:block absolute top-16 left-[60%] w-[80%] h-0.5 bg-linear-to-r from-global-accent/30 to-transparent z-0"></div>
              )}
              
              <div className="relative bg-white rounded-2xl p-10 hover:shadow-xl transition-all duration-300 border-2 border-gray-100 group-hover:border-global-accent/30 min-h-[340px] flex flex-col justify-center">
                <div className="flex flex-col items-center text-center space-y-5 w-full">
                  <div className="relative">
                    <div className="w-24 h-24 bg-linear-to-br from-global-accent to-[#4a9bb8] rounded-2xl flex items-center justify-center text-white group-hover:scale-110 transition-transform duration-300 shadow-lg">
                      {step.icon}
                    </div>
                    <div className="absolute -top-4 -right-4 w-14 h-14 bg-global-accent border-4 border-white rounded-full flex items-center justify-center text-xl font-bold text-white shadow-md" data-test={`numero-passo-${step.number}`}>
                      {step.number}
                    </div>
                  </div>
                  
                  <h3 className="text-xl md:text-2xl font-bold text-global-text-secondary" data-test={`titulo-passo-${step.number}`}>
                    {step.title}
                  </h3>
                  <p className="text-base md:text-lg text-global-text-primary/70 leading-relaxed" data-test={`descricao-passo-${step.number}`}>
                    {step.description}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="bg-linear-to-br from-global-accent/5 to-transparent rounded-2xl p-10 border border-global-accent/20 max-w-5xl mx-auto" data-test="info-processo">
          <div className="flex items-start gap-6">
            <div className="shrink-0 w-12 h-12 bg-global-accent/10 rounded-xl flex items-center justify-center">
              <svg className="w-7 h-7 text-global-accent" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div>
              <h4 className="text-lg font-bold text-global-text-secondary mb-3">
                O que acontece depois?
              </h4>
              <p className="text-base md:text-lg text-global-text-primary/80 leading-relaxed">
                Sua solicitação será analisada pela equipe responsável e, caso aprovada, 
                encaminhada ao setor competente para resolução. Você receberá notificações 
                sobre cada etapa do processo e poderá acompanhar tudo em tempo real através 
                da plataforma.
              </p>
            </div>
          </div>
        </div>
      </section>


      <div className="relative h-px bg-linear-to-r from-transparent via-gray-200 to-transparent"></div>

      <section className="pt-12 pb-24 px-6 sm:px-6 lg:px-40 bg-linear-to-b from-white via-blue-50/20 to-white relative overflow-hidden" data-test="secao-porque-utilizar">
        
        <div className="absolute inset-0 opacity-[0.03]">
          <div className="absolute top-20 right-20 w-64 h-64 bg-global-accent rounded-full blur-3xl"></div>
          <div className="absolute bottom-20 left-20 w-80 h-80 bg-cyan-400 rounded-full blur-3xl"></div>
        </div>

        <div className="absolute inset-0 opacity-[0.02]">
          <svg width="100%" height="100%">
            <pattern id="diagonals" x="0" y="0" width="40" height="40" patternUnits="userSpaceOnUse">
              <path d="M0 40L40 0" stroke="currentColor" strokeWidth="1" className="text-global-accent"/>
            </pattern>
            <rect width="100%" height="100%" fill="url(#diagonals)" />
          </svg>
        </div>

        <div className="grid lg:grid-cols-5 gap-12 lg:gap-16 items-start relative z-10">
          <div className="lg:col-span-3 space-y-10 order-2 lg:order-1">
            <div className="space-y-6">
              <div className="inline-block px-4 py-2 bg-global-accent/10 rounded-full">
                <span className="text-sm font-semibold text-global-accent uppercase tracking-wider">Por que escolher?</span>
              </div>
              
              <div>
                <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-global-text-secondary leading-tight mb-3" data-test="titulo-porque-utilizar">
                  Vilhena<span className="text-global-accent">+</span>Pública
                </h2>
              </div>

              <p className="text-base md:text-lg text-global-text-primary leading-relaxed max-w-2xl" data-test="descricao-porque-utilizar">
                A forma mais eficiente de conectar você com a prefeitura de Vilhena
              </p>
            </div>
          
            <div className="space-y-5" data-test="lista-vantagens">
              {[
                {
                  icon: (
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                    </svg>
                  ),
                  title: "Rápido",
                  description: "Sistema otimizado para resolução ágil e eficiente de todas as suas demandas e solicitações"
                },
                {
                  icon: (
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </svg>
                  ),
                  title: "Transparente",
                  description: "Acompanhe o status da sua solicitação em tempo real, com total visibilidade do processo"
                },
                {
                  icon: (
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                    </svg>
                  ),
                  title: "Seguro",
                  description: "Plataforma oficial mantendo seus dados sempre protegidos e seguros"
                },
                {
                  icon: (
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                    </svg>
                  ),
                  title: "Direto",
                  description: "Comunicação direta com a prefeitura, sem intermediários e sem complicações burocráticas"
                },
              ].map((benefit, index) => (
                <div 
                  key={index} 
                  className="group relative bg-white rounded-2xl p-6 border border-blue-100 hover:border-global-accent/40 hover:shadow-lg transition-all duration-300"
                  data-test={`card-vantagem-${index + 1}`}
                >
                  <div className="absolute left-0 top-6 bottom-6 w-1 bg-linear-to-b from-global-accent to-[#4a9bb8] rounded-r-full opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                  
                  <div className="flex gap-5 items-start pl-2">
                    <div className="shrink-0 w-14 h-14 bg-linear-to-br from-global-accent to-[#4a9bb8] rounded-xl flex items-center justify-center text-white shadow-md group-hover:scale-110 group-hover:shadow-lg transition-all duration-300">
                      {benefit.icon}
                    </div>
                    <div className="flex-1 pt-1">
                      <h3 className="text-lg font-bold text-global-text-secondary mb-2 group-hover:text-global-accent transition-colors" data-test={`titulo-vantagem-${index + 1}`}>
                        {benefit.title}
                      </h3>
                      <p className="text-sm md:text-base text-global-text-primary/70 leading-relaxed" data-test={`descricao-vantagem-${index + 1}`}>
                        {benefit.description}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="lg:col-span-2 order-1 lg:order-2 lg:self-stretch">
            <div className="relative h-full min-h-[400px]">
              <div className="relative aspect-4/4 lg:aspect-auto lg:h-full max-w-sm mx-auto lg:max-w-none">
                <div className="absolute -inset-4 bg-linear-to-br from-global-accent/15 via-cyan-400/8 to-transparent rounded-3xl blur-xl"></div>
                <div className="absolute -inset-2 bg-linear-to-tr from-blue-400/8 via-transparent to-[#4a9bb8]/8 rounded-3xl"></div>
                
                <div className="absolute -inset-1 bg-linear-to-br from-global-accent to-[#4a9bb8] rounded-3xl opacity-15"></div>
                
                <div className="relative h-full rounded-3xl overflow-hidden shadow-2xl border-4 border-white bg-white">
                  <div className="absolute inset-0 bg-linear-to-br from-global-accent/5 via-transparent to-cyan-400/5 z-10"></div>
                  <Image
                    src="/homeCardPorqueUsar.png"
                    alt="Pessoa usando tablet"
                    fill
                    sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 40vw"
                    className="object-cover relative z-0"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
      
      <div className="relative h-px bg-linear-to-r from-transparent via-gray-200 to-transparent"></div>

      <section className="relative py-16 px-6 sm:px-6 lg:px-40 overflow-hidden" data-test="secao-cta">
        <div className="absolute top-0 left-0 right-0 h-px bg-linear-to-r from-transparent via-global-accent/40 to-transparent"></div>
        <div className="absolute inset-0 bg-linear-to-br from-global-accent via-[#3d8aa8] to-[#4a9bb8]">
          <div className="absolute inset-0 opacity-10">
            <svg className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
              <defs>
                <pattern id="grid" width="60" height="60" patternUnits="userSpaceOnUse">
                  <circle cx="30" cy="30" r="2" fill="white"/>
                  <circle cx="0" cy="0" r="1" fill="white"/>
                  <circle cx="60" cy="0" r="1" fill="white"/>
                  <circle cx="0" cy="60" r="1" fill="white"/>
                  <circle cx="60" cy="60" r="1" fill="white"/>
                </pattern>
              </defs>
              <rect width="100%" height="100%" fill="url(#grid)"/>
            </svg>
          </div>
          
          <div className="absolute top-10 right-10 w-72 h-72 bg-white/10 rounded-full blur-3xl"></div>
          <div className="absolute bottom-10 left-10 w-96 h-96 bg-cyan-300/20 rounded-full blur-3xl"></div>
          <div className="absolute top-20 left-20 w-20 h-20 border-2 border-white/20 rounded-lg rotate-12"></div>
          <div className="absolute bottom-32 right-32 w-16 h-16 border-2 border-white/20 rounded-full"></div>
        </div>
        
        <div className="relative z-10 max-w-4xl mx-auto text-center text-white space-y-8">
          {isAuthenticated ? (
            <>
              <div className="inline-block px-6 py-2 bg-white/20 backdrop-blur-sm rounded-full text-sm font-semibold mb-4" data-test="badge-cta">
                Vamos transformar Vilhena juntos
              </div>
              
              <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold leading-tight" data-test="titulo-cta">
                Tem algo para reportar?
              </h2>
              
              <p className="text-xl md:text-2xl text-white/90 max-w-3xl mx-auto leading-relaxed" data-test="descricao-cta">
                Sua participação é fundamental para melhorarmos nossa cidade. 
                Reporte problemas, acompanhe soluções e faça a diferença.
              </p>
              
              <div className="flex flex-col sm:flex-row gap-4 justify-center pt-6" data-test="botoes-cta">
                <a 
                  href="#servicos"
                  className="group relative px-10 py-5 bg-white text-global-accent font-bold text-lg rounded-lg shadow-2xl hover:shadow-3xl transition-all duration-300 overflow-hidden"
                  data-test="botao-fazer-solicitacao"
                >
                  <span className="relative z-10">Fazer uma Solicitação</span>
                  <div className="absolute inset-0 bg-linear-to-r from-white to-blue-50 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                </a>
                <Link 
                  href="/pedidosMunicipe"
                  className="px-10 py-5 bg-transparent text-white font-bold text-lg rounded-lg border-2 border-white hover:bg-white hover:text-global-accent transition-all duration-300"
                  data-test="botao-ver-pedidos"
                >
                  Ver Meus Pedidos
                </Link>
              </div>

              <div className="flex justify-center gap-8 pt-12 text-white/80 text-sm">
                <div className="flex items-center gap-2">
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"/>
                  </svg>
                  <span>Resposta Rápida</span>
                </div>
                <div className="flex items-center gap-2">
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"/>
                  </svg>
                  <span>Acompanhamento em Tempo Real</span>
                </div>
                <div className="flex items-center gap-2">
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"/>
                  </svg>
                  <span>Transparente</span>
                </div>
              </div>
            </>
          ) : (
            <>
              <div className="inline-block px-6 py-2 bg-white/20 backdrop-blur-sm rounded-full text-sm font-semibold mb-4" data-test="badge-cta">
                Junte-se a nós
              </div>
              
              <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold leading-tight" data-test="titulo-cta">
                Pronto para começar?
              </h2>
              
              <p className="text-xl md:text-2xl text-white/90 max-w-3xl mx-auto leading-relaxed" data-test="descricao-cta">
                Faça parte da transformação de Vilhena. Sua participação é fundamental 
                para construirmos juntos uma cidade melhor para todos.
              </p>
              
              <div className="flex flex-col sm:flex-row gap-4 justify-center pt-6" data-test="botoes-cta">
                <Link 
                  href="/cadastro"
                  className="group relative px-10 py-5 bg-white text-global-accent font-bold text-lg rounded-lg shadow-2xl hover:shadow-3xl transition-all duration-300 overflow-hidden"
                  data-test="botao-criar-conta"
                >
                  <span className="relative z-10">
                    Criar Conta Agora
                  </span>
                  <div className="absolute inset-0 bg-linear-to-r from-white to-blue-50 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                </Link>
                <Link 
                  href="/login"
                  className="px-10 py-5 bg-transparent text-white font-bold text-lg rounded-lg border-2 border-white hover:bg-white hover:text-global-accent transition-all duration-300"
                  data-test="botao-ja-tenho-conta"
                >
                  Já tenho conta
                </Link>
              </div>

              <div className="flex justify-center gap-8 pt-12 text-white/80 text-sm">
                <div className="flex items-center gap-2">
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"/>
                  </svg>
                  <span>100% Gratuito</span>
                </div>
                <div className="flex items-center gap-2">
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"/>
                  </svg>
                  <span>Seguro</span>
                </div>
                <div className="flex items-center gap-2">
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"/>
                  </svg>
                  <span>Fácil de usar</span>
                </div>
              </div>
            </>
          )}
        </div>
      </section>
    </div>
  );
}