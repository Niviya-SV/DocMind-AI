"use client";

import { ChangeEvent, FormEvent, useRef, useState } from "react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import Icon from "@/components/ui/AppIcon";

const API_URL = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:5000/api";

type DocumentItem = {
  id: string;
  fileName: string;
  status?: string;
};

export default function SandboxPage() {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [documents, setDocuments] = useState<DocumentItem[]>([]);
  const [selectedDocumentId, setSelectedDocumentId] = useState<string | null>(null);
  const [question, setQuestion] = useState("");
  const [answer, setAnswer] = useState("");
  const [isUploading, setIsUploading] = useState(false);
  const [isAsking, setIsAsking] = useState(false);
  const [error, setError] = useState("");

  const getToken = () => typeof window === "undefined" ? null : localStorage.getItem("token");

  async function uploadFiles(files: File[]) {
    const pdfFiles = files.filter((file) => file.type === "application/pdf" || file.name.toLowerCase().endsWith(".pdf"));
    if (!pdfFiles.length) {
      setError("Please select PDF files only.");
      return;
    }

    setError("");
    setIsUploading(true);
    try {
      const formData = new FormData();
      pdfFiles.slice(0, 10 - documents.length).forEach((file) => formData.append("pdfs", file));
      const token = getToken();
      const response = await fetch(`${API_URL}/documents/upload`, {
        method: "POST",
        headers: token ? { Authorization: `Bearer ${token}` } : undefined,
        body: formData,
      });
      const data = await response.json();
      if (!response.ok || !data.success) throw new Error(data.message || "PDF upload failed.");

      const returnedDocuments = (Array.isArray(data.documents) ? data.documents : [data.document])
        .filter(Boolean)
        .map((document: Record<string, unknown>) => ({
          id: String(document.id || document._id),
          fileName: String(document.fileName || document.title || "PDF document"),
          status: String(document.status || "Processed"),
        }));
      setDocuments((current) => [...current, ...returnedDocuments]);
      setSelectedDocumentId(returnedDocuments[0]?.id || null);
    } catch (uploadError) {
      setError(uploadError instanceof Error ? uploadError.message : "PDF upload failed.");
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  }

  function handleFileChange(event: ChangeEvent<HTMLInputElement>) {
    const files = Array.from(event.target.files || []);
    if (files.length) void uploadFiles(files);
  }

  async function handleAsk(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!question.trim() || !selectedDocumentId) return;
    setError("");
    setIsAsking(true);
    try {
      const token = getToken();
      const response = await fetch(`${API_URL}/chat/ask`, {
        method: "POST",
        headers: { "Content-Type": "application/json", ...(token ? { Authorization: `Bearer ${token}` } : {}) },
        body: JSON.stringify({ question, documentId: selectedDocumentId }),
      });
      const data = await response.json();
      if (!response.ok || !data.success) throw new Error(data.message || "Could not generate an answer.");
      setAnswer(data.answer || "No answer was generated.");
      setQuestion("");
    } catch (askError) {
      setError(askError instanceof Error ? askError.message : "Could not generate an answer.");
    } finally {
      setIsAsking(false);
    }
  }

  return (
    <main className="min-h-screen overflow-x-hidden bg-background text-foreground">
      <Header />
      <section className="mx-auto max-w-7xl px-6 pb-20 pt-36">
        <div className="mb-10 max-w-3xl">
          <p className="mb-3 text-xs font-black uppercase tracking-[0.25em] text-primary">Private workspace</p>
          <h1 className="text-4xl font-black tracking-tight sm:text-6xl">Upload your PDFs</h1>
          <p className="mt-4 text-lg text-muted-foreground">Upload a document, select it, and ask questions using local RAG.</p>
        </div>

        <div className="grid gap-6 lg:grid-cols-[0.8fr_1.2fr]">
          <div className="space-y-6">
            <button type="button" onClick={() => fileInputRef.current?.click()} disabled={isUploading || documents.length >= 10} className="flex min-h-72 w-full flex-col items-center justify-center rounded-2xl border-2 border-dashed border-primary/40 bg-card/60 p-8 text-center transition hover:border-primary hover:bg-primary/5 disabled:cursor-not-allowed disabled:opacity-60">
              <input ref={fileInputRef} type="file" accept=".pdf,application/pdf" multiple onChange={handleFileChange} className="hidden" />
              <span className="mb-5 rounded-2xl border border-primary/30 bg-primary/10 p-5 text-primary"><Icon name="ArrowUpTrayIcon" size={32} /></span>
              <span className="text-xl font-bold">Upload multiple PDFs</span>
              <span className="mt-2 text-sm text-muted-foreground">Click to browse, up to 10 documents</span>
              {isUploading && <span className="mt-5 text-sm text-primary">Uploading and processing...</span>}
            </button>

            {documents.length > 0 && <div className="rounded-2xl border border-border/60 bg-card/60 p-6">
              <p className="mb-4 text-xs font-black uppercase tracking-widest text-muted-foreground">Uploaded documents</p>
              <div className="space-y-2">
                {documents.map((document) => <button key={document.id} type="button" onClick={() => setSelectedDocumentId(document.id)} className={`flex w-full items-center gap-3 rounded-xl border p-3 text-left transition ${selectedDocumentId === document.id ? "border-primary/70 bg-primary/10" : "border-border/40 bg-background/40 hover:border-primary/40"}`}>
                  <Icon name="DocumentCheckIcon" size={20} className="shrink-0 text-primary" />
                  <span className="min-w-0 flex-1 truncate text-sm font-semibold">{document.fileName}</span>
                  <span className="text-xs text-green-400">{document.status}</span>
                </button>)}
              </div>
            </div>}
          </div>

          <div className="rounded-2xl border border-border/60 bg-card/60 p-6 sm:p-8">
            <p className="mb-2 text-xs font-black uppercase tracking-widest text-muted-foreground">Ask your document</p>
            <h2 className="text-2xl font-black">RAG Query</h2>
            <p className="mt-2 text-sm text-muted-foreground">{selectedDocumentId ? "Your selected PDF is ready for questions." : "Upload and select a PDF to start."}</p>
            <form onSubmit={handleAsk} className="mt-6 space-y-4">
              <textarea value={question} onChange={(event) => setQuestion(event.target.value)} disabled={!selectedDocumentId || isAsking} placeholder="Ask anything about the selected document..." rows={6} className="w-full resize-none rounded-xl border border-border bg-background px-4 py-3 text-sm outline-none transition focus:border-primary disabled:opacity-50" />
              <button type="submit" disabled={!selectedDocumentId || !question.trim() || isAsking} className="flex w-full items-center justify-center gap-2 rounded-xl bg-primary px-5 py-3 text-sm font-black uppercase tracking-widest text-primary-foreground transition hover:bg-accent disabled:cursor-not-allowed disabled:opacity-50"><Icon name="PaperAirplaneIcon" size={16} />{isAsking ? "Processing..." : "Run RAG Query"}</button>
            </form>
            {answer && <div className="mt-8 rounded-xl border border-primary/30 bg-primary/5 p-5"><p className="mb-2 text-xs font-black uppercase tracking-widest text-primary">AI answer</p><p className="whitespace-pre-wrap text-sm leading-7">{answer}</p></div>}
            {error && <p className="mt-5 rounded-xl border border-red-400/30 bg-red-400/10 p-4 text-sm text-red-300">{error}</p>}
          </div>
        </div>
      </section>
      <Footer />
    </main>
  );
}
