import{ useState } from "react";

export type Account = {
  email: string;
  appPassword: string;
};

export default function EmailAccountsForm() {
  const [accounts, setAccounts] = useState<Account[]>([
    { email: "", appPassword: "" },
  ]);

  function updateAccount(index: number, key: keyof Account, value: string) {
    setAccounts((prev) => {
      const copy = [...prev];
      copy[index] = { ...copy[index], [key]: value };
      return copy;
    });
  }

  function addAccount() {
    setAccounts((prev) => [...prev, { email: "", appPassword: "" }]);
  }

  function removeAccount(index: number) {
    setAccounts((prev) => prev.filter((_, i) => i !== index));
  }

  function handleSave() {
    // Replace this with an API call to persist accounts securely on the backend
    // For demo purposes we just log the JSON.
    const sanitized = accounts.filter((a) => a.email && a.appPassword);
    console.log("Save accounts:", JSON.stringify(sanitized));
    alert("Accounts saved to console (replace this with API call)");
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
                        value={acct.appPassword}
                        onChange={(e) => updateAccount(idx, "appPassword", e.target.value)}
                        placeholder="16-character app password"
                        className="mt-1 w-full rounded-lg border px-3 py-2 focus:outline-none focus:ring-2 focus:ring-slate-200"
                      />

                      <p className="text-xs text-slate-500 mt-2">
                        How to get a Gmail App Password (quick steps):
                        <ol className="list-decimal ml-4 mt-1">
                          <li>Enable 2-Step Verification on your Google account.</li>
                          <li>Go to Security &gt; App passwords.</li>
                          <li>Select "Mail" and device, then click "Generate".</li>
                          <li>Copy the 16-character password and paste it above.</li>
                        </ol>
                      </p>
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
                onClick={handleSave}
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
