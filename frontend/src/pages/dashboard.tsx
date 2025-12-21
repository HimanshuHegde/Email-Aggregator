/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useMemo, useState, useContext, useRef } from "react";
import { useNavigate } from "react-router-dom";
import type { Email } from "../type/email";
import searchEmails, { deleteAccount, fetchLast30Days, getAccounntByOwnerId } from "../api";
import { jwtDecode } from "jwt-decode";

import {
  AtSign,
  Filter,
  Folder,
  Inbox,
  Loader2,
  LogOutIcon,
  Mail,
  RefreshCw,
  Search,
  X,
} from "lucide-react";
import Badge from "../components/badge";
import { io } from "socket.io-client";
import PrettyDate from "../components/date";
import { CgAdd, CgClose } from "react-icons/cg";
import EmailAccountsForm from "../components/accountForm";
import { UserContext } from "../../lib/context";
import ConfirmModal from "../components/popUp";

export default function Dashboard() {
  const { createAccounts, setCreateAccounts } = useContext(UserContext)!;
  const navigate = useNavigate();
  const [emails, setEmails] = useState<Email[]>([]);
  let userid = useRef<number | null>(null);
  const [filteredEmail, setFilteredEmail] = useState<Email[]>(emails);
  const [selectDeleteAccount, setDeleteAccount] = useState("");
  const [isComposeOpen, setIsComposeOpen] = useState(false);
  const [addaccount, setAddaccount] = useState(false);
  const [form, setForm] = useState({
    name: "",
    from: "",
    to: "",
    subject: "",
    body: "",
  });
  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selected, setSelected] = useState<Email | null>(null);
  const [modalOpen, setModalOpen] = useState(false);

  const [q, setQ] = useState("");
  const [selectedAccount, setSelectedAccount] = useState<
    string | null | "idle"
  >(null);
  const [selectedFolder, setSelectedFolder] = useState<string | null>(null);

  async function handleLogout() {
    localStorage.removeItem("token");
    await fetch("https://email-aggregator-1.onrender.com/auth/logout", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
    })
      .then((res) => {
        if (res.ok) navigate("/", { replace: true });
      })
      .catch((err) => {
        console.error("Logout failed", err);
      });
  }

  function onSave() {
    setLoading(true);
    setAddaccount(false);
  }

  // Initial load from IMAP (last 30 days)
  useEffect(() => {

    setAddaccount(false);
    const socket = io("https://email-aggregator-1.onrender.com", {
      transports: ["websocket"],
    });
    const token = localStorage.getItem("token");
    const decoded = jwtDecode(token!);
    userid.current = ((decoded as any).userId!);
    socket.on("connect", () => {
      console.log("Connected to server");
      socket.emit("authenticate", decoded);
      (async () => {
        let emails = await getAccounntByOwnerId(userid.current!);
        // console.log(emails)
        setCreateAccounts(()=>emails);
        // console.log(createAccounts)
      })()
    });
    socket.on("new-email", (newEmail: Email) => {
      setEmails((prev) => [newEmail, ...prev]);
      setFilteredEmail((prev) => [newEmail, ...prev]);
    });

    return () => {
      socket.disconnect();
    };
  }, []);
  useEffect(() => {
    (async () => {
      setLoading(true);
      setError(null);
      try {
        const items = await fetchLast30Days();
        // console.log(items)
        setEmails(items);
        setFilteredEmail(items);
      } catch (e: any) {
        setError(e?.message || "Failed to load emails");
      } finally {
        setLoading(false);
      }
    })();
    // console.log("createAccounts changed:", createAccounts);
  }, [createAccounts]);

  // Derive accounts & folders from emails
  // const accounts = useMemo(
  //   () => Array.from(new Set(emails.map((e) => e.account).filter(Boolean))),
  //   [emails]
  // );
  const accounts = useMemo(() => {
    return Array.from(createAccounts.map((acc) => acc.email));
  }, [createAccounts])
  const folders = useMemo(
    () => Array.from(new Set(emails.map((e) => e.folder).filter(Boolean))),
    [emails]
  );

  // Filtered view
  const filtered = useMemo(() => {
    return filteredEmail.filter((e) => {
      if (selectedAccount && e.to !== selectedAccount) return false;
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
    const sendform: Email = { ...form };
    sendform["account"] = sendform.from;
    sendform["folder"] = "Sent";
    sendform["date"] = new Date();

    e.preventDefault();
    try {
      const res = await fetch(
        "https://email-aggregator-1.onrender.com/api/sendMail",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(sendform),
        }
      );
      setEmails((prev) => [sendform, ...prev]);
      setFilteredEmail((prev) => [sendform, ...prev]);
      if (res.ok) {
        alert("Email created successfully!");
        setIsComposeOpen(false);
        setForm({ name: "", from: "", to: "", subject: "", body: "" });
      } else {
        alert("Failed to create email");
      }
    } catch (err) {
      console.error(err);
      alert("Error creating email");
    }
  };

  const handleDelete = async () => {
    // Your delete logic here
    const res = await deleteAccount(selectDeleteAccount);
    if (res) {
      setModalOpen(false);
      setCreateAccounts((prev) =>
        prev.filter((a) => a.email !== selectDeleteAccount)
      );
      // (async () => {
      //   let emails = await getAccounntByOwnerId(userid.current!);
      //   setCreateAccounts(()=>emails);
      //   console.log(createAccounts)
      // })()
    } else {
      alert("Failed to delete account");
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
          <h1 className="text-xl font-semibold tracking-tight">
            Email Aggregator
          </h1>
          <div className="ml-auto flex items-center gap-2">
            <form onSubmit={handleSearch} className="relative w-[320px]">
              <input
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder="Search (Elasticsearch)…"
                className="w-full pl-9 pr-9 py-2 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-slate-400"
              />
              <Search className="absolute left-2 top-2.5 h-5 w-5 text-slate-500" />

              {q && (
                <button
                  type="button"
                  onClick={async () => {
                    setQ("");
                    await fetchLast30Days().then(setEmails);
                  }}
                  className="absolute right-2 top-2.5"
                >
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
            {emails.length > 0 && (
              <button
                onClick={() => setAddaccount(!addaccount)}
                className="inline-flex items-center gap-2 px-3 py-2 rounded-xl border border-slate-300 hover:bg-slate-100 active:scale-[0.98"
                title="add accounts"
              >
                {!addaccount ? (
                  <>
                    <CgAdd className="h-4 w-4" /> Add Accounts
                  </>
                ) : (
                  <>
                    <CgClose className="h-4 w-4" /> Close
                  </>
                )}
              </button>
            )}
            <button
              onClick={handleLogout}
              className="inline-flex items-center gap-2 px-3 py-2 rounded-xl border border-slate-300 hover:bg-red-100 active:scale-[0.98] ml-auto"
              title="Logout"
            >
              <LogOutIcon className="h-4 w-4" /> LogOut
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-4 grid grid-cols-12 gap-4">
        {/* Sidebar Filters */}
        <aside className="col-span-12 md:col-span-3 lg:col-span-3">
          <div className="bg-white rounded-2xl shadow p-4 space-y-5 border border-slate-200">
            <div>
              <div className="flex items-center gap-2 mb-2 text-sm font-semibold">
                <Filter className="h-4 w-4" /> Filters
              </div>
              <div className="text-xs text-slate-500">
                Filter by account and folder.
              </div>
            </div>

            <div>
              <div className="flex items-center gap-2 mb-2 text-sm font-medium">
                <AtSign className="h-4 w-4" /> Accounts
              </div>
              <div className="flex flex-wrap gap-2">
                <button
                  onClick={() => setSelectedAccount(null)}
                  className={`px-3 py-1.5 rounded-full border text-sm ${selectedAccount === null
                      ? "bg-slate-900 text-white border-slate-900"
                      : "border-slate-300 hover:bg-slate-100"
                    }`}
                >
                  All
                </button>
                {accounts.map((acc) => (
                  <button
                    key={acc}
                    onClick={() => {
                      setSelectedAccount(acc!);
                      setFilteredEmail(emails);
                    }}
                    className={`flex justify-center items-center gap-2 px-3 py-1.5 rounded-full border text-sm ${selectedAccount === acc
                        ? "bg-slate-900 text-white border-slate-900"
                        : "border-slate-300 hover:bg-slate-100"
                      }`}
                  >
                    <span
                      onClick={() => {
                        setModalOpen(true);
                        setDeleteAccount(acc!);
                      }}
                    >
                      <CgClose className="h-4 w-4" />
                    </span>

                    <span>{acc}</span>
                  </button>
                ))}
              </div>
            </div>

            <div>
              <div className="flex items-center gap-2 mb-2 text-sm font-medium">
                <Folder className="h-4 w-4" /> Folders
              </div>
              <div className="flex flex-wrap gap-2">
                <button
                  onClick={() => setSelectedFolder(null)}
                  className={`px-3 py-1.5 rounded-full border text-sm ${!selectedFolder
                      ? "bg-slate-900 text-white border-slate-900"
                      : "border-slate-300 hover:bg-slate-100"
                    }`}
                >
                  All
                </button>
                {folders.map((f) => (
                  <button
                    key={f}
                    onClick={() => {
                      setSelectedFolder(f!);
                      setFilteredEmail(emails);
                    }}
                    className={`px-3 py-1.5 rounded-full border text-sm ${selectedFolder === f
                        ? "bg-slate-900 text-white border-slate-900"
                        : "border-slate-300 hover:bg-slate-100"
                      }`}
                  >
                    {f}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/*compose*/}
          <div className="p-4">
            {/* Compose button */}
            <div className="flex justify-center">
              <button
                onClick={() => {
                  setIsComposeOpen(true);
                  setAddaccount(false);
                }}
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
              <Inbox className="h-4 w-4" />
              <span className="font-medium">Emails</span>
              <span className="ml-auto text-slate-500">
                {filtered.length} found
              </span>
            </div>
            <ul className="divide-y divide-slate-200 max-h-[72vh] overflow-auto">
              {loading && (
                <li className="p-4 flex items-center gap-2 text-slate-600">
                  <Loader2 className="animate-spin h-4 w-4" /> Loading…
                </li>
              )}
              {error && !loading && (
                <li className="p-4 text-red-600 text-sm">{error}</li>
              )}
              {!loading && !accounts.length && (
                <div className="flex justify-between items-center p-4 flex-col">
                  <li className="p-6 text-sm text-slate-500">
                    No accounts configured. Please add accounts in the backend
                    environment variables.
                  </li>
                  <button
                    onClick={() => setAddaccount(!addaccount)}
                    className="inline-flex items-center gap-2 px-3 py-2 rounded-xl border bg-black text-white border-slate-300 hover:bg-gray-800 active:scale-[0.98]"
                    title="Fetch last 30 days"
                  >
                    {!addaccount ? (
                      <>
                        <CgAdd className="h-4 w-4" /> Add Accounts
                      </>
                    ) : (
                      <>
                        <CgClose className="h-4 w-4" /> Close
                      </>
                    )}
                  </button>
                </div>
              )}
              {accounts.length &&
                !loading &&
                !error &&
                filtered.length === 0 ? (
                <li className="p-6 text-sm text-slate-500">
                  No emails found.
                </li>
              ) : (
                filtered.map((e) => (
                  <li
                    key={e.id || e.subject + e.date}
                    onClick={() => {
                      setSelected(e);
                      setIsComposeOpen(false);
                      setAddaccount(false);
                    }}
                    className={`p-4 cursor-pointer hover:bg-slate-50 ${selected?.id === e.id ? "bg-slate-50" : ""
                      }`}
                  >
                    <div className="flex items-start gap-2">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <div className="truncate font-medium">
                            {e.subject || "(no subject)"}
                        <div className="text-xs text-slate-500 truncate">
                          From: {e.from} • To: {e.to}
                        </div>
                        <div className="text-xs text-slate-500 truncate">
                          {e.account} • {e.folder}
                        </div>
                      </div>
                      <div className="text-xs text-slate-500 whitespace-nowrap">
                        <PrettyDate value={e.date} />
                      </div>
                          </div>
                          <Badge label={e.aiLabel} />
                        </div>
                    </div>
                  </li>
                ))
              )}
            </ul>
          </div>
        </section>

        {/* Email Detail and compose section*/}
        <section className="col-span-12 md:col-span-5 lg:col-span-5">
          {addaccount && !loading && <EmailAccountsForm onSave={onSave} />}
          {!addaccount &&
            (isComposeOpen ? (
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
                    <select
                      name="from"
                      value={form.from}
                      onChange={handleChange}
                      className="w-full border rounded-xl p-2"
                      required
                    >
                      <option value="" disabled>
                        Select sender
                      </option>
                      {createAccounts.map((account) => {
                        // console.log("account:", account);
                        return (<option key={account.email} value={account.email}>
                          {account.email}
                        </option>)
                      })}
                    </select>
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
            ) : (
              <div className="bg-white rounded-2xl shadow border border-slate-200 min-h-[72vh] h-full">
                {!selected ? (
                  <div className="p-8 text-center text-slate-500">
                    <div className="flex justify-center mb-3">
                      <Mail className="h-6 w-6" />
                    </div>
                    Select an email to view details.
                  </div>
                ) : (
                  <article className="p-5 space-y-4 flex flex-col h-full">
                    <header className="space-y-1 flex-shrink-0">
                      <div className="flex items-start gap-3">
                        <h2 className="text-lg font-semibold leading-tight flex-1">
                          {selected.subject || "(no subject)"}
                        </h2>
                        <Badge label={selected.aiLabel} />
                      </div>
                      <div className="text-sm text-slate-600 flex flex-wrap gap-x-4 gap-y-1">
                        <div>
                          <span className="font-medium">From:</span>{" "}
                          {selected.from}
                        </div>
                        <div>
                          <span className="font-medium">To:</span> {selected.to}
                        </div>
                        <div>
                          <span className="font-medium">Account:</span>{" "}
                          {selected.account}
                        </div>
                        <div>
                          <span className="font-medium">Folder:</span>{" "}
                          {selected.folder}
                        </div>
                        <div>
                          <span className="font-medium">Date:</span>{" "}
                          <PrettyDate value={selected.date} />
                        </div>
                      </div>
                    </header>
                    <hr className="border-slate-200 flex-shrink-0" />
                    <div className="prose prose-sm max-w-none relative flex-1 flex flex-col">
                      {selected.body ? (
                        <iframe
                          srcDoc={selected.body || "<p>(no body)</p>"}
                          className="w-full flex-1 border-0"
                          sandbox="allow-same-origin allow-popups allow-forms"
                          title="email-body"
                        />
                      ) : (
                        "(no body)"
                      )}
                    </div>
                  </article>
                )}
              </div>
            ))}
        </section>
      </main>
      {/* Confirm Modal */}
      <ConfirmModal
        isOpen={modalOpen}
        onClose={() => {
          setModalOpen(false);
          setDeleteAccount("");
        }}
        onConfirm={() => {
          handleDelete();
          setLoading(true);
          setModalOpen(false);
          setDeleteAccount("");
          setSelected(null);
        }}
      />
    </div>
  );
}
