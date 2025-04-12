import { startScheduler } from "@/actions/email/scheduler";
import { currentRole } from "@/lib/auth";
import { UserRole } from "@prisma/client";
import { NextResponse } from "next/server";

let isInitialized = false;
let logInterval: NodeJS.Timeout;

// Esta função será chamada automaticamente quando o servidor Next.js iniciar
const initScheduler = () => {
  if (!isInitialized && process.env.NODE_ENV === "production") {
    isInitialized = true;
    startScheduler().catch(console.error);
    console.log("✅ Scheduler iniciado automaticamente");

    // Inicia o log a cada minuto
    logInterval = setInterval(() => {
      const now = new Date().toLocaleString("pt-BR", {
        timeZone: "America/Sao_Paulo",
      });
      console.log(`🕒 Data/Hora atual: ${now}`);
    }, 60000); // 60000ms = 1 minuto

    // Limpa o intervalo quando o servidor for encerrado
    process.on("SIGTERM", () => clearInterval(logInterval));
    process.on("SIGINT", () => clearInterval(logInterval));
  }
};

// Inicializa o scheduler apenas em produção
if (process.env.NODE_ENV === "production") {
  initScheduler();
}

// Route handler para verificar o status
export async function GET() {
  const role = await currentRole();

  if (role === UserRole.ADMIN) {
    return NextResponse.json({
      status: isInitialized
        ? "Scheduler está em execução"
        : "Scheduler não iniciado",
      environment: process.env.NODE_ENV,
    });
  }

  return new NextResponse(null, { status: 403 });
}
