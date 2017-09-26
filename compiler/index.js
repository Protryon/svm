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
	for(let i = 0; i < registers.length; i++) {
		if(registers[i] === 0) {
			registers[i] = 1;
			return i;
		}
	}
	throw "Out of registers!";
}

function freeRegister(r) {
	if(registers[r] > 0) registers[r]--;
}

function str(arg) {
	return '\'' + arg + '\'';
}

function handleExpression(exp) {
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
let argMap = [];
let functionMap = [];

function handleNode(child) {
	let i, e, r, rl, rr, forKey, r2;
	switch(child.type) {
		case 'Identifier':
			if(child.name in varMap) {
				child.register = varMap[child.name];
			}else if(argMap.includes(child.name)) {
				child.register = argMap.indexOf(child.name);
			}else if(functionMap.includes(child.name)) {
				child.register = ':func_' + child.name;
			}else{
				child.register = requestRegister();
				ins('global', reg(child.register));
				ins('getprop', reg(child.register), str(child.name), reg(child.register));
			}
			break;
		case 'RegExpLiteral': 
			child.register = requestRegister(r);
			ins('regex', str(child.pattern), str(flags), reg(child.register));
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
			ins('call_0', reg(124), reg(r), reg(r));
			rl = requestRegister();
			ins('getprop', reg(r), str('e'), reg(rl));
			ins('getprop', reg(r), str('r'), reg(r));
			ins('setprop', reg(rl), 125, reg(r));
			ins('setprop', reg(rl), 123, reg(123));
			ins('context', reg(r));
			ins('setprop', reg(r), str('registers'), reg(rl));
			freeRegister(r);
		break;
		case 'BreakStatement': 
			if(child.label != null) {
				ins('jmp', ':' + child.label.name + 'end')
			}else{
				ins('jmp', ':' + loopStack[loopStack.length - 1].endname);
			}
		break;
		case 'ContinueStatement': 
			if(child.label != null) {
				ins('jmp', ':' + child.label.name)
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
			loopStack.push({endname: 'switch_' + i + '_case_' + (d.cases.length - 1), name : null});
			for(let ci = 0; ci < d.cases.length; d++) {
				let c = d.cases[ci];
				if(c.test != null) {
					e = handleExpression(c.test);
					ins('jz', e, ':switch_' + i + '_case_' + ci);
					freeRegister(e);
				}
				recurseNode(c.consequent);
				ins(':switch_' + i + '_case_' + ci);
			}
			freeRegister(d);
		break;
		case 'ThrowStatement': 
			//TODO
		break;
		case 'TryStatement': 
			//TODO
		break;
		case 'DoWhileStatement': 
			i = branchCounter++;
			ins(':dowhile_' + i + 'start');
			loopStack.push({name: 'dowhile_' + i, endname: 'dowhile_' + i + 'end'});
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
			loopStack.push({name: 'for_' + i, endname: 'for_' + i + 'end'});
			ins(':for_' + i);
			if(child.test != null) {
				e = handleExpression(child.test);
				ins('jz', e, ':for_' + i + 'end');
				freeRegister(e);
			}
			handleNode(child.body);
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
			loopStack.push({name: 'foreach_' + i, endname: 'foreach_' + i + 'end'});
			rl = requestRegister();
			ins('getprop', reg(r), str('length'), reg(rl));
			rr = requestRegister();
			ins('eq', reg(rl), 0, reg(rr));
			ins('jnz', reg(rr), ':foreach_' + i);
			ins('mov', 0, reg(rr));
			e = requestRegister();
			ins(':foreach_' + i);
			ins('getprop', reg(r), reg(rr), reg(forKey));
			handleNode(child.body);
			ins('add', reg(rr), 1, reg(rr));
			ins('le', reg(rr), reg(rl), reg(e));
			ins('jnz', reg(e), ':foreach_' + i);
			ins(':foreach_' + i + 'end');
			freeRegister(r);
			freeRegister(rl);
			freeRegister(rr);
			freeRegister(e);
		break;
		case 'FunctionExpression':
		case 'ArrowFunctionExpression':
		case 'FunctionDeclaration': 
			if(child.type == 'FunctionDeclaration' && child.id == null) {
				throw "Unexpected unnamed function: exports not supported";
			}
			let name = child.id == null || child.id.name == null ? "anon_" + branchCounter++ : child.id.name;
			ins('jmp', ':funcend_' + name)
			ins(':func_' + name);
			functionMap.push(name);
			let oldArgMap = argMap;
			let oldVarMap = varMap;
			varMap = {};
			regStack.push(registers);
			let rss = regStack.length;
			registers = [];
			for(let i = 0; i < 126; i++) {
				registers.push(i < child.params.length ? 1 : 0);
			}
			argMap = child.params.map(v => {
				return v.name;
			});
			if(child.type == 'ArrowFunctionExpression' && child.expression) {
				handleNode({type: 'ReturnStatement', argument: child.body});
			}else handleNode(child.body);
			ins('undefined', reg(123));
			r = requestRegister();
			ins('getprop', reg(124), str('pop'), reg(r));
			ins('call_0', reg(124), reg(r), reg(r));
			rl = requestRegister();
			ins('getprop', reg(r), str('e'), reg(rl));
			ins('getprop', reg(r), str('r'), reg(r));
			ins('setprop', reg(rl), 125, reg(r));
			ins('setprop', reg(rl), 123, reg(123));
			ins('context', reg(r));
			ins('setprop', reg(r), str('registers'), reg(rl));
			freeRegister(r);
			argMap = oldArgMap;
			varMap = oldVarMap;
			registers = regStack.pop();
			ins(':funcend_' + name);
			if(child.type == 'FunctionExpression') {
				debugger;
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
			ins('getprop', reg(124), 'length', reg(r));
			ins('sub', reg(r), 1, reg(r));
			ins('getprop', reg(124), reg(r), reg(r));
			ins('getprop', reg(r), 't', reg(r))
			child.register = r;
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
					let exk = handleExpression(e.value);
					ins('setprop', reg(r), reg(exk), reg(ex));
					freeRegister(exk);
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
				ins('mov', reg(child.register), reg(r));
			}
			switch(child.operator) {
				case '++':
					ins('add', reg(r), 1, reg(r));
				break;
				case '--':
					ins('sub', reg(r), 1, reg(r));
				break;
			}
		break;
		case 'BinaryExpression':
			rl = handleExpression(child.left);
			rr = handleExpression(child.right);
			child.register = requestRegister();
			switch(child.operator) {
				case '==':
					ins('eq', reg(rl), reg(rr), reg(child.register));
				break;
				case '!=':
					ins('neq', reg(rl), reg(rr), reg(child.register));
				break;
				case '===':
					ins('eq_typed', reg(rl), reg(rr), reg(child.register));
				break;
				case '!==':
					ins('neq_typed', reg(rl), reg(rr), reg(child.register));
				break;
				case '<':
					ins('le', reg(rl), reg(rr), reg(child.register));
				break;
				case '<=':
					ins('leeq', reg(rl), reg(rr), reg(child.register));
				break;
				case '>':
					ins('gr', reg(rl), reg(rr), reg(child.register));
				break;
				case '>=':
					ins('greq', reg(rl), reg(rr), reg(child.register));
				break;
				case '<<':
					ins('shl', reg(rl), reg(rr), reg(child.register));
				break;
				case '>>':
					ins('shr', reg(rl), reg(rr), reg(child.register));
				break;
				case '>>>':
					ins('shrz', reg(rl), reg(rr), reg(child.register));
				break;
				case '+':
					ins('add', reg(rl), reg(rr), reg(child.register));
				break;
				case '-':
					ins('sub', reg(rl), reg(rr), reg(child.register));
				break;
				case '*':
					ins('*', reg(rl), reg(rr), reg(child.register));
				break;
				case '/':
					ins('/', reg(rl), reg(rr), reg(child.register));
				break;
				case '%':
					ins('%', reg(rl), reg(rr), reg(child.register));
				break;
				case '|':
					ins('|', reg(rl), reg(rr), reg(child.register));
				break;
				case '^':
					ins('^', reg(rl), reg(rr), reg(child.register));
				break;
				case '&':
					ins('&', reg(rl), reg(rr), reg(child.register));
				break;
				case 'in':
					ins('in', reg(rl), reg(rr), reg(child.register));
				break;
				case 'instanceof':
					ins('instanceof', reg(rl), reg(rr), reg(child.register));
				break;
			}
			freeRegister(rl);
			freeRegister(rr);
		break;
		case 'AssignmentExpression':
			rl = handleExpression(child.left);
			rr = handleExpression(child.right);
			child.register = rl;
			switch(child.operator) {
				case '=':
					ins('mov', reg(rr), reg(rl));
				break;
				case '+=':
					ins('add', reg(rl), reg(rr), reg(rl));
				break;
				case '-=':
					ins('sub', reg(rl), reg(rr), reg(rl));
				break;
				case '*=':
					ins('mul', reg(rl), reg(rr), reg(rl));
				break;
				case '/=':
					ins('div', reg(rl), reg(rr), reg(rl));
				break;
				case '%=':
					ins('mod', reg(rl), reg(rr), reg(rl));
				break;
				case '<<=':
					ins('shl', reg(rl), reg(rr), reg(rl));
				break;
				case '>>=':
					ins('sgr', reg(rl), reg(rr), reg(rl));
				break;
				case '>>>=':
					ins('shrz', reg(rl), reg(rr), reg(rl));
				break;
				case '|=':
					ins('bit_or', reg(rl), reg(rr), reg(rl));
				break;
				case '^=':
					ins('bit_xor', reg(rl), reg(rr), reg(rl));
				break;
				case '&=':
					ins('bit_and', reg(rl), reg(rr), reg(rl));
				break;
			}
			freeRegister(rr);
		break;
		case 'LogicalExpression':
			rl = handleExpression(child.left);
			rr = handleExpression(child.right);
			child.register = requestRegister();
			switch(child.operator) {
				case '||':
					ins('or', reg(rl), reg(rr), reg(child.register));
				break;
				case '&&':
					ins('and', reg(rl), reg(rr), reg(child.register));
				break;
			}
			freeRegister(rr);
			freeRegister(rl);
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
		e = handleExpression(child.consequent);
		ins('mov', reg(e), reg(child.register));
		freeRegister(e);
		ins('jmp', ':ternary_' + i + 'end');
		ins(':ternary_' + i);
		e = handleExpression(child.alternate);
		ins('mov', reg(e), reg(child.register));
		freeRegister(e);
		ins(':ternary_' + i + 'end');
		break;
		case 'CallExpression':
			child.register = requestRegister();
			let args = child.arguments.map(v => {
				return reg(handleExpression(v));
			});
			e = handleExpression(child.callee);
			r = requestRegister();
			i = branchCounter++;
			ins('typeof', reg(e), reg(r));
			ins('eq', reg(r), str('function'), reg(r));
			ins('jnz', reg(r), ':ffi_' + i);
			let r1 = requestRegister();
			ins('obj', reg(r1));
			ins('setprop', reg(r1), str('r'), ':call_' + i);
			ins('global', reg(r));
			ins('setprop', reg(r1), str('t'), reg(r));
			ins('context', reg(r));
			ins('getprop', reg(r), str('registers'), reg(r));
			r2 = requestRegister();
			ins('arr', reg(r2));
			ins('setprop', reg(r2), str('length'), 126);
			ins('setprop', reg(r2), 125, reg(e));
			ins('setprop', reg(r2), 124, reg(124));
			args.forEach((v, index) => {
				ins('setprop', reg(r2), index, args.join(' '));
			});
			ins('setprop', reg(r1), str('e'), reg(r));
			ins('getprop', reg(124), str('push'), reg(r));
			ins('call_1', reg(124), reg(r), reg(r1), reg(r));
			ins('context', reg(r));
			ins('setprop', reg(r), str('registers'), reg(r2))
			freeRegister(r2);
			ins(':call_' + i);
			ins('mov', reg(123), reg(child.register))
			freeRegister(r);
			freeRegister(r1);
			ins('jmp', ':fffi_' + i)
			ins(':ffi_' + i)
			ins('call_' + child.arguments.length, reg(e), reg(e), args.join(' '), reg(child.register));
			ins(':fffi_' + i);
			args.forEach(v => {
				freeRegister(v);
			})
			freeRegister(e);
		break;
		case 'NewExpression': 
			e = handleExpression(child.callee);
			args = child.arguments.map(v => {
				return handleExpression(v);
			})
			ins('new_' + child.arguments.length, reg(e), reg(e), args.join(' '));
			args.forEach(v => {
				freeRegister(v);
			})
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

fs.writeFileSync(process.argv[3], asm);
//console.log(asm);