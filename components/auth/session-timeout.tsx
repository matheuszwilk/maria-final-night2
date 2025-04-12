// "use client";

// import { useEffect, useState } from "react";
// import { signOut } from "next-auth/react";
// import { useSession } from "next-auth/react";
// import { toast } from "sonner";

// export const SessionTimeout = () => {
//   const { data: session } = useSession();
//   const [showWarning, setShowWarning] = useState(false);

//   useEffect(() => {
//     if (!session) return;

//     const checkSession = () => {
//       const now = Date.now();
//       const sessionExpires = new Date(session.expires).getTime();
//       const timeLeft = sessionExpires - now;

//       if (timeLeft <= 30000 && !showWarning) {
//         // 30 segundos
//         setShowWarning(true);
//         toast.warning("Sua sessão irá expirar em 30 segundos!", {
//           description: "Por favor, salve seu trabalho.",
//           duration: 10000,
//         });
//       }

//       if (timeLeft <= 0) {
//         signOut({ callbackUrl: "/auth/login" });
//         toast.error("Sua sessão expirou!");
//       }
//     };

//     // Verifica a cada 1 minuto
//     const interval = setInterval(checkSession, 60000);

//     // Verifica imediatamente ao montar o componente
//     checkSession();

//     return () => clearInterval(interval);
//   }, [session, showWarning]);

//   return null;
// };
