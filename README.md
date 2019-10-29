- [About](#about)
- [Installation & requirements](#installation-and-requirements)
- [Examples](#examples)
  - [First](#basic-example)

# About
- Node JS streams with strong typings.
- Before you will use it note that there's still some work needs to be done here.
There are already similar libraries but none of them fully covers typings for objectMode streams - this one is (or if not it will).
- Exposed classes are Node streams typed extensions, but they are forced to be in `objectMode` as it is the only case where strong typings in streams have sense.

# Requirements
Tested with node 10.16.3

# Examples

## Basic example
```js
    import * as stream from 'typed-object-stream';

    let source: stream.Readable<  {code: number}                    > = ...;
    let modify: stream.Transform< {code: number}, {message: string} > = ...;
    let dest:   stream.Writable<                  {message: string} > = ...;


    source.pipe(modify).pipe(dest);

```