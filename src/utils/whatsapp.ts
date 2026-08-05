// Fallback used whenever a brand hasn't set its own notification number in Admin.
export const DEFAULT_WHATSAPP_NUMBER = '5511953992662';

export function buildWhatsAppUrl(number: string, message: string): string {
  const digitsOnly = number.replace(/\D/g, '');
  return `https://wa.me/${digitsOnly}?text=${encodeURIComponent(message)}`;
}

export function openWhatsAppNotification(number: string, message: string): void {
  window.open(buildWhatsAppUrl(number, message), '_blank', 'noopener,noreferrer');
}
