// from https://github.com/uuidjs/uuid/blob/main/src/v35.ts

type UUIDTypes = string | Uint8Array;

import { parse } from "uuid"
import { stringify as unsafeStringify } from 'uuid';
import type { UUID } from "./types.ts";

export function stringToBytes(str: string) {
  // TODO: Use TextEncoder (see https://stackoverflow.com/a/48762658/109538)
  str = unescape(encodeURIComponent(str));

  const bytes = new Uint8Array(str.length);

  for (let i = 0; i < str.length; ++i) {
    bytes[i] = str.charCodeAt(i);
  }

  return bytes;
}

export const DNS = '6ba7b810-9dad-11d1-80b4-00c04fd430c8';
export const URL = '6ba7b811-9dad-11d1-80b4-00c04fd430c8';

type HashFunction = (bytes: Uint8Array) => Promise<Uint8Array>

export default async function v35(
  version: 0x30 | 0x50 | 0x80,
  hash: HashFunction,
  value: string | Uint8Array,
  namespace: UUIDTypes,
) {
  const valueBytes: Uint8Array = typeof value === 'string' ? stringToBytes(value) : value;
  const namespaceBytes: Uint8Array = typeof namespace === 'string' ? parse(namespace) : namespace;

  if (typeof namespace === 'string') {
    namespace = parse(namespace);
  }

  if (namespace?.length !== 16) {
    throw TypeError('Namespace must be array-like (16 iterable integer values, 0-255)');
  }

  // Compute hash of namespace and value, Per 4.3
  // Future: Use spread syntax when supported on all platforms, e.g. `bytes =
  // hashfunc([...namespace, ... value])`
  let bytes = new Uint8Array(16 + valueBytes.length);
  bytes.set(namespaceBytes);
  bytes.set(valueBytes, namespaceBytes.length);
  bytes = await hash(bytes);

  bytes[6] = (bytes[6] & 0b1111) | version;
  bytes[8] = (bytes[8] & 0x3f) | 0x80;

  return unsafeStringify(bytes) as UUID;
}
