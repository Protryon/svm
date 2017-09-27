# svm
A register-pointer JavaScript virtual machine written in JavaScript.

## Usage

### Building
Create `index.js` in the `src` directory, then run `./build.sh` with the repository directory as your current working directory.

### Running
Run `./run.sh` with the repository directory as your current working directory.

## Planned Features

### Functionality
* Complete native ES6 support without Babel
* Outward FFI (calling functions inside the VM from outside)
* With statements
* Catch external exceptions internally
* Client builder

### Obfuscation
* Instruction repackaging, shuffling, modification/generation
* VM internals repackaging
* Byte-by-byte decoding or block-by-block decoding
* VM-eval statement
* Metamorphic bytecode
* OTP shuffling to create bytecode
* Bytecode scheduler/internal async functions
* Enclaving + shuffling bytecode

### Performance
* Compile-time 'hotspotting'
* Code factoring (very similar to enclaving)
* Global value numbering
* Dead code elimination
* Register reduction
* 2-byte registers (more registers, more types of constants, instructions as registers)

## Architecture

### Compiler
The compiler converts JavaScript code into svm assembler. There is no optimization, and this is only intended to convert the semantics of JavaScript to svm assembler.

### Optfuscator
The optfuscator, or optimizing obfuscator, optimizes and obfuscates svm assembler (but not svm bytecode).

### Assembler
The assembler compiles svm assembler into svm bytecode, and encrypts it. It is planned to output a minimal, obfuscated, and web-compatible client.

### Client
The client runs the svm bytecode.