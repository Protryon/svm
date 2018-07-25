# svm
A register-pointer JavaScript virtual machine written in JavaScript.

## Usage

### Building
Create `index.js` in the `src` directory, then run `./build.sh` with the repository directory as your current working directory.

### Running
Run `./run.sh` with the repository directory as your current working directory.

## Functionality
* Compile almost any JavaScript source to obfuscated virtual machine code
* Dynamic instruction set, randomized output bytecode
* ES5 compatible output for ES6+ input

## Planned Features

### Functionality
* Modules, imports, exports
* Templates (w/o Babel)
* Internal async functions
* Spread elements (w/o Babel)
* Do expressions
* With statements
* Decorators
* Directives
* Function generators
* Catch external exceptions internally
* Bundling of client sources pre-compilation
* Conditional sets
* Run minifier more

### Obfuscation
* Instruction repackaging, shuffling, modification/generation
* VM internals repackaging
* Metamorphic bytecode -- copy in code, alternate decryptions, etc
* Bytecode scheduler/internal async functions
* Hide instructions via mov and call register
* Replace `jz/jnz` with `add r0 X r0` with `X = r0 + !!condition * off`
* Replace `sub` with `add r0 X r2` with `X = div r1 -1`
* Replace `eq_typed` with `eq` + `typeof`
* Internal negation of Numbers
* Compiler-client register mapped shuffling
* Code signing and internal verification
* Tamper detection - block by block - chained
* Code flow graph flattening
* Use register pointing capability
* Internal offset assertions

### Performance
* Compile-time hotspotting
* Global value numbering
* Dead code elimination
* Register reduction
* Instructions as arguments
* Track register state across time rather than live scanning only in optfuscator
* Inbuilt profiling

### Compatibility
* Remove typed arrays dependency

## Architecture

### Compiler
The compiler converts JavaScript code into svm assembler. There is no optimization, and this is only intended to convert the semantics of JavaScript to svm assembler.

### Optfuscator
The optfuscator, or optimizing obfuscator, optimizes and obfuscates svm assembler (but not svm bytecode).

### Assembler
The assembler compiles svm assembler into svm bytecode, and encrypts it. It is planned to output a minimal, obfuscated, and web-compatible client.

### Client
The client runs the svm bytecode.
