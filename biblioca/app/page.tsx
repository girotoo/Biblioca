"use client";

import { useRouter } from "next/navigation";
import { useUser } from "@clerk/nextjs";

export default function HomePage() {
  const router = useRouter();
  const { isSignedIn } = useUser();

  const handleStartStudying = () => {
    if (isSignedIn) {
      router.push("/assets");
    } else {
      router.push("/login");
    }
  };

  return (
    <div className="relative min-h-screen flex flex-col justify-center items-center overflow-hidden bg-[#0a0a0f] p-6">

      {/* Background decorativo */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-[-120px] left-[-120px] w-[500px] h-[500px] rounded-full bg-blue-600/10 blur-[120px]" />
        <div className="absolute bottom-[-80px] right-[-80px] w-[400px] h-[400px] rounded-full bg-indigo-500/10 blur-[100px]" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_transparent_60%,_#0a0a0f_100%)]" />
        {/* Grid subtil */}
        <div
          className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage:
              "linear-gradient(#fff 1px, transparent 1px), linear-gradient(90deg, #fff 1px, transparent 1px)",
            backgroundSize: "60px 60px",
          }}
        />
      </div>

      {/* Conteúdo principal */}
      <div className="relative z-10 max-w-2xl w-full text-center flex flex-col items-center gap-8">

        {/* Badge */}
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-white/10 bg-white/5 text-xs font-medium text-slate-400 tracking-widest uppercase">
          <span className="w-1.5 h-1.5 rounded-full bg-blue-400 animate-pulse" />
          Plataforma de estudo para Portugal
        </div>

        {/* Título */}
        <div className="space-y-3">
          <h1 className="text-7xl font-black tracking-tighter text-white leading-none">
            Biblio<span className="text-blue-400">ca</span>
          </h1>
          <div className="flex items-center justify-center gap-3">
            <div className="h-px w-12 bg-white/10" />
            <p className="text-slate-400 text-sm tracking-widest uppercase font-medium">
              O teu espaço de estudo
            </p>
            <div className="h-px w-12 bg-white/10" />
          </div>
        </div>

        {/* Descrição */}
        <p className="text-slate-400 text-lg leading-relaxed max-w-xl">
          Explora uma vasta biblioteca de recursos escolares e simplifica o teu
          método de estudo. Desenvolvido para o sucesso em Portugal.
        </p>

        {/* Features rápidas */}
        <div className="grid grid-cols-3 gap-4 w-full max-w-lg">
          {[
            { icon: "📚", label: "Recursos" },
            { icon: "🎯", label: "Foco" },
            { icon: "⚡", label: "Eficiência" },
          ].map(({ icon, label }) => (
            <div
              key={label}
              className="flex flex-col items-center gap-2 p-4 rounded-2xl border border-white/8 bg-white/4 hover:bg-white/8 transition-colors"
            >
              <span className="text-2xl">{icon}</span>
              <span className="text-xs text-slate-400 font-medium tracking-wide">
                {label}
              </span>
            </div>
          ))}
        </div>

        {/* Botão CTA */}
        <button
          onClick={handleStartStudying}
          style={{
            font: "inherit",
            backgroundColor: "#60a5fa",
            border: 0,
            color: "#fff",
            borderRadius: "0.5em",
            fontSize: "1.35rem",
            padding: "0.375em 1em",
            fontWeight: 600,
            textShadow: "0 0.0625em 0 #2563eb",
            boxShadow:
              "inset 0 0.0625em 0 0 #93c5fd, 0 0.0625em 0 0 #3b82f6, 0 0.125em 0 0 #3b82f6, 0 0.25em 0 0 #2563eb, 0 0.3125em 0 0 #1d4ed8, 0 0.375em 0 0 #1d4ed8, 0 0.425em 0 0 #1e40af, 0 0.425em 0.5em 0 #1e3a8a",
            transition: "0.15s ease",
            cursor: "pointer",
          }}
          onMouseDown={(e) => {
            (e.currentTarget as HTMLButtonElement).style.translate = "0 0.225em";
            (e.currentTarget as HTMLButtonElement).style.boxShadow =
              "inset 0 0.03em 0 0 #93c5fd, 0 0.03em 0 0 #3b82f6, 0 0.0625em 0 0 #3b82f6, 0 0.125em 0 0 #2563eb, 0 0.125em 0 0 #1d4ed8, 0 0.2em 0 0 #1d4ed8, 0 0.225em 0 0 #1e40af, 0 0.225em 0.375em 0 #1e3a8a";
          }}
          onMouseUp={(e) => {
            (e.currentTarget as HTMLButtonElement).style.translate = "";
            (e.currentTarget as HTMLButtonElement).style.boxShadow =
              "inset 0 0.0625em 0 0 #93c5fd, 0 0.0625em 0 0 #3b82f6, 0 0.125em 0 0 #3b82f6, 0 0.25em 0 0 #2563eb, 0 0.3125em 0 0 #1d4ed8, 0 0.375em 0 0 #1d4ed8, 0 0.425em 0 0 #1e40af, 0 0.425em 0.5em 0 #1e3a8a";
          }}
          onMouseLeave={(e) => {
            (e.currentTarget as HTMLButtonElement).style.translate = "";
            (e.currentTarget as HTMLButtonElement).style.boxShadow =
              "inset 0 0.0625em 0 0 #93c5fd, 0 0.0625em 0 0 #3b82f6, 0 0.125em 0 0 #3b82f6, 0 0.25em 0 0 #2563eb, 0 0.3125em 0 0 #1d4ed8, 0 0.375em 0 0 #1d4ed8, 0 0.425em 0 0 #1e40af, 0 0.425em 0.5em 0 #1e3a8a";
          }}
        >
          Começar a estudar
        </button>

        {/* Autor */}
        <p className="text-xs text-slate-600 font-medium tracking-widest uppercase">
          Desenvolvido por Simão Cardoso Girôto
        </p>
      </div>

      {/* Rodapé */}
      <footer className="absolute bottom-6 text-slate-600 text-xs tracking-wide">
        &copy; {new Date().getFullYear()} Biblioca — Estudar nunca foi tão simples.
      </footer>
    </div>
  );
}
