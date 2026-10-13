// "use client";

// import {
//   ChangeEvent,
//   DragEvent,
//   FormEvent,
//   useRef,
//   useState,
// } from "react";
// import Header from "@/components/Header";
// import Footer from "@/components/Footer";
// import Icon from "@/components/ui/AppIcon";

// const API_URL =
//   process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:5000/api";

// async function readApiResponse(response: Response) {
//   const contentType = response.headers.get("content-type") || "";

//   if (!contentType.includes("application/json")) {
//     throw new Error(
//       "The backend did not return JSON. Check that the backend is running and NEXT_PUBLIC_BACKEND_URL points to it."
//     );
//   }

//   return response.json();
// }

// type DocumentItem = {
//   id: string;
//   fileName: string;
//   status: string;
//   size?: string;
// };

// export default function WorkspacePage() {
//   const fileInputRef = useRef<HTMLInputElement>(null);

//   const [documents, setDocuments] = useState<DocumentItem[]>([]);
//   const [selectedDocumentId, setSelectedDocumentId] = useState<string | null>(
//     null
//   );

//   const [question, setQuestion] = useState("");
//   const [answer, setAnswer] = useState("");

//   const [isUploading, setIsUploading] = useState(false);
//   const [isAsking, setIsAsking] = useState(false);
//   const [isDragging, setIsDragging] = useState(false);

//   const [error, setError] = useState("");

//   const getToken = () => {
//     if (typeof window === "undefined") return null;
//     return localStorage.getItem("token");
//   };

//   const getGuestId = () => {
//     if (typeof window === "undefined") return null;

//     const existingGuestId = localStorage.getItem("docmind_guest_id");
//     if (existingGuestId) return existingGuestId;

//     const guestId = crypto.randomUUID();
//     localStorage.setItem("docmind_guest_id", guestId);
//     return guestId;
//   };

//   const selectedDocument = documents.find(
//     (document) => document.id === selectedDocumentId
//   );

//   function formatFileSize(bytes: number) {
//     if (!bytes) return "";

//     if (bytes < 1024) {
//       return `${bytes} B`;
//     }

//     if (bytes < 1024 * 1024) {
//       return `${(bytes / 1024).toFixed(1)} KB`;
//     }

//     return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
//   }

//   async function uploadFiles(files: File[]) {
//     const pdfFiles = files.filter(
//       (file) =>
//         file.type === "application/pdf" ||
//         file.name.toLowerCase().endsWith(".pdf")
//     );

//     if (!pdfFiles.length) {
//       setError("Please select PDF files only.");
//       return;
//     }

//     const remainingSlots = 10 - documents.length;

//     if (remainingSlots <= 0) {
//       setError("You can upload a maximum of 10 documents.");
//       return;
//     }

//     const filesToUpload = pdfFiles.slice(0, remainingSlots);

//     if (pdfFiles.length > remainingSlots) {
//       setError(
//         `Only ${remainingSlots} more PDF${
//           remainingSlots > 1 ? "s are" : " is"
//         } allowed.`
//       );
//     } else {
//       setError("");
//     }

//     setIsUploading(true);

//     try {
//       const formData = new FormData();

//       filesToUpload.forEach((file) => {
//         formData.append("documents", file);
//       });

//       const token = getToken();
//       const guestId = token ? null : getGuestId();

//       const response = await fetch(`${API_URL}/documents/upload`, {
//         method: "POST",
//         headers: token
//           ? {
//               Authorization: `Bearer ${token}`,
//             }
//           : guestId
//           ? { "x-guest-id": guestId }
//           : undefined,
//         body: formData,
//       });

//       const data = await readApiResponse(response);

//       if (!response.ok || !data.success) {
//         const failedDocument = Array.isArray(data.documents)
//           ? data.documents.find(
//               (document: Record<string, unknown>) => document.status === "failed"
//             )
//           : null;

//         throw new Error(
//           String(failedDocument?.message || data.message || "PDF upload failed.")
//         );
//       }

//       /*
//        * Backend can return either:
//        * data.documents = [...]
//        *
//        * OR
//        *
//        * data.document = {...}
//        */
//       const backendDocuments = Array.isArray(data.documents)
//         ? data.documents
//         : data.document
//         ? [data.document]
//         : [];

//       const returnedDocuments: DocumentItem[] = backendDocuments
//         .filter(Boolean)
//         .map((document: Record<string, unknown>) => ({
//           id: String(document.id || document._id),
//           fileName: String(
//             document.fileName ||
//               document.originalFileName ||
//               document.title ||
//               "PDF document"
//           ),
//           status: String(document.status || "Ready"),
//           size: document.size ? String(document.size) : "",
//         }));

//       if (!returnedDocuments.length) {
//         throw new Error(
//           "The upload succeeded, but the server did not return document details."
//         );
//       }

//       /*
//        * IMPORTANT:
//        * Append new documents instead of replacing old documents.
//        */
//       setDocuments((current) => {
//         const existingIds = new Set(current.map((doc) => doc.id));

//         const newDocuments = returnedDocuments.filter(
//           (doc) => !existingIds.has(doc.id)
//         );

//         return [...current, ...newDocuments];
//       });

//       /*
//        * Automatically select the first newly uploaded document.
//        */
//       setSelectedDocumentId(returnedDocuments[0].id);

//       setAnswer("");
//     } catch (uploadError) {
//       setError(
//         uploadError instanceof TypeError
//           ? `Could not reach the backend at ${API_URL}. Start the backend and check NEXT_PUBLIC_BACKEND_URL.`
//           : uploadError instanceof Error
//           ? uploadError.message
//           : "PDF upload failed."
//       );
//     } finally {
//       setIsUploading(false);

//       if (fileInputRef.current) {
//         fileInputRef.current.value = "";
//       }
//     }
//   }

//   function handleFileChange(event: ChangeEvent<HTMLInputElement>) {
//     const files = Array.from(event.target.files || []);

//     if (files.length) {
//       void uploadFiles(files);
//     }
//   }

//   function handleDrop(event: DragEvent<HTMLDivElement>) {
//     event.preventDefault();
//     setIsDragging(false);

//     const files = Array.from(event.dataTransfer.files || []);

//     if (files.length) {
//       void uploadFiles(files);
//     }
//   }

//   async function handleAsk(event: FormEvent<HTMLFormElement>) {
//     event.preventDefault();

//     if (!question.trim()) {
//       setError("Please enter a question.");
//       return;
//     }

//     if (!selectedDocumentId) {
//       setError("Please select a PDF first.");
//       return;
//     }

//     setError("");
//     setAnswer("");
//     setIsAsking(true);

//     try {
//       const token = getToken();
//       const guestId = token ? null : getGuestId();

//       const response = await fetch(`${API_URL}/chat/ask`, {
//         method: "POST",
//         headers: {
//           "Content-Type": "application/json",
//           ...(token
//             ? {
//                 Authorization: `Bearer ${token}`,
//               }
//             : guestId
//             ? {
//                 "x-guest-id": guestId,
//               }
//             : {}),
//         },
//         body: JSON.stringify({
//           question: question.trim(),
//           documentId: selectedDocumentId,
//         }),
//       });

//       const data = await readApiResponse(response);

//       if (!response.ok || !data.success) {
//         throw new Error(
//           data.message || "Could not generate an answer."
//         );
//       }

//       setAnswer(data.answer || "No answer was generated.");
//       setQuestion("");
//     } catch (askError) {
//       setError(
//         askError instanceof TypeError
//           ? `Could not reach the backend at ${API_URL}. Start the backend and check NEXT_PUBLIC_BACKEND_URL.`
//           : askError instanceof Error
//           ? askError.message
//           : "Could not generate an answer."
//       );
//     } finally {
//       setIsAsking(false);
//     }
//   }

//   return (
//     <main className="min-h-screen overflow-x-hidden bg-[#07051a] text-white">
//       <Header />

//       <section className="mx-auto max-w-7xl px-5 pb-24 pt-32 sm:px-8">
//         {/* HERO */}
//         <div className="mx-auto mb-10 max-w-4xl text-center">
//           <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-purple-400/20 bg-purple-500/10 px-4 py-2 text-xs font-black uppercase tracking-[0.2em] text-purple-300">
//             <span className="h-2 w-2 rounded-full bg-green-400" />
//             Private Document Workspace
//           </div>

//           <h1 className="text-4xl font-black tracking-tight sm:text-6xl">
//             RAG Query{" "}
//             <span className="bg-gradient-to-r from-purple-400 to-blue-500 bg-clip-text text-transparent">
//               Workspace
//             </span>
//           </h1>

//           <p className="mx-auto mt-5 max-w-2xl text-base leading-7 text-purple-200/70 sm:text-lg">
//             Upload multiple PDF documents, keep them in your workspace, select
//             any document, and ask questions using your local RAG pipeline.
//           </p>
//         </div>

//         {/* ============================= */}
//         {/* UPLOADED DOCUMENTS TOP PANEL */}
//         {/* ============================= */}

//         {documents.length > 0 && (
//           <section className="mb-8 rounded-3xl border border-purple-400/20 bg-white p-5 shadow-[0_20px_80px_rgba(0,0,0,0.25)] sm:p-7">
//             <div className="mb-5 flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
//               <div>
//                 <p className="text-xs font-black uppercase tracking-[0.2em] text-purple-600">
//                   Your Documents
//                 </p>

//                 <h2 className="mt-1 text-2xl font-black text-black">
//                   Uploaded PDFs
//                 </h2>

//                 <p className="mt-1 text-sm text-gray-500">
//                   {documents.length} of 10 documents uploaded
//                 </p>
//               </div>

//               <button
//                 type="button"
//                 onClick={() => fileInputRef.current?.click()}
//                 disabled={isUploading || documents.length >= 10}
//                 className="inline-flex items-center justify-center gap-2 rounded-xl bg-purple-600 px-5 py-3 text-sm font-black text-white transition hover:bg-purple-700 disabled:cursor-not-allowed disabled:opacity-50"
//               >
//                 <Icon name="PlusIcon" size={18} />
//                 ADD MORE PDFs
//               </button>
//             </div>

//             {/* DOCUMENT CARDS */}
//             <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
//               {documents.map((document, index) => {
//                 const isSelected =
//                   selectedDocumentId === document.id;

//                 return (
//                   <button
//                     key={document.id}
//                     type="button"
//                     onClick={() => {
//                       setSelectedDocumentId(document.id);
//                       setAnswer("");
//                       setError("");
//                     }}
//                     className={`group relative flex min-h-[125px] items-start gap-4 rounded-2xl border p-4 text-left transition-all ${
//                       isSelected
//                         ? "border-purple-600 bg-purple-50 shadow-lg shadow-purple-100"
//                         : "border-gray-200 bg-gray-50 hover:border-purple-300 hover:bg-purple-50/50"
//                     }`}
//                   >
//                     {/* NUMBER */}
//                     <div
//                       className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-sm font-black ${
//                         isSelected
//                           ? "bg-purple-600 text-white"
//                           : "bg-purple-100 text-purple-700"
//                       }`}
//                     >
//                       {index + 1}
//                     </div>

//                     {/* PDF ICON + INFO */}
//                     <div className="min-w-0 flex-1">
//                       <div className="flex items-start gap-2">
//                         <Icon
//                           name="DocumentTextIcon"
//                           size={20}
//                           className="mt-0.5 shrink-0 text-purple-600"
//                         />

//                         {/* BLACK FILE NAME */}
//                         <span className="break-words text-sm font-black leading-5 text-black">
//                           {document.fileName}
//                         </span>
//                       </div>

//                       <div className="mt-3 flex items-center gap-2">
//                         <span className="inline-flex items-center gap-1 rounded-full bg-green-100 px-2.5 py-1 text-[10px] font-black uppercase tracking-wider text-green-700">
//                           <span className="h-1.5 w-1.5 rounded-full bg-green-500" />
//                           {document.status}
//                         </span>

//                         {isSelected && (
//                           <span className="rounded-full bg-purple-100 px-2.5 py-1 text-[10px] font-black uppercase tracking-wider text-purple-700">
//                             Selected
//                           </span>
//                         )}
//                       </div>
//                     </div>

//                     {/* CHECK */}
//                     {isSelected && (
//                       <div className="absolute right-3 top-3 flex h-6 w-6 items-center justify-center rounded-full bg-purple-600 text-white">
//                         <Icon name="CheckIcon" size={14} />
//                       </div>
//                     )}
//                   </button>
//                 );
//               })}
//             </div>
//           </section>
//         )}

//         {/* ============================= */}
//         {/* MAIN GRID */}
//         {/* ============================= */}

//         <div className="grid gap-7 lg:grid-cols-[0.8fr_1.2fr]">
//           {/* LEFT SIDE */}
//           <div className="space-y-7">
//             {/* MULTIPLE UPLOAD */}
//             <div
//               onDragOver={(event) => {
//                 event.preventDefault();
//                 setIsDragging(true);
//               }}
//               onDragLeave={() => setIsDragging(false)}
//               onDrop={handleDrop}
//               onClick={() => fileInputRef.current?.click()}
//               className={`group flex min-h-[330px] cursor-pointer flex-col items-center justify-center rounded-3xl border-2 border-dashed p-8 text-center transition-all ${
//                 isDragging
//                   ? "border-purple-400 bg-purple-500/10"
//                   : "border-purple-400/30 bg-[#0c0924] hover:border-purple-400 hover:bg-purple-500/5"
//               }`}
//             >
//               <input
//                 ref={fileInputRef}
//                 type="file"
//                 accept=".pdf,application/pdf"
//                 multiple
//                 onChange={handleFileChange}
//                 className="hidden"
//               />

//               <div className="mb-6 flex h-20 w-20 items-center justify-center rounded-3xl border border-purple-400/30 bg-purple-500/10 text-purple-400 transition group-hover:scale-105">
//                 <Icon name="ArrowUpTrayIcon" size={36} />
//               </div>

//               <h2 className="text-2xl font-black text-white">
//                 Upload Multiple PDFs
//               </h2>

//               <p className="mt-3 max-w-sm text-sm leading-6 text-purple-200/60">
//                 Select multiple PDF documents at once or drag and drop them
//                 here.
//               </p>

//               <div className="mt-5 flex flex-wrap justify-center gap-2">
//                 <span className="rounded-full bg-purple-500/10 px-3 py-1.5 text-xs font-bold text-purple-300">
//                   PDF only
//                 </span>

//                 <span className="rounded-full bg-purple-500/10 px-3 py-1.5 text-xs font-bold text-purple-300">
//                   Maximum 10
//                 </span>

//                 <span className="rounded-full bg-purple-500/10 px-3 py-1.5 text-xs font-bold text-purple-300">
//                   RAG Ready
//                 </span>
//               </div>

//               {isUploading && (
//                 <div className="mt-6 flex items-center gap-2 text-sm font-bold text-purple-300">
//                   <span className="h-2 w-2 animate-pulse rounded-full bg-purple-400" />
//                   Uploading and processing PDFs...
//                 </div>
//               )}
//             </div>

//             {/* CURRENT DOCUMENT */}
//             <div className="rounded-3xl border border-purple-400/15 bg-[#0c0924] p-6">
//               <p className="text-xs font-black uppercase tracking-[0.2em] text-purple-400">
//                 Current Document
//               </p>

//               {selectedDocument ? (
//                 <div className="mt-4 flex items-center gap-4 rounded-2xl border border-purple-400/20 bg-white p-4">
//                   <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-purple-100 text-purple-600">
//                     <Icon name="DocumentTextIcon" size={24} />
//                   </div>

//                   <div className="min-w-0">
//                     <p className="break-words text-sm font-black text-black">
//                       {selectedDocument.fileName}
//                     </p>

//                     <p className="mt-1 text-xs font-semibold text-green-600">
//                       Ready for questions
//                     </p>
//                   </div>
//                 </div>
//               ) : (
//                 <p className="mt-3 text-sm text-purple-200/50">
//                   Upload and select a PDF to start asking questions.
//                 </p>
//               )}
//             </div>
//           </div>

//           {/* RIGHT SIDE - QUESTION AREA */}
//           <div className="rounded-3xl border border-purple-400/15 bg-[#0c0924] p-6 sm:p-8">
//             <div className="mb-6">
//               <p className="text-xs font-black uppercase tracking-[0.2em] text-purple-400">
//                 Ask Your Document
//               </p>

//               <h2 className="mt-2 text-3xl font-black text-white">
//                 Ask a Question
//               </h2>

//               <p className="mt-2 text-sm leading-6 text-purple-200/60">
//                 {selectedDocument
//                   ? `Questions will be answered from "${selectedDocument.fileName}".`
//                   : "Select a PDF from your uploaded documents."}
//               </p>
//             </div>

//             <form onSubmit={handleAsk}>
//               <textarea
//                 value={question}
//                 onChange={(event) => setQuestion(event.target.value)}
//                 disabled={!selectedDocumentId || isAsking}
//                 placeholder={
//                   selectedDocumentId
//                     ? "Ask anything about this document..."
//                     : "Upload and select a PDF first..."
//                 }
//                 rows={8}
//                 className="w-full resize-none rounded-2xl border border-purple-400/20 bg-white px-5 py-4 text-sm font-medium text-black outline-none placeholder:text-gray-400 transition focus:border-purple-500 focus:ring-4 focus:ring-purple-500/10 disabled:cursor-not-allowed disabled:bg-gray-100"
//               />

//               <button
//                 type="submit"
//                 disabled={
//                   !selectedDocumentId ||
//                   !question.trim() ||
//                   isAsking
//                 }
//                 className="mt-4 flex w-full items-center justify-center gap-3 rounded-2xl bg-gradient-to-r from-purple-600 to-blue-600 px-6 py-4 text-sm font-black uppercase tracking-widest text-white transition hover:scale-[1.01] hover:shadow-lg hover:shadow-purple-500/20 disabled:cursor-not-allowed disabled:opacity-40"
//               >
//                 <Icon name="PaperAirplaneIcon" size={18} />

//                 {isAsking ? "Processing..." : "Run RAG Query"}
//               </button>
//             </form>

//             {/* ANSWER */}
//             {answer && (
//               <div className="mt-8 rounded-2xl border border-purple-400/20 bg-white p-6">
//                 <div className="mb-4 flex items-center gap-3">
//                   <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-purple-100 text-purple-600">
//                     <Icon name="SparklesIcon" size={18} />
//                   </div>

//                   <div>
//                     <p className="text-xs font-black uppercase tracking-widest text-purple-600">
//                       AI Answer
//                     </p>

//                     <p className="text-xs text-gray-500">
//                       Based on the selected PDF
//                     </p>
//                   </div>
//                 </div>

//                 <p className="whitespace-pre-wrap text-sm leading-7 text-black">
//                   {answer}
//                 </p>
//               </div>
//             )}

//             {/* ERROR */}
//             {error && (
//               <div className="mt-5 rounded-2xl border border-red-300 bg-red-50 p-4 text-sm font-semibold text-red-700">
//                 {error}
//               </div>
//             )}
//           </div>
//         </div>
//       </section>

//       <Footer />
//     </main>
//   );
// }

"use client";

import {
  ChangeEvent,
  DragEvent,
  FormEvent,
  useEffect,
  useRef,
  useState,
} from "react";

import Header from "@/components/Header";
import Footer from "@/components/Footer";
import Icon from "@/components/ui/AppIcon";

// ======================================================
// BACKEND URL
// ======================================================

const API_URL =
  process.env.NEXT_PUBLIC_BACKEND_URL ||
  "http://localhost:5000/api";

// ======================================================
// API RESPONSE
// ======================================================

async function readApiResponse(response: Response) {
  const contentType =
    response.headers.get("content-type") || "";

  if (!contentType.includes("application/json")) {
    throw new Error(
      "The backend did not return JSON. Check that the backend is running and NEXT_PUBLIC_BACKEND_URL points to it."
    );
  }

  return response.json();
}

// ======================================================
// TYPES
// ======================================================

type DocumentItem = {
  id: string;
  fileName: string;
  status: string;
  size?: string;
  space?: string;
};

// ======================================================
// WORKSPACE PAGE
// ======================================================

export default function WorkspacePage() {
  // ----------------------------------------------------
  // REFS
  // ----------------------------------------------------

  const fileInputRef =
    useRef<HTMLInputElement>(null);

  // ----------------------------------------------------
  // DOCUMENT STATE
  // ----------------------------------------------------

  const [documents, setDocuments] =
    useState<DocumentItem[]>([]);

  const [
    selectedDocumentId,
    setSelectedDocumentId,
  ] = useState<string | null>(null);

  // ----------------------------------------------------
  // QUESTION / ANSWER
  // ----------------------------------------------------

  const [question, setQuestion] =
    useState("");

  const [answer, setAnswer] =
    useState("");

  // ----------------------------------------------------
  // UI STATE
  // ----------------------------------------------------

  const [isUploading, setIsUploading] =
    useState(false);

  const [isAsking, setIsAsking] =
    useState(false);

  const [isPreparingWorkspace, setIsPreparingWorkspace] =
    useState(false);

  const [isDragging, setIsDragging] =
    useState(false);

  const [error, setError] =
    useState("");

  // ====================================================
  // GET TOKEN
  // ====================================================

  const getToken = () => {
    if (
      typeof window === "undefined"
    ) {
      return null;
    }

    return (
      localStorage.getItem("token") ||
      localStorage.getItem("accessToken")
    );
  };

  const getAuthHeaders = (token: string): HeadersInit => ({
    Authorization: `Bearer ${token}`,
  });

  // ====================================================
  // SELECTED DOCUMENT
  // ====================================================

  const selectedDocument =
    documents.find(
      (document) =>
        document.id ===
        selectedDocumentId
    );

  // ====================================================
  // FORMAT FILE SIZE
  // ====================================================

  function formatFileSize(
    bytes: number
  ) {
    if (!bytes) return "";

    if (bytes < 1024) {
      return `${bytes} B`;
    }

    if (
      bytes <
      1024 * 1024
    ) {
      return `${(
        bytes / 1024
      ).toFixed(1)} KB`;
    }

    return `${(
      bytes /
      (1024 * 1024)
    ).toFixed(1)} MB`;
  }

  // ====================================================
  // LOAD WORKSPACE DOCUMENTS
  // ====================================================

  async function loadDocuments() {
    try {
      setError("");

      const token =
        getToken();

      // Workspace is private
      if (!token) {
        setDocuments([]);
        setSelectedDocumentId(null);

        setError(
          "Please login to access your Workspace."
        );

        return;
      }

      console.log(
        "📚 Loading Workspace documents..."
      );

      setIsPreparingWorkspace(true);

      const reprocessResponse = await fetch(
        `${API_URL}/documents/reprocess`,
        {
          method: "POST",
          headers: {
            Authorization:
              `Bearer ${token}`,
          },
        }
      );

      const reprocessData =
        await readApiResponse(reprocessResponse);

      if (reprocessResponse.status === 401) {
        localStorage.removeItem("token");
        localStorage.removeItem("accessToken");
        setError("Your login session is invalid or expired. Please log in again.");
        return;
      }

      if (!reprocessResponse.ok || !reprocessData.success) {
        throw new Error(
          reprocessData.message ||
            "Failed to prepare Workspace documents."
        );
      }

      const response =
        await fetch(
          `${API_URL}/documents?space=workspace`,
          {
            method: "GET",

            headers: getAuthHeaders(token),
          }
        );

      const data =
        await readApiResponse(
          response
        );

      if (response.status === 401) {
        localStorage.removeItem("token");
        localStorage.removeItem("accessToken");
        setError("Your login session is invalid or expired. Please log in again.");
        return;
      }

      console.log(
        "📥 Workspace documents response:",
        data
      );

      if (
        !response.ok ||
        !data.success
      ) {
        throw new Error(
          data.message ||
            "Failed to load Workspace documents."
        );
      }

      const backendDocuments =
        Array.isArray(
          data.documents
        )
          ? data.documents
          : [];

      const workspaceDocuments: DocumentItem[] =
        backendDocuments
          .filter(
            (
              document: Record<
                string,
                unknown
              >
            ) =>
              !document.space ||
              document.space ===
                "workspace"
          )
          .map(
            (
              document: Record<
                string,
                unknown
              >
            ) => ({
              id: String(
                document.id ||
                  document._id
              ),

              fileName: String(
                document.fileName ||
                  document.originalFileName ||
                  document.title ||
                  "PDF document"
              ),

              status: String(
                document.status ||
                  "Ready"
              ),

              size: document.fileSize
                ? formatFileSize(
                    Number(
                      document.fileSize
                    )
                  )
                : document.size
                ? String(
                    document.size
                  )
                : "",

              space: String(
                document.space ||
                  "workspace"
              ),
            })
          );

      setDocuments(
        workspaceDocuments
      );

      // Select first document if
      // nothing is selected
      if (
        workspaceDocuments.length >
          0 &&
        !selectedDocumentId
      ) {
        setSelectedDocumentId(
          workspaceDocuments[0].id
        );
      }

      console.log(
        "✅ Workspace documents loaded:",
        workspaceDocuments.length
      );

    } catch (loadError) {
      console.error(
        "❌ Workspace loading error:",
        loadError
      );

      setError(
        loadError instanceof TypeError
          ? `Could not reach the backend at ${API_URL}. Start the backend and check NEXT_PUBLIC_BACKEND_URL.`
          : loadError instanceof Error
          ? loadError.message
          : "Failed to load Workspace documents."
      );
    } finally {
      setIsPreparingWorkspace(false);
    }
  }

  // ====================================================
  // LOAD DOCUMENTS WHEN PAGE OPENS
  // ====================================================

  useEffect(() => {
    void loadDocuments();
  }, []);

  // ====================================================
  // UPLOAD WORKSPACE FILES
  // ====================================================

  async function uploadFiles(
    files: File[]
  ) {
    // --------------------------------------------------
    // Validate supported documents
    // --------------------------------------------------

    const pdfFiles =
      files.filter(
        (file) =>
          file.type ===
            "application/pdf" ||
          file.name.toLowerCase().endsWith(".pdf") ||
          file.name.toLowerCase().endsWith(".docx")
      );

    if (!pdfFiles.length) {
      setError(
        "Please select PDF or DOCX files only."
      );

      return;
    }

    // --------------------------------------------------
    // Workspace requires login
    // --------------------------------------------------

    const token =
      getToken();

    if (!token) {
      setError(
        "Please login to upload documents to Workspace."
      );

      return;
    }

    // --------------------------------------------------
    const filesToUpload = pdfFiles;
    setError("");

    setIsUploading(true);

    try {
      // ------------------------------------------------
      // FormData
      // ------------------------------------------------

      const formData =
        new FormData();

      // IMPORTANT:
      // Workspace documents
      formData.append(
        "space",
        "workspace"
      );

      // Add PDFs
      filesToUpload.forEach(
        (file) => {
          formData.append(
            "documents",
            file
          );
        }
      );

      console.log(
        "📤 Uploading to Workspace:",
        filesToUpload.map(
          (file) =>
            file.name
        )
      );

      // ------------------------------------------------
      // Backend request
      // ------------------------------------------------

      const response =
        await fetch(
          `${API_URL}/documents/upload`,
          {
            method: "POST",
            headers: getAuthHeaders(token),

            body: formData,
          }
        );

      // ------------------------------------------------
      // Read response
      // ------------------------------------------------

      const data =
        await readApiResponse(
          response
        );

      console.log(
        "📥 Workspace upload response:",
        data
      );

      // ------------------------------------------------
      // Check response
      // ------------------------------------------------

      if (
        !response.ok ||
        !data.success
      ) {
        const failedDocument =
          Array.isArray(
            data.documents
          )
            ? data.documents.find(
                (
                  document: Record<
                    string,
                    unknown
                  >
                ) =>
                  document.status ===
                  "failed"
              )
            : null;

        throw new Error(
          String(
            failedDocument?.message ||
              data.message ||
              "PDF upload failed."
          )
        );
      }

      // ------------------------------------------------
      // Get returned documents
      // ------------------------------------------------

      const backendDocuments =
        Array.isArray(
          data.documents
        )
          ? data.documents
          : data.document
          ? [data.document]
          : [];

      const returnedDocuments: DocumentItem[] =
        backendDocuments
          .filter(Boolean)
          .map(
            (
              document: Record<
                string,
                unknown
              >
            ) => ({
              id: String(
                document.id ||
                  document._id
              ),

              fileName: String(
                document.fileName ||
                  document.originalFileName ||
                  document.title ||
                  "PDF document"
              ),

              status: String(
                document.status ||
                  "Ready"
              ),

              size: document.fileSize
                ? formatFileSize(
                    Number(
                      document.fileSize
                    )
                  )
                : document.size
                ? String(
                    document.size
                  )
                : "",

              space: String(
                document.space ||
                  "workspace"
              ),
            })
          );

      if (
        !returnedDocuments.length
      ) {
        throw new Error(
          "The upload succeeded, but the server did not return document details."
        );
      }

      // ------------------------------------------------
      // Make sure only Workspace
      // documents are added
      // ------------------------------------------------

      const workspaceDocuments =
        returnedDocuments.filter(
          (document) =>
            document.space ===
              "workspace" ||
            !document.space
        );

      // ------------------------------------------------
      // Append documents
      // ------------------------------------------------

      setDocuments(
        (current) => {
          const existingIds =
            new Set(
              current.map(
                (doc) =>
                  doc.id
              )
            );

          const newDocuments =
            workspaceDocuments.filter(
              (doc) =>
                !existingIds.has(
                  doc.id
                )
            );

          return [
            ...current,
            ...newDocuments,
          ];
        }
      );

      // ------------------------------------------------
      // Select first uploaded document
      // ------------------------------------------------

      setSelectedDocumentId(
        workspaceDocuments[0]
          .id
      );

      setAnswer("");

      console.log(
        "✅ Workspace upload successful"
      );

    } catch (uploadError) {
      console.error(
        "❌ Workspace upload error:",
        uploadError
      );

      setError(
        uploadError instanceof TypeError
          ? `Could not reach the backend at ${API_URL}. Start the backend and check NEXT_PUBLIC_BACKEND_URL.`
          : uploadError instanceof Error
          ? uploadError.message
          : "PDF upload failed."
      );

    } finally {
      setIsUploading(false);

      if (
        fileInputRef.current
      ) {
        fileInputRef.current.value =
          "";
      }
    }
  }

  // ====================================================
  // FILE CHANGE
  // ====================================================

  function handleFileChange(
    event: ChangeEvent<HTMLInputElement>
  ) {
    const files =
      Array.from(
        event.target.files || []
      );

    if (files.length) {
      void uploadFiles(
        files
      );
    }
  }

  // ====================================================
  // DRAG & DROP
  // ====================================================

  function handleDrop(
    event: DragEvent<HTMLDivElement>
  ) {
    event.preventDefault();

    setIsDragging(false);

    const files =
      Array.from(
        event.dataTransfer.files ||
          []
      );

    if (files.length) {
      void uploadFiles(
        files
      );
    }
  }

  // ====================================================
  // ASK QUESTION
  // ====================================================

  async function handleAsk(
    event: FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    // --------------------------------------------------
    // Validate question
    // --------------------------------------------------

    if (!question.trim()) {
      setError(
        "Please enter a question."
      );

      return;
    }

    // --------------------------------------------------
    // Validate document
    // --------------------------------------------------

    if (!selectedDocumentId) {
      setError(
        "Please select a PDF first."
      );

      return;
    }

    if (isPreparingWorkspace) {
      setError("Workspace documents are still being prepared. Please wait.");
      return;
    }

    // --------------------------------------------------
    // Login required
    // --------------------------------------------------

    const token =
      getToken();

    if (!token) {
      setError(
        "Please login to use Workspace."
      );

      return;
    }

    setError("");
    setAnswer("");
    setIsAsking(true);

    try {
      console.log(
        "🔎 Workspace question:",
        question
      );

      console.log(
        "📄 Workspace document:",
        selectedDocumentId
      );

      // ------------------------------------------------
      // Ask backend
      // ------------------------------------------------

      const response =
        await fetch(
          `${API_URL}/chat/ask`,
          {
            method: "POST",

            headers: {
              "Content-Type": "application/json",
              ...getAuthHeaders(token),
            },

            body: JSON.stringify({
              question:
                question.trim(),

              documentId:
                selectedDocumentId,

              // IMPORTANT:
              // This query belongs to Workspace
              space: "workspace",
            }),
          }
        );

      // ------------------------------------------------
      // Read response
      // ------------------------------------------------

      const data =
        await readApiResponse(
          response
        );

      console.log(
        "🤖 Workspace RAG response:",
        data
      );

      // ------------------------------------------------
      // Check response
      // ------------------------------------------------

      if (
        !response.ok ||
        !data.success
      ) {
        throw new Error(
          data.message ||
            "Could not generate an answer."
        );
      }

      // ------------------------------------------------
      // Display answer
      // ------------------------------------------------

      setAnswer(
        data.answer ||
          "No answer was generated."
      );

      setQuestion("");

    } catch (askError) {
      console.error(
        "❌ Workspace question error:",
        askError
      );

      setError(
        askError instanceof TypeError
          ? `Could not reach the backend at ${API_URL}. Start the backend and check NEXT_PUBLIC_BACKEND_URL.`
          : askError instanceof Error
          ? askError.message
          : "Could not generate an answer."
      );

    } finally {
      setIsAsking(false);
    }
  }

  // ====================================================
  // UI
  // ====================================================

  return (
    <main className="min-h-screen overflow-x-hidden bg-[#07051a] text-white">

      <Header />

      {/* =================================================
          HERO
      ================================================= */}

      <section className="mx-auto max-w-7xl px-5 pb-24 pt-32 sm:px-8">

        <div className="mx-auto mb-10 max-w-4xl text-center">

          <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-purple-400/20 bg-purple-500/10 px-4 py-2 text-xs font-black uppercase tracking-[0.2em] text-purple-300">

            <span className="h-2 w-2 rounded-full bg-green-400" />

            Private Document Workspace

          </div>

          <h1 className="text-4xl font-black tracking-tight sm:text-6xl">

            RAG Query{" "}

            <span className="bg-gradient-to-r from-purple-400 to-blue-500 bg-clip-text text-transparent">
              Workspace
            </span>

          </h1>

          <p className="mx-auto mt-5 max-w-2xl text-base leading-7 text-purple-200/70 sm:text-lg">

            Upload multiple PDF documents, keep them
            in your private workspace, select any
            document, and ask questions using your
            local RAG pipeline.

          </p>

        </div>

        {/* =================================================
            UPLOADED DOCUMENTS
        ================================================= */}

        {documents.length > 0 && (

          <section className="mb-8 rounded-3xl border border-purple-400/20 bg-white p-5 shadow-[0_20px_80px_rgba(0,0,0,0.25)] sm:p-7">

            <div className="mb-5 flex flex-col justify-between gap-3 sm:flex-row sm:items-center">

              <div>

                <p className="text-xs font-black uppercase tracking-[0.2em] text-purple-600">
                  Your Documents
                </p>

                <h2 className="mt-1 text-2xl font-black text-black">
                  Uploaded Documents
                </h2>

                <p className="mt-1 text-sm text-gray-500">
                  {documents.length} document{
                    documents.length === 1 ? "" : "s"
                  } uploaded
                </p>

              </div>

              <button
                type="button"
                onClick={() =>
                  fileInputRef.current?.click()
                }
                disabled={
                  isUploading ||
                  isPreparingWorkspace
                }
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-purple-600 px-5 py-3 text-sm font-black text-white transition hover:bg-purple-700 disabled:cursor-not-allowed disabled:opacity-50"
              >

                <Icon
                  name="PlusIcon"
                  size={18}
                />

                {isPreparingWorkspace
                  ? "PREPARING DOCUMENTS..."
                  : "ADD MORE DOCUMENTS"}

              </button>

            </div>

            {/* DOCUMENT CARDS */}

            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">

              {documents.map(
                (
                  document,
                  index
                ) => {

                  const isSelected =
                    selectedDocumentId ===
                    document.id;

                  return (

                    <button
                      key={
                        document.id
                      }

                      type="button"

                      onClick={() => {
                        setSelectedDocumentId(
                          document.id
                        );

                        setAnswer("");

                        setError("");
                      }}

                      className={`group relative flex min-h-[125px] items-start gap-4 rounded-2xl border p-4 text-left transition-all ${
                        isSelected
                          ? "border-purple-600 bg-purple-50 shadow-lg shadow-purple-100"
                          : "border-gray-200 bg-gray-50 hover:border-purple-300 hover:bg-purple-50/50"
                      }`}
                    >

                      {/* NUMBER */}

                      <div
                        className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-sm font-black ${
                          isSelected
                            ? "bg-purple-600 text-white"
                            : "bg-purple-100 text-purple-700"
                        }`}
                      >
                        {index + 1}
                      </div>

                      {/* FILE INFO */}

                      <div className="min-w-0 flex-1">

                        <div className="flex items-start gap-2">

                          <Icon
                            name="DocumentTextIcon"
                            size={20}
                            className="mt-0.5 shrink-0 text-purple-600"
                          />

                          <span className="break-words text-sm font-black leading-5 text-black">
                            {document.fileName}
                          </span>

                        </div>

                        <div className="mt-3 flex items-center gap-2">

                          <span className="inline-flex items-center gap-1 rounded-full bg-green-100 px-2.5 py-1 text-[10px] font-black uppercase tracking-wider text-green-700">

                            <span className="h-1.5 w-1.5 rounded-full bg-green-500" />

                            {document.status}

                          </span>

                          {document.size && (

                            <span className="rounded-full bg-gray-100 px-2.5 py-1 text-[10px] font-bold text-gray-500">
                              {document.size}
                            </span>

                          )}

                          {isSelected && (

                            <span className="rounded-full bg-purple-100 px-2.5 py-1 text-[10px] font-black uppercase tracking-wider text-purple-700">
                              Selected
                            </span>

                          )}

                        </div>

                      </div>

                      {/* CHECK */}

                      {isSelected && (

                        <div className="absolute right-3 top-3 flex h-6 w-6 items-center justify-center rounded-full bg-purple-600 text-white">

                          <Icon
                            name="CheckIcon"
                            size={14}
                          />

                        </div>

                      )}

                    </button>

                  );
                }
              )}

            </div>

          </section>

        )}

        {/* =================================================
            MAIN GRID
        ================================================= */}

        <div className="grid gap-7 lg:grid-cols-[0.8fr_1.2fr]">

          {/* =================================================
              LEFT SIDE
          ================================================= */}

          <div className="space-y-7">

            {/* MULTIPLE UPLOAD */}

            <div
              onDragOver={(
                event
              ) => {
                event.preventDefault();

                setIsDragging(
                  true
                );
              }}

              onDragLeave={() =>
                setIsDragging(
                  false
                )
              }

              onDrop={
                handleDrop
              }

              onClick={() =>
                fileInputRef.current?.click()
              }

              className={`group flex min-h-[330px] cursor-pointer flex-col items-center justify-center rounded-3xl border-2 border-dashed p-8 text-center transition-all ${
                isDragging
                  ? "border-purple-400 bg-purple-500/10"
                  : "border-purple-400/30 bg-[#0c0924] hover:border-purple-400 hover:bg-purple-500/5"
              }`}
            >

              <input
                ref={
                  fileInputRef
                }

                type="file"

                accept=".pdf,.docx,application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document"

                multiple

                onChange={
                  handleFileChange
                }

                className="hidden"
              />

              <div className="mb-6 flex h-20 w-20 items-center justify-center rounded-3xl border border-purple-400/30 bg-purple-500/10 text-purple-400 transition group-hover:scale-105">

                <Icon
                  name="ArrowUpTrayIcon"
                  size={36}
                />

              </div>

              <h2 className="text-2xl font-black text-white">
                Upload Multiple PDFs
              </h2>

              <p className="mt-3 max-w-sm text-sm leading-6 text-purple-200/60">

                Select multiple PDF or DOCX documents at
                once or drag and drop them here.

              </p>

              <div className="mt-5 flex flex-wrap justify-center gap-2">

                <span className="rounded-full bg-purple-500/10 px-3 py-1.5 text-xs font-bold text-purple-300">
                  PDF or DOCX
                </span>

                <span className="rounded-full bg-purple-500/10 px-3 py-1.5 text-xs font-bold text-purple-300">
                  Unlimited documents
                </span>

                <span className="rounded-full bg-purple-500/10 px-3 py-1.5 text-xs font-bold text-purple-300">
                  RAG Ready
                </span>

              </div>

              {isUploading && (

                <div className="mt-6 flex items-center gap-2 text-sm font-bold text-purple-300">

                  <span className="h-2 w-2 animate-pulse rounded-full bg-purple-400" />

                  Uploading and processing PDFs...

                </div>

              )}

            </div>

            {/* CURRENT DOCUMENT */}

            <div className="rounded-3xl border border-purple-400/15 bg-[#0c0924] p-6">

              <p className="text-xs font-black uppercase tracking-[0.2em] text-purple-400">
                Current Document
              </p>

              {selectedDocument ? (

                <div className="mt-4 flex items-center gap-4 rounded-2xl border border-purple-400/20 bg-white p-4">

                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-purple-100 text-purple-600">

                    <Icon
                      name="DocumentTextIcon"
                      size={24}
                    />

                  </div>

                  <div className="min-w-0">

                    <p className="break-words text-sm font-black text-black">
                      {selectedDocument.fileName}
                    </p>

                    <p className="mt-1 text-xs font-semibold text-green-600">
                      Ready for questions
                    </p>

                  </div>

                </div>

              ) : (

                <p className="mt-3 text-sm text-purple-200/50">
                  Upload and select a PDF to start asking questions.
                </p>

              )}

            </div>

          </div>

          {/* =================================================
              RIGHT SIDE
          ================================================= */}

          <div className="rounded-3xl border border-purple-400/15 bg-[#0c0924] p-6 sm:p-8">

            <div className="mb-6">

              <p className="text-xs font-black uppercase tracking-[0.2em] text-purple-400">
                Ask Your Document
              </p>

              <h2 className="mt-2 text-3xl font-black text-white">
                Ask a Question
              </h2>

              <p className="mt-2 text-sm leading-6 text-purple-200/60">

                {selectedDocument
                  ? `Questions will be answered from "${selectedDocument.fileName}".`
                  : "Select a PDF from your uploaded documents."}

              </p>

            </div>

            <form
              onSubmit={
                handleAsk
              }
            >

              <textarea
                value={
                  question
                }

                onChange={(
                  event
                ) =>
                  setQuestion(
                    event.target.value
                  )
                }

                disabled={
                  !selectedDocumentId ||
                  isAsking ||
                  isPreparingWorkspace
                }

                placeholder={
                  selectedDocumentId
                    ? "Ask anything about this document..."
                    : "Upload and select a PDF first..."
                }

                rows={8}

                className="w-full resize-none rounded-2xl border border-purple-400/20 bg-white px-5 py-4 text-sm font-medium text-black outline-none placeholder:text-gray-400 transition focus:border-purple-500 focus:ring-4 focus:ring-purple-500/10 disabled:cursor-not-allowed disabled:bg-gray-100"
              />

              <button
                type="submit"

                disabled={
                  !selectedDocumentId ||
                  !question.trim() ||
                  isAsking
                }

                className="mt-4 flex w-full items-center justify-center gap-3 rounded-2xl bg-gradient-to-r from-purple-600 to-blue-600 px-6 py-4 text-sm font-black uppercase tracking-widest text-white transition hover:scale-[1.01] hover:shadow-lg hover:shadow-purple-500/20 disabled:cursor-not-allowed disabled:opacity-40"
              >

                <Icon
                  name="PaperAirplaneIcon"
                  size={18}
                />

                {isAsking
                  ? "Processing..."
                  : "Run RAG Query"}

              </button>

            </form>

            {/* ANSWER */}

            {answer && (

              <div className="mt-8 rounded-2xl border border-purple-400/20 bg-white p-6">

                <div className="mb-4 flex items-center gap-3">

                  <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-purple-100 text-purple-600">

                    <Icon
                      name="SparklesIcon"
                      size={18}
                    />

                  </div>

                  <div>

                    <p className="text-xs font-black uppercase tracking-widest text-purple-600">
                      AI Answer
                    </p>

                    <p className="text-xs text-gray-500">
                      Based on the selected PDF
                    </p>

                  </div>

                </div>

                <p className="whitespace-pre-wrap text-sm leading-7 text-black">
                  {answer}
                </p>

              </div>

            )}

            {/* ERROR */}

            {error && (

              <div className="mt-5 rounded-2xl border border-red-300 bg-red-50 p-4 text-sm font-semibold text-red-700">
                {error}
              </div>

            )}

          </div>

        </div>

      </section>

      <Footer />

    </main>
  );
}