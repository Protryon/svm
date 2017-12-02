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

let variables = {};

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
	if(typeof r == 'string' && r.startsWith('r')) r = parseInt(r.substring(1), 10);
	if(hrStack[curStack] == null || hrStack[curStack] < r) hrStack[curStack] = r;
	if(activeRegisters[r] != null) {
		activeRegisters[r].ct++;
	}else activeRegisters[r] = {sets: [], gets: [], ct: 1};
}

function requestRegister(min) {
	for(let i = min || 3; i < 65536; i++) {
		if(activeRegisters[i] == null || activeRegisters[i].ct === 0) {
			if(hrStack[curStack] == null || hrStack[curStack] < i) hrStack[curStack] = i;
			activeRegisters[i] = {sets: [], gets: [], ct: 1};
			return 'r' + i;
		}
	}
	throw "Out of registers!";
}

function freeRegister(r) {
	if(typeof r == 'string' && r.startsWith('r')) r = parseInt(r.substring(1), 10);
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

let hasDynamicVariables = false;

let variableRules = {
	
	registerifySingleScope: {
		f: function(vr) {
			if(hasDynamicVariables) return; // we cannot guarantee whats been set/get w/o dynamic analysis
			let scope;
			for(let get of vr.gets) {
				if(scope === undefined) scope = get.stack;
				else if(scope != get.stack) return;
			}
			for(let set of vr.sets) {
				if(scope === undefined) scope = set.stack;
				else if(scope != set.stack) return;
			}
			let r = requestRegister(hrStack[scope] + 1);
			for(let get of vr.gets) {
				let oins = lines[get.line];
				processInstruction(get.line, 'mov', [r, oins[2]], false, true); //TODO: track register state
			}
			for(let set of vr.sets) {
				let oins = lines[set.line];
				processInstruction(set.line, 'mov', [oins[2], r], false, true);
			}
			//freeRegister(r);
		},
		improves: ['speed'],
		worsens: [],
		type: 'obfuscation',
	},
	/*destroyUnusedVariables: { // TODO: interfered by above
		f: function(vr) {
			if(vr.gets.length > 0) return;
			for(let set of vr.sets) {
				lines.splice(set.line, 1);
			}
		},
		improves: ['speed'],
		worsens: [],
		type: 'obfuscation',
	}*/
	
};

function applyVariableRules(vr) {
	for(let key in variableRules) {
		variableRules[key].f(vr);
	}
}

let latestLineProcessed = -1;
let stackCounter = 0;
let curStack = -1;
let rStack = [];
let hrStack = {};

function processInstruction(lino, ins, args, insert, skipReg) {
	let patched = lino <= latestLineProcessed;
	if(patched) {
		lines.splice(lino, insert ? 0 : 1, [ins].concat(args));
	}
	if(lino > latestLineProcessed) latestLineProcessed = lino;
	if(ins == null) return;
	if(ins.startsWith('//')) {
		if(ins.startsWith('//alloc')) {
			allocRegister(parseInt(ins.substring(7), 10));
		}else if(ins.startsWith('//free')) {
			freeRegister(parseInt(ins.substring(6), 10));
		}else if(ins.startsWith('//pushreg')) {
			varStack.push(variables);
			let nv = {};
			for(let key in variables) {
				nv[key] = variables[key];
			}
			variables = nv;
			regStack.push(activeRegisters);
			activeRegisters = {};
			rStack.push(curStack);
			curStack = stackCounter++;
		}else if(ins.startsWith('//popreg')) {
			for(let r in activeRegisters) {
				if(activeRegisters[r] == null) continue;
				activeRegisters[r].ct = 1;
				freeRegister(r);
			}
			let ov = varStack.pop();
			for(let key in ov) {
				if(!(key in variables)) {
					applyVariableRules(ov[key]);
				}
			}
			variables = ov;
			activeRegisters = regStack.pop();
			curStack = rStack.pop();
		}
		return;
	}
	if(ins == 'setvar') {
		if(!isstr(args[0])) {
			hasDynamicVariables = true;
		}else{
			let a = variables[args[0].substring(1, args[0].length - 1)] || {sets: [], gets: []};
			variables[args[0].substring(1, args[0].length - 1)] = a;
			a.sets.push({stack: curStack, line: lino, to: args[1]});
		}
	}else if(ins == 'getvar') {
		if(!isstr(args[0])) {
			hasDynamicVariables = true;
		}else{
			let a = variables[args[0].substring(1, args[0].length - 1)] || {sets: [], gets: []};
			variables[args[0].substring(1, args[0].length - 1)] = a;
			a.gets.push({stack: curStack, line: lino, to: args[1]});
		}
	}
	let dins = instructions[ins];
	if(dins == null || (args.length) != dins.length) {
		throw "Invalid instruction: " + ins;
	}
	if(!skipReg)
		args.forEach((v, i) => {
			if(v.startsWith('r')) {
				let r = parseInt(v.substring(1), 10);
				if(r < 3) return;
				let st = dins[i].split('/');
				let gi = activeRegisters[r].gets.length;
				let si = activeRegisters[r].sets.length;
				if(patched) {
					gi = 0;
					si = 0;
					for(let j = 0; j < activeRegisters[r].gets.length; j++) {
						if(activeRegisters[r].gets[j].line == lino) {
							gi = j;
							if(insert) break;
						}else if(!insert && (activeRegisters[r].gets[j].line > lino || j == activeRegisters[r].gets.length - 1)) {
							activeRegisters[r].gets.splice(gi, j - gi);
						}
					}
					for(let j = 0; j < activeRegisters[r].sets.length; j++) {
						if(activeRegisters[r].sets[j].line == lino) {
							si = j;
							if(insert) break;
						}else if(!insert && (activeRegisters[r].sets[j].line > lino || j == activeRegisters[r].sets.length - 1)) {
							activeRegisters[r].sets.splice(si, j - si);
						}
					}
				}
				for(let sto of st) {
					if(sto == 'get') {
						activeRegisters[r].gets.splice(gi, 0, {line: lino, ins: args[0], argi: i});
					}else if(sto == 'set' || sto == 'set_const') {
						activeRegisters[r].sets.splice(si, 0, {line: lino, ins: args[0], args: args.slice(1), cst: sto == 'set_const'});
					}
				}
			}
		});
	for(let key of Object.keys(instructionRules)) {
		if(instructionRules[key].f(lino, ins, args)) {
			return;
		}
	}
}

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
	replaceInstruction: {
		f: function(line, ins, args) {
			let repl = null;
			if(ins == 'jmp') {
				repl = ['mov', args[0], 'r0'];
			}else if(ins == 'gr') {
				repl = ['le', args[1], args[0], args[2]];
			}else if(ins == 'greq') {
				repl = ['leeq', args[1], args[0], args[2]];
			}else return;
			processInstruction(line, repl[0], repl.slice(1), false);
			return true;
		},
		improves: [],
		worsens: [],
		type: 'obfuscation',
	},
	expandInstructions: {
		f: function(line, ins, args) {
			if(ins == 'mul') {
				let r = requestRegister();
				processInstruction(line, 'div', ['1', args[1], r], true);
				latestLineProcessed++;
				processInstruction(line + 1, 'div', [args[0], r, args[2]], false);
				freeRegister(r);
			}else if(ins == 'neq') {
				processInstruction(line, 'eq', [args[0], args[1], args[2]], true);
				latestLineProcessed++;
				processInstruction(line + 1, 'not', [args[2], args[2]], false);
			}else if(ins == 'neq_typed') {
				processInstruction(line, 'eq_typed', [args[0], args[1], args[2]], true);
				latestLineProcessed++;
				processInstruction(line + 1, 'not', [args[2], args[2]], false);
			}
			//internal type equals?
			//greq/leeq?
			// intennal <?
		},
		improves: [],
		worsens: ['size', 'speed'],
		type: 'obfuscation',
	},
	
	//code factoring
}

//TODO: variable rules: fold into registers if local

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
	}
	*/
	//GVN
	//register shuffling
};
let regStack = [];
let varStack = [];

for(let lino = 0; lino < lines.length; lino++) {
	let args = lines[lino];
	try{
		if(args.length == 0) continue;
		if(args.length == 1 && args[0].startsWith(':') && !args[0].includes(' ')) {
			continue;
		}
		if(lino <= latestLineProcessed) continue;
		processInstruction(lino, args[0], args.slice(1), false);
	}catch(e) {
		console.log(e, 'Line: ' + (lino + 1));
	}
}
for(let key in variables) {
	applyVariableRules(variables[key]);
}
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
	let v = lines.splice(original + 2 * i, 30, [':shuffle_' + (nw / 30)], ...olines.slice(nw, nw + 30), ['mov', (nw / 30) == lShuffle.length - 1 ? ':eof' : ':shuffle_' + ((nw / 30) + 1), 'r0']);
	//lines.splice(nw, 30, [':shuffle_' + (nw / 30)], ...v, ['jmp', (nw / 30) == lShuffle.length - 1 ? ':eof' : ':shuffle_' + ((nw / 30) + 1)]);
});

for(let i = 0; i < lines.length; i++) {
	if(lines[i][0] == ':eof') {
		lines.splice(i, 1);
		lines.push([':eof']);
		break;
	}
}

if(lines.length > 15)
	for(let i = 0; i < Math.max(lines.length / 100, 5); i++) {
		let x = (Math.random() * lines.length) | 0;
		if(x < Math.max(lines.length / 100, 15)) {
			i++;
			continue;
		}
		let len = 5 + (Math.random() * Math.max(lines.length / 3, 15)) | 0;
		lines.splice(x, 0, ['mov', ':overlap_' + i, 'r0'], ['obf_pushx', len], [':overlap_' + i]);
	}


let trace = false;
if (trace) {
	let nl = [];
	for (let i = 0; i < lines.length; i++) {
		nl.push(['report', "'" + (nl.length + 2) + "'"]);
		nl.push(lines[i]);
	}
	lines = nl;
}

fs.writeFileSync(process.argv[3], lines.map(v => {
	return v.map(v2 => {
		if(isstr(v2)) {
			return str(v2.substring(1, v2.length - 1));
		}
		return v2;
	}).join(' ');
}).join('\n'));
