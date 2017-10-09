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
]

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
lines.splice(0, 0, `var pl = '${new Buffer(obj).toString('base64')}';`);
lines.splice(0, 0, `var glob = ${glob};`);
for(let instr of instrs) {
	lines.splice(0, 0, `var INS_${instr} = true;`);
}
for(let instr of tinstrs.filter(v => instrs.indexOf(v) < 0)) {
	lines.splice(0, 0, `var INS_${instr} = false;`);
}
lines.splice(0, 0, '//begin preprocessor');

fs.writeFileSync(process.argv[6], lines.join('\n'));