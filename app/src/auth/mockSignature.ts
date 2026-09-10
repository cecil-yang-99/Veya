export function buildMockSignature(address: string, nonce: string): string {
  const payload = `veya-dev-signature:${address.toLowerCase()}:${nonce}`;
  return `0x${stringToHex(payload)}`;
}

function stringToHex(value: string): string {
  return Array.from(value)
    .map((char) => char.charCodeAt(0).toString(16).padStart(2, '0'))
    .join('');
}
