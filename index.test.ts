import { describe, test } from "node:test"
import assert from "node:assert"
import CUUIDv8SHA2 from "./index.js"
import { UUID } from "node:crypto"
import v35 from "./v35.js"
import { hexToBuffer } from "./hex.js"

const UUID_NAMESPACE_DNS = '6ba7b810-9dad-11d1-80b4-00c04fd430c8' as const

interface CuuidExample {
  namespace: string
  name: string
  uuid: UUID
  hash: Promise<ArrayBuffer> | ArrayBuffer
}

const appendixB2Example: CuuidExample = {
  namespace: UUID_NAMESPACE_DNS,
  name: 'www.example.com' as const,
  uuid: '5c146b14-3c52-8afd-938a-375d0df1fbf6' as const,
  hash: hexToBuffer(`5c146b143c524afd938a375d0df1fbf6fe12a66b645f72f6158759387e51f3c8`),
}

await describe(`cuuid-uuidv8-sha2`, async () => {
  await test('can reproduce rfc9562 example from S B.2.', async t => {
    const cuuid = new CUUIDv8SHA2(appendixB2Example)
    assert.equal(
      await cuuid.toString(),
      appendixB2Example.uuid,
      `CUUIDv8SHA2 generates same UUID as example`)
    await t.test('parsing', async t => {
      const parsed = CUUIDv8SHA2.parse('5c146b14-3c52-8afd-938a-375d0df1fbf6')

      assert.equal(parsed.custom_a, 0x5c146b143c52)
      assert.equal(parsed.ver, 0x8)
      assert.equal(parsed.custom_b, 0xafd)
      assert.equal(parsed.var, 0b10)

      // this hex is in the RFC.
      // but I think it might be missing a bit at the beginning?
      {
        const customCShouldEndWith = BigInt('0x038a375d0df1fbf6').toString(2)
        assert.ok(parsed.custom_c.toString(2).endsWith(customCShouldEndWith))
      }
    })
  })
})
