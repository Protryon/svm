//begin preprocessor
var INS_nop = false;
var INS_dump = false;
var INS_report = false;
var INS_getvar = false;
var INS_setvar = false;
var INS_jmp = false;
var INS_greq = false;
var INS_leeq = false;
var INS_gr = false;
var INS_neq_typed = false;
var INS_neq = false;
var INS_eq = false;
var INS_protokeys = false;
var INS_false = false;
var INS_true = false;
var INS_regex = false;
var INS_null = false;
var INS_call_10 = false;
var INS_call_9 = false;
var INS_call_8 = false;
var INS_call_7 = false;
var INS_call_6 = false;
var INS_call_5 = false;
var INS_call_4 = false;
var INS_call_3 = false;
var INS_call_2 = false;
var INS_typeof = false;
var INS_instanceof = false;
var INS_delete = false;
var INS_in = false;
var INS_xchg = false;
var INS_bit_not = false;
var INS_bit_xor = false;
var INS_bit_and = false;
var INS_bit_or = false;
var INS_shrz = false;
var INS_shl = false;
var INS_shr = false;
var INS_not = false;
var INS_and = false;
var INS_or = false;
var INS_mod = false;
var INS_div = false;
var INS_mul = false;
var INS_obf_pushx = true;
var INS_context = true;
var INS_jnz = true;
var INS_jz = true;
var INS_le = true;
var INS_eq_typed = true;
var INS_undefined = true;
var INS_arr = true;
var INS_obj = true;
var INS_call_1 = true;
var INS_call_0 = true;
var INS_setprop = true;
var INS_getprop = true;
var INS_global = true;
var INS_mov = true;
var INS_sub = true;
var INS_add = true;
var glob = window;
var pl = 'AgoKuru7AwKCj70FYBARYWIGRkqkrR0cXfPyNjc3Z2dTV1cEZEshEm8DZmYmTWEHa0QnZwRsYwdhdB4dHgh3ievg4HrramAeDg6FhIoLjo2AgYOIiAgJbWZkb28JCWhjc3thEhoNAJqLgPXwe3p5C+jmZmdk8/Y2BYWEh+/qYmNljYyH4eQECnkbawh1BZHg6ujtDQ9qfxQDdHAVc2oaEgNlEH4dHtisx9TcfN3ZrNTcfWxsbGxuLi7e19fi5/f38IWGZhJlHR6QkZaGFocGALAhIqmoCAnS2dZ2d6sLBabV0AAFFmcLHnQDdHAVC21pCAl5fW0VlOXj+IgICAgDExsMCoqbkO7qGhZlBgZ2enp1ZWYLHnQDdGhoGBRkBAb2+4UNDoWEigu/tcXNzgsObhaU5eR0BYbv6mJiYwMBKSwQE2MMfGwfaRYWlufldQSH4+cXEpH19vTw4ODm5Ox87emc5Ox+X1WlAQSEhYb18AADIGJgGxk5CHd8bGRiHRYGDgiDiI/PrndHQglpOQiZkhAYHhwXBw8IkJuZKSmDgbNTUlJYaQkLC7OzgYu+Dg0EDAkIv7Q=';
//end preprocessor
(function(){

	var bootPayload = [];
	{
		let chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=';
		let str = String(pl).replace(/[=]+$/, '');
	    let tmp = 0;
	    for (let bc = 0, bs, buffer, idx = 0; buffer = str.charAt(idx++);~buffer && (bs = bc % 4 ? bs * 64 + buffer : buffer,bc++ % 4) ? (tmp = (255 & bs >> (-2 * bc & 6)), bootPayload.push(tmp), tmp) : 0) {
	    	buffer = chars.indexOf(buffer);
	    }
	}

	class Context {
		constructor(global, payload, registers, variables) {
			this.g = global;
			this.p = payload;
			this.r = registers || [];
			if(registers == null) {
				this.r[2] = undefined;
				this.r[1] = [{h: 0, t: global, f: null}];
				this.r[0] = 0;
			}
			this.v = variables || {};
			this.s = 0;
			this.d = 0;
			this.f = 0;
			this.t = [];
		}
	}
	let v = {g: this};
	v.g.ct = Context;

	let globalContext = new Context(glob, bootPayload, null, v);

	function decrypt(ctx, i) {
	  let si = (i / 40) | 0;
	  let sd = i - si * 40;
	  if(sd < ctx.d || ctx.f != si || ctx.d >= 40) {
	    ctx.d = 0;
	    ctx.f = si;
	    ctx.s = 0;
	    ctx.t = [];
	  }
	  let decResult = 0;
		if(i < 0) throw 'this is a dummy throw to fix a babel-minify bug';
	  for(; ctx.d <= sd; ctx.d++) {
	    decResult = ctx.p[ctx.d + (si * 40)] ^ ctx.s;
	    ctx.t.push(decResult);
	    if(ctx.d < 4) {
	      ctx.s ^= ctx.t[ctx.d];
	    }else {
	      ctx.s ^= ctx.t.splice(0, 1)[0] ^ ctx.t[ctx.t.length - 1];
	    }
	  }
	  return decResult;
	}
	v.g.d = decrypt;

	function readVarInt(ctx, i) {
	    let output = 0;
	    let v2 = 0;
	    let v3 = 0;
	    do {
	        v3 = decrypt(ctx, v2 + i);
	        output |= (v3 & 127) << (v2++ * 7);
	        if(v2 > 5) return {o: output, c: v2};
	    }while((v3 & 128) == 128);
	    return {o: output, c: v2};
	}
	v.g.rvi = readVarInt;

	let lastDecodePos = 0;

	function safeZero() {
		return 0;
	}
	v.g.sz = safeZero;

	function safeArray() {
		return [];
	}
	v.g.sa = safeArray;

	function nextReadLocation(ctx) {
		let depth = 0;
		let reg = safeZero() << 4;
		if(reg != 0) throw 'this is a dummy throw to fix a babel-minify bug';
		while(depth++ < 127 && reg & 7 == 1) {
			reg = ctx.r[reg >> 4];
		}
		if(reg & 7 == 1) {
			throw "Circular pointer";
		}
		if(reg & 0b00000111 != 0) {
			throw "Unexpected constant";
		}
		return reg;
	}
	v.g.nr = nextReadLocation;

	function decodeByte(ctx) {
		let reg = nextReadLocation(ctx);
		let r = Math.round(ctx.r[reg >> 4]);
		if(r >= ctx.p.length || r < 0) {
			return -1;
		}
		ctx.r[reg >> 4] = r + 1;
		lastDecodePos = r;
		return decrypt(ctx, r);
	}
	v.g.db = decodeByte;

	function decode(ctx) {
		let reg = nextReadLocation(ctx);
		let r = Math.round(ctx.r[reg >> 4]);
		if(r >= ctx.p.length || r < 0) {
			return -1;
		}
		let ret = readVarInt(ctx, r);
		ctx.r[reg >> 4] = r + ret.c;
		lastDecodePos = r;
		return ret.o;
	}
	v.g.dg = decode;

	function readRegister(ctx) {
		return decode(ctx) >> 4;
	}
	v.g.dr = readRegister;

	function readArg(ctx) {
		let b = decode(ctx);
		if(b < 0) throw 'this is a dummy throw to fix a babel-minify bug';
		let depth = 0;
		while(depth++ < 127 && b & 7 == 1) {
			b = ctx.r[b >> 4];
		}
		if(b & 7 == 1) {
			throw "Circular register pointer";
		}
		if(b === 2) {
			let buf = new ArrayBuffer(8);
			let u8 = new Uint8Array(buf);
			u8[7] = decodeByte(ctx);
			u8[6] = decodeByte(ctx);
			u8[5] = decodeByte(ctx);
			u8[4] = decodeByte(ctx);
			u8[3] = decodeByte(ctx);
			u8[2] = decodeByte(ctx);
			u8[1] = decodeByte(ctx);
			u8[0] = decodeByte(ctx);
			let f64 = new Float64Array(buf);
			return f64[0];
		}else if(b === 3) {
			let strc = safeArray();
			if(strc.length != 0) throw 'this is a dummy throw to fix a babel-minify bug';
			for(let i = 0; (i = decodeByte(ctx)) != 0;) {
				strc.push(String.fromCharCode(i));
			}
			return strc.join('');
		}else if(b === 4) {
			return true;
		}else if(b === 5) {
			return false;
		}else if(b === 6) {
			return null;
		}else if(b === 7) {
			return undefined;
		}else if(b === 8) {
			let b = decodeByte(ctx);
			return b > 127 ? b -= 256 : b;
		}else if(b === 9) {
			let b = decodeByte(ctx) << 8 | decodeByte(ctx);
			return b > 32767 ? b -= 65536 : b;
		}else if(b === 10) {
			let b = decodeByte(ctx) << 16 | decodeByte(ctx) << 8 | decodeByte(ctx);
			return b > 8388607 ? b -= 16777216 : b;
		}else if(b === 11) {
			let b = decodeByte(ctx) << 24 | decodeByte(ctx) << 16 | decodeByte(ctx) << 8 | decodeByte(ctx);
			return b > 2147483647 ? b -= 4294967296 : b;
		}
		return ctx.r[b >> 4];
	}
	v.g.da = readArg;

	let lastInstruction = 0;
	function readInstruction(ctx) {
		let r = decode(ctx);
		lastInstruction = lastDecodePos;
		if(r < 0) return null;
		if(r >= instructions.length) {
			throw "Invalid instruction, ISN# " + r;
		}
		return instructions[r];
	}
	v.g.di = readInstruction;

	function writeArg(ctx, value) {
		ctx.r[readRegister(ctx)] = value;
	}
	v.g.qa = writeArg;

	let instructions = []
	//arithmatic
	//add
	if(INS_add)
		instructions.push(function(ctx) {
			writeArg(ctx, readArg(ctx) + readArg(ctx));
		});
	//sub
	if(INS_sub)
		instructions.push(function(ctx) {
			writeArg(ctx, readArg(ctx) - readArg(ctx));
		});
	//mul
	if(INS_mul)
		instructions.push(function(ctx) {
			writeArg(ctx, readArg(ctx) * readArg(ctx));
		});
	//div
	if(INS_div)
		instructions.push(function(ctx) {
			writeArg(ctx, readArg(ctx) / readArg(ctx));
		});
	//mod
	if(INS_mod)
		instructions.push(function(ctx) {
			writeArg(ctx, readArg(ctx) % readArg(ctx));
		});

	//boolean arithmatic
	//or
	if(INS_or)
		instructions.push(function(ctx) {
			writeArg(ctx, readArg(ctx) || readArg(ctx));
		});
	//and
	if(INS_and)
		instructions.push(function(ctx) {
			writeArg(ctx, readArg(ctx) && readArg(ctx));
		});
	//not
	if(INS_not)
		instructions.push(function(ctx) {
			writeArg(ctx, !readArg(ctx));
		});

	//bit arithmatic
	//shr
	if(INS_shr)
		instructions.push(function(ctx) {
			writeArg(ctx, readArg(ctx) >> readArg(ctx));
		});
	//shl
	if(INS_shl)
		instructions.push(function(ctx) {
			writeArg(ctx, readArg(ctx) << readArg(ctx));
		});
	//shrz
	if(INS_shrz)
		instructions.push(function(ctx) {
			writeArg(ctx, readArg(ctx) >>> readArg(ctx));
		});
	//bit_or
	if(INS_bit_or)
		instructions.push(function(ctx) {
			writeArg(ctx, readArg(ctx) | readArg(ctx));
		});
	//bit_and
	if(INS_bit_and)
		instructions.push(function(ctx) {
			writeArg(ctx, readArg(ctx) & readArg(ctx));
		});
	//bit_xor
	if(INS_bit_xor)
		instructions.push(function(ctx) {
			writeArg(ctx, readArg(ctx) ^ readArg(ctx));
		});
	//bit_not
	if(INS_bit_not)
		instructions.push(function(ctx) {
			writeArg(ctx, ~readArg(ctx));
		});

	//register management
	//mov
	if(INS_mov)
		instructions.push(function(ctx) {
			writeArg(ctx, readArg(ctx));
		});
	//xchg
	if(INS_xchg)
		instructions.push(function(ctx) {
			let r1 = readRegister(ctx);
			let r2 = readRegister(ctx);
			let v1 = ctx.r[r1];
			ctx.r[r1] = ctx.r[r2];
			ctx.r[r2] = v1;
		});

	//JS interface
	//global
	if(INS_global)
		instructions.push(function(ctx) {
			writeArg(ctx, ctx.g);
		});
	//getprop
	if(INS_getprop)
		instructions.push(function(ctx) {
			writeArg(ctx, readArg(ctx)[readArg(ctx)]);
		});
	//setprop
	if(INS_setprop)
		instructions.push(function(ctx) {
			readArg(ctx)[readArg(ctx)] = readArg(ctx);
		});
	//in
	if(INS_in)
		instructions.push(function(ctx) {
			writeArg(ctx, readArg(ctx) in readArg(ctx));
		});
	//delete
	if(INS_delete)
		instructions.push(function(ctx) {
			delete readArg(ctx)[readArg(ctx)];
		});
	//instanceof
	if(INS_instanceof)
		instructions.push(function(ctx) {
			writeArg(ctx, readArg(ctx) instanceof readArg(ctx));
		});
	//typeof
	if(INS_typeof)
		instructions.push(function(ctx) {
			writeArg(ctx, typeof readArg(ctx));
		});
	//call_0
	if(INS_call_0)
		instructions.push(function(ctx) {
			let th = readArg(ctx);
			writeArg(ctx, readArg(ctx).apply(th, []));
		});
	//call_1
	if(INS_call_1)
		instructions.push(function(ctx) {
			let th = readArg(ctx);
			writeArg(ctx, readArg(ctx).apply(th, [readArg(ctx)]));
		});
	//call_2
	if(INS_call_2)
		instructions.push(function(ctx) {
			let th = readArg(ctx);
			writeArg(ctx, readArg(ctx).apply(th, [readArg(ctx), readArg(ctx)]));
		});
	//call_3
	if(INS_call_3)
		instructions.push(function(ctx) {
			let th = readArg(ctx);
			writeArg(ctx, readArg(ctx).apply(th, [readArg(ctx), readArg(ctx), readArg(ctx)]));
		});
	//call_4
	if(INS_call_4)
		instructions.push(function(ctx) {
			let th = readArg(ctx);
			writeArg(ctx, readArg(ctx).apply(th, [readArg(ctx), readArg(ctx), readArg(ctx), readArg(ctx)]));
		});
	//call_5
	if(INS_call_5)
		instructions.push(function(ctx) {
			let th = readArg(ctx);
			writeArg(ctx, readArg(ctx).apply(th, [readArg(ctx), readArg(ctx), readArg(ctx), readArg(ctx), readArg(ctx)]));
		});
	//call_6
	if(INS_call_6)
		instructions.push(function(ctx) {
			let th = readArg(ctx);
			writeArg(ctx, readArg(ctx).apply(th, [readArg(ctx), readArg(ctx), readArg(ctx), readArg(ctx), readArg(ctx), readArg(ctx)]));
		});
	//call_7
	if(INS_call_7)
		instructions.push(function(ctx) {
			let th = readArg(ctx);
			writeArg(ctx, readArg(ctx).apply(th, [readArg(ctx), readArg(ctx), readArg(ctx), readArg(ctx), readArg(ctx), readArg(ctx), readArg(ctx)]));
		});
	//call_8
	if(INS_call_8)
		instructions.push(function(ctx) {
			let th = readArg(ctx);
			writeArg(ctx, readArg(ctx).apply(th, [readArg(ctx), readArg(ctx), readArg(ctx), readArg(ctx), readArg(ctx), readArg(ctx), readArg(ctx), readArg(ctx)]));
		});
	//call_9
	if(INS_call_9)
		instructions.push(function(ctx) {
			let th = readArg(ctx);
			writeArg(ctx, readArg(ctx).apply(th, [readArg(ctx), readArg(ctx), readArg(ctx), readArg(ctx), readArg(ctx), readArg(ctx), readArg(ctx), readArg(ctx), readArg(ctx)]));
		});
	//call_10
	if(INS_call_10)
		instructions.push(function(ctx) {
			let th = readArg(ctx);
			writeArg(ctx, readArg(ctx).apply(th, [readArg(ctx), readArg(ctx), readArg(ctx), readArg(ctx), readArg(ctx), readArg(ctx), readArg(ctx), readArg(ctx), readArg(ctx), readArg(ctx)]));
		});
	//obj
	if(INS_obj)
		instructions.push(function(ctx) {
			writeArg(ctx, {});
		});
	//arr
	if(INS_arr)
		instructions.push(function(ctx) {
			writeArg(ctx, []);
		});
	//null
	if(INS_null)
		instructions.push(function(ctx) {
			writeArg(ctx, null);
		});
	//undefined
	if(INS_undefined)
		instructions.push(function(ctx) {
			writeArg(ctx, undefined);
		});
	//regex
	if(INS_regex)
		instructions.push(function(ctx) {
			writeArg(ctx, new RegExp(readArg(ctx), readArg(ctx)));
		});
	//true
	if(INS_true)
		instructions.push(function(ctx) {
			writeArg(ctx, true);
		});
	//false
	if(INS_false)
		instructions.push(function(ctx) {
			writeArg(ctx, false);
		});
	//protokeys
	if(INS_protokeys)
		instructions.push(function(ctx) {
			let obj = readArg(ctx);
			let ret = [];
			for(let x in obj) {
				ret.push(x);
			}
			writeArg(ctx, ret);
		});

	//comparison
	//eq
	if(INS_eq)
		instructions.push(function(ctx) {
			let a1 = readArg(ctx);
			let a2 = readArg(ctx);
			writeArg(ctx, a1 == a2 || ((a1 == undefined || a2 == undefined) && (a1 == 0 || a2 == 0)));
		});
	//eq_typed
	if(INS_eq_typed)
		instructions.push(function(ctx) {
			writeArg(ctx, readArg(ctx) === readArg(ctx));
		});
	//neq
	if(INS_neq)
		instructions.push(function(ctx) {
			let a1 = readArg(ctx);
			let a2 = readArg(ctx);
			writeArg(ctx, a1 != a2 && !((a1 == undefined || a2 == undefined) && (a1 == 0 || a2 == 0)));
		});
	//neq_typed
	if(INS_neq_typed)
		instructions.push(function(ctx) {
			writeArg(ctx, readArg(ctx) !== readArg(ctx));
		});
	//le
	if(INS_le)
		instructions.push(function(ctx) {
			writeArg(ctx, readArg(ctx) < readArg(ctx));
		});
	//gr
	if(INS_gr)
		instructions.push(function(ctx) {
			writeArg(ctx, readArg(ctx) > readArg(ctx));
		});
	//leeq
	if(INS_leeq)
		instructions.push(function(ctx) {
			writeArg(ctx, readArg(ctx) <= readArg(ctx));
		});
	//greq
	if(INS_greq)
		instructions.push(function(ctx) {
			writeArg(ctx, readArg(ctx) >= readArg(ctx));
		});

	//branching
	//jmp
	if(INS_jmp)
		instructions.push(function(ctx) {
			ctx.r[0] = readArg(ctx);
		});
	//jz
	if(INS_jz)
		instructions.push(function(ctx) {
			let a = readArg(ctx);
			if(a == 0 || a == undefined) {
				ctx.r[0] = readArg(ctx);
			}else{
				readArg(ctx);
			}
		});
	//jnz
	if(INS_jnz)
		instructions.push(function(ctx) {
			let a = readArg(ctx);
			if(a != 0 && a != undefined) {
				ctx.r[0] = readArg(ctx);
			}else{
				readArg(ctx);
			}
		});

	//variables
	//setvar
	if(INS_setvar)
		instructions.push(function(ctx) {
			ctx.v[readArg(ctx)] = readArg(ctx);
		});
	//getvar
	if(INS_getvar)
		instructions.push(function(ctx) {
			writeArg(ctx, ctx.v[readArg(ctx)]);
		});

	//VM interface
	//context
	if(INS_context)
		instructions.push(function(ctx) {
			writeArg(ctx, ctx);
		});

	//debugging
	//report
	if(INS_report)
		instructions.push(function(ctx) {
			console.log('reported:', readArg(ctx));
		});
	//dump
	if(INS_dump)
		instructions.push(function(ctx) {
			for(let i = 0; i < ctx.r.length; i++) {
				console.log(i + ':', readArg(ctx));
			}
		});

	//obfuscation related
	//nop
	if(INS_nop)
		instructions.push(function(ctx) {

		});
	if(INS_obf_pushx) // incapable of being properly assembled at this time, used to obfuscate
		instructions.push(function(ctx) {
			let c = readArg(ctx);
			let b = [];
			for(let i = 0; i < c; i++) {
				b.push(readArg(ctx));
			}
			writeArg(ctx, b);
		});
	v.g.is = instructions;

	function runContext(ctx) {
		let ins = null;
		try{
			while((ins = readInstruction(ctx)) != null) {
				ins(ctx);
			}
		}catch(e) {
			console.log(e, 'LOC: ' + lastInstruction)
		}
	}
	v.g.rc = runContext;
	runContext(globalContext);
}).call({});
