const fs = require('fs');
const babel = require("babel-core");

if(process.argv.length != 4) {
	console.log('Usage: node index.js <input.js> <output.sasm>');
	return;
}

let asm = '';

let script = fs.readFileSync(process.argv[2], 'utf8');
let extern = fs.readFileSync('extern.txt', 'utf8').split('\n');

let xf = babel.transform(script, {babelrc: false, sourceType: 'script', plugins: [
	'transform-es2015-computed-properties',
	'transform-es2015-destructuring',
	'transform-es2015-duplicate-keys',
	'transform-es2015-literals',
	'transform-es2015-object-super',
	'transform-es2015-parameters',
	'transform-es2015-shorthand-properties',
	'transform-es2015-spread',
	'transform-es2015-template-literals',
	'transform-es2015-unicode-regex',
]});
console.log(xf.code);
xf = xf.ast.program;

let registers = [];
for(let i = 0; i < 126; i++) {
	registers.push(0);
}
let variables = {};

function ins(ins) {
	let args = Array.from(arguments).slice(1).filter(v => {
		if(v == undefined) {
			console.log(Array.from(arguments).toString());
		}
		return v.toString().trim().length > 0;
	});
	asm += ins + ' ' + args.join(' ') + '\n';
	args.forEach(v => {
		if(typeof v == 'string') {
			if(v == 'null' || v == 'undefined' || v == 'true' || v == 'false') return;
			if(!v.startsWith(':') && !v.startsWith('\'') && !v.endsWith('\'') && !v.startsWith('r')) console.log('Invalid String: ' + v);
			if(v.startsWith('r') && isNaN(parseInt(v.substring(1), 10))) console.log('Invalid register: ' + v);
		}
	});
}

function requestRegister() {
	for(let i = 3; i < 65536; i++) {
		if(registers[i] === undefined || registers[i] === 0) {
			registers[i] = 1;
			asm += '//alloc' + i + '\n'
			return 'r' + i;
		}
	}
	throw "Out of registers!";
}

function claimRegister(r) {
	if(typeof r == 'string') {
		if(r.startsWith('r')) r = parseInt(r.substring(1));
		else return;
	}else return;
	if(r <= 2) return;
	if(registers[r] === undefined) registers[r] = 0;
	registers[r]++;
	asm += '//alloc' + r + '\n';
}

function freeRegister(r) {
	if(typeof r == 'string') {
		if(r.startsWith('r')) r = parseInt(r.substring(1));
		else return;
	}else return;
	if(r <= 2) return;
	asm += '//free' + r + '\n'
	if(registers[r] > 0) registers[r]--;
	for(let k in varMap) {
		if(varMap[k].reg == r) varMap[k].reg = null;
		break;
	}
}

function refreshRegister(r) {
	if(typeof r == 'string') {
		if(r.startsWith('r')) r = parseInt(r.substring(1));
		else return;
	} else return;
	if(r <= 2) return;
	asm += '//free' + r + '\n'
	asm += '//alloc' + r + '\n'
}

function str(arg) {
	return '\'' + arg.toString().replace(/'/g, '\\\'') + '\'';
}

function handleExpression(exp) {
	if(typeof exp == 'string' && exp.startsWith('r'))
		 exp = parseInt(exp.substring(1));
	if(typeof exp == 'number') {
		if(exp > 2) {
			asm += '//alloc' + exp + '\n'
			registers[exp]++;
		}
		return exp;
	}
	handleNode(exp);
	if('register' in exp) {
		return exp.register;
	}
	return undefined;
}

Object.prototype.findChild = function(func) {
	for(let key in this) {
		if(func(key, this[key])) return key;
	}
	return undefined;
}

// {name, endname}
let loopStack = [];
let branchCounter = 0;
let varMap = {};
let regStack = [];
let tryStack = [];
let tryStackStack = [];
let argMap = [];

function handleNode(child) {
	let i, e, r, r1, r2, r3, r4, r5, r6;
	switch(child.type) {
		case 'Identifier':
			if(argMap.includes(child.name)) {
				child.register = 'r' + argMap.indexOf(child.name);
				claimRegister(child.register);
			}else if(child.name in varMap) {
				if(varMap[child.name].reg != null) {
					claimRegister(varMap[child.name].reg);
					child.register = varMap[child.name].reg;
				}else{
					child.register = requestRegister();
					ins('getvar', str(varMap[child.name].ivar), child.register);
				}
				child.retVar = varMap[child.name].ivar;
			}else{
				child.register = requestRegister();
				ins('global', child.register);
				ins('getprop', child.register, str(child.name), child.register);
			}
			break;
		case 'RegExpLiteral': 
			child.register = requestRegister(r);
			ins('regex', str(child.pattern), str(child.flags), child.register);
		break;
		case 'NullLiteral': 
			child.register = 'null';
		break;
		case 'StringLiteral': 
			child.register = str(child.value);
		break;
		case 'BooleanLiteral': 
			child.register = child.value ? 'true' : 'false'
		break;
		case 'NumericLiteral': 
			child.register = child.value;
		break;
		case 'WithStatement': 
			//TODO
		break;
		case 'BlockStatement': 
			recurseNode(child.body)
		break;
		case 'ExpressionStatement': 
			freeRegister(handleExpression(child.expression));
		break;
		case 'ReturnStatement': 
			if(child.argument != null) {
				e = handleExpression(child.argument);
				ins('mov', e, 'r2');
				freeRegister(e);
			}else{
				ins('undefined', 'r2');
			}
			r = requestRegister();
			ins('getprop', 'r1', str('pop'), r);
			r1 = requestRegister();
			ins('call_0', 'r1', r, r1);
			refreshRegister(r);
			ins('getprop', r1, str('e'), r);
			if(child.returnLoc == null) {
				r2 = requestRegister();
				ins('getprop', r1, str('r'), r2);
				ins('setprop', r, 0, r2);
				freeRegister(r2);
			}else{
				ins('setprop', r, 0, child.returnLoc);
			}
			ins('setprop', r, 2, 'r2');
			refreshRegister(r1);
			ins('context', r1);
			ins('setprop', r1, str('r'), r);
			freeRegister(r1);
			freeRegister(r);
		break;
		case 'LabeledStatement':
			child.body.label = child.label.name;
		break;
		case 'BreakStatement': 
			if(child.label != null) {
				let loop;
				for(let i = loopStack.length - 1; i >= 0; i--) {
					if(loopStack[i].label == child.label.name) {
						loop = loopStack[i];
						break;
					}
				}
				if(loop != null) ins('jmp', ':' + loop.endName)
			}else{
				ins('jmp', ':' + loopStack[loopStack.length - 1].endname);
			}
		break;
		case 'ContinueStatement': 
			if(child.label != null) {
				let loop;
				for(let i = loopStack.length - 1; i >= 0; i--) {
					if(loopStack[i].label == child.label.name) {
						loop = loopStack[i];
						break;
					}
				}
				if(loop != null) ins('jmp', ':' + loop.name);
			}else{
				ins('jmp', ':' + loopStack[loopStack.length - 1].name);
			}
		break;
		case 'IfStatement': 
			i = branchCounter++;
			e = handleExpression(child.test);
			ins('jz', e, ':if_' + i);
			freeRegister(e);
			handleNode(child.consequent);
			if(child.alternate != null) {
				ins('jmp', ':if_alternate_' + i);
			}
			ins(':if_' + i);
			if(child.alternate != null) {
				handleNode(child.alternate);
			}
			ins(':if_alternate_' + i);
		break;
		case 'SwitchStatement': 
			i = branchCounter++;
			let d = handleExpression(child.discriminant);
			loopStack.push({endname: 'switch_' + i + '_case_' + (child.cases.length - 1), name : null});
			for(let ci = 0; ci < child.cases.length; ci++) {
				let c = child.cases[ci];
				if(c.test != null) {
					e = handleExpression(c.test);
					r = requestRegister();
					ins('eq', d, e, r);
					freeRegister(e);
					ins('jz', r, ':switch_' + i + '_case_' + ci);
					freeRegister(r);
				}
				ins(':switch_' + i + '_case_start_' + ci);
				recurseNode(c.consequent);
				if(ci + 1 < child.cases.length)
					ins('jmp', ':switch_' + i + '_case_start_' + (ci+1));
				ins(':switch_' + i + '_case_' + ci);
			}
			freeRegister(d);
		break;
		case 'ThrowStatement': 
			e = handleExpression(child.argument);
			let tr = tryStack.length == 0 ? null : tryStack[tryStack.length - 1];
			if(tr == null) {
				r = requestRegister();
				ins('getprop', 'r1', str('length'), r);
				r1 = requestRegister();
				ins('le', r, 2, r1);
				ins('jnz', r1, ':eof');
				ins('sub', r, 2, r);
				refreshRegister(r1);
				ins('getprop', 'r1', r, r1);
				freeRegister(r);
				ins('setprop', r1, str('h'), 1);
				freeRegister(r1);
				handleNode({type: 'ReturnStatement', argument: e});
				freeRegister(e);
			}else{
				ins('setvar', str('tryv'), e);
				freeRegister(e);
				ins('jmp', ':' + tr.handler);
			}
		break;
		case 'TryStatement': 
			i = branchCounter++;
			ins(':try_' + i);
			tryStack.push({start: 'try_' + i, handler: (child.handler != null ? ('trycatch_' + i) : ('tryfinish_' + i))});
			handleNode(child.block);
			tryStack.pop();
			if(child.handler != null) {
				ins('jmp', ':tryfinish_' + i);
				ins(':trycatch_' + i);
				if(child.handler.param != null) {
					varMap[child.handler.param.name] = {ivar: 'tryv', reg: null};
				}
				handleNode(child.handler.body);
				if(child.handler.param != null) {
					delete varMap[child.handler.param.name];
				}
			}
			ins(':tryfinish_' + i);
			if(child.finalizer != null) {
				handleNode(child.finalizer);
			}
		break;
		case 'WhileStatement':
			i = branchCounter++;
			ins(':while_' + i);
			e = handleExpression(child.test);
			ins('jz', e, ':while_' + i + 'end');
			freeRegister(e);
			loopStack.push({name: 'while_' + i, endname: 'while_' + i + 'end', label: child.label});
			handleNode(child.body);
			ins('jmp', ':while_' + i);
			ins(':while_' + i + 'end');
		break;
		case 'DoWhileStatement': 
			i = branchCounter++;
			ins(':dowhile_' + i + 'start');
			loopStack.push({name: 'dowhile_' + i, endname: 'dowhile_' + i + 'end', label: child.label});
			handleNode(child.body);
			ins(':dowhile_' + i);
			e = handleExpression(child.test);
			ins('jnz', e, ':dowhile_' + i + 'start');
			freeRegister(e);
			ins(':dowhile_' + i + 'end');
		break;
		case 'ForStatement': 
			i = branchCounter++;
			if(child.init != null) {
				handleNode(child.init);
			}
			loopStack.push({name: 'for_' + i + 'cont', endname: 'for_' + i + 'end', label: child.label});
			ins(':for_' + i);
			if(child.test != null) {
				e = handleExpression(child.test);
				ins('jz', e, ':for_' + i + 'end');
				freeRegister(e);
			}
			handleNode(child.body);
			ins(':for_' + i + 'cont');
			if(child.update != null) freeRegister(handleExpression(child.update));
			ins('jmp', ':for_' + i);
			ins(':for_' + i + 'end');
		break;
		case 'ForInStatement': 
			e = handleExpression(child.right);
			r = requestRegister();
			ins('protokeys', e, r);
			freeRegister(e);
			forKey = handleExpression(child.left);
		case 'ForOfStatement':
			if(child.type == 'ForOfStatement') {
				r = handleExpression(child.right);
				forKey = handleExpression(child.left);
			}
			i = branchCounter++;
			loopStack.push({name: 'foreach_' + i, endname: 'foreach_' + i + 'end', label: child.label});
			r1 = requestRegister();
			ins('getprop', r, str('length'), r1);
			r2 = requestRegister();
			ins('eq', r1, 0, r2);
			ins('jnz', r2, ':foreach_' + i + 'end');
			refreshRegister(r2);
			ins('mov', 0, r2);
			ins(':foreach_' + i);
			ins('getprop', r, r2, forKey);
			handleNode(child.body);
			ins('add', r2, 1, r2);
			r3 = requestRegister();
			ins('le', r2, r1, r3);
			freeRegister(r);
			freeRegister(r2);
			freeRegister(r1);
			ins('jnz', r3, ':foreach_' + i);
			freeRegister(r3);
			ins(':foreach_' + i + 'end');
			freeRegister(forKey);
		break;
		case 'FunctionExpression':
		case 'ArrowFunctionExpression':
		case 'FunctionDeclaration': 
			if(child.type == 'FunctionDeclaration' && child.id == null) {
				throw "Unexpected unnamed function: exports not supported";
			}
			i = branchCounter++;
			let name = child.id == null || child.id.name == null ? "anon_" + branchCounter++ : child.id.name;
			r = requestRegister();
			r2 = requestRegister();
			ins('global', r2);
			r1 = requestRegister();
			ins('getprop', r2, str('Function'), r1);
			//TODO: make sure GVN in the future factors out this huge string!
			ins('call_1', r2, r1, str('var lc = new arguments.callee.ct.v.g.ct(arguments.callee.ct.g, arguments.callee.ct.p, null, arguments.callee.ct.v);for(var i = 0; i < arguments.length; i++){lc.r[i + 3] = arguments[i];}lc.r[1] = [{t: this, r: -1, h: 0, e: []}];lc.r[0] = arguments.callee.func;arguments.callee.ct.v.g.rc(lc);return lc.r[2];'), r);
			refreshRegister(r1);
			if(child.super != null) {
				refreshRegister(r2);
				ins('obj', r1);
				ins('getprop', child.super, str('prototype'), r2);
				ins('setprop', r1, str('__proto__'), r2);
				ins('setprop', r, str('prototype'), r1);
				refreshRegister(r1);
				ins('setprop', r, str('__proto__'), child.super);
			}
			ins('setvar', str('ifunc_' + name), r);
			ins('setprop', r, str('func'), ':func_' + i + '_' + name);
			ins('context', r1);
			ins('setprop', r, str('ct'), r1);
			refreshRegister(r1);
			//TODO: make call/apply functions so that they can be externally called
			r3 = requestRegister();
			ins('global', r3);
			ins('getprop', r3, str('Function'), r1);
			ins('call_1', r3, r1, str('var lc = new arguments.callee.ct.v.g.ct(arguments.callee.ct.g, arguments.callee.ct.p, null, arguments.callee.ct.v);for(var i = 0; i < arguments.length; i++){lc.r[i + 3] = arguments[i];}lc.r[1] = [{t: this, r: -1, h: 0, e: []}];lc.r[0] = arguments.callee.func;arguments.callee.ct.v.g.rc(lc);return lc.r[2];'), r2);
			ins('setprop', r2, str('func'), ':funccall_' + i + '_' + name);
			ins('setprop', r, str('call'), r2);
			r4 = requestRegister();
			ins('context', r4);
			ins('setprop', r2, str('ct'), r4);
			ins('call_1', r3, r1, str('var lc = new arguments.callee.ct.v.g.ct(arguments.callee.ct.g, arguments.callee.ct.p, null, arguments.callee.ct.v);for(var i = 0; i < arguments.length; i++){lc.r[i + 3] = arguments[i];}lc.r[1] = [{t: this, r: -1, h: 0, e: []}];lc.r[0] = arguments.callee.func;arguments.callee.ct.v.g.rc(lc);return lc.r[2];'), r2);
			freeRegister(r3);
			ins('setprop', r2, str('func'), ':funcapply_' + i + '_' + name);
			ins('setprop', r, str('apply'), r2);
			ins('setprop', r2, str('ct'), r4);
			freeRegister(r4);
			//TODO: function.bind
			//TODO: function.toString/function.toSource
			freeRegister(r2);
			refreshRegister(r1);

			if(child.super != null) {
				ins('getprop', r, str('prototype'), r1);
			}else{
				ins('obj', r1);
				ins('setprop', r, str('prototype'), r1);
			}
			ins('setprop', r1, str('constructor'), r);
			freeRegister(r1);
			if(child.type == 'FunctionExpression' || child.type == 'ArrowFunctionExpression') {
				child.register = r;
				if(child.varName != null) {
					varMap[child.varName] = {ivar: child.varValue, reg: child.register};
					ins('setvar', str(child.varValue), r);
				}
			}else{
				freeRegister(r);
			}
			let rr = r;
			ins('jmp', ':funcend_' + i + '_' + name);
			varMap[name] = {ivar: 'ifunc_' + name, reg: null};
			let oldArgMap = argMap;
			let oldVarMap = varMap;
			tryStackStack.push(tryStack);
			tryStack = [];
			varMap = {};
			for(let key in oldVarMap) {
				varMap[key] = {ivar: oldVarMap[key].ivar, reg: null};
			}
			regStack.push(registers);
			asm += '//pushreg\n';
			let rss = regStack.length;
			registers = [0, 0, 0];
			for(let i = 3; i < child.params.length + 3; i++) {
				asm += '//alloc' + i + '\n';
				registers.push(1);
			}
			argMap = [null, null, null].concat(child.params.map(v => {
				return v.name;
			}));
			ins(':funcapply_' + i + '_' + name);
			if(argMap.length == 3) {
				requestRegister();
				requestRegister();
			}else if(argMap.length == 4) {
				requestRegister();
			}
			r = requestRegister();
			ins('getprop', 'r4', str('length'), r);
			r1 = requestRegister();
			ins('sub', r, 1, r1);
			refreshRegister(r);
			ins('getprop', 'r4', r1, r);
			freeRegister(r1);
			ins('setprop', r, str('t'), 'r3');
			freeRegister(r);
			claimRegister('r' + argMap.length);
			ins('mov', 'r4', 'r' + argMap.length);
			if(argMap.length == 3) {
				freeRegister(3);
				freeRegister(4);
			}else if(argMap.length == 4) {
				freeRegister(3);
			}
			for(let i = 3; i < argMap.length; i++) {
				ins('getprop', 'r' + argMap.length, i, 'r' + i);
			}
			freeRegister(argMap.length);
			ins('jmp', ':func_' + i + '_' + name);
			ins(':funccall_' + i + '_' + name);
			requestRegister(); // makes up for argument lost
			r = requestRegister();
			ins('getprop', 'r1', str('length'), r);
			r1 = requestRegister();
			ins('sub', r, 1, r1);
			refreshRegister(r);
			ins('getprop', 'r1', r1, r);
			freeRegister(r1);
			ins('setprop', r, str('t'), 'r3');
			freeRegister(r);
			for(let i = 4; i < argMap.length + 1; i++) {
				ins('mov', 'r' + i, 'r' + (i - 1));
			}
			if(argMap.length > 3)
				freeRegister(argMap.length);
			ins(':func_' + i + '_' + name);
			if(child.type == 'ArrowFunctionExpression' && child.expression) {
				handleNode({type: 'ReturnStatement', argument: child.body});
			}else handleNode(child.body);
			ins('undefined', 'r2');
			r = requestRegister();
			ins('getprop', 'r1', str('pop'), r);
			r1 = requestRegister();
			ins('call_0', 'r1', r, r1);
			refreshRegister(r);
			ins('getprop', r1, str('e'), r);
			r2 = requestRegister();
			ins('getprop', r1, str('r'), r2);
			ins('setprop', r, 0, r2);
			freeRegister(r2);
			ins('setprop', r, 2, 'r2');
			refreshRegister(r1);
			ins('context', r1);
			ins('setprop', r1, str('r'), r);
			freeRegister(r1);
			freeRegister(r);
			argMap = oldArgMap;
			varMap = oldVarMap;
			tryStack = tryStackStack.pop();
			registers = regStack.pop();
			asm += '//popreg\n';
			ins(':funcend_' + i + '_' + name);
		break;
		case 'VariableDeclaration': 
			//TODO: var/let/const spec impl?
			for(let decl of child.declarations) {
				i = branchCounter++;
				if(decl.init == null) {
					r = requestRegister();
				}else{
					decl.init.varName = decl.id.name;
					decl.init.varValue = 'v_' + i;
					r = handleExpression(decl.init);
				}
				if(child.register != null) freeRegister(child.register);
				child.register = child.register || r;
				ins('setvar', str('v_' + i), r);
				varMap[decl.id.name] = {ivar: 'v_' + i, reg: null};
			}
			if(typeof child.register == 'string' && child.register.startsWith('r'))
				varMap[child.declarations[child.declarations.length - 1].id.name].reg = child.register;
		break;
		case 'Decorator': 
			//TODO
		break;
		case 'Directive': 
			//TODO
		break;
		case 'DirectiveLiteral': 
			//TODO
		break;
		case 'Super': 
			r = requestRegister();
			ins('getprop', 'r1', str('length'), r);
			r1 = requestRegister();
			ins('sub', r, 1, r1);
			refreshRegister(r);
			ins('getprop', 'r1', r1, r);
			refreshRegister(r1);
			ins('getprop', r, str('f'), r1);
			refreshRegister(r);
			ins('getprop', r1, str('__proto__'), r);
			child.register = r;
			freeRegister(r1);
		break;
		case 'Import': 
			//TODO
		break;
		case 'ThisExpression': 
			r = requestRegister();
			ins('getprop', 'r1', str('length'), r);
			r1 = requestRegister();
			ins('sub', r, 1, r1);
			refreshRegister(r);
			ins('getprop', 'r1', r1, r);
			refreshRegister(r1);
			ins('getprop', r, str('t'), r1);
			child.register = r1;
			freeRegister(r);
		break;
		case 'YieldExpression': 
			//TODO
		break;
		case 'AwaitExpression': 
			//TODO
		break;
		case 'ArrayExpression': 
			r = requestRegister();
			ins('arr', r);
			r2 = requestRegister();
			ins('getprop', r, str('push'), r2);
			r3 = requestRegister();
			for(e of child.elements) {
				if(e.type == "SpreadElement") {
					//TODO
				}else if(e == null) {
					//??
				}else{
					let ex = handleExpression(e);
					ins('call_1', r, r2, ex, r3);
					freeRegister(ex);
				}
			}
			freeRegister(r2);
			freeRegister(r3);
			child.register = r;
		break;
		case 'ObjectExpression':
			r = requestRegister();
			ins('obj', r);
			for(e of child.properties) {
				let v = e.computed ? handleExpression(e.key) : str(e.key.name);
				if(e.type == "SpreadElement") {
					//TODO
				}else if(e.type == "ObjectProperty") {
					let ex = handleExpression(e.value);
					ins('setprop', r, v, ex);
					freeRegister(ex);
				}else if(e.type == "ObjectMethod") {
					if(e.kind == "method") {
						r2 = handleExpression({type: 'FunctionExpression', id: null, params: e.params, body: e.body});
						ins('setprop', r, str(e.id), r2);
						freeRegister(r2);
					}else{
						r5 = handleExpression({type: 'FunctionExpression', id: null, params: e.params, body: e.body});
						let i = branchCounter++;
						r1 = requestRegister();
						ins('global', r1);
						r2 = requestRegister();
						ins('getprop', r1, str('Object'), r2);
						refreshRegister(r1);
						r3 = requestRegister();
						ins('getprop', r2, str('getOwnPropertyDescriptor'), r3);
						r4 = requestRegister();
						ins('getprop', r2, str('defineProperty'), r4);
						refreshRegister(r2);
						ins('call_2', r3, r3, r, v, r2);
						freeRegister(r3);
						ins('jz', r2, ':om_' + i);
						ins('setprop', r2, str(e.kind), r5);
						ins('delete', r2, str('value'));
						ins('call_3', r4, r4, r, v, r2, r1);
						ins('jmp', ':om2_' + i);
						ins(':om_' + i);
						refreshRegister(r2);
						ins('obj', r2);
						ins('setprop', r2, str(e.kind), r5);
						r6 = requestRegister();
						ins('true', r6);
						ins('setprop', r2, str('configurable'), r6);
						freeRegister(r6);
						ins('call_3', r4, r4, r, v, r2, r1);
						ins(':om2_' + i);
						freeRegister(r1);
						freeRegister(r2);
						freeRegister(r4);
						freeRegister(r5);
					}
				}
				if(e.computed) {
					freeRegister(v);
				}
			}
			child.register = r;
		break;
		case 'UnaryExpression':
			r = handleExpression(child.argument);
			let ret = requestRegister();
			child.register = ret;
			switch(child.operator) {
				case '-':
					ins('sub', 0, r, ret);
				break;
				case '+':
				break;
				case '!':
					ins('not', r, ret);
				break;
				case '~':
					ins('bit_not', r, ret);
				break;
				case 'typeof':
					ins('typeof', r, ret);
				break;
				case 'void':
					ins('undefined', ret);
				break;
				case 'delete':
					ins('undefined', r, ret);
				break;
			}
			freeRegister(r);
		break;
		case 'UpdateExpression':
			r = handleExpression(child.argument);
			child.register = child.prefix ? r : requestRegister();
			if(child.register != r) {
				ins('mov', r, child.register);
			}
			switch(child.operator) {
				case '++':
					ins('add', r, 1, r);
				break;
				case '--':
					ins('sub', r, 1, r);
				break;
			}
			if(child.argument.retVar != null) {
				ins('setvar', str(child.argument.retVar), r);
			}
			if(child.register != r) {
				freeRegister(r);
			}
		break;
		case 'BinaryExpression':
			r = handleExpression(child.left);
			r1 = handleExpression(child.right);
			child.register = requestRegister();
			switch(child.operator) {
				case '==':
					ins('eq', r, r1, child.register);
				break;
				case '!=':
					ins('neq', r, r1, child.register);
				break;
				case '===':
					ins('eq_typed', r, r1, child.register);
				break;
				case '!==':
					ins('neq_typed', r, r1, child.register);
				break;
				case '<':
					ins('le', r, r1, child.register);
				break;
				case '<=':
					ins('leeq', r, r1, child.register);
				break;
				case '>':
					ins('gr', r, r1, child.register);
				break;
				case '>=':
					ins('greq', r, r1, child.register);
				break;
				case '<<':
					ins('shl', r, r1, child.register);
				break;
				case '>>':
					ins('shr', r, r1, child.register);
				break;
				case '>>>':
					ins('shrz', r, r1, child.register);
				break;
				case '+':
					ins('add', r, r1, child.register);
				break;
				case '-':
					ins('sub', r, r1, child.register);
				break;
				case '*':
					ins('mul', r, r1, child.register);
				break;
				case '/':
					ins('div', r, r1, child.register);
				break;
				case '%':
					ins('mod', r, r1, child.register);
				break;
				case '|':
					ins('bit_or', r, r1, child.register);
				break;
				case '^':
					ins('bit_xor', r, r1, child.register);
				break;
				case '&':
					ins('bit_and', r, r1, child.register);
				break;
				case 'in':
					ins('in', r, r1, child.register);
				break;
				case 'instanceof':
					ins('instanceof', r, r1, child.register);
				break;
			}
			freeRegister(r);
			freeRegister(r1);
		break;
		case 'AssignmentExpression':
			r = child.left.type == 'MemberExpression' ? requestRegister() : handleExpression(child.left);
			r1 = handleExpression(child.right);
			child.register = r;
			switch(child.operator) {
				case '=':
					ins('mov', r1, r);
				break;
				case '+=':
					ins('add', r, r1, r);
				break;
				case '-=':
					ins('sub', r, r1, r);
				break;
				case '*=':
					ins('mul', r, r1, r);
				break;
				case '/=':
					ins('div', r, r1, r);
				break;
				case '%=':
					ins('mod', r, r1, r);
				break;
				case '<<=':
					ins('shl', r, r1, r);
				break;
				case '>>=':
					ins('shr', r, r1, r);
				break;
				case '>>>=':
					ins('shrz', r, r1, r);
				break;
				case '|=':
					ins('bit_or', r, r1, r);
				break;
				case '^=':
					ins('bit_xor', r, r1, r);
				break;
				case '&=':
					ins('bit_and', r, r1, r);
				break;
			}
			if(child.left.type == 'MemberExpression') {
				e = handleExpression(child.left.object);
				if(child.computed) {
					let v = handleExpression(child.left.property);
					ins('setprop', e, v, r);
					freeRegister(v);
				}else{
					let v = child.left.property.type == 'Identifier' ? str(child.left.property.name) : handleExpression(child.left.property);
					ins('setprop', e, v, r);
					freeRegister(v);
				}
				freeRegister(e);
			}else if(child.left.retVar != null) {
				ins('setvar', str(child.left.retVar), r);
			}
			freeRegister(r1);
		break;
		case 'LogicalExpression':
			//correctly transferring semantics requires we not use the or/and instructions here because it will require precomputing the child.right expression
			i = branchCounter++;
			child.register = requestRegister();
			r = handleExpression(child.left);
			r1 = requestRegister();
			ins('mov', r, child.register);
			ins('neq', r, 0, r1);
			freeRegister(r);
			if(child.operator == '||') {
				ins('jnz', r1, ':log_' + i);
				e = handleExpression(child.right);
				ins('mov', e, child.register);
				freeRegister(e);
				ins(':log_' + i);
			}else if(child.operator == '&&') {
				ins('jz', r1, ':log_' + i);
				e = handleExpression(child.right);
				ins('mov', e, child.register);
				freeRegister(e);
				ins(':log_' + i);
			}
			freeRegister(r1);
		break;
		case 'MemberExpression':
			let o = handleExpression(child.object);
			if(child.object.type == 'StringLiteral' || child.object.type == 'NumericLiteral' || child.object.type == 'RegExpLiteral' || child.object.type == 'BooleanLiteral') {
				child.isExtern = true;
			}else if(child.object.type == 'Identifier' && extern.includes(child.object.name)) {
				child.isExtern = true;
			}else if(child.object.type == 'MemberExpression') {
				child.isExtern = child.object.isExtern;
			}
			child.register = requestRegister();
			if(child.computed) {
				let v = handleExpression(child.property);
				ins('getprop', o, v, child.register)
				freeRegister(v);
			}else{
				let v = child.property.type == 'Identifier' ? str(child.property.name) : handleExpression(child.left.property);
				ins('getprop', o, v, child.register);
				freeRegister(v);
			}
			freeRegister(o);
		break;
		case 'BindExpression':
			//apparenly babel already parses this
			//https://github.com/tc39/proposal-bind-operator
		break;
		case 'ConditionalExpression':
			i = branchCounter++;
			e = handleExpression(child.test);
			child.register = requestRegister();
			ins('jz', e, ':ternary_' + i);
			freeRegister(e);
			e = handleExpression(child.consequent);
			ins('mov', e, child.register);
			ins('jmp', ':ternary_' + i + 'end');
			ins(':ternary_' + i);
			freeRegister(e);
			e = handleExpression(child.alternate);
			ins('mov', e, child.register);
			freeRegister(e);
			ins(':ternary_' + i + 'end');
		break;
		case 'NewExpression':
		case 'CallExpression':
			child.register = requestRegister();
			let args = child.arguments.map(v => {
				return handleExpression(v);
			});
			let t = child.register;
			let isExtern = false;
			if(child.type == 'CallExpression') {
				// maybe we should export these values from the real AST handlers rather than copy/modify
				if(child.callee.type == 'MemberExpression') {
					t = handleExpression(child.callee.object);
					if(child.callee.object.type == 'StringLiteral' || child.callee.object.type == 'NumericLiteral' || child.callee.object.type == 'RegExpLiteral' || child.callee.object.type == 'BooleanLiteral') {
						isExtern = true;
					}else if(child.callee.object.type == 'Identifier' && extern.includes(child.callee.object.name)) {
						isExtern = true;
					}else if(child.callee.object.type == 'MemberExpression') {
						isExtern = child.callee.object.isExtern;
					}
					e = requestRegister();
					if(child.callee.computed) {
						let v = handleExpression(child.callee.property);
						ins('getprop', t, v, e);
						freeRegister(v);
					}else{
						let v = child.callee.property.type == 'Identifier' ? str(child.callee.property.name) : handleExpression(child.callee.property);
						ins('getprop', t, v, e);
						freeRegister(v);
					}
					if(child.callee.object.type == 'Super') {
						//TODO: theoretically there could be a long chain after super, and that isnt handled
						freeRegister(t);
						t = handleExpression({type: 'ThisExpression'});
					}
				}else if(child.callee.type == 'Super') {
					t = handleExpression({type: 'ThisExpression'});
					child.callee.varName = child.varName;
					child.callee.varValue = child.varValue;
					e = handleExpression(child.callee);
				}else {
					child.callee.varName = child.varName;
					child.callee.varValue = child.varValue;
					e = handleExpression(child.callee);
					t = requestRegister();
					ins('global', t);
				}
			}else{
				child.callee.varName = child.varName;
				child.callee.varValue = child.varValue;
				e = handleExpression(child.callee);
			}
			r = requestRegister();
			if(child.type == 'NewExpression') {
				ins('obj', child.register);
				ins('getprop', e, str('prototype'), r);
				ins('setprop', child.register, str('__proto__'), r);
				refreshRegister(r);
			}
			i = branchCounter++;
			if(isExtern) {
				freeRegister(r);
			}else{
				ins('getprop', e, str('func'), r);
				r1 = requestRegister();
				r2 = requestRegister();
				ins('undefined', r2);
				ins('eq_typed', r, r2, r1);
				refreshRegister(r);
				freeRegister(r2);
				ins('jnz', r1, ':ffi_' + i);
				refreshRegister(r1);
				ins('obj', r1);
				ins('setprop', r1, str('r'), ':call_' + i);
				ins('setprop', r1, str('t'), t);
				ins('setprop', r1, str('h'), 0);
				ins('setprop', r1, str('f'), e);
				ins('context', r);
				r2 = requestRegister();
				ins('getprop', r, str('r'), r2);
				refreshRegister(r);
				ins('arr', r);
				ins('setprop', r, str('length'), 126);
				r3 = requestRegister();
				ins('getprop', e, str('func'), r3);
				ins('setprop', r, 0, r3);
				freeRegister(r3);
				ins('setprop', r, 1, 'r1');
				args.forEach((v, index) => {
					ins('setprop', r, index + 3, v);
				});
				ins('setprop', r1, str('e'), r2);
				refreshRegister(r2);
				ins('getprop', 'r1', str('push'), r2);
				r3 = requestRegister();
				ins('call_1', 'r1', r2, r1, r3);
				freeRegister(r1);
				freeRegister(r2);
				ins('context', r3);
				ins('setprop', r3, str('r'), r);
				freeRegister(r3);
				ins(':call_' + i);
				refreshRegister(r);
				ins('getprop', 'r1', str('length'), r);
				ins('sub', r, 1, r);
				r1 = requestRegister();
				ins('getprop', 'r1', r, r1);
				refreshRegister(r);
				ins('getprop', r1, str('h'), r);
				freeRegister(r1);
				ins('jz', r, ':pcall_' + i);
				freeRegister(r);
				handleNode({type: 'ThrowStatement', argument: 2});
				ins(':pcall_' + i);
				if(child.type == 'NewExpression') r = requestRegister();
				ins('mov', 'r2', (child.type == 'NewExpression' ? r : child.register));
				if(child.type == 'NewExpression') {
					r2 = requestRegister();
					ins('neq', r, 0, r2);
					ins('jz', r2, ':pcall3_' + i);
					freeRegister(r2);
					ins('mov', r, child.register);
					ins(':pcall3_' + i);
					freeRegister(r);
				}
				ins('jmp', ':fffi_' + i);
				ins(':ffi_' + i);
			}
			if(child.type == 'NewExpression') r = requestRegister();
			ins('call_' + child.arguments.length, t, e, ...args, (child.type == 'NewExpression' ? r : child.register));
			if(child.type == 'NewExpression') {
				r2 = requestRegister();
				ins('neq', r, 0, r2);
				ins('jz', r2, ':pcall2_' + i);
				freeRegister(r2);
				ins('mov', r, child.register);
				ins(':pcall2_' + i);
				freeRegister(r);
			}
			freeRegister(e);
			args.forEach(v => {
				if(typeof v == 'string' && v.startsWith('r'))
					freeRegister(v);
			});
			if(!isExtern)ins(':fffi_' + i);
		break;
		case 'SequenceExpression': 
			r = -1;
			for(let c2 of child.expressions) {
				if(r >= 0) freeRegister(r);
				r = handleExpression(c2);
			}
			child.register = r;
		break;
		case 'ClassDeclaration':
		case 'ClassExpression':
			let constr = child.body.body[child.body.body.findChild((key, v) => {
				return v.type == 'ClassMethod' && v.kind == 'constructor';
			})];
			i = branchCounter++;
			if(child.id == null) {
				child.id = {name: 'anonclass_' + i};
			}
			//TODO: add new enforcement?
			e = undefined;
			if(child.superClass != null) {
				e = handleExpression(child.superClass);
			}
			r = handleExpression({type: 'FunctionExpression', params: constr.params, body: constr.body, super: e});
			if(child.superClass != null) {
				freeRegister(e);
			}
			varMap[child.id.name] = {ivar: 'iclass_' + child.id.name, reg: r};
			ins('setvar', str('iclass_' + child.id.name), r);
			child.body.body.forEach(v => {
				if(v.type == 'ClassMethod' || v.type == 'ClassPrivateMethod') {
					if(v.kind == 'constructor') return;
					let k;
					if(v.type == 'ClassMethod') {
						k = v.computed ? handleExpression(v.key) : str(v.key.name);
					}else{
						k = str(v.key.id.name);
					}
					r1 = handleExpression({type: 'FunctionExpression', params: v.params, body: v.body});
					if(v['static']) {
						ins('setprop', r, k, r1);
					}else{
						r2 = requestRegister();
						ins('getprop', r, str('prototype'), r2);
						ins('setprop', r2, k, r1);
						freeRegister(r2);
					}
					freeRegister(r1);
					if(v.type == 'ClassMethod' && v.computed) freeRegister(k);
				}else if (v.type == 'ClassProperty' || v.type == 'ClassPrivateProperty') { // babel implements this in AST, but doesnt seem to parse them
					let k;
					if(v.type == 'ClassProperty') {
						k = v.computed ? handleExpression(v.key) : str(v.key.name);
					}else{
						k = str(v.key.id.name);
					}
					r1 = handleExpression(v.value);
					if(v['static']) {
						ins('setprop', r, k, r1);
					}else{
						r2 = requestRegister();
						ins('getprop', r, str('prototype'), r2);
						ins('setprop', r2, k, r1);
						freeRegister(r2);
					}
					freeRegister(r1);
					if(v.type == 'ClassMethod' && v.computed) freeRegister(k);
				}
			});
		break;
		case 'DoExpression':
			//TODO
		break;
	}
}

function recurseNode(node) {
	for(let child of node) {
		if(child.type == 'FunctionDeclaration') {
			handleNode(child);
		}
	}
	for(let child of node) {
		if(child.type != 'FunctionDeclaration') {
			handleNode(child);
		}
	}
}
try{
	recurseNode(xf.body);
}catch(e) {
	console.log(e);
}
ins(':eof');

fs.writeFileSync(process.argv[3], asm);
//console.log(asm);