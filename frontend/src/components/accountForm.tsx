import{ useState,useContext } from "react";
import { UserContext } from "../../lib/context";

export type Account = {
  email: string;
  AppPass: string;
};

interface EmailAccountsFormProps {
  onSave: () => void;
}

export default function EmailAccountsForm({onSave}:EmailAccountsFormProps) {
  const context = useContext(UserContext);
  
  const {setCreateAccounts} = context!;
  const [accounts, setAccounts] = useState<Account[]>([
    { email: "", AppPass: "" },
  ]);

  function updateAccount(index: number, key: keyof Account, value: string) {
    setAccounts((prev) => {
      const copy = [...prev];
      copy[index] = { ...copy[index], [key]: value };
      return copy;
    });
  }

  function addAccount() {
    setAccounts((prev) => [...prev, { email: "", AppPass: "" }]);
  }

  function removeAccount(index: number) {
    setAccounts((prev) => prev.filter((_, i) => i !== index));
  }

  async function handleSave() {
    // Replace this with an API call to persist accounts securely on the backend
    // For demo purposes we just log the JSON.
    const token = localStorage.getItem("token");
    if (!token) {
      console.error("No auth token found");
      return;
    }
    const sanitized = accounts.filter((a) => a.email && a.AppPass);
    await fetch("https://email-aggregator-1.onrender.com/api/elasticSearchfunc/addAccounts", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        'authorization': `Bearer ${token}`
      },
      body: JSON.stringify(sanitized),
      },
    );
    setCreateAccounts((prev)=> [...prev,...sanitized]);
  }

  return (
    <div className="min-h-auto bg-slate-50 ">
      <div className="max-w-4xl mx-auto">
        

          <div className="bg-white rounded-2xl shadow p-6">
            <h2 className="font-medium mb-3">Add accounts</h2>

            <p className="text-sm text-slate-500 mb-4">
              Add the email and App Password for each account. The App Password is required for
              IMAP access if two-factor authentication is enabled.
            </p>

            <div className="space-y-4">
              {accounts.map((acct, idx) => (
                <div key={idx} className="border rounded-xl p-4">
                  <div className="flex justify-between items-start gap-4">
                    <div className="flex-1">
                      <label className="text-sm text-slate-600">Email</label>
                      <input
                        type="email"
                        value={acct.email}
                        onChange={(e) => updateAccount(idx, "email", e.target.value)}
                        placeholder="you@example.com"
                        className="mt-1 w-full rounded-lg border px-3 py-2 focus:outline-none focus:ring-2 focus:ring-slate-200"
                      />

                      <label className="text-sm text-slate-600 mt-3 block">App password</label>
                      <input
                        type="password"
                        value={acct.AppPass}
                        onChange={(e) => updateAccount(idx, "AppPass", e.target.value)}
                        placeholder="16-character app password"
                        className="mt-1 w-full rounded-lg border px-3 py-2 focus:outline-none focus:ring-2 focus:ring-slate-200"
                      />

                      <span className="text-xs text-slate-500 mt-2">
                        How to get a Gmail App Password (quick steps):
                        <ol className="list-decimal ml-4 mt-1">
                          <li>Enable 2-Step Verification on your Google account.</li>
                          <li>Go to Security &gt; App passwords.</li>
                          <li>Select "Mail" and device, then click "Generate".</li>
                          <li>Copy the 16-character password and paste it above.</li>
                        </ol>
                      </span>
                    </div>

                    <div className="flex flex-col gap-2">
                      <button
                        onClick={() => removeAccount(idx)}
                        className="text-sm px-3 py-2 rounded-full border hover:bg-slate-100"
                        aria-label={`Remove account ${idx + 1}`}
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-4 flex items-center gap-3">
              <button
                onClick={addAccount}
                className="px-4 py-2 rounded-2xl bg-white border shadow hover:shadow-md"
              >
                + Add another account
              </button>

              <button
                onClick={()=>{handleSave();onSave()}}
                className="ml-auto px-5 py-2 rounded-2xl bg-black text-white shadow"
              >
                Save
              </button>
            </div>
          </div>

          
      </div>
    </div>
  );
}
