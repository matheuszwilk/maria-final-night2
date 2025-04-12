import nodemailer from "nodemailer";
import { db } from "@/lib/db";
import { getDepartmentEmails } from "@/app/_helpers/email-config";

const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

type NotificationRecord = {
  cause_department?: string;
  organization?: string;
  secondary_cause_dept?: string;
  count: number;
  reasons?: string;
  contents?: string;
};

export async function sendSystemNotifications() {
  try {
    // Busca o último mês disponível
    const lastMonth = await db.$queryRaw<{ year_month: string }[]>`
      SELECT DISTINCT \`year_month\`
      FROM andon_monthly_top_defects
      ORDER BY \`year_month\` DESC 
      LIMIT 1
    `;

    if (!lastMonth.length) return;

    const targetMonth = lastMonth[0].year_month;

    // Fetch both Andon and Idle records
    const andonRecords = await db.$queryRaw<NotificationRecord[]>`
      SELECT 
        cause_department,
        organization,
        COUNT(*) as count,
        GROUP_CONCAT(reason SEPARATOR ';;') as reasons
      FROM andon_monthly_top_defects
      WHERE \`year_month\` = ${targetMonth}
      AND status = 'NG'
      GROUP BY cause_department, organization
    `;

    const idleRecords = await db.$queryRaw<NotificationRecord[]>`
      SELECT 
        secondary_cause_dept as cause_department,
        organization,
        COUNT(*) as count,
        GROUP_CONCAT(contents SEPARATOR ';;') as reasons
      FROM idle_monthly_top_defects
      WHERE \`year_month\` = ${targetMonth}
      AND status = 'NG'
      GROUP BY secondary_cause_dept, organization
    `;

    let transporter = nodemailer.createTransport({
      host: process.env.RESEND_KEY,
      port: 25,
      secure: false,
      tls: {
        rejectUnauthorized: false,
      },
    });

    // Process both types of records
    for (const [systemType, records] of [
      ["Andon", andonRecords],
      ["Idle", idleRecords],
    ] as const) {
      for (const record of records) {
        try {
          const department = record.cause_department;
          const organization = record.organization;
          const recipients = await getDepartmentEmails(
            department!,
            organization
          );

          if (recipients.length === 0) {
            console.warn(
              `Nenhum email encontrado para o departamento: ${department} e organização: ${organization}`
            );
            continue;
          }

          const reasonsArray = record.reasons ? record.reasons.split(";;") : [];
          const systemPath = systemType.toLowerCase();
          const systemUrl = `${process.env.NEXT_PUBLIC_APP_URL}/${systemPath}/report`;

          await transporter.sendMail({
            from: '"H&A Improvoments" <f6dx@lge.com>',
            to: recipients,
            subject: `H&A Improvoments) (${organization}) Ação Necessária: ${record.count} Planos de Ação Pendentes - (${targetMonth}) - ${systemType}`,
            html: `
            <html lang="pt-BR">
            <head>
                <meta charset="UTF-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <title>Planos de Ação Pendentes</title>
                <style>
                    body {
                        font-family: 'Roboto', Arial, sans-serif;
                        line-height: 1.6;
                        color: #333;
                        max-width: 600px;
                        margin: 0 auto;
                        padding: 20px;
                        background-color: #f4f7f9;
                    }
                    .container {
                        background-color: #ffffff;
                        border-radius: 8px;
                        box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
                        padding: 30px;
                        margin-top: 20px;
                    }
                    h2 {
                        color: #2c3e50;
                        border-bottom: 2px solid #A50034;
                        padding-bottom: 10px;
                        margin-top: 0;
                        font-weight: 700;
                    }
                    h3 {
                        color: #A50034;
                        font-weight: 400;
                    }
                    ul {
                        background-color: #f8f9fa;
                        border-left: 4px solid #A50034;
                        padding: 15px 15px 15px 30px;
                        margin: 0;
                        border-radius: 0 4px 4px 0;
                    }
                    li {
                        margin-bottom: 10px;
                        transition: transform 0.2s ease-in-out;
                    }
                    li:hover {
                        transform: translateX(5px);
                    }
                    p {
                        margin-bottom: 15px;
                    }
                    .highlight {
                        font-weight: bold;
                        color: #e74c3c;
                        background-color: #ffeaa7;
                        padding: 2px 5px;
                        border-radius: 3px;
                    }
                    .footer {
                        margin-top: 20px;
                        font-style: italic;
                        color: #7f8c8d;
                        text-align: center;
                        padding-top: 15px;
                        border-top: 1px solid #ecf0f1;
                    }
                    .header {
                        text-align: center;
                        margin-bottom: 20px;
                    }
                    .logo {
                        max-width: 150px;
                        height: auto;
                    }
                    @keyframes fadeIn {
                        from { opacity: 0; }
                        to { opacity: 1; }
                    }
                    .fade-in {
                        animation: fadeIn 0.5s ease-in-out;
                    }
                    .button-container {
                        text-align: center;
                        margin-top: 30px;
                    }
                    .modern-button {
                        display: inline-block;
                        padding: 12px 24px;
                        background-color: #A50034;
                        color: #ffffff;
                        text-decoration: none;
                        font-weight: 700;
                        border-radius: 30px;
                        transition: all 0.3s ease;
                        box-shadow: 0 4px 6px rgba(165, 0, 52, 0.2);
                    }
                    .modern-button:hover {
                        background-color: #7D0028;
                        transform: translateY(-2px);
                        box-shadow: 0 6px 8px rgba(165, 0, 52, 0.3);
                    }
                </style>
            </head>
            <body>
                <div class="container fade-in">
                    <div class="header">
                        <img src="https://www.lg.com/content/dam/lge/common/logo/logo-lg-100-44.svg" alt="Company Logo" class="logo">
                    </div>
                    <h2>
                    <span style="color: #A50034; font-size: 0.8em; display: block; margin-bottom: 5px;">${systemType} System</span>
                    Planos de Ação Pendentes para ${department}
                    </h2>
                    <p>Mês de referência: <span class="highlight">${targetMonth}</span></p>
                    <p>Quantidade de itens pendentes: <span class="highlight">${record.count}</span></p>
                    <h3>Razões:</h3>
                    <ul>
                        ${reasonsArray.map((reason) => `<li>${reason.trim()}</li>`).join("")}
                    </ul>
                    <p class="footer">Por favor, providencie os planos de ação necessários.</p>
                    <div class="button-container">
                        <a href="${systemUrl}" class="modern-button">Acesse o sistema</a>
                    </div>
                </div>
            </body>
          </html>
          `,
          });

          await delay(2000);
        } catch (error) {
          console.error(
            `Erro ao enviar email para ${record.cause_department}:`,
            error
          );
        }
      }
    }
  } catch (error) {
    console.error("Erro ao enviar notificações:", error);
  }
}
