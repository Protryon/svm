const fs = require('fs');
const babel = require("babel-core");

if(process.argv.length != 4) {
	console.log('Usage: node index.js <input.js> <output.sasm>');
	return;
}

let asm = '';

let script = fs.readFileSync(process.argv[2], 'utf8');

let xf = babel.transform(script, {babelrc: false, sourceType: 'script', plugins: [
	'transform-es2015-classes',
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
	asm += ins + ' ' + Array.from(arguments).slice(1).filter(v => {
		return v.toString().trim().length > 0;
	}).join(' ') + '\n';
}

function reg(reg) {
	return typeof reg === 'string' && reg.startsWith(':') ? reg : 'r' + reg;
}

function requestRegister() {
	for(let i = 0; i < 123; i++) {
		if(registers[i] === 0) {
			registers[i] = 1;
			asm += '//alloc' + i + '\n'
			return i;
		}
	}
	throw "Out of registers!";
}

function claimRegister(r) {
	if(r >= 123) return;
	registers[r]++;
	asm += '//alloc' + r + '\n';
}

function freeRegister(r) {
	if(typeof r == 'string') {
		if(r.startsWith('r')) r = parseInt(r.substring(1));
		else return;
	}else if(r == null) return;
	if(r >= 123) return;
	asm += '//free' + r + '\n'
	if(registers[r] > 0) registers[r]--;
}

function refreshRegister(r) {
	if(r >= 123) return;
	asm += '//free' + r + '\n'
	asm += '//alloc' + r + '\n'
}

function str(arg) {
	return '\'' + arg + '\'';
}

function handleExpression(exp) {
	if(typeof exp == 'number') {
		if(exp < 123) {
			asm += '//alloc' + exp + '\n'
		}
		registers[exp]++;
		return exp;
	}
	handleNode(exp);
	if('register' in exp) {
		return exp.register;
	}else if ('registers' in exp && exp.registers.length > 0) {
		return exp.registers[0];
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
let functionMap = [];

function handleNode(child) {
	let i, e, r, r1, r2, r3, r4, r5;
	switch(child.type) {
		case 'Identifier':
			if(child.name in varMap) {
				child.register = varMap[child.name];
				claimRegister(child.register);
			}else if(argMap.includes(child.name)) {
				child.register = argMap.indexOf(child.name);
				claimRegister(child.register);
			}else if(functionMap.includes(child.name)) {
				child.register = requestRegister();
				r = requestRegister();
				ins('add', str('class_'), ':func_' + child.name, reg(r));
				ins('getvar', reg(r), reg(child.register));
				freeRegister(r);
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
			child.register = requestRegister(r);
			ins('null', reg(child.register));
		break;
		case 'StringLiteral': 
			child.register = requestRegister(r);
			ins('mov', str(child.value), reg(child.register));
		break;
		case 'BooleanLiteral': 
			child.register = requestRegister(r);
			ins(child.value ? 'true' : 'false', reg(child.register));
		break;
		case 'NumericLiteral': 
			child.register = requestRegister(r);
			ins('mov', child.value, reg(child.register));
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
				ins('mov', reg(e), reg(123));
				freeRegister(e);
			}else{
				ins('undefined', reg(123));
			}
			r = requestRegister();
			ins('getprop', reg(124), str('pop'), reg(r));
			r1 = requestRegister();
			ins('call_0', reg(124), reg(r), reg(r1));
			refreshRegister(r);
			ins('getprop', reg(r1), str('e'), reg(r));
			if(child.returnLoc == null) {
				r2 = requestRegister();
				ins('getprop', reg(r1), str('r'), reg(r2));
				ins('setprop', reg(r), 125, reg(r2));
				freeRegister(r2);
			}else{
				ins('setprop', reg(r), 125, child.returnLoc);
			}
			ins('setprop', reg(r), 123, reg(123));
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
				ins('getprop', reg(124), str('length'), reg(r));
				r1 = requestRegister();
				ins('le', reg(r), 2, reg(r1));
				ins('jnz', reg(r1), ':eof');
				ins('sub', reg(r), 2, reg(r));
				refreshRegister(r1);
				ins('getprop', reg(124), reg(r), reg(r1));
				freeRegister(r);
				ins('setprop', reg(r1), str('h'), 1);
				freeRegister(r1);
				handleNode({type: 'ReturnStatement', argument: e});
				freeRegister(e);
			}else{
				ins('mov', reg(e), reg(123));
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
					varMap[child.handler.param.name] = 123;
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
			let name = child.id == null || child.id.name == null ? "anon_" + branchCounter++ : child.id.name;
			r = requestRegister();
			ins('obj', reg(r));
			r1 = requestRegister();
			ins('add', str('class_'), ':func_' + name, reg(r1));
			ins('setvar', reg(r1), reg(r));
			refreshRegister(r1);
			ins('setprop', reg(r), str('func'), ':func_' + name);
			r2 = requestRegister();
			ins('obj', reg(r2));
			ins('setprop', reg(r2), str('func'), ':funccall_' + name);
			ins('setprop', reg(r), str('call'), reg(r2));
			freeRegister(r2);
			ins('obj', reg(r1));
			ins('setprop', reg(r), str('prototype'), reg(r1));
			ins('setprop', reg(r1), str('constructor'), ':func_' + name);
			freeRegister(r1);
			freeRegister(r);
			ins('jmp', ':funcend_' + name)
			ins(':funccall_' + name);
			functionMap.push(name);
			let oldArgMap = argMap;
			let oldVarMap = varMap;
			tryStackStack.push(tryStack);
			tryStack = [];
			varMap = {};
			regStack.push(registers);
			asm += '//pushreg\n';
			let rss = regStack.length;
			registers = [];
			for(let i = 0; i < 126; i++) {
				if(i < child.params.length) {
					asm += '//alloc' + i + '\n';
				}
				registers.push(i < child.params.length ? 1 : 0);
			}
			argMap = child.params.map(v => {
				return v.name;
			});
			requestRegister(); // makes up for argument lost
			r = requestRegister();
			ins('getprop', reg(124), str('length'), reg(r));
			r1 = requestRegister();
			ins('sub', reg(r), 1, reg(r1));
			refreshRegister(r);
			ins('getprop', reg(124), reg(r1), reg(r));
			freeRegister(r1);
			ins('setprop', reg(r), str('t'), reg(0));
			freeRegister(r);
			for(let i = 1; i < argMap.length + 1; i++) {
				ins('mov', reg(i), reg(i - 1));
			}
			freeRegister(argMap.length);
			ins(':func_' + name);
			if(child.type == 'ArrowFunctionExpression' && child.expression) {
				handleNode({type: 'ReturnStatement', argument: child.body});
			}else handleNode(child.body);
			ins('undefined', reg(123));
			r = requestRegister();
			ins('getprop', reg(124), str('pop'), reg(r));
			r1 = requestRegister();
			ins('call_0', reg(124), reg(r), reg(r1));
			refreshRegister(r);
			ins('getprop', reg(r1), str('e'), reg(r));
			r2 = requestRegister();
			ins('getprop', reg(r1), str('r'), reg(r2));
			ins('setprop', reg(r), 125, reg(r2));
			freeRegister(r2);
			ins('setprop', reg(r), 123, reg(123));
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
			ins(':funcend_' + name);
			if(child.type == 'FunctionExpression' || child.type == 'ArrowFunctionExpression') {
				child.register = ':func_' + name;
			}
		break;
		case 'VariableDeclaration': 
			child.registers = [];
			//TODO: var/let/const spec impl?
			for(let decl of child.declarations) {
				r = decl.init != null ? handleExpression(decl.init) : requestRegister();
				child.registers.push(r);
				varMap[decl.id.name] = r;
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
			//TODO ES6
		break;
		case 'Import': 
			//TODO ES6
		break;
		case 'ThisExpression': 
			r = requestRegister();
			ins('getprop', reg(124), str('length'), reg(r));
			r1 = requestRegister();
			ins('sub', reg(r), 1, reg(r1));
			refreshRegister(r);
			ins('getprop', reg(124), reg(r1), reg(r));
			refreshRegister(r1);
			ins('getprop', reg(r), str('t'), reg(r1))
			child.register = r1;
			freeRegister(r);
		break;
		case 'YieldExpression': 
			//TODO ES6
		break;
		case 'AwaitExpression': 
			//TODO ES6
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
				if(e.type == "SpreadElement") {
					//TODO
				}else if(e.type == "ObjectProperty") {
					let ex = handleExpression(e.value);
					ins('setprop', reg(r), str(e.key.name), reg(ex));
					freeRegister(ex);
				}else if(e.type == "ObjectMethod") {
					if(e.kind == "method") {
						//TODO
					}else{
						/*let i = branchCounter++;
						let r2 = requestRegister();
						let r3 = requestRegister();
						ins('global', reg(r2));
						ins('getprop', reg(r2), 'Object', reg(r2));
						ins('getprop', reg(r2), 'getOwnPropertyDescriptor', reg(r3));
						ins('getprop', reg(r2), 'defineProperty', reg(r2));
						ins('call_2', reg(r3), reg(r3), reg(r), str(e.key), reg(r3));
						ins('jz', reg(r3), ':om_' + i);
						ins('call_3')
						ins(':om_' + i);
						freeRegister(r2);*/
						//TODO
					}
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
					ins('setprop', reg(e), reg(v), reg(r))
					freeRegister(v);
				}else{
					ins('setprop', reg(e), str(child.left.property.name), reg(r));
				}
				freeRegister(e);
			}
			freeRegister(r1);
		break;
		case 'LogicalExpression':
			i = branchCounter++;
			r = handleExpression(child.left);
			child.register = requestRegister();
			ins('neq', reg(r), 0, reg(child.register));
			freeRegister(r);
			if(child.operator == '||') {
				ins('jnz', reg(child.register), ':log_' + i);
				e = handleExpression(child.right);
				ins('mov', reg(e), reg(child.register));
				freeRegister(e);
				ins(':log_' + i);
			}else if(child.operator == '&&') {
				ins('jz', reg(child.register), ':log_' + i);
				e = handleExpression(child.right);
				ins('mov', reg(e), reg(child.register));
				freeRegister(e);
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
			//??
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
			e = handleExpression(child.callee);
			r = requestRegister();
			if(child.type == 'NewExpression') {
				ins('obj', reg(child.register));
				ins('getprop', reg(e), str('prototype'), reg(r));
				ins('setprop', reg(child.register), str('__proto__'), reg(r));
				refreshRegister(r);
			}
			i = branchCounter++;
			ins('typeof', reg(e), reg(r));
			r1 = requestRegister();
			ins('eq', reg(r), str('function'), reg(r1));
			ins('jnz', reg(r1), ':ffi_' + i);
			refreshRegister(r1);
			ins('obj', reg(r1));
			ins('setprop', reg(r1), str('r'), ':call_' + i);
			if(child.type != 'NewExpression') {
				refreshRegister(r);
				ins('global', reg(r));
			}
			ins('setprop', reg(r1), str('t'), (child.type == 'NewExpression' ? reg(child.register) : reg(r)));
			ins('setprop', reg(r1), str('h'), 0);
			refreshRegister(r);
			ins('context', reg(r));
			r2 = requestRegister();
			ins('getprop', reg(r), str('registers'), reg(r2));
			refreshRegister(r);
			ins('arr', reg(r));
			ins('setprop', reg(r), str('length'), 126);
			r3 = requestRegister();
			ins('getprop', reg(e), str('func'), reg(r3));
			ins('setprop', reg(r), 125, reg(r3));
			freeRegister(r3);
			ins('setprop', reg(r), 124, reg(124));
			args.forEach((v, index) => {
				ins('setprop', reg(r), index, v);
			});
			ins('setprop', reg(r1), str('e'), reg(r2));
			refreshRegister(r2);
			ins('getprop', reg(124), str('push'), reg(r2));
			r3 = requestRegister();
			ins('call_1', reg(124), reg(r2), reg(r1), reg(r3));
			freeRegister(r1);
			freeRegister(r2);
			ins('context', reg(r3));
			ins('setprop', reg(r3), str('registers'), reg(r));
			freeRegister(r3);
			ins(':call_' + i);
			refreshRegister(r);
			ins('getprop', reg(124), str('length'), reg(r));
			ins('sub', reg(r), 1, reg(r));
			r1 = requestRegister();
			ins('getprop', reg(124), reg(r), reg(r1));
			refreshRegister(r);
			ins('getprop', reg(r1), str('h'), reg(r));
			freeRegister(r1);
			ins('jz', reg(r), ':pcall_' + i);
			freeRegister(r);
			handleNode({type: 'ThrowStatement', argument: 123});
			ins(':pcall_' + i);
			if(child.type == 'NewExpression') r = requestRegister();
			ins('mov', reg(123), (child.type == 'NewExpression' ? reg(r) : reg(child.register)));
			if(child.type == 'NewExpression') {
				r2 = requestRegister();
				ins('neq', reg(r), 0, reg(r2));
				ins('jnz', reg(r2), ':pcall3_' + i);
				freeRegister(r2);
				ins('mov', reg(r), reg(child.register));
				ins(':pcall3_' + i);
				freeRegister(r);
			}
			ins('jmp', ':fffi_' + i);
			ins(':ffi_' + i);
			if(child.type == 'NewExpression') r = requestRegister();
			ins('call_' + child.arguments.length, (child.type == 'NewExpression' ? reg(child.register) : reg(e)), reg(e), args.join(' '), (child.type == 'NewExpression' ? reg(r) : reg(child.register)));
			if(child.type == 'NewExpression') {
				r2 = requestRegister();
				ins('neq', reg(r), 0, reg(r2));
				ins('jnz', reg(r2), ':pcall2_' + i);
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
		case 'DoExpression':
		//TODO
		break;
	}
}

function recurseNode(node) {
	for(let child of node) {
		handleNode(child);
	}
}

recurseNode(xf.body);
ins(':eof');

fs.writeFileSync(process.argv[3], asm);
//console.log(asm);