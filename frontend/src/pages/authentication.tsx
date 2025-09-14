import {  useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

export default function AuthPage() {
    const navigate = useNavigate();
  const [isSignUp, setIsSignUp] = useState(false);
 
  useEffect(() => {
    (async()=>{
      const token = localStorage.getItem("token")
      if(!token) return;
      const valid = await fetch("https://email-aggregator-xjcx.onrender.com/auth/me", {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
      });
      const validData = await valid.json();
      if (validData.authenticated) {
        navigate("/dashboard", {replace:true});
      }
    })()
  },[])
  async function submitHandler(e: React.FormEvent) {
    e.preventDefault();
    const formDat = new FormData(e.currentTarget as HTMLFormElement);
    const data = Object.fromEntries(formDat.entries());
    const res = await fetch(`https://email-aggregator-xjcx.onrender.com/auth/${isSignUp ? "signup" : "login"}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    })
    const resData = await res.json();
    if (resData.success) {
      localStorage.setItem("token", resData.token);
      navigate("/dashboard");
    } else {
      alert(resData.message || "Authentication failed");
    }
    
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-md p-8">
        {/* Title */}
        <h2 className="text-2xl font-semibold text-gray-800 text-center mb-6">
          {isSignUp ? "Create an Account" : "Email Aggregator"}
        </h2>

        {/* Form */}
        <form className="space-y-4" onSubmit={submitHandler}>
          {isSignUp && (
            <div>
              <label className="block text-sm text-gray-600">Full Name</label>
              <input
                type="text"
                name="name"
                placeholder="John Doe"
                className="w-full mt-1 px-4 py-2 border rounded-xl focus:ring focus:ring-blue-200 focus:outline-none"
              />
            </div>
          )}

          <div>
            <label className="block text-sm text-gray-600">Email</label>
            <input
              type="email"
              name="email"
              placeholder="you@example.com"
              className="w-full mt-1 px-4 py-2 border rounded-xl focus:ring focus:ring-blue-200 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-sm text-gray-600">Password</label>
            <input
              type="password"
              name="password"
              placeholder="********"
              className="w-full mt-1 px-4 py-2 border rounded-xl focus:ring focus:ring-blue-200 focus:outline-none"
            />
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            className="w-full py-2 rounded-xl bg-black text-white font-medium shadow-md hover:bg-gray-900 transition"
          >
            {isSignUp ? "Sign Up" : "Sign In"}
          </button>
        </form>

        {/* Toggle */}
        <p className="text-center text-sm text-gray-500 mt-6">
          {isSignUp ? "Already have an account?" : "Don’t have an account?"}{" "}
          <button
            onClick={() => setIsSignUp(!isSignUp)}
            className="text-blue-600 font-medium hover:underline"
          >
            {isSignUp ? "Sign In" : "Sign Up"}
          </button>
        </p>
      </div>
    </div>
  );
}
