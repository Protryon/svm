const fs = require('fs');

if(process.argv.length != 4) {
	console.log('Usage: node index.js <input.sasm> <output.sasm>');
	return;
}

String.prototype.splitC = function(delim, seqs, removeEscapes) {
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
				if(removeEscapes) {
					sub = sub.substring(0, i) + sub.substring(i + 1);
					i--;
				}
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
		escaped = false;
	}
	ret.push(sub);
	return ret;
}

let activeRegisters = {};

function shuffle(input) {
	let out = new Array(input.length);
	let rin = input.slice(0);
	for(let i = 0; i < out.length; i++) {
		let x = Math.floor(Math.random() * rin.length);
		out[i] = rin[x];
		rin.splice(x, 1);
	}
	return out;
}

let asm = fs.readFileSync(process.argv[2], 'utf8');

function ins(ins) {
	asm += ins + ' ' + Array.from(arguments).slice(1).filter(v => {
		return v.toString().trim().length > 0;
	}).join(' ') + '\n';
}

function reg(reg) {
	return typeof reg === 'string' && reg.startsWith(':') ? reg : 'r' + reg;
}

function allocRegister(r) {
	if(activeRegisters[r] != null) {
		activeRegisters[r].ct++;
	}else activeRegisters[r] = {sets: [], gets: [], ct: 1};
}

function freeRegister(r) {
	if(activeRegisters[r] == null) {
		throw "Double free";
	}
	if(--activeRegisters[r].ct == 0) {
		Object.keys(registerRules).forEach(v => {
			registerRules[v].f(r);
		});
		activeRegisters[r] = null;
	}
}

function str(arg) {
	return '\'' + arg.replace(/'/g, '\\\'') + '\'';
}

function isstr(arg) {
	return typeof arg == 'string' && arg.startsWith('\'') && arg.endsWith('\'');
}

function isconst(arg) {
	return isstr(arg) || typeof arg == 'number';
}

let labels = {};
let lines = asm.splitC('\n', ['\'', '"', '`'], false);
lines = lines.map(line => {
	return line.trim().splitC(' ', ['\'', '"', '`'], true).filter(v => {
		return v.trim().length > 0;
	});
});

lines.forEach((args, lino) => {
	if(args.length == 1 && args[0].startsWith(':') && !args[0].includes(' ')) {
		labels[args[0].substring(1)] = lino + 1;
	}
});

let instructions = {
	//arithmatic
	'add': ['get', 'get', 'set'],
	'sub': ['get', 'get', 'set'],
	'mul': ['get', 'get', 'set'],
	'div': ['get', 'get', 'set'],
	'mod': ['get', 'get', 'set'],

	//boolean arithmatic
	'or': ['get', 'get', 'set'],
	'and': ['get', 'get', 'set'],
	'not': ['get', 'set'],

	//bit arithmatic
	'shr': ['get', 'get', 'set'],
	'shl': ['get', 'get', 'set'],
	'shrz': ['get', 'get', 'set'],
	'bit_or': ['get', 'get', 'set'],
	'bit_and': ['get', 'get', 'set'],
	'bit_xor': ['get', 'get', 'set'],
	'bit_not': ['get', 'set'],

	//register management
	'mov': ['get', 'set'],
	'xchg': ['get/set', 'get/set'],

	//JS interface
	'global': ['set_const'],
	'getprop': ['get', 'get', 'set'],
	'setprop': ['get', 'get', 'get'],
	'in': ['get', 'get', 'set'],
	'delete': ['get', 'get'],
	'instanceof': ['get', 'get', 'set'],
	'typeof': ['get', 'set'],
	'call_0': ['get', 'get', 'set'],
	'call_1': ['get', 'get', 'get', 'set'],
	'call_2': ['get', 'get', 'get', 'get', 'set'],
	'call_3': ['get', 'get', 'get', 'get', 'get', 'set'],
	'call_4': ['get', 'get', 'get', 'get', 'get', 'get', 'set'],
	'call_5': ['get', 'get', 'get', 'get', 'get', 'get', 'get', 'set'],
	'call_6': ['get', 'get', 'get', 'get', 'get', 'get', 'get', 'get', 'set'],
	'call_7': ['get', 'get', 'get', 'get', 'get', 'get', 'get', 'get', 'get', 'set'],
	'call_8': ['get', 'get', 'get', 'get', 'get', 'get', 'get', 'get', 'get', 'get', 'set'],
	'call_9': ['get', 'get', 'get', 'get', 'get', 'get', 'get', 'get', 'get', 'get', 'get', 'set'],
	'call_10': ['get', 'get', 'get', 'get', 'get', 'get', 'get', 'get', 'get', 'get', 'get', 'get', 'set'],
	'obj': ['set'],
	'arr': ['set'],
	'null': ['set_const'],
	'undefined': ['set_const'],
	'regex': ['get', 'get', 'set'],
	'true': ['set_const'],
	'false': ['set_const'],
	'protokeys': ['get', 'set'],

	//comparison
	'eq': ['get', 'get', 'set'],
	'eq_typed': ['get', 'get', 'set'],
	'neq': ['get', 'get', 'set'],
	'neq_typed': ['get', 'get', 'set'],
	'le': ['get', 'get', 'set'],
	'gr': ['get', 'get', 'set'],
	'leeq': ['get', 'get', 'set'],
	'greq': ['get', 'get', 'set'],

	//branching
	'jmp': ['get'],
	'jz': ['get', 'get'],
	'jnz': ['get', 'get'],

	//variables
	'setvar': ['get', 'get'],
	'getvar': ['get', 'set'],

	//VM interface
	'context': ['set_const'],

	//debugging
	'report': ['get'],
	'dump': [],

	//obfuscation
	'nop': [],
};

let instructionRules = {
	uselessInstruction: {
		f: function(line, ins, args) {
			let rem = false;
			if(args.length == 3 && (args[0] == 0 || args[1] == 0)) {
				rem = (ins == 'add' || ins == 'sub' || ins == 'shr' || ins == 'shl' || ins == 'shrz' || ins == 'bit_or') && (args[0] == args[2] || args[1] == args[2]);
			}
			if(!rem && ins == 'mov' && args[0] == args[1]) rem = true;
			if(rem) lines.splice(line, 1, []);
		},
		improves: ['size', 'speed'],
		worsens: [],
		type: 'optimization',
	},
	//code factoring
}

let registerRules = {
	constantFolding: {
		f: function(r) {
			let ar = activeRegisters[r];
			for(let set of ar.sets) {
				if(set.args.length == 3 && isconst(set.args[0] && isconst(set.args[1]))) {
					if(set.ins == 'add') lines[set.line] = ['mov', set.args[0] + set.args[1], set.args[2]];
					else if(set.ins == 'sub') lines[set.line] = ['mov', set.args[0] - set.args[1], set.args[2]];
					else if(set.ins == 'mul') lines[set.line] = ['mov', set.args[0] * set.args[1], set.args[2]];
					else if(set.ins == 'div') lines[set.line] = ['mov', set.args[0] / set.args[1], set.args[2]];
					else if(set.ins == 'mod') lines[set.line] = ['mov', set.args[0] % set.args[1], set.args[2]];
					else if(set.ins == 'or') lines[set.line] = ['mov', set.args[0] || set.args[1], set.args[2]];
					else if(set.ins == 'and') lines[set.line] = ['mov', set.args[0] && set.args[1], set.args[2]];
					else if(set.ins == 'shr') lines[set.line] = ['mov', set.args[0] >> set.args[1], set.args[2]];
					else if(set.ins == 'shl') lines[set.line] = ['mov', set.args[0] << set.args[1], set.args[2]];
					else if(set.ins == 'shrz') lines[set.line] = ['mov', set.args[0] >>> set.args[1], set.args[2]];
					else if(set.ins == 'bit_or') lines[set.line] = ['mov', set.args[0] | set.args[1], set.args[2]];
					else if(set.ins == 'bit_and') lines[set.line] = ['mov', set.args[0] & set.args[1], set.args[2]];
					else if(set.ins == 'bit_xor') lines[set.line] = ['mov', set.args[0] ^ set.args[1], set.args[2]];
					else if(set.ins == 'eq') lines[set.line] = ['mov', set.args[0] == set.args[1], set.args[2]];
					else if(set.ins == 'eq_typed') lines[set.line] = ['mov', set.args[0] === set.args[1], set.args[2]];
					else if(set.ins == 'neq') lines[set.line] = ['mov', set.args[0] != set.args[1], set.args[2]];
					else if(set.ins == 'neq_typed') lines[set.line] = ['mov', set.args[0] !== set.args[1], set.args[2]];
					else if(set.ins == 'le') lines[set.line] = ['mov', set.args[0] < set.args[1], set.args[2]];
					else if(set.ins == 'gr') lines[set.line] = ['mov', set.args[0] > set.args[1], set.args[2]];
					else if(set.ins == 'leeq') lines[set.line] = ['mov', set.args[0] <= set.args[1], set.args[2]];
					else if(set.ins == 'greq') lines[set.line] = ['mov', set.args[0] >= set.args[1], set.args[2]];
				}else if(set.args.length == 2 && isconst(set.args[0])) {
					if(set.ins == 'not') lines[set.line] = ['mov', !set.args[0], set.args[1]];
					else if(set.ins == 'bit_not') lines[set.line] = ['mov', ~set.args[0], set.args[1]];
				}
			}
		},
		improves: ['speed'],
		worsens: [],
		type: 'optimization',
	},
	inlineConstants: {
		f: function(r) {
			let ar = activeRegisters[r];
			if(ar.sets.length == 1) {
				let cnst = false;//ar.sets[0].cst; -- if we ever implement instructions as arguments, then this will compress such
				let cnstV = null;
				if(!cnst && ar.sets[0].ins == 'mov') {
					if(isstr(ar.sets[0].args[0]) || typeof ar.sets[0].args[0] == 'number') {
						cnst = true;
						cnstV = ar.sets[0].args[0];
					}
				}
				if(cnst && ar.gets.length < 3) {

					ar.gets.forEach(v => {
						lines[v.line][v.argi + 1] = cnstV;
					});
					lines.splice(ar.sets[0].line, 1, []);
				}
			}
		},
		improves: ['reg', 'size'],
		worsens: ['size'],
		type: 'optimization',
	},
	/*uselessSets: { // TODO: fix loops and such
		f: function(r) {
			let ar = activeRegisters[r];
			let lastGet = -1;
			for(let get of ar.gets) {
				if(get.line > lastGet) lastGet = get.line;
			}
			for(let set of ar.sets) {
				if(set.ins.startsWith('call') || set.ins.startsWith('new')) continue; // side affects
				if(set.line > lastGet) {
					lines.splice(set.line, 1, []);
				}
			}
		},
		improves: ['size', 'speed'],
		worsens: [],
		type: 'optimization',
	}*/
	//GVN
	//register shuffling
};
let regStack = [];

lines.forEach((args, lino) => {
	try{
		if(args.length == 0) return;
		if(args.length == 1 && args[0].startsWith(':') && !args[0].includes(' ')) {
			return;
		}
		if(args.length == 1 && args[0].startsWith('//')) {
			if(args[0].startsWith('//alloc')) {
				allocRegister(parseInt(args[0].substring(7), 10));
			}else if(args[0].startsWith('//free')) {
				freeRegister(parseInt(args[0].substring(6), 10));
			}else if(args[0].startsWith('//pushreg')) {
				regStack.push(activeRegisters);
				activeRegisters = {};
			}else if(args[0].startsWith('//popreg')) {
				for(let r in activeRegisters) {
					if(activeRegisters[r] == null) continue;
					activeRegisters[r].ct = 1;
					freeRegister(r);
				}
				activeRegisters = regStack.pop();
			}
			return;
		}
		let ins = instructions[args[0]];
		if(ins == null || (args.length - 1) != ins.length) {
			throw "Invalid instruction: " + args[0];
		}
		args.slice(1).forEach((v, i) => {
			if(v.startsWith('r')) {
				let r = parseInt(v.substring(1), 10);
				if(r < 3) return;
				let st = ins[i].split('/');
				for(let sto of st) {
					if(sto == 'get') {
						activeRegisters[r].gets.push({line: lino, ins: args[0], argi: i});
					}else if(sto == 'set' || sto == 'set_const') {
						activeRegisters[r].sets.push({line: lino, ins: args[0], args: args.slice(1), cst: sto == 'set_const'});
					}
				}
			}
		});
		for(let key of Object.keys(instructionRules)) {
			instructionRules[key].f(lino, args[0], args.slice(1));
		}
	}catch(e) {
		console.log(e, 'Line: ' + (lino + 1));
	}
});

lines = lines.filter(v => {
	return v.length > 0 && !v[0].startsWith('//');
})

let lineIndex = [];
for(let i = 0; i < lines.length; i += 30) {
	lineIndex[i / 30] = i;
}

let lShuffle = shuffle(lineIndex);
for(let i = 0; i < lShuffle.length; i++) {
	if(lShuffle[i] == 0) {
		lShuffle[i] = lShuffle[0];
		break;
	}
}

let olines = lines.slice(0);
lShuffle[0] = 0;
lShuffle.forEach((vx, i) => {
	//if(i == 0 || vx == i * 30) return;
	let nw = vx;
	let original = i * 30;
	let v = lines.splice(original + 2 * i, 30, [':shuffle_' + (nw / 30)], ...olines.slice(nw, nw + 30), ['jmp', (nw / 30) == lShuffle.length - 1 ? ':eof' : ':shuffle_' + ((nw / 30) + 1)]);
	//lines.splice(nw, 30, [':shuffle_' + (nw / 30)], ...v, ['jmp', (nw / 30) == lShuffle.length - 1 ? ':eof' : ':shuffle_' + ((nw / 30) + 1)]);
});

for(let i = 0; i < lines.length; i++) {
	if(lines[i][0] == ':eof') {
		lines.splice(i, 1);
		lines.push([':eof']);
		break;
	}
}

fs.writeFileSync(process.argv[3], lines.map(v => {
	return v.map(v2 => {
		if(isstr(v2)) {
			return str(v2.substring(1, v2.length - 1));
		}
		return v2;
	}).join(' ');
}).join('\n'));