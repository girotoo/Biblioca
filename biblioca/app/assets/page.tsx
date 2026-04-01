"use client";

import { useEffect, useRef, useState } from "react";
import { useUser } from "@clerk/nextjs";
import AuthCheck from "../components/AuthCheck";

interface Material {
  id: string;
  title: string;
  subject: string;
  description: string;
  fileUrl: string;
  fileName: string;
  fileType: string;
  authorId: string;
  authorName: string;
  authorImageUrl: string;
  approved: boolean;
  createdAt: string;
}

export default function AssetsPage() {
  const { user } = useUser();
  const [subjects, setSubjects] = useState<string[]>([]);
  const [materials, setMaterials] = useState<Material[]>([]);
  const [activeSubject, setActiveSubject] = useState<string>("Todos");
  const [menuOpen, setMenuOpen] = useState(false);
  const [uploadOpen, setUploadOpen] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [materialsCount, setMaterialsCount] = useState(0);
  const [profileOpen, setProfileOpen] = useState(false);
  const [pendingMaterials, setPendingMaterials] = useState<Material[]>([]);
  const [adminPanelOpen, setAdminPanelOpen] = useState(false);
  const [newSubjectName, setNewSubjectName] = useState("");
  const menuRef = useRef<HTMLDivElement>(null);

  // Upload form state
  const [uploadTitle, setUploadTitle] = useState("");
  const [uploadSubject, setUploadSubject] = useState("");
  const [uploadDesc, setUploadDesc] = useState("");
  const [uploadFile, setUploadFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadSuccess, setUploadSuccess] = useState(false);

  useEffect(() => {
    fetchData();
    fetchMe();
  }, []);

  useEffect(() => {
    if (user?.id) fetchProfileCount(user.id);
  }, [user]);

  useEffect(() => {
    if (isAdmin) fetchPending();
  }, [isAdmin]);

  // Close menu on outside click
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  async function fetchData() {
    const res = await fetch("/api/materials");
    const data = await res.json();
    setSubjects(data.subjects || []);
    setMaterials(data.materials || []);
  }

  async function fetchMe() {
    const res = await fetch("/api/me");
    const data = await res.json();
    setIsAdmin(data.isAdmin);
  }

  async function fetchProfileCount(userId: string) {
    const res = await fetch(`/api/profile?userId=${userId}`);
    const data = await res.json();
    setMaterialsCount(data.count);
  }

  async function fetchPending() {
    const res = await fetch("/api/admin");
    const data = await res.json();
    setPendingMaterials(data.pending || []);
  }

  async function handleUpload() {
    if (!uploadTitle || !uploadSubject || !uploadFile) return;
    setUploading(true);

    // Convert file to base64 data URL (simulated storage)
    const reader = new FileReader();
    reader.onload = async () => {
      const fileUrl = reader.result as string;

      const res = await fetch("/api/materials", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: uploadTitle,
          subject: uploadSubject,
          description: uploadDesc,
          fileUrl,
          fileName: uploadFile.name,
          fileType: uploadFile.type,
          authorName: user?.fullName || user?.username || "Anónimo",
          authorImageUrl: user?.imageUrl || "",
        }),
      });

      setUploading(false);
      if (res.ok) {
        setUploadSuccess(true);
        setUploadTitle("");
        setUploadSubject("");
        setUploadDesc("");
        setUploadFile(null);
        setTimeout(() => {
          setUploadSuccess(false);
          setUploadOpen(false);
        }, 2000);
      }
    };
    reader.readAsDataURL(uploadFile);
  }

  async function handleAdminAction(materialId: string, action: "approve" | "reject") {
    await fetch("/api/admin", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ materialId, action }),
    });
    fetchPending();
    fetchData();
  }

  async function handleAddSubject() {
    if (!newSubjectName.trim()) return;
    await fetch("/api/admin", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ subject: newSubjectName.trim() }),
    });
    setNewSubjectName("");
    fetchData();
  }

  const filteredMaterials =
    activeSubject === "Todos"
      ? materials
      : materials.filter((m) => m.subject === activeSubject);

  function getFileIcon(fileType: string) {
    if (fileType?.includes("pdf")) return "📄";
    if (fileType?.includes("image")) return "🖼️";
    if (fileType?.includes("word") || fileType?.includes("document")) return "📝";
    if (fileType?.includes("presentation") || fileType?.includes("powerpoint")) return "📊";
    return "📁";
  }

  return (
    <AuthCheck>
      <div className="relative min-h-screen bg-[#0a0a0f] text-white">

        {/* ── NAVBAR ── */}
        <nav className="sticky top-0 z-40 flex items-center justify-between px-6 py-4 border-b border-white/8 bg-[#0a0a0f]/90 backdrop-blur-md">
          {/* Hamburger */}
          <div ref={menuRef} className="relative">
            <button
              onClick={() => setMenuOpen((v) => !v)}
              className="flex flex-col gap-1.5 p-2 rounded-lg hover:bg-white/8 transition-colors"
              aria-label="Menu"
            >
              <span className={`block w-6 h-0.5 bg-white transition-all duration-200 ${menuOpen ? "rotate-45 translate-y-2" : ""}`} />
              <span className={`block w-6 h-0.5 bg-white transition-all duration-200 ${menuOpen ? "opacity-0" : ""}`} />
              <span className={`block w-6 h-0.5 bg-white transition-all duration-200 ${menuOpen ? "-rotate-45 -translate-y-2" : ""}`} />
            </button>

            {/* Dropdown menu */}
            {menuOpen && (
              <div className="absolute top-full left-0 mt-2 w-56 rounded-2xl border border-white/10 bg-[#111118] shadow-2xl overflow-hidden">
                <div className="px-4 py-3 border-b border-white/8">
                  <p className="text-xs text-slate-500 uppercase tracking-widest font-medium">Matérias</p>
                </div>
                <button
                  onClick={() => { setActiveSubject("Todos"); setMenuOpen(false); }}
                  className={`w-full text-left px-4 py-3 text-sm transition-colors hover:bg-white/6 ${activeSubject === "Todos" ? "text-blue-400 font-semibold" : "text-slate-300"}`}
                >
                  📚 Todos
                </button>
                {subjects.map((s) => (
                  <button
                    key={s}
                    onClick={() => { setActiveSubject(s); setMenuOpen(false); }}
                    className={`w-full text-left px-4 py-3 text-sm transition-colors hover:bg-white/6 ${activeSubject === s ? "text-blue-400 font-semibold" : "text-slate-300"}`}
                  >
                    {s}
                  </button>
                ))}
                {isAdmin && (
                  <div className="border-t border-white/8 px-4 py-3 space-y-2">
                    <p className="text-xs text-amber-400 uppercase tracking-widest font-medium">Admin</p>
                    <div className="flex gap-2">
                      <input
                        value={newSubjectName}
                        onChange={(e) => setNewSubjectName(e.target.value)}
                        placeholder="Nova matéria..."
                        className="flex-1 text-xs bg-white/8 rounded-lg px-3 py-2 text-white placeholder-slate-500 border border-white/10 focus:outline-none focus:border-blue-400"
                        onKeyDown={(e) => e.key === "Enter" && handleAddSubject()}
                      />
                      <button
                        onClick={handleAddSubject}
                        className="text-xs px-3 py-2 bg-blue-600 hover:bg-blue-500 rounded-lg transition-colors font-medium"
                      >
                        +
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Logo */}
          <h1 className="text-xl font-black tracking-tighter">
            Biblio<span className="text-blue-400">ca</span>
          </h1>

          {/* Right actions */}
          <div className="flex items-center gap-3">
            {isAdmin && (
              <button
                onClick={() => setAdminPanelOpen(true)}
                className="relative text-xs px-3 py-1.5 rounded-full border border-amber-400/40 text-amber-400 hover:bg-amber-400/10 transition-colors font-medium"
              >
                Admin
                {pendingMaterials.length > 0 && (
                  <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-red-500 text-white text-[10px] flex items-center justify-center font-bold">
                    {pendingMaterials.length}
                  </span>
                )}
              </button>
            )}
            <button
              onClick={() => setUploadOpen(true)}
              className="text-xs px-4 py-2 rounded-full bg-blue-600 hover:bg-blue-500 transition-colors font-semibold"
            >
              + Upload
            </button>
            {/* Avatar / Profile */}
            <button onClick={() => setProfileOpen(true)} className="relative">
              {user?.imageUrl ? (
                <img src={user.imageUrl} alt="avatar" className="w-9 h-9 rounded-full border-2 border-white/20 hover:border-blue-400 transition-colors object-cover" />
              ) : (
                <div className="w-9 h-9 rounded-full bg-blue-600 flex items-center justify-center text-sm font-bold">
                  {user?.firstName?.[0] || "?"}
                </div>
              )}
            </button>
          </div>
        </nav>

        {/* ── MAIN CONTENT ── */}
        <main className="max-w-6xl mx-auto px-6 py-10">
          {/* Header */}
          <div className="mb-8">
            <h2 className="text-3xl font-black tracking-tight">
              {activeSubject === "Todos" ? "Todos os materiais" : activeSubject}
            </h2>
            <p className="text-slate-500 text-sm mt-1">{filteredMaterials.length} material(is) disponível(eis)</p>
          </div>

          {/* Materials grid */}
          {filteredMaterials.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-24 text-center">
              <span className="text-5xl mb-4">📭</span>
              <p className="text-slate-400 text-lg font-medium">Nenhum material ainda</p>
              <p className="text-slate-600 text-sm mt-1">Sê o primeiro a fazer upload!</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {filteredMaterials.map((mat) => (
                <div
                  key={mat.id}
                  className="group flex flex-col rounded-2xl border border-white/8 bg-white/4 hover:bg-white/7 hover:border-blue-400/30 transition-all duration-200 overflow-hidden"
                >
                  {/* File preview banner */}
                  <div className="flex items-center justify-center h-32 bg-white/4 border-b border-white/8 text-5xl">
                    {getFileIcon(mat.fileType)}
                  </div>

                  <div className="flex flex-col flex-1 p-5 gap-3">
                    {/* Subject tag */}
                    <span className="text-[11px] font-semibold uppercase tracking-widest text-blue-400 bg-blue-400/10 px-2.5 py-1 rounded-full w-fit">
                      {mat.subject}
                    </span>

                    {/* Title */}
                    <h3 className="font-bold text-white text-base leading-snug line-clamp-2">
                      {mat.title}
                    </h3>

                    {/* Description */}
                    {mat.description && (
                      <p className="text-slate-400 text-sm line-clamp-3 leading-relaxed">
                        {mat.description}
                      </p>
                    )}

                    {/* Author */}
                    <div className="flex items-center gap-2 mt-auto pt-3 border-t border-white/8">
                      {mat.authorImageUrl ? (
                        <img src={mat.authorImageUrl} alt={mat.authorName} className="w-6 h-6 rounded-full object-cover" />
                      ) : (
                        <div className="w-6 h-6 rounded-full bg-blue-600 flex items-center justify-center text-[10px] font-bold">
                          {mat.authorName?.[0] || "?"}
                        </div>
                      )}
                      <span className="text-xs text-slate-400 font-medium">{mat.authorName}</span>
                      <span className="text-slate-700 text-xs ml-auto">
                        {new Date(mat.createdAt).toLocaleDateString("pt-PT")}
                      </span>
                    </div>

                    {/* Download */}
                    <a
                      href={mat.fileUrl}
                      download={mat.fileName}
                      className="text-center text-xs font-semibold py-2.5 rounded-xl bg-blue-600/20 text-blue-400 hover:bg-blue-600 hover:text-white transition-all duration-150"
                    >
                      ⬇ Descarregar {mat.fileName}
                    </a>
                  </div>
                </div>
              ))}
            </div>
          )}
        </main>

        {/* ── UPLOAD MODAL ── */}
        {uploadOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
            <div className="w-full max-w-md rounded-3xl border border-white/10 bg-[#111118] p-8 shadow-2xl">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-black">Enviar material</h3>
                <button onClick={() => setUploadOpen(false)} className="text-slate-500 hover:text-white transition-colors text-2xl leading-none">×</button>
              </div>

              {uploadSuccess ? (
                <div className="flex flex-col items-center py-8 gap-3">
                  <span className="text-5xl">✅</span>
                  <p className="text-green-400 font-semibold">Enviado! A aguardar aprovação.</p>
                </div>
              ) : (
                <div className="space-y-4">
                  <div>
                    <label className="text-xs text-slate-400 uppercase tracking-widest font-medium mb-1.5 block">Título *</label>
                    <input
                      value={uploadTitle}
                      onChange={(e) => setUploadTitle(e.target.value)}
                      placeholder="Ex: Resumo Funções Matemática"
                      className="w-full bg-white/6 border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-blue-400 transition-colors"
                    />
                  </div>

                  <div>
                    <label className="text-xs text-slate-400 uppercase tracking-widest font-medium mb-1.5 block">Matéria *</label>
                    <select
                      value={uploadSubject}
                      onChange={(e) => setUploadSubject(e.target.value)}
                      className="w-full bg-white/6 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-blue-400 transition-colors appearance-none"
                    >
                      <option value="" className="bg-[#111118]">Selecionar matéria...</option>
                      {subjects.map((s) => (
                        <option key={s} value={s} className="bg-[#111118]">{s}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="text-xs text-slate-400 uppercase tracking-widest font-medium mb-1.5 block">Descrição (opcional)</label>
                    <textarea
                      value={uploadDesc}
                      onChange={(e) => setUploadDesc(e.target.value)}
                      placeholder="Descreve o conteúdo do material..."
                      rows={3}
                      className="w-full bg-white/6 border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-blue-400 transition-colors resize-none"
                    />
                  </div>

                  <div>
                    <label className="text-xs text-slate-400 uppercase tracking-widest font-medium mb-1.5 block">Ficheiro *</label>
                    <label className="flex flex-col items-center justify-center w-full h-28 border-2 border-dashed border-white/15 rounded-xl cursor-pointer hover:border-blue-400/50 hover:bg-blue-400/5 transition-all">
                      {uploadFile ? (
                        <div className="text-center px-4">
                          <p className="text-2xl mb-1">{getFileIcon(uploadFile.type)}</p>
                          <p className="text-sm text-blue-400 font-medium truncate max-w-[200px]">{uploadFile.name}</p>
                          <p className="text-xs text-slate-500 mt-0.5">{(uploadFile.size / 1024).toFixed(1)} KB</p>
                        </div>
                      ) : (
                        <div className="text-center">
                          <p className="text-2xl mb-1">📎</p>
                          <p className="text-sm text-slate-400">Clica para selecionar qualquer ficheiro</p>
                        </div>
                      )}
                      <input type="file" className="hidden" onChange={(e) => setUploadFile(e.target.files?.[0] || null)} />
                    </label>
                  </div>

                  {/* Author info (read-only) */}
                  <div className="flex items-center gap-3 px-4 py-3 rounded-xl bg-white/4 border border-white/8">
                    {user?.imageUrl ? (
                      <img src={user.imageUrl} alt="avatar" className="w-8 h-8 rounded-full object-cover" />
                    ) : (
                      <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center text-sm font-bold">
                        {user?.firstName?.[0] || "?"}
                      </div>
                    )}
                    <div>
                      <p className="text-sm font-medium text-white">{user?.fullName || user?.username}</p>
                      <p className="text-xs text-slate-500">Autor do material</p>
                    </div>
                  </div>

                  <button
                    onClick={handleUpload}
                    disabled={uploading || !uploadTitle || !uploadSubject || !uploadFile}
                    style={{
                      font: "inherit",
                      backgroundColor: (!uploadTitle || !uploadSubject || !uploadFile) ? "#1e3a5f" : "#60a5fa",
                      border: 0,
                      color: "#fff",
                      borderRadius: "0.5em",
                      fontSize: "1rem",
                      padding: "0.5em 1em",
                      fontWeight: 600,
                      width: "100%",
                      textShadow: "0 0.0625em 0 #2563eb",
                      boxShadow: (!uploadTitle || !uploadSubject || !uploadFile) ? "none" :
                        "inset 0 0.0625em 0 0 #93c5fd, 0 0.0625em 0 0 #3b82f6, 0 0.125em 0 0 #3b82f6, 0 0.25em 0 0 #2563eb, 0 0.3125em 0 0 #1d4ed8, 0 0.375em 0 0 #1d4ed8, 0 0.425em 0 0 #1e40af, 0 0.425em 0.5em 0 #1e3a8a",
                      transition: "0.15s ease",
                      cursor: (!uploadTitle || !uploadSubject || !uploadFile) ? "not-allowed" : "pointer",
                      opacity: uploading ? 0.7 : 1,
                    }}
                    onMouseDown={(e) => {
                      if (!uploadTitle || !uploadSubject || !uploadFile) return;
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
                    {uploading ? "A enviar..." : "Enviar material"}
                  </button>
                </div>
              )}
            </div>
          </div>
        )}

        {/* ── PROFILE MODAL ── */}
        {profileOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
            <div className="w-full max-w-sm rounded-3xl border border-white/10 bg-[#111118] p-8 shadow-2xl text-center">
              <button onClick={() => setProfileOpen(false)} className="absolute top-4 right-4 text-slate-500 hover:text-white text-2xl">×</button>

              {user?.imageUrl ? (
                <img src={user.imageUrl} alt="avatar" className="w-20 h-20 rounded-full border-4 border-blue-400/40 object-cover mx-auto mb-4" />
              ) : (
                <div className="w-20 h-20 rounded-full bg-blue-600 flex items-center justify-center text-3xl font-black mx-auto mb-4">
                  {user?.firstName?.[0] || "?"}
                </div>
              )}

              <h3 className="text-xl font-black text-white">{user?.fullName || user?.username}</h3>
              <p className="text-slate-500 text-sm mt-1">{user?.primaryEmailAddress?.emailAddress}</p>

              {/* Role badge */}
              <div className={`inline-flex items-center gap-2 mt-3 px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-widest ${isAdmin ? "bg-amber-400/15 text-amber-400 border border-amber-400/30" : "bg-blue-400/10 text-blue-400 border border-blue-400/20"}`}>
                <span className={`w-1.5 h-1.5 rounded-full ${isAdmin ? "bg-amber-400" : "bg-blue-400"}`} />
                {isAdmin ? "Admin" : "Estudante"}
              </div>

              {/* Stats */}
              <div className="mt-6 p-4 rounded-2xl bg-white/4 border border-white/8">
                <p className="text-3xl font-black text-blue-400">{materialsCount}</p>
                <p className="text-slate-400 text-sm mt-1">
                  {materialsCount === 1 ? "material enviado" : "materiais enviados"}
                </p>
              </div>

              <button
                onClick={() => setProfileOpen(false)}
                className="mt-4 w-full py-3 rounded-xl border border-white/10 text-slate-400 hover:text-white hover:border-white/20 transition-colors text-sm font-medium"
              >
                Fechar
              </button>
            </div>
          </div>
        )}

        {/* ── ADMIN PANEL MODAL ── */}
        {adminPanelOpen && isAdmin && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
            <div className="w-full max-w-2xl rounded-3xl border border-amber-400/20 bg-[#111118] p-8 shadow-2xl max-h-[80vh] overflow-y-auto">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h3 className="text-xl font-black">Painel Admin</h3>
                  <p className="text-amber-400 text-sm font-medium mt-0.5">Materiais a aguardar aprovação</p>
                </div>
                <button onClick={() => setAdminPanelOpen(false)} className="text-slate-500 hover:text-white text-2xl">×</button>
              </div>

              {pendingMaterials.length === 0 ? (
                <div className="flex flex-col items-center py-12 text-center">
                  <span className="text-4xl mb-3">✅</span>
                  <p className="text-slate-400">Nenhum material pendente</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {pendingMaterials.map((mat) => (
                    <div key={mat.id} className="flex items-start gap-4 p-4 rounded-2xl border border-white/8 bg-white/4">
                      <span className="text-3xl mt-1">{getFileIcon(mat.fileType)}</span>
                      <div className="flex-1 min-w-0">
                        <p className="font-bold text-white text-sm">{mat.title}</p>
                        <p className="text-blue-400 text-xs font-medium mt-0.5">{mat.subject}</p>
                        {mat.description && <p className="text-slate-400 text-xs mt-1 line-clamp-2">{mat.description}</p>}
                        <div className="flex items-center gap-2 mt-2">
                          {mat.authorImageUrl && <img src={mat.authorImageUrl} className="w-5 h-5 rounded-full" alt="" />}
                          <p className="text-slate-500 text-xs">{mat.authorName}</p>
                          <span className="text-slate-700 text-xs">· {mat.fileName}</span>
                        </div>
                      </div>
                      <div className="flex flex-col gap-2">
                        <button
                          onClick={() => handleAdminAction(mat.id, "approve")}
                          className="px-4 py-2 text-xs font-bold rounded-xl bg-green-500/20 text-green-400 hover:bg-green-500 hover:text-white transition-all"
                        >
                          ✓ Aprovar
                        </button>
                        <button
                          onClick={() => handleAdminAction(mat.id, "reject")}
                          className="px-4 py-2 text-xs font-bold rounded-xl bg-red-500/20 text-red-400 hover:bg-red-500 hover:text-white transition-all"
                        >
                          ✕ Rejeitar
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

      </div>
    </AuthCheck>
  );
}
