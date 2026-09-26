'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';

const API_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:5000/api';

type DocumentRecord = {
  _id: string;
  fileName: string;
  title: string;
  status: string;
  createdAt: string;
};

type ChatRecord = {
  _id: string;
  question: string;
  answer: string;
  createdAt: string;
};

export default function HistoryPage() {
  const [documents, setDocuments] = useState<DocumentRecord[]>([]);
  const [chats, setChats] = useState<Record<string, ChatRecord[]>>({});
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      window.location.href = '/login';
      return;
    }

    async function loadHistory() {
      try {
        const headers = { Authorization: `Bearer ${token}` };
        const documentResponse = await fetch(`${API_URL}/documents`, { headers });
        const documentData = await documentResponse.json();
        if (!documentResponse.ok || !documentData.success) {
          throw new Error(documentData.message || 'Unable to load documents');
        }

        const records: DocumentRecord[] = documentData.documents || [];
        const historyEntries = await Promise.all(
          records.map(async (document) => {
            const response = await fetch(`${API_URL}/chat/history/${document._id}`, { headers });
            const data = await response.json();
            return [document._id, data.chats || []] as const;
          })
        );

        setDocuments(records);
        setChats(Object.fromEntries(historyEntries));
      } catch (loadError) {
        setError(loadError instanceof Error ? loadError.message : 'Unable to load history');
      } finally {
        setIsLoading(false);
      }
    }

    loadHistory();
  }, []);

  return (
    <main className="min-h-screen bg-background text-foreground">
      <Header />
      <section className="mx-auto max-w-6xl px-6 pb-24 pt-36">
        <div className="mb-10 flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="mb-3 text-xs font-black uppercase tracking-[0.25em] text-primary">Workspace archive</p>
            <h1 className="text-4xl font-black tracking-tight sm:text-5xl">Document history</h1>
            <p className="mt-3 max-w-2xl text-muted-foreground">Review the documents you uploaded and the questions you asked.</p>
          </div>
          <Link href="/workspace" className="rounded-full bg-primary px-5 py-3 text-center text-xs font-black uppercase tracking-widest text-primary-foreground transition hover:bg-accent">Open workspace</Link>
        </div>

        {isLoading && <p className="text-muted-foreground">Loading history...</p>}
        {error && <p className="rounded-xl border border-red-400/30 bg-red-400/10 p-4 text-sm text-red-300">{error}</p>}
        {!isLoading && !error && documents.length === 0 && (
          <div className="rounded-3xl border border-dashed border-border/60 p-12 text-center">
            <h2 className="text-xl font-bold">No documents yet</h2>
            <p className="mt-2 text-muted-foreground">Upload your first document in the workspace.</p>
          </div>
        )}

        <div className="space-y-6">
          {documents.map((document) => (
            <article key={document._id} className="rounded-3xl border border-border/50 bg-card/60 p-6 shadow-xl backdrop-blur-xl">
              <div className="flex flex-col gap-3 border-b border-border/40 pb-5 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <h2 className="text-lg font-bold">{document.title || document.fileName}</h2>
                  <p className="mt-1 text-xs text-muted-foreground">{document.fileName} · {new Date(document.createdAt).toLocaleString()}</p>
                </div>
                <span className="w-fit rounded-full border border-green-400/30 bg-green-400/10 px-3 py-1 text-xs font-bold uppercase tracking-widest text-green-300">{document.status}</span>
              </div>
              <div className="mt-5 space-y-3">
                {(chats[document._id] || []).length === 0 && <p className="text-sm text-muted-foreground">No questions asked for this document.</p>}
                {(chats[document._id] || []).map((chat) => (
                  <div key={chat._id} className="rounded-2xl border border-border/40 bg-background/40 p-4">
                    <p className="text-sm font-semibold">{chat.question}</p>
                    <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{chat.answer}</p>
                    <p className="mt-3 text-[11px] text-muted-foreground/70">{new Date(chat.createdAt).toLocaleString()}</p>
                  </div>
                ))}
              </div>
            </article>
          ))}
        </div>
      </section>
      <Footer />
    </main>
  );
}
