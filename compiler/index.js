const fs = require('fs');
const babel = require("babel-core");

if(process.argv.length != 4) {
	console.log('Usage: node index.js <input.js> <output.sasm>');
	return;
}

let asm = '';

let script = fs.readFileSync(process.argv[2], 'utf8');

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
	'transform-es2015-typeof-symbol',
	'transform-es2015-unicode-regex',
]});
//console.log(xf.code);
xf = xf.ast.program;

let registers = [];
for(let i = 0; i < 126; i++) {
	registers.push(0);
}
let variables = {};

function ins(ins) {
	let args = Array.from(arguments).slice(1).filter(v => {
		return v.toString().trim().length > 0;
	});
	asm += ins + ' ' + args.join(' ') + '\n';
	args.forEach(v => {
		if(typeof v == 'string') {
			if(!v.startsWith(':') && !v.startsWith('\'') && !v.endsWith('\'') && !v.startsWith('r')) throw 'Invalid String: ' + v;
			if(v.startsWith('r') && isNaN(parseInt(v.substring(1), 10))) throw 'Invalid register: ' + v;
		}
	});
}

function reg(reg) {
	return typeof reg !== 'number' ? reg : 'r' + reg;
}

function requestRegister() {
	for(let i = 3; i < 65536; i++) {
		if(registers[i] === undefined || registers[i] === 0) {
			registers[i] = 1;
			asm += '//alloc' + i + '\n'
			return i;
		}
	}
	throw "Out of registers!";
}

function claimRegister(r) {
	if(r <= 2) return;
	if(registers[r] === undefined) registers[r] = 0;
	registers[r]++;
	asm += '//alloc' + r + '\n';
}

function freeRegister(r) {
	if(typeof r == 'string') {
		if(r.startsWith('r')) r = parseInt(r.substring(1));
		else return;
	}else if(r == null) return;
	if(r <= 2) return;
	asm += '//free' + r + '\n'
	if(registers[r] > 0) registers[r]--;
}

function refreshRegister(r) {
	if(r <= 2) return;
	asm += '//free' + r + '\n'
	asm += '//alloc' + r + '\n'
}

function str(arg) {
	return '\'' + arg.toString().replace(/'/g, '\\\'') + '\'';
}

function handleExpression(exp) {
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
let functionMap = {};

function handleNode(child) {
	let i, e, r, r1, r2, r3, r4, r5, r6;
	switch(child.type) {
		case 'Identifier':
			if(child.name in varMap) {
				child.register = requestRegister();
				ins('getvar', str(varMap[child.name]), reg(child.register));
			}else if(argMap.includes(child.name)) {
				child.register = argMap.indexOf(child.name);
				claimRegister(child.register);
			/*}else if(child.name in functionMap) {
				child.register = requestRegister();
				r = requestRegister();
				ins('add', str('class_'), ':func_' + functionMap[child.name] + '_' + child.name, reg(r));
				ins('getvar', reg(r), reg(child.register));
				freeRegister(r);*/
			}else{
				child.register = requestRegister();
				ins('global', reg(child.register));
				ins('getprop', reg(child.register), str(child.name), reg(child.register));
			}
			break;
		case 'RegExpLiteral': 
			child.register = requestRegister(r);
			ins('regex', str(child.pattern), str(child.flags), reg(child.register));
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
				ins('mov', reg(e), reg(2));
				freeRegister(e);
			}else{
				ins('undefined', reg(2));
			}
			r = requestRegister();
			ins('getprop', reg(1), str('pop'), reg(r));
			r1 = requestRegister();
			ins('call_0', reg(1), reg(r), reg(r1));
			refreshRegister(r);
			ins('getprop', reg(r1), str('e'), reg(r));
			if(child.returnLoc == null) {
				r2 = requestRegister();
				ins('getprop', reg(r1), str('r'), reg(r2));
				ins('setprop', reg(r), 0, reg(r2));
				freeRegister(r2);
			}else{
				ins('setprop', reg(r), 0, child.returnLoc);
			}
			ins('setprop', reg(r), 2, reg(2));
			refreshRegister(r1);
			ins('context', reg(r1));
			ins('setprop', reg(r1), str('registers'), reg(r));
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
			ins('jz', reg(e), ':if_' + i);
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
					ins('eq', reg(d), reg(e), reg(r));
					freeRegister(e);
					ins('jz', reg(r), ':switch_' + i + '_case_' + ci);
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
				ins('getprop', reg(1), str('length'), reg(r));
				r1 = requestRegister();
				ins('le', reg(r), 2, reg(r1));
				ins('jnz', reg(r1), ':eof');
				ins('sub', reg(r), 2, reg(r));
				refreshRegister(r1);
				ins('getprop', reg(1), reg(r), reg(r1));
				freeRegister(r);
				ins('setprop', reg(r1), str('h'), 1);
				freeRegister(r1);
				handleNode({type: 'ReturnStatement', argument: e});
				freeRegister(e);
			}else{
				ins('setvar', str('tryv'), reg(e));
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
					varMap[child.handler.param.name] = 'tryv';
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
			ins('jz', reg(e), ':while_' + i + 'end');
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
			ins('jnz', reg(e), ':dowhile_' + i + 'start');
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
				ins('jz', reg(e), ':for_' + i + 'end');
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
			ins('protokeys', reg(e), reg(r));
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
			ins('getprop', reg(r), str('length'), reg(r1));
			r2 = requestRegister();
			ins('eq', reg(r1), 0, reg(r2));
			ins('jnz', reg(r2), ':foreach_' + i + 'end');
			refreshRegister(r2);
			ins('mov', 0, reg(r2));
			ins(':foreach_' + i);
			ins('getprop', reg(r), reg(r2), reg(forKey));
			handleNode(child.body);
			ins('add', reg(r2), 1, reg(r2));
			r3 = requestRegister();
			ins('le', reg(r2), reg(r1), reg(r3));
			freeRegister(r);
			freeRegister(r2);
			freeRegister(r1);
			ins('jnz', reg(r3), ':foreach_' + i);
			freeRegister(r3);
			ins(':foreach_' + i + 'end');
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
			ins('global', reg(r2));
			r1 = requestRegister();
			ins('getprop', reg(r2), str('Function'), reg(r1));
			//TODO: make sure GVN in the future factors out this huge string!
			ins('call_1', reg(r2), reg(r1), str('let localContext = new Context(global, bootPayload, null, globalVariables);for(let i = 0; i < arguments.length; i++){localContext.registers[i] = arguments[i]}localContext.registers[1] = [{t: this, e: localContext.registers, r: -1, h: 0}];localContext.registers[0] = arguments.callee.func;runContext(localContext);return localContext.registers[2];'), reg(r));
			refreshRegister(r1);
			if(child.super != null) {
				refreshRegister(r2);
				ins('obj', reg(r1));
				ins('getprop', reg(child.super), str('prototype'), reg(r2));
				ins('setprop', reg(r1), str('__proto__'), reg(r2));
				ins('setprop', reg(r), str('prototype'), reg(r1));
				refreshRegister(r1);
				ins('setprop', reg(r), str('__proto__'), reg(child.super));
			}
			ins('setvar',  str('ifunc_' + name), reg(r));
			ins('setprop', reg(r), str('func'), ':func_' + i + '_' + name);
			//TODO: make call/apply functions so that they can be externally called
			r3 = requestRegister();
			ins('global', reg(r3));
			ins('getprop', reg(r3), str('Function'), reg(r1));
			ins('call_1', reg(r3), reg(r1), str('let localContext = new Context(global, bootPayload, null, globalVariables);for(let i = 0; i < arguments.length; i++){localContext.registers[i] = arguments[i]}localContext.registers[1] = [{t: this, e: localContext.registers, r: -1, h: 0}];localContext.registers[0] = arguments.callee.func;runContext(localContext);return localContext.registers[2];'), reg(r2));
			ins('setprop', reg(r2), str('func'), ':funccall_' + i + '_' + name);
			ins('setprop', reg(r), str('call'), reg(r2));
			refreshRegister(r2);
			ins('call_1', reg(r3), reg(r1), str('let localContext = new Context(global, bootPayload, null, globalVariables);for(let i = 0; i < arguments.length; i++){localContext.registers[i] = arguments[i]}localContext.registers[1] = [{t: this, e: localContext.registers, r: -1, h: 0}];localContext.registers[0] = arguments.callee.func;runContext(localContext);return localContext.registers[2];'), reg(r2));
			freeRegister(r3);
			ins('setprop', reg(r2), str('func'), ':funcapply_' + i + '_' + name);
			ins('setprop', reg(r), str('apply'), reg(r2));
			//TODO: function.bind
			//TODO: function.toString/function.toSource
			freeRegister(r2);
			refreshRegister(r1);

			if(child.super != null) {
				ins('getprop', reg(r), str('prototype'), reg(r1));
			}else{
				ins('obj', reg(r1));
				ins('setprop', reg(r), str('prototype'), reg(r1));
			}
			ins('setprop', reg(r1), str('constructor'), reg(r));
			freeRegister(r1);
			if(child.type == 'FunctionExpression' || child.type == 'ArrowFunctionExpression') {
				child.register = r;
				if(child.varName != null) {
					debugger;
					varMap[child.varName] = child.varValue;
					ins('setvar', str(child.varValue), reg(r))
				}
			}else{
				freeRegister(r);
			}
			let rr = r;
			ins('jmp', ':funcend_' + i + '_' + name);
			functionMap[name] = i;
			varMap[name] = 'ifunc_' + name;
			let oldArgMap = argMap;
			let oldVarMap = varMap;
			tryStackStack.push(tryStack);
			tryStack = [];
			varMap = {};
			for(let key in oldVarMap) {
				varMap[key] = oldVarMap[key];
			}
			regStack.push(registers);
			asm += '//pushreg\n';
			let rss = regStack.length;
			registers = [];
			for(let i = 3; i < child.params.length; i++) {
				asm += '//alloc' + i + '\n';
				registers.push(1);
			}
			argMap = [null, null, null].concat(child.params.map(v => {
				return v.name;
			}));
			ins(':funcapply_' + i + '_' + name);
			if(argMap.length == 0) {
				requestRegister();
				requestRegister();
			}else if(argMap.length == 1) {
				requestRegister();
			}
			r = requestRegister();
			ins('getprop', reg(1), str('length'), reg(r));
			r1 = requestRegister();
			ins('sub', reg(r), 1, reg(r1));
			refreshRegister(r);
			ins('getprop', reg(1), reg(r1), reg(r));
			freeRegister(r1);
			ins('setprop', reg(r), str('t'), reg(0));
			freeRegister(r);
			for(let i = 0; i < argMap.length; i++) {
				ins('getprop', reg(1), i, reg(i));
			}
			if(argMap.length == 0) {
				freeRegister(0);
				freeRegister(1);
			}else if(argMap.length == 1) {
				freeRegister(1);
			}
			ins('jmp', ':func_' + i + '_' + name);
			ins(':funccall_' + i + '_' + name);
			requestRegister(); // makes up for argument lost
			r = requestRegister();
			ins('getprop', reg(1), str('length'), reg(r));
			r1 = requestRegister();
			ins('sub', reg(r), 1, reg(r1));
			refreshRegister(r);
			ins('getprop', reg(1), reg(r1), reg(r));
			freeRegister(r1);
			ins('setprop', reg(r), str('t'), reg(0));
			freeRegister(r);
			for(let i = 1; i < argMap.length + 1; i++) {
				ins('mov', reg(i), reg(i - 1));
			}
			freeRegister(argMap.length);
			ins(':func_' + i + '_' + name);
			if(child.type == 'ArrowFunctionExpression' && child.expression) {
				handleNode({type: 'ReturnStatement', argument: child.body});
			}else handleNode(child.body);
			ins('undefined', reg(2));
			r = requestRegister();
			ins('getprop', reg(1), str('pop'), reg(r));
			r1 = requestRegister();
			ins('call_0', reg(1), reg(r), reg(r1));
			refreshRegister(r);
			ins('getprop', reg(r1), str('e'), reg(r));
			r2 = requestRegister();
			ins('getprop', reg(r1), str('r'), reg(r2));
			ins('setprop', reg(r), 0, reg(r2));
			freeRegister(r2);
			ins('setprop', reg(r), 2, reg(2));
			refreshRegister(r1);
			ins('context', reg(r1));
			ins('setprop', reg(r1), str('registers'), reg(r));
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
					if(decl.id.name == 'c2') debugger;
					r = handleExpression(decl.init);
				}
				child.register = child.register || r;
				ins('setvar', str('v_' + i), reg(r));
				varMap[decl.id.name] = 'v_' + i;
			}
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
			ins('getprop', reg(1), str('length'), reg(r));
			r1 = requestRegister();
			ins('sub', reg(r), 1, reg(r1));
			refreshRegister(r);
			ins('getprop', reg(1), reg(r1), reg(r));
			refreshRegister(r1);
			ins('getprop', reg(r), str('f'), reg(r1));
			refreshRegister(r);
			ins('getprop', reg(r1), str('__proto__'), reg(r));
			child.register = r;
			freeRegister(r1);
		break;
		case 'Import': 
			//TODO
		break;
		case 'ThisExpression': 
			r = requestRegister();
			ins('getprop', reg(1), str('length'), reg(r));
			r1 = requestRegister();
			ins('sub', reg(r), 1, reg(r1));
			refreshRegister(r);
			ins('getprop', reg(1), reg(r1), reg(r));
			refreshRegister(r1);
			ins('getprop', reg(r), str('t'), reg(r1));
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
			ins('arr', reg(r));
			r2 = requestRegister();
			ins('getprop', reg(r), str('push'), reg(r2));
			for(e of child.elements) {
				if(e.type == "SpreadElement") {
					//TODO
				}else if(e == null) {
					//??
				}else{
					let ex = handleExpression(e);
					ins('call_1', reg(r), reg(r2), reg(ex), reg(ex));
					freeRegister(ex);
				}
			}
			freeRegister(r2);
			child.register = r;
		break;
		case 'ObjectExpression':
			r = requestRegister();
			ins('obj', reg(r));
			for(e of child.properties) {
				let v = e.computed ? reg(handleExpression(e.key)) : str(e.key.name);
				if(e.type == "SpreadElement") {
					//TODO
				}else if(e.type == "ObjectProperty") {
					let ex = handleExpression(e.value);
					ins('setprop', reg(r), v, reg(ex));
					freeRegister(ex);
				}else if(e.type == "ObjectMethod") {
					if(e.kind == "method") {
						r2 = handleExpression({type: 'FunctionExpression', id: null, params: e.params, body: e.body});
						ins('setprop', reg(r), str(e.id), reg(r2));
						freeRegister(r2);
					}else{
						r5 = handleExpression({type: 'FunctionExpression', id: null, params: e.params, body: e.body});
						let i = branchCounter++;
						r1 = requestRegister();
						ins('global', reg(r1));
						r2 = requestRegister();
						ins('getprop', reg(r1), str('Object'), reg(r2));
						refreshRegister(r1);
						r3 = requestRegister();
						ins('getprop', reg(r2), str('getOwnPropertyDescriptor'), reg(r3));
						r4 = requestRegister();
						ins('getprop', reg(r2), str('defineProperty'), reg(r4));
						refreshRegister(r2);
						ins('call_2', reg(r3), reg(r3), reg(r), v, reg(r2));
						freeRegister(r3);
						ins('jz', reg(r2), ':om_' + i);
						ins('setprop', reg(r2), str(e.kind), reg(r5));
						ins('delete', reg(r2), str('value'));
						ins('call_3', reg(r4), reg(r4), reg(r), v, reg(r2), reg(r1));
						ins('jmp', ':om2_' + i);
						ins(':om_' + i);
						refreshRegister(r2);
						ins('obj', reg(r2));
						ins('setprop', reg(r2), str(e.kind), reg(r5));
						r6 = requestRegister();
						ins('true', reg(r6));
						ins('setprop', reg(r2), str('configurable'), reg(r6));
						freeRegister(r6);
						ins('call_3', reg(r4), reg(r4), reg(r), v, reg(r2), reg(r1));
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
					ins('sub', 0, reg(r), reg(ret));
				break;
				case '+':
				break;
				case '!':
					ins('not', reg(r), reg(ret));
				break;
				case '~':
					ins('bit_not', reg(r), reg(ret));
				break;
				case 'typeof':
					ins('typeof', reg(r), reg(ret));
				break;
				case 'void':
					ins('undefined', reg(ret));
				break;
				case 'delete':
					ins('undefined', reg(r), reg(ret));
				break;
			}
			freeRegister(r);
		break;
		case 'UpdateExpression':
			r = handleExpression(child.argument);
			child.register = child.prefix ? r : requestRegister();
			if(child.register != r) {
				ins('mov', reg(r), reg(child.register));
			}
			switch(child.operator) {
				case '++':
					ins('add', reg(r), 1, reg(r));
				break;
				case '--':
					ins('sub', reg(r), 1, reg(r));
				break;
			}
			if(child.register != r) {
				freeRegister(r)
			}
		break;
		case 'BinaryExpression':
			r = handleExpression(child.left);
			r1 = handleExpression(child.right);
			child.register = requestRegister();
			switch(child.operator) {
				case '==':
					ins('eq', reg(r), reg(r1), reg(child.register));
				break;
				case '!=':
					ins('neq', reg(r), reg(r1), reg(child.register));
				break;
				case '===':
					ins('eq_typed', reg(r), reg(r1), reg(child.register));
				break;
				case '!==':
					ins('neq_typed', reg(r), reg(r1), reg(child.register));
				break;
				case '<':
					ins('le', reg(r), reg(r1), reg(child.register));
				break;
				case '<=':
					ins('leeq', reg(r), reg(r1), reg(child.register));
				break;
				case '>':
					ins('gr', reg(r), reg(r1), reg(child.register));
				break;
				case '>=':
					ins('greq', reg(r), reg(r1), reg(child.register));
				break;
				case '<<':
					ins('shl', reg(r), reg(r1), reg(child.register));
				break;
				case '>>':
					ins('shr', reg(r), reg(r1), reg(child.register));
				break;
				case '>>>':
					ins('shrz', reg(r), reg(r1), reg(child.register));
				break;
				case '+':
					ins('add', reg(r), reg(r1), reg(child.register));
				break;
				case '-':
					ins('sub', reg(r), reg(r1), reg(child.register));
				break;
				case '*':
					ins('*', reg(r), reg(r1), reg(child.register));
				break;
				case '/':
					ins('/', reg(r), reg(r1), reg(child.register));
				break;
				case '%':
					ins('%', reg(r), reg(r1), reg(child.register));
				break;
				case '|':
					ins('|', reg(r), reg(r1), reg(child.register));
				break;
				case '^':
					ins('^', reg(r), reg(r1), reg(child.register));
				break;
				case '&':
					ins('&', reg(r), reg(r1), reg(child.register));
				break;
				case 'in':
					ins('in', reg(r), reg(r1), reg(child.register));
				break;
				case 'instanceof':
					ins('instanceof', reg(r), reg(r1), reg(child.register));
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
					ins('mov', reg(r1), reg(r));
				break;
				case '+=':
					ins('add', reg(r), reg(r1), reg(r));
				break;
				case '-=':
					ins('sub', reg(r), reg(r1), reg(r));
				break;
				case '*=':
					ins('mul', reg(r), reg(r1), reg(r));
				break;
				case '/=':
					ins('div', reg(r), reg(r1), reg(r));
				break;
				case '%=':
					ins('mod', reg(r), reg(r1), reg(r));
				break;
				case '<<=':
					ins('shl', reg(r), reg(r1), reg(r));
				break;
				case '>>=':
					ins('sgr', reg(r), reg(r1), reg(r));
				break;
				case '>>>=':
					ins('shrz', reg(r), reg(r1), reg(r));
				break;
				case '|=':
					ins('bit_or', reg(r), reg(r1), reg(r));
				break;
				case '^=':
					ins('bit_xor', reg(r), reg(r1), reg(r));
				break;
				case '&=':
					ins('bit_and', reg(r), reg(r1), reg(r));
				break;
			}
			if(child.left.type == 'MemberExpression') {
				e = handleExpression(child.left.object);
				if(child.computed) {
					let v = handleExpression(child.left.property);
					ins('setprop', reg(e), reg(v), reg(r));
					freeRegister(v);
				}else{
					ins('setprop', reg(e), str(child.left.property.name), reg(r));
				}
				freeRegister(e);
			}
			freeRegister(r1);
		break;
		case 'LogicalExpression':
			//correctly transferring semantics requires we not use the or/and instructions here because it will require precomputing the child.right expression
			i = branchCounter++;
			child.register = handleExpression(child.left);
			r1 = requestRegister();
			ins('neq', reg(child.register), 0, reg(r1));
			if(child.operator == '||') {
				ins('jnz', reg(r1), ':log_' + i);
				freeRegister(child.register);
				e = handleExpression(child.right);
				child.register = e;
				ins(':log_' + i);
			}else if(child.operator == '&&') {
				ins('jz', reg(r1), ':log_' + i);
				freeRegister(child.register);
				e = handleExpression(child.right);
				child.register = e;
				ins(':log_' + i);
			}
		break;
		case 'MemberExpression':
			let o = handleExpression(child.object);
			child.register = requestRegister();
			if(child.computed) {
				let v = handleExpression(child.property);
				ins('getprop', reg(o), reg(v), reg(child.register))
				freeRegister(v);
			}else{
				ins('getprop', reg(o), str(child.property.name), reg(child.register));
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
			ins('jz', reg(e), ':ternary_' + i);
			refreshRegister(e);
			e = handleExpression(child.consequent);
			ins('mov', reg(e), reg(child.register));
			ins('jmp', ':ternary_' + i + 'end');
			ins(':ternary_' + i);
			refreshRegister(e);
			e = handleExpression(child.alternate);
			ins('mov', reg(e), reg(child.register));
			freeRegister(e);
			ins(':ternary_' + i + 'end');
		break;
		case 'NewExpression':
		case 'CallExpression':
			child.register = requestRegister();
			let args = child.arguments.map(v => {
				return reg(handleExpression(v));
			});
			let t = child.register;
			if(child.type == 'CallExpression') {
				// maybe we should export these values from the real AST handlers rather than copy/modify
				if(child.callee.type == 'MemberExpression') {
					t = handleExpression(child.callee.object);
					e = requestRegister();
					if(child.callee.computed) {
						let v = handleExpression(child.callee.property);
						ins('getprop', reg(t), reg(v), reg(e))
						freeRegister(v);
					}else{
						ins('getprop', reg(t), str(child.callee.property.name), reg(e));
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
					ins('global', reg(t));
				}
			}else{
				child.callee.varName = child.varName;
				child.callee.varValue = child.varValue;
				e = handleExpression(child.callee);
			}
			r = requestRegister();
			if(child.type == 'NewExpression') {
				ins('obj', reg(child.register));
				ins('getprop', reg(e), str('prototype'), reg(r));
				ins('setprop', reg(child.register), str('__proto__'), reg(r));
				refreshRegister(r);
			}
			i = branchCounter++;
			ins('getprop', reg(e), str('func'), reg(r));
			r1 = requestRegister();
			r2 = requestRegister();
			ins('undefined', reg(r2));
			ins('eq_typed', reg(r), reg(r2), reg(r1));
			refreshRegister(r);
			freeRegister(r2);
			ins('jnz', reg(r1), ':ffi_' + i);
			refreshRegister(r1);
			ins('obj', reg(r1));
			ins('setprop', reg(r1), str('r'), ':call_' + i);
			ins('setprop', reg(r1), str('t'), reg(t));
			ins('setprop', reg(r1), str('h'), 0);
			ins('setprop', reg(r1), str('f'), reg(e));
			ins('context', reg(r));
			r2 = requestRegister();
			ins('getprop', reg(r), str('registers'), reg(r2));
			refreshRegister(r);
			ins('arr', reg(r));
			ins('setprop', reg(r), str('length'), 126);
			r3 = requestRegister();
			ins('getprop', reg(e), str('func'), reg(r3));
			ins('setprop', reg(r), 0, reg(r3));
			freeRegister(r3);
			ins('setprop', reg(r), 1, reg(1));
			args.forEach((v, index) => {
				ins('setprop', reg(r), index, v);
			});
			ins('setprop', reg(r1), str('e'), reg(r2));
			refreshRegister(r2);
			ins('getprop', reg(1), str('push'), reg(r2));
			r3 = requestRegister();
			ins('call_1', reg(1), reg(r2), reg(r1), reg(r3));
			freeRegister(r1);
			freeRegister(r2);
			ins('context', reg(r3));
			ins('setprop', reg(r3), str('registers'), reg(r));
			freeRegister(r3);
			ins(':call_' + i);
			refreshRegister(r);
			ins('getprop', reg(1), str('length'), reg(r));
			ins('sub', reg(r), 1, reg(r));
			r1 = requestRegister();
			ins('getprop', reg(1), reg(r), reg(r1));
			refreshRegister(r);
			ins('getprop', reg(r1), str('h'), reg(r));
			freeRegister(r1);
			ins('jz', reg(r), ':pcall_' + i);
			freeRegister(r);
			handleNode({type: 'ThrowStatement', argument: 2});
			ins(':pcall_' + i);
			if(child.type == 'NewExpression') r = requestRegister();
			ins('mov', reg(2), (child.type == 'NewExpression' ? reg(r) : reg(child.register)));
			if(child.type == 'NewExpression') {
				r2 = requestRegister();
				ins('neq', reg(r), 0, reg(r2));
				ins('jz', reg(r2), ':pcall3_' + i);
				freeRegister(r2);
				ins('mov', reg(r), reg(child.register));
				ins(':pcall3_' + i);
				freeRegister(r);
			}
			ins('jmp', ':fffi_' + i);
			ins(':ffi_' + i);
			if(child.type == 'NewExpression') r = requestRegister();
			ins('call_' + child.arguments.length, reg(t), reg(e), args.join(' '), (child.type == 'NewExpression' ? reg(r) : reg(child.register)));
			if(child.type == 'NewExpression') {
				r2 = requestRegister();
				ins('neq', reg(r), 0, reg(r2));
				ins('jz', reg(r2), ':pcall2_' + i);
				freeRegister(r2);
				ins('mov', reg(r), reg(child.register));
				ins(':pcall2_' + i);
				freeRegister(r);
			}
			freeRegister(e);
			args.forEach(v => {
				freeRegister(v);
			});
			ins(':fffi_' + i);
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
			varMap[child.id.name] = 'iclass_' + child.id.name;
			ins('setvar', str('iclass_' + child.id.name), reg(r));
			child.body.body.forEach(v => {
				if(v.type == 'ClassMethod' || v.type == 'ClassPrivateMethod') {
					if(v.kind == 'constructor') return;
					let k;
					if(v.type == 'ClassMethod') {
						k = v.computed ? reg(handleExpression(v.key)) : str(v.key.name);
					}else{
						k = str(v.key.id.name);
					}
					r1 = handleExpression({type: 'FunctionExpression', params: v.params, body: v.body});
					if(v['static']) {
						ins('setprop', reg(r), k, reg(r1));
					}else{
						r2 = requestRegister();
						ins('getprop', reg(r), str('prototype'), reg(r2));
						ins('setprop', reg(r2), k, reg(r1));
						freeRegister(r2);
					}
					freeRegister(r1);
					if(v.type == 'ClassMethod' && v.computed) freeRegister(k);
				}else if (v.type == 'ClassProperty' || v.type == 'ClassPrivateProperty') { // babel implements this in AST, but doesnt seem to parse them
					let k;
					if(v.type == 'ClassProperty') {
						k = v.computed ? reg(handleExpression(v.key)) : str(v.key.name);
					}else{
						k = str(v.key.id.name);
					}
					r1 = handleExpression(v.value);
					if(v['static']) {
						ins('setprop', reg(r), k, reg(r1));
					}else{
						r2 = requestRegister();
						ins('getprop', reg(r), str('prototype'), reg(r2));
						ins('setprop', reg(r2), k, reg(r1));
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