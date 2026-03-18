 "use client";
 
 import { useEffect } from "react";
 
 export default function AccountError({
   error,
   reset,
 }: {
   error: Error & { digest?: string };
   reset: () => void;
 }) {
   useEffect(() => {
     console.error("Account page error", {
       message: error.message,
       digest: error.digest,
     });
   }, [error]);
 
   return (
     <div className="container">
       <h1>Account</h1>
       <div className="accountCard">
         <p>Something went wrong loading your account.</p>
         <button type="button" className="primary" onClick={reset}>
           Try again
         </button>
       </div>
     </div>
   );
 }
