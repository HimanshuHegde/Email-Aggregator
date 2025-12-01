import { useEffect, useState, type JSX } from "react";

export default function ProtectedRoute({ children }: { children: JSX.Element }) {
    const [auth,setAuth] = useState(false); 
    const [loading,setLoading] = useState(true);
    useEffect(() => {
      const token = localStorage.getItem("token");
      (async()=>{
        if(!token){
            setLoading(false);
            setAuth(false);
            return;
        }
        const res = await fetch("https://email-aggregator-1.onrender.com/auth/me", {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token}`
          },
        });
        const resData = await res.json();
        if (resData.authenticated) {
          setAuth(true);
          setLoading(false);
        } else {
          setAuth(false);
          setLoading(false);
        }
      })()
          
    }, []);
  
    
   
    if (loading) {
    return <div className="text-center mt-20">Loading...</div>;
  }

  return auth ? (
    children
  ) : (
    <div className="text-red-600 text-center mt-20">
      Access Denied: You are not Logged In.
    </div>
  );
}