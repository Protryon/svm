let lit_regexp = /test/g;
let lit_null = null;
let lit_string = 'string';
let lit_true = true;
let lit_false = false;
let lit_num = 3.14;

console.log(lit_regexp, lit_null, lit_string, lit_true, lit_false, lit_num);

lit_num + 3.14;

{
	let block_val = '5' + 25;
	console.log(block_val);
}

;

debugger;

function voidFunc() {

}

function valFunc() {
	return "valFunc";
}

function argFunc(arg1, arg2) {
	return arg1 + arg2;
}



//voidFunc();

let val = valFunc();
console.log('valFunc:', val);
console.log('argf', argFunc(2, 3));

for(let i = 0; i < 10; i++) {
	console.log('for1', i);
}



for(let i = 0; i < 10; i++) {
	console.log('for2', i);
	if(i > 5) break;
}

for(let i = 0; i < 10; i++) {
	if(i == 5) continue;
	console.log('for3', i);
}

if(lit_num == 3.14) {
	console.log('lit_num == ' + 3.14);
}

if(lit_num != 3.14) {
	console.log('lit_num != ' + 3.14);
}else{
	console.log('lit_num =2= ' + 3.14);
}

switch(5) {
case 3:
	console.log('5 == 3');
break;
case 5:
case 4:
	console.log('4||5 == 5');
break;
}

try{
	console.log('try exec');
}catch(e) {
	console.log('unexpected exception ' + e);
}finally {
	console.log('try finally');
}

try{
	throw 'valid throw';
	console.log('unexpected try exec');
}catch(e) {
	console.log('throw expected ' + e);
}finally {
	console.log('try finally');
}

while(5 == 3) {
	console.log('FAIL: while 5 == 3');
}

let i = 3;
while(i < 5) {
	console.log('while', i++);
}


do{
	console.log('do run once')
}while(5 == 3);

i = 3;

do {
	console.log('dowhile', i++);
}while(i < 5);


let arr = [1, 5, 10];

console.log('arr', '1 == ' + arr[0]);

for(let x in arr) {
	console.log('arr index', x);
}

for(let x of arr) {
	console.log('arr value', x);
}

console.log('this', this != null);

let lambda = (a) => {
	console.log('lambda', a);
};
lambda('lambdaarg');

let fstat = function(a) {
	console.log('anonfunc', a);
};

fstat('anonmr');

let obj = {
	testKey1: 'test',
	testKey2: 3.14159,
};

console.log(obj);

let tnum = 2.7;

console.log('unary-', -tnum);

console.log('tnum++', tnum++);

console.log('++tnum', ++tnum);

tnum = 2.7;

console.log('tnum--', tnum--);

console.log('--tnum', --tnum);

console.log('assign', tnum = 5.);

console.log(tnum == 5. ? 'tnum is 5' : 'tnum is not 5');

console.log(new RegExp('test'));

console.log('sequence', (1, 2));


function TestClass(toPrint) {
	this.tp = toPrint;
}

console.log('testClass', new TestClass('myTestClass'));

function UberTestClass(toPrint, toPrint2) {
	TestClass.call(this, toPrint);
	this.tp2 = toPrint2;
}

console.log('uberTestClass', new UberTestClass('myUberTestClassOld', 'myUberTestClass'));

let obj2 = {
	underlyingTest: 'initial',
	get test() {
		return this.underlyingTest;
	},
	set test(val) {
		this.underlyingTest = val + 'set';
	},
	genericMethod() {
		this.underlyingTest = this.underlyingTest + 'GENERIC';
	},
}

console.log('initial = ' + obj2.test);

obj2.test = 'ubertest';
console.log('ubertestset = ' + obj2.test);

obj2.genericMethod();

console.log('ubertestsetGENERIC = ' + obj2.test);

console.log(2, '==', 1 && 2);
console.log(0, '==', 0 && 2);
console.log(1, '==', 2 && 1);
console.log(1, '==', 1 || 2);
console.log(2, '==', 0 || 2);
console.log(0, '==', 0 || 0);



class c1 {
	//babel implements class props, but does not parse them
	//c1Value = 'test value';
	//static c1ValueStatic = 'test static value';
	constructor() {
		this.test = 'test';
	}

	testFunc() {
		console.log('test func');
	}

	static staticFunc() {
		console.log('static func');
	}
}
let c1o = new c1();
c1o.testFunc();
c1.staticFunc();
//console.log(c1o.c1Value);
//console.log(c1.c1ValueStatic);

class c2 extends c1 {
	//c2Value = 'test2 value';
	constructor() {
		super();
		this.test2 = 'test2';
	}

	testFunc2() {
		console.log('test func #2');
	}
}

let c2o = new c2();

c2o.testFunc();
c2o.testFunc2();
c2.staticFunc();
//console.log(c2o.c1Value);
//console.log(c2o.c2Value);

console.log('pre');
setTimeout(function() {
	console.log('works');
}, 1000);
