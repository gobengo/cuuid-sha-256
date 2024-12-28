# cuuid-sha-256

content addressed UUID using SHA-256.

As defined in [RFC 9562 S B.2](https://datatracker.ietf.org/doc/html/rfc9562#name-example-of-a-uuidv8-value-n).

## CLI

```shell
$ npx cuuid-sha-256 hi
bd97808c-95bb-8be7-84e9-89db07656caf
$ echo -n hi | npx cuuid-sha-256
bd97808c-95bb-8be7-84e9-89db07656caf
```

## Usage

```javascript
import CUUIDSHA256 from "cuuid-sha-256"

// example from https://datatracker.ietf.org/doc/html/rfc9562#name-example-of-a-uuidv8-value-n
const cuuid = new CUUIDSHA256({
  namespace: '6ba7b810-9dad-11d1-80b4-00c04fd430c8',
  name: 'www.example.com',
})

if (await cuuid.toString() !== '5c146b14-3c52-8afd-938a-375d0df1fbf6') {
  throw new Error(`expected cuuid to be UUID from example`)
}
```

CUUID for Canonicalized JSON

```javascript
import CUUIDSHA256 from "cuuid-sha-256"
import { canonicalize } from 'json-canonicalize';

export async function getCUUIDForObject(object) {
  const cuuid = new CUUIDSHA256({
    // https://bengo.is/blogging/syntax-of-a-CUUID/#data-stream-cuuids
    namespace: '026d1093-7ee7-570b-b78c-add35fa5ec5b',
    name: canonicalize(object),
  })
  return await cuuid.toString()
}
```
