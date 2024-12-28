import { parse, stringify } from "uuid";
import v35, { stringToBytes } from "./v35.js"
import { UUID } from "./types.js";
import { hexToBuffer } from "./hex.js";

const sha256 = async function (data: Uint8Array) {
  const buf = await crypto.subtle.digest('SHA-256', data).then(d => new Uint8Array(d))
  return buf
}

/* eslint-disable no-unused-private-class-members */
export default class CUUIDv8SHA2 {
  static parse = parseCUUIDv8SHA2
  #options: {
    namespace: string,
    name: string,
  }
  constructor(options: {
    namespace: string,
    name: string,
  }) {
    this.#options = options
    const value = options.name
    const valueBytes: Uint8Array = typeof value === 'string' ? stringToBytes(value) : value;
    const { namespace } = this.#options
    const namespaceBytes: Uint8Array = typeof namespace === 'string' ? parse(namespace) : namespace;
    if (namespaceBytes?.length !== 16) {
      throw TypeError('Namespace must be array-like (16 iterable integer values, 0-255)');
    }
  }
  async toString(): Promise<UUID> {
    const uuid = await v35(
      0x80,
      sha256,
      this.#options.name,
      this.#options.namespace,
    )
    return uuid
  }
  createUuidBytesFromSha256(hash: ArrayBuffer) {
    const hashBytes = new Uint8Array(hash)
    const uuid = new Uint8Array(128/8)
    uuid.set(new Uint8Array(hash.slice(0,128/8)))
    const verBits = 0x8
    // left 4 bits of uuidByte6 are `ver` bits,
    const uuidByte6Left4Bits = verBits
    const uuidByte6Right4Bits = hashBytes[6] & 0b00001111
    const uuidByte6 = (uuidByte6Left4Bits << 4) | uuidByte6Right4Bits
    uuid.set([uuidByte6], 6)
    return uuid
  }
}

function parseCUUIDv8SHA2(uuid: UUID) {
  const hex = uuid.replaceAll('-', '')
  const buf = hexToBuffer(hex)
  const uuidBinary = Array.from(new Uint8Array(buf)).map(byte => byte.toString(2).padStart(8, '0')).join('')
  // custom_a
  const customABitOffset = 0
  const customABitLength = 48
  const customABinary = uuidBinary.slice(customABitOffset, customABitOffset + customABitLength)
  const customANumber = parseInt(`${customABinary}`, 2)
  // ver
  const verBitOffset = 0 + 48
  const verBitLength = 4
  const verBinary = uuidBinary.slice(verBitOffset, verBitOffset + verBitLength)
  const verNumber = parseInt(verBinary, 2)
  // custom_b
  const customBBitOffset = 52
  const customBBitLength = 12
  const customBBinary = uuidBinary.slice(customBBitOffset, customBBitOffset + customBBitLength)
  const customBNumber = parseInt(customBBinary, 2)
  // var
  const varBitOffset = 48 + 4 + 12
  const varBitLength = 2
  const varBinary = uuidBinary.slice(varBitOffset, varBitOffset + varBitLength)
  const varNumber = parseInt(varBinary, 2)
  // custom_c
  const customCBitOffset = 48 + 4 + 12 + 2
  const customCBitLength = 62
  const customCBinary = uuidBinary.slice(customCBitOffset, customCBitOffset + customCBitLength)
  const customCBigInt = BigInt(`0b${customCBinary}`)
  // const customCBinary = uuidBinary.slice(customCBitOffset, customCBitOffset + customCBitLength)
  return {
    custom_a: customANumber,
    ver: verNumber,
    custom_b: customBNumber,
    var: varNumber,
    custom_c: customCBigInt,
  }
}
