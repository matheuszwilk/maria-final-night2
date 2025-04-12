import { hc } from "hono/client";
import { AppType } from "@/app/api/[[...route]]/route";

const urls = process.env.NEXT_PUBLIC_APP_URL?.split(",");
const httpClient = hc<AppType>(urls?.[0] ?? "");
const httpsClient = hc<AppType>(urls?.[1] ?? "");

// Função para testar a conexão de forma síncrona
function testConnection(client: ReturnType<typeof hc<AppType>>): boolean {
  try {
    // Faz uma requisição síncrona
    client.api.jira.workspaces.$get();
    return true;
  } catch {
    return false;
  }
}

// Função que retorna o cliente apropriado
function getWorkingClient(): ReturnType<typeof hc<AppType>> {
  // Tenta primeiro o cliente HTTP
  if (testConnection(httpClient)) {
    return httpClient;
  }
  // Se falhar, tenta o cliente HTTPS
  if (testConnection(httpsClient)) {
    return httpsClient;
  }
  // Se ambos falharem, retorna o HTTP (default)
  return httpClient;
}

// Exporta um único cliente
export const client = getWorkingClient();
