var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

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
var INS_and = false;
var INS_or = false;
var INS_mod = false;
var INS_mul = false;
var INS_add = false;
var INS_context = true;
var INS_jnz = true;
var INS_jz = true;
var INS_le = true;
var INS_eq_typed = true;
var INS_eq = true;
var INS_undefined = true;
var INS_arr = true;
var INS_obj = true;
var INS_call_1 = true;
var INS_call_0 = true;
var INS_setprop = true;
var INS_getprop = true;
var INS_global = true;
var INS_mov = true;
var INS_not = true;
var INS_div = true;
var INS_sub = true;
var glob = global;
var pl = 'AwsI2NnZ2dzs7OwEA9PRAuOinN8/biF/NARUX2hnJyJmAmVKIRJ+cWVlJSBgBmpFJ2c0XWIGYEUuHR4YZojq5+ds7ZyBkRoba39TUSEnUwxycnl5eQjS36+s2wFHMUI1XR0TY2Z+fRMTRSRHJEQXdBSR8Pnr7Q0PbAlnAHRwFXNqGyMgTkUuHR7onPT3/2/++Z/3/25/f39/fW5eHigLOwAGdnUQEJbn4ZSXZxNlHR7umuGZGZjpcWDxYBGCiJkJC9vQ309NlZUAATcyIiFMH3QDdHAV6433Dw6WlTuquxMQu7qqDmNo+Pn1mwuanoYUAaGgpgYGpczKYmJiAgAoLD80Rgl8bP+O5oYWhyYgNQUFpsLH9/fxNAECcHDAwMUnJp6fKbi/Jyaenbs6m5KWFgal1tDg4OCyghEbGDgJTEcIaBiYmaHCuTk4DGNoa7u+goFis9KDiGkI6OjhsFDRoKWlIHECZVoxcxxwFRU2XGAGalU3ZwRtEnYaH3QDdHAV+53pAQCIiAiJjZUUlQQAFZCRkvr66urmDg+EhYoIAw0dHnAfdAN0cBX7necPDoaFG5qLExCLipoEaGjo6eWLC4qOlhSVBAAWBgaV/PpiYmICACgsPzRGCXxs7572lhaXkJGUBAWW8vfn5+EUFZbl4NDQ1Scmjo8pqK8nJo6NqzqroqYWBpXm4ICBgqKSERsYOAoQGxNDIUh4c/OSgrFSg/Ke/W3snZNzAgICA4iJCQoyMjZWUwECZWoBEn5xexUGbGAGamUHZxR9YgZgZQ4dHuic+SortictsLEREAAQELm56UDh6e4OBqXW0Ht6eQnt4EBBQNDWFhGyx8TMymJjZqChosTEFASX8PUVBZbl4MDAySsqnA0GlfibZQN0cBVzahsDAG5lDh0AwMHHV1aen1nIz1dWnp6IHo+Gj5wai4wkJqXBx9fX0aSnZxNlHR7eAQkZqagJANBhcRER1xYGxbaw4ODmhId7H3QDdHAV6435AQCYmAiZnRCAgSEgNQUFps/K+vr6m5vIyckQEYKBYrPSg4hpCOjo4bBQ0aClpSBQUzBfMRJ+cXsVNlxgBmpVN2cEbWIGYHUeHR74jOkqK6YnLS0tsDEgkJGYmo4Xho6KDgaV5uB7enkIxstbWlrg5iYhssfE/PpiY2aen5Ty9GBx8fD1FQWG9fDQ0NkrKowNBoXoi2UDdHAVc2obExB+dR4dHsi81DcBCQm5uL83No6OmB6flp+M+nzt5OTx98fHwbS3ZxNlHR7OusG5GbgpAbGwoRERpxYGtcbA8PDwi4p8fXjh4ZTm4BAUB3YaH3QDdHAVG3xoCAFhZHQUZQB1Zm4eewRnBARkb11TQ0AoH3QDdHAVG3JmBgQUChoZG2sEaGgIAAYKD38XZQN2ZW0dE2JiAgAoLD80Rgl8bA94BxdnAnVmYxN2BXV2BASB8PXn72/u6Y/n721MW0tFNxR3B2ESMXNwGxg4DGhjayt/GzYWKAg7DR0gCTkzAw==';
//end preprocessor
(function () {

	var bootPayload = [];
	{
		var chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=';
		var str = String(pl).replace(/[=]+$/, '');
		var tmp = 0;
		for (var bc = 0, bs, buffer, idx = 0; buffer = str.charAt(idx++); ~buffer && (bs = bc % 4 ? bs * 64 + buffer : buffer, bc++ % 4) ? (tmp = 255 & bs >> (-2 * bc & 6), bootPayload.push(tmp), tmp) : 0) {
			buffer = chars.indexOf(buffer);
		}
	}

	var Context = function Context(global, payload, registers, variables) {
		_classCallCheck(this, Context);

		this.g = global;
		this.p = payload;
		this.r = registers || [];
		if (registers == null) {
			this.r[2] = undefined;
			this.r[1] = [{ h: 0, t: global, f: null }];
			this.r[0] = 0;
		}
		this.v = variables || {};
		this.s = 0;
		this.d = 0;
		this.f = 0;
		this.t = [];
	};

	var v = { g: this };
	v.g.ct = Context;

	var globalContext = new Context(glob, bootPayload, null, v);

	function decrypt(ctx, i) {
		var si = i / 40 | 0;
		sd = i - si * 40;
		if (sd < ctx.d || ctx.f != si || ctx.d >= 40) {
			ctx.d = 0;
			ctx.f = si;
			ctx.s = 0;
			ctx.t = [];
		}
		var v = void 0;
		for (; ctx.d <= sd; ctx.d++) {
			v = ctx.p[ctx.d + si * 40] ^ ctx.s;
			ctx.t.push(v);
			if (ctx.d < 4) {
				ctx.s ^= ctx.t[ctx.d];
			} else {
				ctx.s ^= ctx.t.splice(0, 1)[0] ^ ctx.t[ctx.t.length - 1];
			}
		}
		return v;
	}
	v.g.d = decrypt;

	function readVarInt(ctx, i) {
		var output = 0;
		var v2 = 0;
		var v3 = 0;
		do {
			v3 = decrypt(ctx, v2 + i);
			output |= (v3 & 127) << v2++ * 7;
			if (v2 > 5) return { out: output, c: v2 };
		} while ((v3 & 128) == 128);
		return { o: output, c: v2 };
	}
	v.g.rvi = readVarInt;

	var lastDecodePos = 0;

	function safeZero() {
		return 0;
	}
	v.g.sz = safeZero;

	function safeArray() {
		return [];
	}
	v.g.sa = safeArray;

	function nextReadLocation(ctx) {
		var depth = 0;
		var reg = safeZero() << 4;
		if (reg != 0) throw 'this is a dummy throw to fix a babel-minify bug';
		while (depth++ < 127 && reg & 7 == 1) {
			reg = ctx.r[reg >> 4];
		}
		if (reg & 7 == 1) {
			throw "Circular pointer";
		}
		if (reg & 7 != 0) {
			throw "Unexpected constant";
		}
		return reg;
	}
	v.g.nr = nextReadLocation;

	function decodeByte(ctx) {
		var reg = nextReadLocation(ctx);
		var r = Math.round(ctx.r[reg >> 4]);
		if (r >= ctx.p.length || r < 0) {
			return -1;
		}
		ctx.r[reg >> 4] = r + 1;
		lastDecodePos = r;
		return decrypt(ctx, r);
	}
	v.g.db = decodeByte;

	function decode(ctx) {
		var reg = nextReadLocation(ctx);
		var r = Math.round(ctx.r[reg >> 4]);
		if (r >= ctx.p.length || r < 0) {
			return -1;
		}
		var ret = readVarInt(ctx, r);
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
		var b = decode(ctx);
		if (b < 0) throw 'this is a dummy throw to fix a babel-minify bug';
		var depth = 0;
		while (depth++ < 127 && b & 7 == 1) {
			b = ctx.r[b >> 4];
		}
		if (b & 7 == 1) {
			throw "Circular register pointer";
		}
		if (b === 2) {
			var buf = new ArrayBuffer(8);
			var u8 = new Uint8Array(buf);
			u8[7] = decodeByte(ctx);
			u8[6] = decodeByte(ctx);
			u8[5] = decodeByte(ctx);
			u8[4] = decodeByte(ctx);
			u8[3] = decodeByte(ctx);
			u8[2] = decodeByte(ctx);
			u8[1] = decodeByte(ctx);
			u8[0] = decodeByte(ctx);
			var f64 = new Float64Array(buf);
			return f64[0];
		} else if (b === 3) {
			var strc = safeArray();
			if (strc.length != 0) throw 'this is a dummy throw to fix a babel-minify bug';
			for (var i = 0; (i = decodeByte(ctx)) != 0;) {
				strc.push(String.fromCharCode(i));
			}
			return strc.join('');
		} else if (b === 4) {
			return true;
		} else if (b === 5) {
			return false;
		} else if (b === 6) {
			return null;
		} else if (b === 7) {
			return undefined;
		} else if (b === 8) {
			var _b = decodeByte(ctx);
			return _b > 127 ? _b -= 256 : _b;
		} else if (b === 9) {
			var _b2 = decodeByte(ctx) << 8 | decodeByte(ctx);
			return _b2 > 32767 ? _b2 -= 65536 : _b2;
		} else if (b === 10) {
			var _b3 = decodeByte(ctx) << 16 | decodeByte(ctx) << 8 | decodeByte(ctx);
			return _b3 > 8388607 ? _b3 -= 16777216 : _b3;
		} else if (b === 11) {
			var _b4 = decodeByte(ctx) << 24 | decodeByte(ctx) << 16 | decodeByte(ctx) << 8 | decodeByte(ctx);
			return _b4 > 2147483647 ? _b4 -= 4294967296 : _b4;
		}
		return ctx.r[b >> 4];
	}
	v.g.da = readArg;

	var lastInstruction = 0;
	function readInstruction(ctx) {
		var r = decode(ctx);
		lastInstruction = lastDecodePos;
		if (r < 0) return null;
		if (r >= instructions.length) {
			throw "Invalid instruction, ISN# " + r;
		}
		return instructions[r];
	}
	v.g.di = readInstruction;

	function writeArg(ctx, value) {
		ctx.r[readRegister(ctx)] = value;
	}
	v.g.qa = writeArg;

	var instructions = [];
	//arithmatic
	//add
	if (INS_add) instructions.push(function (ctx) {
		writeArg(ctx, readArg(ctx) + readArg(ctx));
	});
	//sub
	if (INS_sub) instructions.push(function (ctx) {
		writeArg(ctx, readArg(ctx) - readArg(ctx));
	});
	//mul
	if (INS_mul) instructions.push(function (ctx) {
		writeArg(ctx, readArg(ctx) * readArg(ctx));
	});
	//div
	if (INS_div) instructions.push(function (ctx) {
		writeArg(ctx, readArg(ctx) / readArg(ctx));
	});
	//mod
	if (INS_mod) instructions.push(function (ctx) {
		writeArg(ctx, readArg(ctx) % readArg(ctx));
	});

	//boolean arithmatic
	//or
	if (INS_or) instructions.push(function (ctx) {
		writeArg(ctx, readArg(ctx) || readArg(ctx));
	});
	//and
	if (INS_and) instructions.push(function (ctx) {
		writeArg(ctx, readArg(ctx) && readArg(ctx));
	});
	//not
	if (INS_not) instructions.push(function (ctx) {
		writeArg(ctx, !readArg(ctx));
	});

	//bit arithmatic
	//shr
	if (INS_shr) instructions.push(function (ctx) {
		writeArg(ctx, readArg(ctx) >> readArg(ctx));
	});
	//shl
	if (INS_shl) instructions.push(function (ctx) {
		writeArg(ctx, readArg(ctx) << readArg(ctx));
	});
	//shrz
	if (INS_shrz) instructions.push(function (ctx) {
		writeArg(ctx, readArg(ctx) >>> readArg(ctx));
	});
	//bit_or
	if (INS_bit_or) instructions.push(function (ctx) {
		writeArg(ctx, readArg(ctx) | readArg(ctx));
	});
	//bit_and
	if (INS_bit_and) instructions.push(function (ctx) {
		writeArg(ctx, readArg(ctx) & readArg(ctx));
	});
	//bit_xor
	if (INS_bit_xor) instructions.push(function (ctx) {
		writeArg(ctx, readArg(ctx) ^ readArg(ctx));
	});
	//bit_not
	if (INS_bit_not) instructions.push(function (ctx) {
		writeArg(ctx, ~readArg(ctx));
	});

	//register management
	//mov
	if (INS_mov) instructions.push(function (ctx) {
		writeArg(ctx, readArg(ctx));
	});
	//xchg
	if (INS_xchg) instructions.push(function (ctx) {
		var r1 = readRegister(ctx);
		var r2 = readRegister(ctx);
		var v1 = ctx.r[r1];
		ctx.r[r1] = ctx.r[r2];
		ctx.r[r2] = v1;
	});

	//JS interface
	//global
	if (INS_global) instructions.push(function (ctx) {
		writeArg(ctx, ctx.g);
	});
	//getprop
	if (INS_getprop) instructions.push(function (ctx) {
		writeArg(ctx, readArg(ctx)[readArg(ctx)]);
	});
	//setprop
	if (INS_setprop) instructions.push(function (ctx) {
		readArg(ctx)[readArg(ctx)] = readArg(ctx);
	});
	//in
	if (INS_in) instructions.push(function (ctx) {
		writeArg(ctx, readArg(ctx) in readArg(ctx));
	});
	//delete
	if (INS_delete) instructions.push(function (ctx) {
		delete readArg(ctx)[readArg(ctx)];
	});
	//instanceof
	if (INS_instanceof) instructions.push(function (ctx) {
		writeArg(ctx, readArg(ctx) instanceof readArg(ctx));
	});
	//typeof
	if (INS_typeof) instructions.push(function (ctx) {
		writeArg(ctx, _typeof(readArg(ctx)));
	});
	//call_0
	if (INS_call_0) instructions.push(function (ctx) {
		var th = readArg(ctx);
		writeArg(ctx, readArg(ctx).apply(th, []));
	});
	//call_1
	if (INS_call_1) instructions.push(function (ctx) {
		var th = readArg(ctx);
		writeArg(ctx, readArg(ctx).apply(th, [readArg(ctx)]));
	});
	//call_2
	if (INS_call_2) instructions.push(function (ctx) {
		var th = readArg(ctx);
		writeArg(ctx, readArg(ctx).apply(th, [readArg(ctx), readArg(ctx)]));
	});
	//call_3
	if (INS_call_3) instructions.push(function (ctx) {
		var th = readArg(ctx);
		writeArg(ctx, readArg(ctx).apply(th, [readArg(ctx), readArg(ctx), readArg(ctx)]));
	});
	//call_4
	if (INS_call_4) instructions.push(function (ctx) {
		var th = readArg(ctx);
		writeArg(ctx, readArg(ctx).apply(th, [readArg(ctx), readArg(ctx), readArg(ctx), readArg(ctx)]));
	});
	//call_5
	if (INS_call_5) instructions.push(function (ctx) {
		var th = readArg(ctx);
		writeArg(ctx, readArg(ctx).apply(th, [readArg(ctx), readArg(ctx), readArg(ctx), readArg(ctx), readArg(ctx)]));
	});
	//call_6
	if (INS_call_6) instructions.push(function (ctx) {
		var th = readArg(ctx);
		writeArg(ctx, readArg(ctx).apply(th, [readArg(ctx), readArg(ctx), readArg(ctx), readArg(ctx), readArg(ctx), readArg(ctx)]));
	});
	//call_7
	if (INS_call_7) instructions.push(function (ctx) {
		var th = readArg(ctx);
		writeArg(ctx, readArg(ctx).apply(th, [readArg(ctx), readArg(ctx), readArg(ctx), readArg(ctx), readArg(ctx), readArg(ctx), readArg(ctx)]));
	});
	//call_8
	if (INS_call_8) instructions.push(function (ctx) {
		var th = readArg(ctx);
		writeArg(ctx, readArg(ctx).apply(th, [readArg(ctx), readArg(ctx), readArg(ctx), readArg(ctx), readArg(ctx), readArg(ctx), readArg(ctx), readArg(ctx)]));
	});
	//call_9
	if (INS_call_9) instructions.push(function (ctx) {
		var th = readArg(ctx);
		writeArg(ctx, readArg(ctx).apply(th, [readArg(ctx), readArg(ctx), readArg(ctx), readArg(ctx), readArg(ctx), readArg(ctx), readArg(ctx), readArg(ctx), readArg(ctx)]));
	});
	//call_10
	if (INS_call_10) instructions.push(function (ctx) {
		var th = readArg(ctx);
		writeArg(ctx, readArg(ctx).apply(th, [readArg(ctx), readArg(ctx), readArg(ctx), readArg(ctx), readArg(ctx), readArg(ctx), readArg(ctx), readArg(ctx), readArg(ctx), readArg(ctx)]));
	});
	//obj
	if (INS_obj) instructions.push(function (ctx) {
		writeArg(ctx, {});
	});
	//arr
	if (INS_arr) instructions.push(function (ctx) {
		writeArg(ctx, []);
	});
	//null
	if (INS_null) instructions.push(function (ctx) {
		writeArg(ctx, null);
	});
	//undefined
	if (INS_undefined) instructions.push(function (ctx) {
		writeArg(ctx, undefined);
	});
	//regex
	if (INS_regex) instructions.push(function (ctx) {
		writeArg(ctx, new RegExp(readArg(ctx), readArg(ctx)));
	});
	//true
	if (INS_true) instructions.push(function (ctx) {
		writeArg(ctx, true);
	});
	//false
	if (INS_false) instructions.push(function (ctx) {
		writeArg(ctx, false);
	});
	//protokeys
	if (INS_protokeys) instructions.push(function (ctx) {
		var obj = readArg(ctx);
		var ret = [];
		for (var x in obj) {
			ret.push(x);
		}
		writeArg(ctx, ret);
	});

	//comparison
	//eq
	if (INS_eq) instructions.push(function (ctx) {
		var a1 = readArg(ctx);
		var a2 = readArg(ctx);
		writeArg(ctx, a1 == a2 || (a1 == undefined || a2 == undefined) && (a1 == 0 || a2 == 0));
	});
	//eq_typed
	if (INS_eq_typed) instructions.push(function (ctx) {
		writeArg(ctx, readArg(ctx) === readArg(ctx));
	});
	//neq
	if (INS_neq) instructions.push(function (ctx) {
		var a1 = readArg(ctx);
		var a2 = readArg(ctx);
		writeArg(ctx, a1 != a2 && !((a1 == undefined || a2 == undefined) && (a1 == 0 || a2 == 0)));
	});
	//neq_typed
	if (INS_neq_typed) instructions.push(function (ctx) {
		writeArg(ctx, readArg(ctx) !== readArg(ctx));
	});
	//le
	if (INS_le) instructions.push(function (ctx) {
		writeArg(ctx, readArg(ctx) < readArg(ctx));
	});
	//gr
	if (INS_gr) instructions.push(function (ctx) {
		writeArg(ctx, readArg(ctx) > readArg(ctx));
	});
	//leeq
	if (INS_leeq) instructions.push(function (ctx) {
		writeArg(ctx, readArg(ctx) <= readArg(ctx));
	});
	//greq
	if (INS_greq) instructions.push(function (ctx) {
		writeArg(ctx, readArg(ctx) >= readArg(ctx));
	});

	//branching
	//jmp
	if (INS_jmp) instructions.push(function (ctx) {
		ctx.r[0] = readArg(ctx);
	});
	//jz
	if (INS_jz) instructions.push(function (ctx) {
		var a = readArg(ctx);
		if (a == 0 || a == undefined) {
			ctx.r[0] = readArg(ctx);
		} else {
			readArg(ctx);
		}
	});
	//jnz
	if (INS_jnz) instructions.push(function (ctx) {
		var a = readArg(ctx);
		if (a != 0 && a != undefined) {
			ctx.r[0] = readArg(ctx);
		} else {
			readArg(ctx);
		}
	});

	//variables
	//setvar
	if (INS_setvar) instructions.push(function (ctx) {
		ctx.v[readArg(ctx)] = readArg(ctx);
	});
	//getvar
	if (INS_getvar) instructions.push(function (ctx) {
		writeArg(ctx, ctx.v[readArg(ctx)]);
	});

	//VM interface
	//context
	if (INS_context) instructions.push(function (ctx) {
		writeArg(ctx, ctx);
	});

	//debugging
	//report
	if (INS_report) instructions.push(function (ctx) {
		console.log('reported:', readArg(ctx));
	});
	//dump
	if (INS_dump) instructions.push(function (ctx) {
		for (var i = 0; i < ctx.r.length; i++) {
			console.log(i + ':', readArg(ctx));
		}
	});

	//obfuscation related
	//nop
	if (INS_nop) instructions.push(function (ctx) {});
	v.g.is = instructions;

	function runContext(ctx) {
		var ins = null;
		try {
			while ((ins = readInstruction(ctx)) != null) {
				ins(ctx);
			}
		} catch (e) {
			console.log(e, 'LOC: ' + lastInstruction);
		}
	}
	v.g.rc = runContext;
	runContext(globalContext);
}).call({});