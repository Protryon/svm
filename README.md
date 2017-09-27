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
* Compile-time hotspotting
* Optimizing compiler