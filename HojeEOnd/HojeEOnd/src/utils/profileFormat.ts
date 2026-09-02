export function normalizeCityWithUf(value: string): string | null {
  const trimmed = value.trim();
  if (!trimmed) return null;
  const match = trimmed.match(/^(.+),\s*([A-Za-z]{2})$/);
  if (!match) throw new Error("Informe a cidade e a UF, por exemplo: Carapicuíba, SP.");
  return `${match[1].trim()}, ${match[2].toUpperCase()}`;
}

export function normalizePhone(value: string): string {
  const trimmed = value.trim();
  if (!trimmed) return "";
  const normalized = `${trimmed.startsWith("+") ? "+" : ""}${trimmed.replace(/\D/g, "")}`;
  if (!/^\+?\d{10,11}$/.test(normalized)) throw new Error("Digite um telefone válido com DDD.");
  return normalized;
}

export function formatBrazilianPhone(value: string | null | undefined): string {
  if (!value) return "";
  const digits = value.replace(/\D/g, "").slice(-11);
  if (digits.length <= 2) return `(${digits}`;
  if (digits.length <= 6) return `(${digits.slice(0, 2)}) ${digits.slice(2)}`;
  return digits.length === 10 ? `(${digits.slice(0, 2)}) ${digits.slice(2, 6)}-${digits.slice(6)}` : `(${digits.slice(0, 2)}) ${digits.slice(2, 7)}-${digits.slice(7)}`;
}

/** Formats TextInput edits while treating mask punctuation as non-data. */
export function formatBrazilianPhoneInput(value: string, previous: string): string {
  const nextDigits = value.replace(/\D/g, "");
  const previousDigits = previous.replace(/\D/g, "");
  if (nextDigits.length === 0) return "";
  // Backspace over `)`, space or `-` may leave the same digits in the event;
  // consume the previous digit instead of immediately restoring punctuation.
  if (value.length < previous.length && nextDigits.length === previousDigits.length) {
    return formatBrazilianPhone(previousDigits.slice(0, -1));
  }
  return formatBrazilianPhone(nextDigits);
}
