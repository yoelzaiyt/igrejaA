// Connector registry — one entry per supported payment provider. Each
// connector implements: createPayment(accessToken, params), checkStatus(accessToken, id),
// testConnection(accessToken). Add a new provider by adding a module here
// and wiring it into the registry.

import * as mercadopago from './mercadopago.js';

function notImplemented(providerName) {
  const fail = async () => {
    throw Object.assign(new Error(`Conector ${providerName} ainda não está implementado.`), { status: 501 });
  };
  return { createPayment: fail, checkStatus: fail, testConnection: fail, cancelPayment: fail };
}

export const connectors = {
  mercadopago,
  // Estrutura pronta — implementar quando a integração real for priorizada.
  stone: notImplemented('Stone'),
  cielo: notImplemented('Cielo'),
  pagbank: notImplemented('PagBank'),
};

export function getConnector(provider) {
  const connector = connectors[provider];
  if (!connector) {
    throw Object.assign(new Error(`Provedor de pagamento desconhecido: ${provider}`), { status: 400 });
  }
  return connector;
}
