#!/usr/bin/env node --no-warnings=ExperimentalWarning --experimental-strip-types

import { fileURLToPath } from "node:url"
import { parseArgs } from "node:util"
import CUUID from "./index.ts"
import { text } from "node:stream/consumers"
import fs from "fs/promises"

const UUID_NAMESPACE_DNS = '6ba7b810-9dad-11d1-80b4-00c04fd430c8' as const

// if process is running this script as main
if (await fs.realpath(globalThis?.process?.argv?.[1]) === fileURLToPath(import.meta.url)) {
  await main(...(process.argv.slice(2) ?? []))
}

async function main(...argv: string[]) {
  const parsedArgs = parseArgs({
    args: argv,
    allowPositionals: true,
  })
  let valueString: string
  if (!process.stdin.isTTY) {
    // stdin is being piped in
    valueString = await text(process.stdin)
  } else {
    const [positionalValueString] = parsedArgs.positionals
    valueString = positionalValueString
  }
  if ( ! valueString) throw new Error(`unable to determine value to get cuuid of`)
  const cuuid = new CUUID({
    namespace: UUID_NAMESPACE_DNS,
    name: valueString,
  })
  console.debug(await cuuid.toString())
}
