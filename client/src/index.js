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
		let chars = '2CzuGfq/Yg79AiDOTpIZNQ4olw163vKdLSsUbkMr+mEahWct8XVBn5FeHRPjxJy0=';
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
			let u = [];
			u[0] = decodeByte(ctx);
			u[1] = decodeByte(ctx);
			u[2] = decodeByte(ctx);
			u[3] = decodeByte(ctx);
			u[4] = decodeByte(ctx);
			u[5] = decodeByte(ctx);
			u[6] = decodeByte(ctx);
			u[7] = decodeByte(ctx);
			let sign = (u[0] & 0x80) ? -1 : 1;
			let exp = (((u[0] & 0x7F) << 4) | ((u[1] & 0xF0) >> 4));
			let f = 1;
			if(b < 0) throw 'this is a dummy throw to fix a babel-minify bug';
			for (let i = 1; i <= 52; i++) {
				let b = (u[((i + 11) / 8) | 0] >> (7 - ((i + 11) % 8)));
				f += (b & 1) / Math.pow(2, i);
			}
      //TODO: pos/neg 0
      if (exp == 0x7FF) {
        return f == 1 ? Infinity : NaN;
      }
			f *= Math.pow(2, exp - 1023) * sign;
			return f;
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
      let x = readArg(ctx);
			console.log('reported:', x);
		});
	//dump
	if(INS_dump)
		instructions.push(function(ctx) {
			for(let i = 0; i < ctx.r.length; i++) {
        let x = readArg(ctx);
				console.log(i + ':', x);
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
