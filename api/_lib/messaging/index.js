// Messaging provider registry — mirrors api/_lib/connectors/index.js exactly,
// so adding a real Meta/WhatsApp Business Platform provider later is just
// adding a module here, without touching the endpoints that call it.

import * as evolution from './evolution.js';

function notImplemented(providerName) {
  const fail = async () => {
    throw Object.assign(new Error(`Provedor de mensageria ${providerName} ainda não está implementado.`), { status: 501 });
  };
  return { createInstance: fail, getQrCode: fail, getConnectionState: fail, sendText: fail, healthCheck: async () => false };
}

export const messagingProviders = {
  evolution,
  meta: notImplemented('Meta (WhatsApp Business Platform)'),
};

export function getMessagingProvider(provider) {
  const impl = messagingProviders[provider];
  if (!impl) {
    throw Object.assign(new Error(`Provedor de mensageria desconhecido: ${provider}`), { status: 400 });
  }
  return impl;
}
