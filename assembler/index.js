const fs = require('fs');

if(process.argv.length != 4) {
	console.log('Usage: node index.js <input.sasm> <output.sobj>');
	return;
}

let asm = fs.readFileSync(process.argv[2], 'utf8');

class Instruction {
	constructor(ins, args) {
		this.ins = ins;
		this.args = args;
	}
}

let instructions = [
	//arithmatic
	new Instruction('add', ['rc', 'rc', 'r']),
	new Instruction('sub', ['rc', 'rc', 'r']),
	new Instruction('mul', ['rc', 'rc', 'r']),
	new Instruction('div', ['rc', 'rc', 'r']),
	new Instruction('mod', ['rc', 'rc', 'r']),

	//boolean arithmatic
	new Instruction('or', ['rc', 'rc', 'r']),
	new Instruction('and', ['rc', 'rc', 'r']),
	new Instruction('not', ['rc', 'r']),

	//bit arithmatic
	new Instruction('shr', ['rc', 'rc', 'r']),
	new Instruction('shl', ['rc', 'rc', 'r']),
	new Instruction('shrz', ['rc', 'rc', 'r']),
	new Instruction('bit_or', ['rc', 'rc', 'r']),
	new Instruction('bit_and', ['rc', 'rc', 'r']),
	new Instruction('bit_xor', ['rc', 'rc', 'r']),
	new Instruction('bit_not', ['rc', 'r']),

	//register management
	new Instruction('mov', ['rc', 'r']),
	new Instruction('xchg', ['r', 'r']),

	//JS interface
	new Instruction('global', ['r']),
	new Instruction('getprop', ['rc', 'rc', 'r']),
	new Instruction('setprop', ['rc', 'rc', 'rc']),
	new Instruction('in', ['rc', 'rc', 'r']),
	new Instruction('delete', ['rc', 'rc']),
	new Instruction('instanceof', ['rc', 'rc', 'r']),
	new Instruction('typeof', ['rc', 'r']),
	new Instruction('call_0', ['rc', 'rc', 'r']),
	new Instruction('call_1', ['rc', 'rc', 'rc', 'r']),
	new Instruction('call_2', ['rc', 'rc', 'rc', 'rc', 'r']),
	new Instruction('call_3', ['rc', 'rc', 'rc', 'rc', 'rc', 'r']),
	new Instruction('call_4', ['rc', 'rc', 'rc', 'rc', 'rc', 'rc', 'r']),
	new Instruction('call_5', ['rc', 'rc', 'rc', 'rc', 'rc', 'rc', 'rc', 'r']),
	new Instruction('call_6', ['rc', 'rc', 'rc', 'rc', 'rc', 'rc', 'rc', 'r']),
	new Instruction('call_7', ['rc', 'rc', 'rc', 'rc', 'rc', 'rc', 'rc', 'rc', 'r']),
	new Instruction('call_8', ['rc', 'rc', 'rc', 'rc', 'rc', 'rc', 'rc', 'rc', 'rc', 'r']),
	new Instruction('call_9', ['rc', 'rc', 'rc', 'rc', 'rc', 'rc', 'rc', 'rc', 'rc', 'rc', 'r']),
	new Instruction('call_10', ['rc', 'rc', 'rc', 'rc', 'rc', 'rc', 'rc', 'rc', 'rc', 'rc', 'rc', 'r']),
	new Instruction('new_0', ['rc', 'rc', 'r']),
	new Instruction('new_1', ['rc', 'rc', 'rc', 'r']),
	new Instruction('new_2', ['rc', 'rc', 'rc', 'rc', 'r']),
	new Instruction('new_3', ['rc', 'rc', 'rc', 'rc', 'rc', 'r']),
	new Instruction('new_4', ['rc', 'rc', 'rc', 'rc', 'rc', 'rc', 'r']),
	new Instruction('new_5', ['rc', 'rc', 'rc', 'rc', 'rc', 'rc', 'rc', 'r']),
	new Instruction('new_6', ['rc', 'rc', 'rc', 'rc', 'rc', 'rc', 'rc', 'rc', 'r']),
	new Instruction('new_7', ['rc', 'rc', 'rc', 'rc', 'rc', 'rc', 'rc', 'rc', 'rc', 'r']),
	new Instruction('new_8', ['rc', 'rc', 'rc', 'rc', 'rc', 'rc', 'rc', 'rc', 'rc', 'rc', 'r']),
	new Instruction('new_9', ['rc', 'rc', 'rc', 'rc', 'rc', 'rc', 'rc', 'rc', 'rc', 'rc', 'rc', 'r']),
	new Instruction('new_10', ['rc', 'rc', 'rc', 'rc', 'rc', 'rc', 'rc', 'rc', 'rc', 'rc', 'rc', 'rc', 'r']),
	new Instruction('obj', ['r']),
	new Instruction('arr', ['r']),
	new Instruction('null', ['r']),
	new Instruction('undefined', ['r']),
	new Instruction('regex', ['rc', 'rc', 'r']),
	new Instruction('true', ['r']),
	new Instruction('false', ['r']),
	new Instruction('protokeys', ['r', 'r']),

	//comparison
	new Instruction('eq', ['rc', 'rc', 'r']),
	new Instruction('eq_typed', ['rc', 'rc', 'r']),
	new Instruction('neq', ['rc', 'rc', 'r']),
	new Instruction('neq_typed', ['rc', 'rc', 'r']),
	new Instruction('le', ['rc', 'rc', 'r']),
	new Instruction('gr', ['rc', 'rc', 'r']),
	new Instruction('leeq', ['rc', 'rc', 'r']),
	new Instruction('greq', ['rc', 'rc', 'r']),

	//branching
	new Instruction('jmp', ['rc']),
	new Instruction('jz', ['rc', 'rc']),
	new Instruction('jnz', ['rc', 'rc']),

	//variables
	new Instruction('setvar', ['rc', 'rc']),
	new Instruction('getvar', ['rc', 'r']),

	//VM interface
	new Instruction('context', ['r']),

	//debugging
	new Instruction('report', ['rc']),
	new Instruction('dump', []),
]

String.prototype.splitC = function(delim, seqs) {
	let seqse = seqs.map(v => {
		return false;
	});
	let escaped = false;
	let ret = [];
	let sub = this;
	for(let i = 0; i < sub.length; i++) {
		let c = sub.substring(i, i + 1);
		let ci = seqs.indexOf(c);
		let seqed = true;
		if(!escaped)
			for(let j = 0; j < seqse.length; j++) {
				if(seqse[j]) {
					seqed = false;
					break;
				}
			}
		if(c == '\\') {
			escaped = !escaped;
			if(escaped) {
				sub = sub.substring(0, i - 1) + sub.substring(i);
				i--;
				continue;
			}
		}
		if(!escaped && ci >= 0) {
			seqse[ci] = !seqse[ci];
		}else if (seqed && sub.substring(i, i + delim.length) == delim){
			ret.push(sub.substring(0, i));
			sub = sub.substring(i + delim.length);
			i = -1;
		}
	}
	ret.push(sub);
	return ret;
}

function assemble(asm) {
	let labels = {};
	let out = [];
	let lines = asm.splitC('\n', ['\'', '"', '`']);
	let delayedLabels = [];
	lines.filter(v => {
		return v.trim().length > 0;
	}).forEach((line, lino) => {
		let args = line.trim().splitC(' ', ['\'', '"', '`']).filter(v => {
			return v.trim().length > 0;
		});
		if(args.length == 1 && args[0].startsWith(':') && !args[0].includes(' ')) {
			labels[args[0].substring(1)] = out.length;
			return;
		}
		let ins = null;
		let insi = -1;
		for(let i = 0; i < instructions.length; i++) {
			if(instructions[i].ins == args[0]) {
				ins = instructions[i];
				insi = i;
				break;
			}
		}
		if(ins == null) {
			console.log(`Line ${lino + 1}: invalid instruction mnemonic`);
			return;
		}
		if(ins.args.length != args.length - 1) {
			console.log(`Line ${lino + 1}: Mismatched instruction arguments`);
			return;
		}
		out.push(insi);
		for(let i = 1; i < args.length; i++) {
			let arg = args[i];
			let cfg = ins.args[i - 1];
			let ptrc = false;
			let isRegister = false;
			let delayedLabel = false;
			if(arg.startsWith(':')) {
				if(labels[arg.substring(1)] != null) {
					arg = labels[arg.substring(1)];
				}else{
					delayedLabel = true;
				}
			}
			let j = 0;
			if(!delayedLabel && arg[j] === '*') {
				ptrc = true;
				j++;
			}
			if(!delayedLabel && arg[j] == 'r') {
				isRegister = true;
				j++;
			}
			arg = arg.toString().substring(j);
			let n = parseInt(arg, 10);
			if(!delayedLabel) {
				if(!isRegister && ptrc) {
					console.log(`Line ${lino + 1}: Constants cannot be pointers`);
					return;
				}else if(isRegister && !cfg.includes('r')) {
					console.log(`Line ${lino + 1}: Register not allowed for arg ${i}`);
					return;
				}else if(!isRegister && !cfg.includes('c')) {
					console.log(`Line ${lino + 1}: Constant not allowed for arg ${i}`);
					return;
				}else if(isRegister && n > 125) {
					console.log(`Line ${lino + 1}: Register > 125 for arg ${i}`);
					return;
				}
			}
			if(!delayedLabel && isRegister && ptrc) {
				out.push(0b1000000 | n);
			}else if(!delayedLabel && isRegister && !ptrc){
				out.push(0b0000000 | n);
			}else if(delayedLabel || (!isRegister && !isNaN(n))) {
				out.push(127);
				if(delayedLabel) {
					delayedLabels.push({i: out.length, label: arg.substring(1)});
				}
				let buf = new Buffer(8);
				buf.writeDoubleBE(delayedLabel ? 0 : n, 0);
				out.push(...buf);
			}else if(!delayedLabel && !isRegister){
				out.push(126);
				arg = arg.substring(1, arg.length - 1).replace(new RegExp('\\' + arg.substring(0, 1), 'g'), arg.substring(0, 1));
				let rarg = [];
				for(let i = 0; i < arg.length; i++) {
					rarg.push(arg.charCodeAt(i));
				}
				rarg.push(0);
				out.push(...rarg);
			}else{
				console.log(`Line ${lino + 1}: Unknown error for arg ${i}`);
				return;
			}
		}
	});
	delayedLabels.forEach(v => {
		let b = [];
		let buf = new Buffer(8);
		buf.writeDoubleBE(labels[v.label], 0);
		b.push(...buf);
		out.splice(v.i, 8, ...b);
	})
	return out;
}

fs.writeFileSync(process.argv[3], new Uint8Array(assemble(asm)));