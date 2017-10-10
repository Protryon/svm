# svm
A register-pointer JavaScript virtual machine written in JavaScript.

## Usage

### Building
Create `index.js` in the `src` directory, then run `./build.sh` with the repository directory as your current working directory.

### Running
Run `./run.sh` with the repository directory as your current working directory.

## Planned Features

### Functionality
* Modules, imports, exports
* Templates
* Internal async functions
* Spread elements
* Symbols
* Do expressions
* With statements
* Decorators
* Directives
* Function generators
* Catch external exceptions internally
* Client builder
* Bundling and Browserification

### Obfuscation
* Instruction repackaging, shuffling, modification/generation
* VM internals repackaging
* Metamorphic bytecode -- copy in code, alternate decryptions, etc
* Bytecode scheduler/internal async functions
* Hide instructions via mov and call register
* Replace `jz/jnz` with `add r0 X r0` with `X = r0 + (true ? 1 : 0) * off`
* Internal negation of Numbers
* Compiler register maps
* Bytecode reuse
* Tamper detection - block by block - chained
* Code flow graph flattening

### Performance
* Compile-time hotspotting
* Global value numbering
* Dead code elimination
* Register reduction
* Instructions as arguments
* Track register state across time rather than live scanning only

## Architecture

### Compiler
The compiler converts JavaScript code into svm assembler. There is no optimization, and this is only intended to convert the semantics of JavaScript to svm assembler.

### Optfuscator
The optfuscator, or optimizing obfuscator, optimizes and obfuscates svm assembler (but not svm bytecode).

### Assembler
The assembler compiles svm assembler into svm bytecode, and encrypts it. It is planned to output a minimal, obfuscated, and web-compatible client.

### Client
The client runs the svm bytecode.
