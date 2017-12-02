const fs = require('fs');

if(process.argv.length != 7) {
	console.log('Usage: node index.js <out.sobj> <global object> <instrs.txt> <input.js> <output.js>');
	process.exit(0);
}

let tinstrs = [
	'add',
	'sub',
	'mul',
	'div',
	'mod',
	'or',
	'and',
	'not',
	'shr',
	'shl',
	'shrz',
	'bit_or',
	'bit_and',
	'bit_xor',
	'bit_not',
	'mov',
	'xchg',
	'global',
	'getprop',
	'setprop',
	'in',
	'delete',
	'instanceof',
	'typeof',
	'call_0',
	'call_1',
	'call_2',
	'call_3',
	'call_4',
	'call_5',
	'call_6',
	'call_7',
	'call_8',
	'call_9',
	'call_10',
	'obj',
	'arr',
	'null',
	'undefined',
	'regex',
	'true',
	'false',
	'protokeys',
	'eq',
	'eq_typed',
	'neq',
	'neq_typed',
	'le',
	'gr',
	'leeq',
	'greq',
	'jmp',
	'jz',
	'jnz',
	'setvar',
	'getvar',
	'context',
	'report',
	'dump',
	'nop',
	'obf_pushx',
]

let lookup = '2CzuGfq/Yg79AiDOTpIZNQ4olw163vKdLSsUbkMr+mEahWct8XVBn5FeHRPjxJy0=';

function tripletToBase64 (num) {
  return lookup[num >> 18 & 0x3F] + lookup[num >> 12 & 0x3F] + lookup[num >> 6 & 0x3F] + lookup[num & 0x3F]
}

function encodeChunk (uint8, start, end) {
  var tmp
  var output = []
  for (var i = start; i < end; i += 3) {
    tmp = (uint8[i] << 16) + (uint8[i + 1] << 8) + (uint8[i + 2])
    output.push(tripletToBase64(tmp))
  }
  return output.join('')
}

function fromByteArray (uint8) {
  var tmp
  var len = uint8.length
  var extraBytes = len % 3 // if we have 1 byte left, pad 2 bytes
  var output = ''
  var parts = []
  var maxChunkLength = 16383 // must be multiple of 3

  // go through the array every three bytes, we'll deal with trailing stuff later
  for (var i = 0, len2 = len - extraBytes; i < len2; i += maxChunkLength) {
    parts.push(encodeChunk(uint8, i, (i + maxChunkLength) > len2 ? len2 : (i + maxChunkLength)))
  }

  // pad the end with zeros, but make sure to not forget the extra bytes
  if (extraBytes === 1) {
    tmp = uint8[len - 1]
    output += lookup[tmp >> 2]
    output += lookup[(tmp << 4) & 0x3F]
    output += '=='
  } else if (extraBytes === 2) {
    tmp = (uint8[len - 2] << 8) + (uint8[len - 1])
    output += lookup[tmp >> 10]
    output += lookup[(tmp >> 4) & 0x3F]
    output += lookup[(tmp << 2) & 0x3F]
    output += '='
  }

  parts.push(output)

  return parts.join('')
}

let obj = fs.readFileSync(process.argv[2]);
let glob = process.argv[3];
let instrs = fs.readFileSync(process.argv[4], 'utf8').split('\n');
let script = fs.readFileSync(process.argv[5], 'utf8');

let lines = script.split('\n');
if(lines[0].startsWith('//begin preprocessor')) {
	let end = lines.indexOf('//end preprocessor');
	if(end < 0) {
		console.log('Existing preprocessor block beings without end!');
		process.exit();
	}
	lines.splice(0, end + 1);
}
lines.splice(0, 0, '//end preprocessor');
//lines.splice(0, 0, `var pl = '${new Buffer(obj).toString('base64')}';`);//
lines.splice(0, 0, `var pl = '${fromByteArray(obj)}';`);//
lines.splice(0, 0, `var glob = ${glob};`);
for(let instr of instrs) {
	lines.splice(0, 0, `var INS_${instr} = true;`);
}
for(let instr of tinstrs.filter(v => instrs.indexOf(v) < 0)) {
	lines.splice(0, 0, `var INS_${instr} = false;`);
}
lines.splice(0, 0, '//begin preprocessor');

fs.writeFileSync(process.argv[6], lines.join('\n'));
