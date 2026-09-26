import Header from "@/components/Header";
import Footer from "@/components/Footer";

const principles = [
  {
    title: "Private by design",
    description: "Your documents stay in your workspace. DOCMIND AI is built around local retrieval so sensitive knowledge does not need to leave your control.",
  },
  {
    title: "Answers with context",
    description: "Instead of searching through pages manually, ask a question and get a focused answer grounded in the document you selected.",
  },
  {
    title: "Knowledge that works",
    description: "Turn static PDFs into a practical knowledge base for research, study, legal work, operations, and everyday decisions.",
  },
];

export default function AboutPage() {
  return (
    <main className="min-h-screen overflow-x-hidden bg-background text-foreground">
      <Header />

      <section className="relative overflow-hidden px-6 pb-20 pt-40 sm:pb-28 sm:pt-48">
        <div className="absolute inset-0 hero-bg pointer-events-none" />
        <div className="absolute inset-0 grid-lines opacity-30 pointer-events-none" />
        <div className="relative z-10 mx-auto max-w-5xl">
          <p className="mb-4 text-xs font-black uppercase tracking-[0.25em] text-primary">About DOCMIND AI</p>
          <h1 className="max-w-4xl text-5xl font-black tracking-tight sm:text-7xl">Your documents should answer back.</h1>
          <p className="mt-8 max-w-3xl text-xl leading-relaxed text-muted-foreground">
            DOCMIND AI turns the information inside your PDFs into a private, searchable workspace. Upload your documents, ask natural questions, and understand the material faster.
          </p>
        </div>
      </section>

      <section className="relative z-10 border-y border-border/40 px-6 py-20 sm:py-28">
        <div className="mx-auto max-w-5xl">
          <div className="max-w-2xl">
            <p className="mb-3 text-xs font-black uppercase tracking-[0.25em] text-primary">Why we built it</p>
            <h2 className="text-3xl font-black tracking-tight sm:text-5xl">Less searching. More understanding.</h2>
            <p className="mt-6 text-lg leading-relaxed text-muted-foreground">
              Important knowledge is often locked inside long reports, notes, manuals, and research papers. DOCMIND AI gives that knowledge a useful interface without making you sort through endless results or give up ownership of your files.
            </p>
          </div>

          <div className="mt-14 grid gap-5 md:grid-cols-3">
            {principles.map((principle) => (
              <article key={principle.title} className="rounded-2xl border border-border/60 bg-card/60 p-7">
                <h3 className="text-xl font-bold">{principle.title}</h3>
                <p className="mt-4 leading-relaxed text-muted-foreground">{principle.description}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="px-6 py-20 sm:py-28">
        <div className="mx-auto grid max-w-5xl gap-12 md:grid-cols-[0.8fr_1.2fr] md:items-center">
          <div>
            <p className="mb-3 text-xs font-black uppercase tracking-[0.25em] text-primary">Built for real work</p>
            <h2 className="text-3xl font-black tracking-tight sm:text-5xl">One calm place for the knowledge you already have.</h2>
          </div>
          <p className="text-lg leading-relaxed text-muted-foreground">
            Whether you are studying a textbook, reviewing a contract, exploring research, or organizing company documentation, DOCMIND AI helps you move from a question to a useful answer with less friction. The experience stays focused: your files, your questions, your understanding.
          </p>
        </div>
      </section>

      <Footer />
    </main>
  );
}