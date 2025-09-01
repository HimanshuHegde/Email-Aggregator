/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useMemo, useState } from "react";
import type { Email } from "./type/email";
import searchEmails, { fetchLast30Days } from "./api";
import { AtSign, Filter, Folder, Inbox, Loader2, Mail, RefreshCw, Search, X } from "lucide-react";
import Badge from "./components/badge";
import { io } from "socket.io-client";
import PrettyDate from "./components/date";

export default function App() {
  const [emails, setEmails] = useState<Email[]>([]);
  const [filteredEmail, setFilteredEmail] = useState<Email[]>(emails);
  const [isComposeOpen, setIsComposeOpen] = useState(false);
  const [form, setForm] = useState({
    name:"",
    from: "",
    to: "",
    subject: "",
    body: "",
  });
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selected, setSelected] = useState<Email | null>(null);

  const [q, setQ] = useState("");
  const [selectedAccount, setSelectedAccount] = useState<string | null | 'idle'>(null);
  const [selectedFolder, setSelectedFolder] = useState<string | null>(null);
  


  // Initial load from IMAP (last 30 days)
  useEffect(() => {
    const socket = io("https://reachinbox-assign.onrender.com", { transports: ['websocket'] }); 
    socket.on("connect", () => {
  console.log("Connected to server");
});
socket.on('new-email', (newEmail: Email) => {
  setEmails(prev => [newEmail, ...prev]);
  setFilteredEmail(prev => [newEmail, ...prev]);
});
    (async () => {
      setLoading(true);
      setError(null);
      try {
        const items = await fetchLast30Days();
        setEmails(items);
        setFilteredEmail(items);
      } catch (e: any) {
        setError(e?.message || "Failed to load emails");
      } finally {
        setLoading(false);
      }
    })();
    return () => {
      socket.disconnect();
    }
  }, []);

  // Derive accounts & folders from emails
  const accounts = useMemo(() => Array.from(new Set(emails.map(e => e.account).filter(Boolean))), [emails]);
  const folders = useMemo(() => Array.from(new Set(emails.map(e => e.folder).filter(Boolean))), [emails]);

  // Filtered view
  const filtered = useMemo(() => {
    return filteredEmail.filter(e => {
      if (selectedAccount && e.account !== selectedAccount) return false;
      if (selectedFolder && e.folder !== selectedFolder) return false;
      return true;
    });
  }, [filteredEmail, selectedAccount, selectedFolder]);

  async function handleSearch(ev?: React.FormEvent) {
    ev?.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const results = await searchEmails(q);
      setFilteredEmail(results);
      setSelectedAccount(null);
      setSelectedFolder(null);
      setSelected(null);
    } catch (e: any) {
      setError(e?.message || "Search error");
    } finally {
      setLoading(false);
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    const sendform:Email = { ...form };
    sendform['account'] = sendform.from;
    sendform['folder'] = "Sent";
    sendform['date'] = new Date();

    e.preventDefault();
    try {
      const res = await fetch("https://reachinbox-assign.onrender.com0/api/sendMail", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(sendform),
      });
      setEmails(prev => [sendform, ...prev]);
      setFilteredEmail(prev => [sendform, ...prev]);
      if (res.ok) {
        alert("Email created successfully!");
        setIsComposeOpen(false);
        setForm({name: "", from: "", to: "", subject: "", body: "" });
      } else {
        alert("Failed to create email");
      }
    } catch (err) {
      console.error(err);
      alert("Error creating email");
    }
  };

  async function handleRefresh() {
    setLoading(true);
    setError(null);
    try {
      const fresh = await fetchLast30Days();
      setEmails(fresh);
      setSelectedAccount(null);
      setSelectedFolder(null);
      setSelected(null);
    } catch (e: any) {
      setError(e?.message || "Refresh failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <header className="sticky top-0 z-10 bg-white/70 backdrop-blur border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 py-3 flex items-center gap-3">
          <Mail className="h-6 w-6" />
          <h1 className="text-xl font-semibold tracking-tight">Email Aggregator</h1>
          <div className="ml-auto flex items-center gap-2">
            <form onSubmit={handleSearch} className="relative w-[320px]">
              <input
                value={q}
                onChange={e => setQ(e.target.value)}
                placeholder="Search (Elasticsearch)…"
                className="w-full pl-9 pr-9 py-2 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-slate-400"
              />
              <Search className="absolute left-2 top-2.5 h-5 w-5 text-slate-500" />
              {q && (
                <button type="button" onClick={async () =>{ setQ("")
                  await fetchLast30Days().then(setEmails)
                }} className="absolute right-2 top-2.5">
                  <X className="h-5 w-5 text-slate-500" />
                </button>
              )}
            </form>
            <button
              onClick={handleRefresh}
              className="inline-flex items-center gap-2 px-3 py-2 rounded-xl border border-slate-300 hover:bg-slate-100 active:scale-[0.98]"
              title="Fetch last 30 days"
            >
              <RefreshCw className="h-4 w-4" /> Refresh
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-4 grid grid-cols-12 gap-4">
        {/* Sidebar Filters */}
        <aside className="col-span-12 md:col-span-3 lg:col-span-3">
          <div className="bg-white rounded-2xl shadow p-4 space-y-5 border border-slate-200">
            <div>
              <div className="flex items-center gap-2 mb-2 text-sm font-semibold"><Filter className="h-4 w-4"/> Filters</div>
              <div className="text-xs text-slate-500">Filter by account and folder.</div>
            </div>

            <div>
              <div className="flex items-center gap-2 mb-2 text-sm font-medium"><AtSign className="h-4 w-4"/> Accounts</div>
              <div className="flex flex-wrap gap-2">
                <button
                  onClick={() => setSelectedAccount(null)}
                  className={`px-3 py-1.5 rounded-full border text-sm ${selectedAccount === null ? "bg-slate-900 text-white border-slate-900" : "border-slate-300 hover:bg-slate-100"}`}
                >All</button>
                {accounts.map(acc => (
                  <button
                    key={acc}
                    onClick={() => {setSelectedAccount(acc!)
                      setFilteredEmail(emails)
                    }}
                    className={`px-3 py-1.5 rounded-full border text-sm ${selectedAccount === acc ? "bg-slate-900 text-white border-slate-900" : "border-slate-300 hover:bg-slate-100"}`}
                  >{acc}</button>
                ))}
              </div>
            </div>

            <div>
              <div className="flex items-center gap-2 mb-2 text-sm font-medium"><Folder className="h-4 w-4"/> Folders</div>
              <div className="flex flex-wrap gap-2">
                <button
                  onClick={() => setSelectedFolder(null)}
                  className={`px-3 py-1.5 rounded-full border text-sm ${!selectedFolder ? "bg-slate-900 text-white border-slate-900" : "border-slate-300 hover:bg-slate-100"}`}
                >All</button>
                {folders.map(f => (
                  <button
                    key={f}
                    onClick={() => {setSelectedFolder(f!)
                      setFilteredEmail(emails)
                    }}
                    className={`px-3 py-1.5 rounded-full border text-sm ${selectedFolder === f ? "bg-slate-900 text-white border-slate-900" : "border-slate-300 hover:bg-slate-100"}`}
                  >{f}</button>
                ))}
              </div>
            </div>

            <div className="text-xs text-slate-500">Search is powered by <span className="font-medium">Elasticsearch</span>.</div>
          </div>
          <div>

          </div>

          {/*compose*/}
          <div className="p-4">
      {/* Compose button */}
      <div className="flex justify-center">
      <button
        onClick={() => setIsComposeOpen(true)}
        className="bg-black text-white px-4 py-2 rounded-xl shadow-md hover:bg-gray-800"
      >
        Compose
      </button>
      </div>
      
    </div>
        </aside>
        

        {/* Email List */}
        <section className="col-span-12 md:col-span-4 lg:col-span-4">
          <div className="bg-white rounded-2xl shadow border border-slate-200 overflow-hidden">
            <div className="px-4 py-3 border-b border-slate-200 flex items-center gap-2 text-sm">
              <Inbox className="h-4 w-4"/>
              <span className="font-medium">Emails</span>
              <span className="ml-auto text-slate-500">{filtered.length} found</span>
            </div>
            <ul className="divide-y divide-slate-200 max-h-[72vh] overflow-auto">
              {loading && (
                <li className="p-4 flex items-center gap-2 text-slate-600"><Loader2 className="animate-spin h-4 w-4"/> Loading…</li>
              )}
              {error && !loading && (
                <li className="p-4 text-red-600 text-sm">{error}</li>
              )}
              {!loading && !error && filtered.length === 0 && (
                <li className="p-6 text-sm text-slate-500">No emails match the current filters.</li>
              )}
              {filtered.map((e) => (
                <li key={(e).id || e.subject+e.date}
                    onClick={() => setSelected(e)}
                    className={`p-4 cursor-pointer hover:bg-slate-50 ${selected?.id === e.id ? "bg-slate-50" : ""}`}>
                  <div className="flex items-start gap-2">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <div className="truncate font-medium">{e.subject || "(no subject)"}</div>
                        <Badge label={e.aiLabel} />
                      </div>
                      <div className="text-xs text-slate-500 truncate">From: {e.from} • To: {e.to}</div>
                      <div className="text-xs text-slate-500 truncate">{e.account} • {e.folder}</div>
                    </div>
                    <div className="text-xs text-slate-500 whitespace-nowrap"><PrettyDate value={e.date} /></div>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </section>

        {/* Email Detail and compose section*/}
        
        <section className="col-span-12 md:col-span-5 lg:col-span-5">
          {isComposeOpen ? (
        <div className=" flex items-center justify-center">
          <div className="bg-white p-6 rounded-2xl w-full max-w-lg shadow-lg">
            <h2 className="text-xl font-semibold mb-4">New Email</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <input
                type="text"
                name="name"
                placeholder="name"
                value={form.name}
                onChange={handleChange}
                className="w-full border rounded-xl p-2"
                required
              />
              <input
                type="email"
                name="from"
                placeholder="From"
                value={form.from}
                onChange={handleChange}
                className="w-full border rounded-xl p-2"
                required
              />
              <input
                type="email"
                name="to"
                placeholder="To"
                value={form.to}
                onChange={handleChange}
                className="w-full border rounded-xl p-2"
                required
              />
              <input
                type="text"
                name="subject"
                placeholder="Subject"
                value={form.subject}
                onChange={handleChange}
                className="w-full border rounded-xl p-2"
              />
              <textarea
                name="body"
                placeholder="Write your email..."
                value={form.body}
                onChange={handleChange}
                className="w-full border rounded-xl p-2 h-40"
                required
              />

              <div className="flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setIsComposeOpen(false)}
                  className="px-4 py-2 rounded-xl border"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="bg-black text-white px-4 py-2 rounded-xl shadow-md hover:bg-gray-700"
                >
                  Send
                </button>
              </div>
            </form>
          </div>
        </div>
      ):(<div className="bg-white rounded-2xl shadow border border-slate-200 min-h-[72vh]">
            {!selected ? (
              <div className="p-8 text-center text-slate-500">
                <div className="flex justify-center mb-3"><Mail className="h-6 w-6"/></div>
                Select an email to view details.
              </div>
            ) : (
              <article className="p-5 space-y-4">
                <header className="space-y-1">
                  <div className="flex items-start gap-3">
                    <h2 className="text-lg font-semibold leading-tight flex-1">{selected.subject || "(no subject)"}</h2>
                    <Badge label={selected.aiLabel} />
                  </div>
                  <div className="text-sm text-slate-600 flex flex-wrap gap-x-4 gap-y-1">
                    <div><span className="font-medium">From:</span> {selected.from}</div>
                    <div><span className="font-medium">To:</span> {selected.to}</div>
                    <div><span className="font-medium">Account:</span> {selected.account}</div>
                    <div><span className="font-medium">Folder:</span> {selected.folder}</div>
                    <div><span className="font-medium">Date:</span> <PrettyDate value={selected.date} /></div>
                  </div>
                </header>
                <hr className="border-slate-200"/>
                <div className="prose prose-sm max-w-none">
                  <pre className="whitespace-pre-wrap break-words text-sm leading-relaxed">{selected.body || "(no body)"}</pre>
                </div>
              </article>
            )}
          </div>)}
        </section>
      </main>
    </div>
  );
}