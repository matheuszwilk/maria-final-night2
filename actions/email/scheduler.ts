import { db } from "@/lib/db";
import { sendSystemNotifications } from "./andon-email-notification";

const JOB_NAME = "andon_notifications";
const CHECK_INTERVAL = 1000 * 20; // Checar a cada 30 segundos

export async function startScheduler() {
  // Evita iniciar se não for ambiente de produção
  if (process.env.NODE_ENV === "production") {
    console.log("🚀 Iniciando o agendador com PostgreSQL...");

    try {
      // Inicializa o registro do job se não existir e executa imediatamente
      await initializeJob();
      await checkAndExecuteJob(true); // Executa imediatamente na inicialização

      // Inicia o loop de verificação usando Promise para melhor performance
      const interval = setInterval(async () => {
        try {
          await checkAndExecuteJob(false);
        } catch (error) {
          console.error("Erro ao executar job:", error);
        }
      }, CHECK_INTERVAL);

      // Garante limpeza adequada em caso de encerramento
      process.on("SIGTERM", () => clearInterval(interval));
      process.on("SIGINT", () => clearInterval(interval));
    } catch (error) {
      console.error("Erro ao iniciar scheduler:", error);
    }
  } else {
    console.log("⚠️ Scheduler não iniciado: ambiente não é produção");
  }
}

async function initializeJob() {
  const job = await db.scheduler_log.findFirst({
    where: { job_name: JOB_NAME },
  });

  if (!job) {
    await db.scheduler_log.create({
      data: {
        job_name: JOB_NAME,
        last_run: null,
        next_run: calculateNextRun(),
        status: "pending",
      },
    });
  }
}

async function checkAndExecuteJob(isInitialRun: boolean = false) {
  const now = new Date().toLocaleString("en-US", {
    timeZone: "America/Sao_Paulo",
  });

  // Tenta obter e atualizar o job em uma única transação
  try {
    // Executa tudo em uma única transação para evitar problemas de concorrência
    await db.$transaction(async (tx) => {
      const job = await tx.scheduler_log.findFirst({
        where: {
          job_name: JOB_NAME,
          ...(isInitialRun ? {} : { next_run: { lte: new Date(now) } }),
          status: "pending",
        },
      });

      if (!job) return null;

      // Atualiza o status para evitar execuções duplicadas
      await tx.scheduler_log.update({
        where: { id: job.id },
        data: {
          status: "running",
          updated_at: new Date(now),
        },
      });

      try {
        console.log("Iniciando envio de notificações de email...");
        await sendSystemNotifications();
        console.log("Notificações de email enviadas com sucesso!");

        // Atualiza o registro com sucesso dentro da transação
        await tx.scheduler_log.update({
          where: { id: job.id },
          data: {
            last_run: new Date(now),
            next_run: calculateNextRun(),
            status: "pending",
            updated_at: new Date(now),
          },
        });
      } catch (error) {
        console.error("Erro ao enviar notificações:", error);

        // Atualiza o registro com falha dentro da transação
        await tx.scheduler_log.update({
          where: { id: job.id },
          data: {
            status: "failed",
            updated_at: new Date(now),
          },
        });
      }

      return job;
    });
  } catch (error) {
    console.error("Erro ao processar job:", error);
  }
}

function calculateNextRun(): Date {
  const now = new Date().toLocaleString("en-US", {
    timeZone: "America/Sao_Paulo",
  });
  const next = new Date(now);

  // Configura para 9:00
  next.setHours(8, 0, 0, 0);

  // Se já passou de 8:00 hoje, agenda para amanhã
  if (new Date(now) > next) {
    next.setDate(next.getDate() + 1);
  }

  return next;
}

// function calculateNextRun(): Date {
//   const now = new Date();
//   const next = new Date(now);

//   // Adiciona 5 minutos ao tempo atual
//   next.setMinutes(next.getMinutes() + 1);

//   return next;
// }
