#!/usr/bin/env node --no-warnings=ExperimentalWarning --experimental-strip-types

import { fileURLToPath } from "node:url"
import { parseArgs } from "node:util"
import CUUID from "./index.ts"
import { text } from "node:stream/consumers"
import fs from "fs/promises"

const CUUID_DATA_STREAM_NS = '026d1093-7ee7-570b-b78c-add35fa5ec5b' as const

// if process is running this script as main
if (await fs.realpath(globalThis?.process?.argv?.[1]) === fileURLToPath(import.meta.url)) {
  await main(...(process.argv.slice(2) ?? []))
}

async function main(...argv: string[]) {
  const parsedArgs = parseArgs({
    args: argv,
    allowPositionals: true,
    options: {
      namespace: {
        type: 'string',
        default: CUUID_DATA_STREAM_NS,
      }
    }
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
    namespace: parsedArgs.values.namespace,
    name: valueString,
  })
  console.debug(await cuuid.toString())
}
