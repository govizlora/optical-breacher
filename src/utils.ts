/**
 * `C` -> `[]`
 * `1C` -> `[1C]`
 * `1C55BD` -> `[1C, 55, BD]`
 */
function parseByte(byte: string): (string)[] {
  if (byte.length < 2 || !byte.match(/^[0-9A-F]+$/)) {
    return [];
  }

  if (byte.length === 2) {
    try {
      return parseInt(byte, 16) < 256 ? [byte] : [];
    } catch {
      return []
    }
  }

  if (byte.length % 2 === 0) {
    const bytes = byte.match(/.{1,2}/g)!
    return bytes.map(parseByte).flat();
  }

  return [];
}

const getBytes = (line: string) => line.split(' ').map(parseByte).flat();

// type Falsy = null | undefined | 0 | false | '';

// const isTruthy = <V>(v: V | Falsy): v is V => Boolean(v);

export const processResult = (res: string) => res.split('\n').map(getBytes).filter(l => l.length > 0)