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
* Bundling and browserification

### Obfuscation
* Instruction repackaging, shuffling, modification/generation
* VM internals repackaging
* Byte-by-byte decoding or block-by-block decoding
* Metamorphic bytecode -- mov instead of jmp, copy in all the code, etc
* Bytecode scheduler/internal async functions
* Jump to instruction arguments
* Hide instructions via mov and call register
* jmp conditional to add r0 X r0 with X cur instr + true * off
* Internal negation?

### Performance
* Compile-time 'hotspotting'
* Code factoring (very similar to enclaving)
* Global value numbering
* Dead code elimination
* Register reduction
* Instructions as arguments
* Track register state across time rather and livescan only

## Architecture

### Compiler
The compiler converts JavaScript code into svm assembler. There is no optimization, and this is only intended to convert the semantics of JavaScript to svm assembler.

### Optfuscator
The optfuscator, or optimizing obfuscator, optimizes and obfuscates svm assembler (but not svm bytecode).

### Assembler
The assembler compiles svm assembler into svm bytecode, and encrypts it. It is planned to output a minimal, obfuscated, and web-compatible client.

### Client
The client runs the svm bytecode.