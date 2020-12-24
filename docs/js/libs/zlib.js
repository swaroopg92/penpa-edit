/** @license zlib.js 2012 - imaya [ https://github.com/imaya/zlib.js ] The MIT License */
(function() {
    'use strict';
    var n = void 0,
        u = !0,
        aa = this;

    function ba(e, d) {
        var c = e.split("."),
            f = aa;
        !(c[0] in f) && f.execScript && f.execScript("var " + c[0]);
        for (var a; c.length && (a = c.shift());) !c.length && d !== n ? f[a] = d : f = f[a] ? f[a] : f[a] = {}
    };
    var C = "undefined" !== typeof Uint8Array && "undefined" !== typeof Uint16Array && "undefined" !== typeof Uint32Array && "undefined" !== typeof DataView;

    function K(e, d) {
        this.index = "number" === typeof d ? d : 0;
        this.d = 0;
        this.buffer = e instanceof(C ? Uint8Array : Array) ? e : new(C ? Uint8Array : Array)(32768);
        if (2 * this.buffer.length <= this.index) throw Error("invalid index");
        this.buffer.length <= this.index && ca(this)
    }

    function ca(e) {
        var d = e.buffer,
            c, f = d.length,
            a = new(C ? Uint8Array : Array)(f << 1);
        if (C) a.set(d);
        else
            for (c = 0; c < f; ++c) a[c] = d[c];
        return e.buffer = a
    }
    K.prototype.a = function(e, d, c) {
        var f = this.buffer,
            a = this.index,
            b = this.d,
            k = f[a],
            m;
        c && 1 < d && (e = 8 < d ? (L[e & 255] << 24 | L[e >>> 8 & 255] << 16 | L[e >>> 16 & 255] << 8 | L[e >>> 24 & 255]) >> 32 - d : L[e] >> 8 - d);
        if (8 > d + b) k = k << d | e, b += d;
        else
            for (m = 0; m < d; ++m) k = k << 1 | e >> d - m - 1 & 1, 8 === ++b && (b = 0, f[a++] = L[k], k = 0, a === f.length && (f = ca(this)));
        f[a] = k;
        this.buffer = f;
        this.d = b;
        this.index = a
    };
    K.prototype.finish = function() {
        var e = this.buffer,
            d = this.index,
            c;
        0 < this.d && (e[d] <<= 8 - this.d, e[d] = L[e[d]], d++);
        C ? c = e.subarray(0, d) : (e.length = d, c = e);
        return c
    };
    var ga = new(C ? Uint8Array : Array)(256),
        M;
    for (M = 0; 256 > M; ++M) {
        for (var R = M, S = R, ha = 7, R = R >>> 1; R; R >>>= 1) S <<= 1, S |= R & 1, --ha;
        ga[M] = (S << ha & 255) >>> 0
    }
    var L = ga;

    function ja(e) {
        this.buffer = new(C ? Uint16Array : Array)(2 * e);
        this.length = 0
    }
    ja.prototype.getParent = function(e) { return 2 * ((e - 2) / 4 | 0) };
    ja.prototype.push = function(e, d) {
        var c, f, a = this.buffer,
            b;
        c = this.length;
        a[this.length++] = d;
        for (a[this.length++] = e; 0 < c;)
            if (f = this.getParent(c), a[c] > a[f]) b = a[c], a[c] = a[f], a[f] = b, b = a[c + 1], a[c + 1] = a[f + 1], a[f + 1] = b, c = f;
            else break;
        return this.length
    };
    ja.prototype.pop = function() {
        var e, d, c = this.buffer,
            f, a, b;
        d = c[0];
        e = c[1];
        this.length -= 2;
        c[0] = c[this.length];
        c[1] = c[this.length + 1];
        for (b = 0;;) {
            a = 2 * b + 2;
            if (a >= this.length) break;
            a + 2 < this.length && c[a + 2] > c[a] && (a += 2);
            if (c[a] > c[b]) f = c[b], c[b] = c[a], c[a] = f, f = c[b + 1], c[b + 1] = c[a + 1], c[a + 1] = f;
            else break;
            b = a
        }
        return { index: e, value: d, length: this.length }
    };

    function ka(e, d) {
        this.e = ma;
        this.f = 0;
        this.input = C && e instanceof Array ? new Uint8Array(e) : e;
        this.c = 0;
        d && (d.lazy && (this.f = d.lazy), "number" === typeof d.compressionType && (this.e = d.compressionType), d.outputBuffer && (this.b = C && d.outputBuffer instanceof Array ? new Uint8Array(d.outputBuffer) : d.outputBuffer), "number" === typeof d.outputIndex && (this.c = d.outputIndex));
        this.b || (this.b = new(C ? Uint8Array : Array)(32768))
    }
    var ma = 2,
        T = [],
        U;
    for (U = 0; 288 > U; U++) switch (u) {
        case 143 >= U:
            T.push([U + 48, 8]);
            break;
        case 255 >= U:
            T.push([U - 144 + 400, 9]);
            break;
        case 279 >= U:
            T.push([U - 256 + 0, 7]);
            break;
        case 287 >= U:
            T.push([U - 280 + 192, 8]);
            break;
        default:
            throw "invalid literal: " + U;
    }
    ka.prototype.h = function() {
        var e, d, c, f, a = this.input;
        switch (this.e) {
            case 0:
                c = 0;
                for (f = a.length; c < f;) {
                    d = C ? a.subarray(c, c + 65535) : a.slice(c, c + 65535);
                    c += d.length;
                    var b = d,
                        k = c === f,
                        m = n,
                        g = n,
                        p = n,
                        v = n,
                        x = n,
                        l = this.b,
                        h = this.c;
                    if (C) {
                        for (l = new Uint8Array(this.b.buffer); l.length <= h + b.length + 5;) l = new Uint8Array(l.length << 1);
                        l.set(this.b)
                    }
                    m = k ? 1 : 0;
                    l[h++] = m | 0;
                    g = b.length;
                    p = ~g + 65536 & 65535;
                    l[h++] = g & 255;
                    l[h++] = g >>> 8 & 255;
                    l[h++] = p & 255;
                    l[h++] = p >>> 8 & 255;
                    if (C) l.set(b, h), h += b.length, l = l.subarray(0, h);
                    else {
                        v = 0;
                        for (x = b.length; v < x; ++v) l[h++] =
                            b[v];
                        l.length = h
                    }
                    this.c = h;
                    this.b = l
                }
                break;
            case 1:
                var q = new K(C ? new Uint8Array(this.b.buffer) : this.b, this.c);
                q.a(1, 1, u);
                q.a(1, 2, u);
                var t = na(this, a),
                    w, da, z;
                w = 0;
                for (da = t.length; w < da; w++)
                    if (z = t[w], K.prototype.a.apply(q, T[z]), 256 < z) q.a(t[++w], t[++w], u), q.a(t[++w], 5), q.a(t[++w], t[++w], u);
                    else if (256 === z) break;
                this.b = q.finish();
                this.c = this.b.length;
                break;
            case ma:
                var B = new K(C ? new Uint8Array(this.b.buffer) : this.b, this.c),
                    ra, J, N, O, P, Ia = [16, 17, 18, 0, 8, 7, 9, 6, 10, 5, 11, 4, 12, 3, 13, 2, 14, 1, 15],
                    W, sa, X, ta, ea, ia = Array(19),
                    ua, Q, fa, y, va;
                ra = ma;
                B.a(1, 1, u);
                B.a(ra, 2, u);
                J = na(this, a);
                W = oa(this.j, 15);
                sa = pa(W);
                X = oa(this.i, 7);
                ta = pa(X);
                for (N = 286; 257 < N && 0 === W[N - 1]; N--);
                for (O = 30; 1 < O && 0 === X[O - 1]; O--);
                var wa = N,
                    xa = O,
                    F = new(C ? Uint32Array : Array)(wa + xa),
                    r, G, s, Y, E = new(C ? Uint32Array : Array)(316),
                    D, A, H = new(C ? Uint8Array : Array)(19);
                for (r = G = 0; r < wa; r++) F[G++] = W[r];
                for (r = 0; r < xa; r++) F[G++] = X[r];
                if (!C) { r = 0; for (Y = H.length; r < Y; ++r) H[r] = 0 }
                r = D = 0;
                for (Y = F.length; r < Y; r += G) {
                    for (G = 1; r + G < Y && F[r + G] === F[r]; ++G);
                    s = G;
                    if (0 === F[r])
                        if (3 > s)
                            for (; 0 < s--;) E[D++] = 0,
                                H[0]++;
                        else
                            for (; 0 < s;) A = 138 > s ? s : 138, A > s - 3 && A < s && (A = s - 3), 10 >= A ? (E[D++] = 17, E[D++] = A - 3, H[17]++) : (E[D++] = 18, E[D++] = A - 11, H[18]++), s -= A;
                    else if (E[D++] = F[r], H[F[r]]++, s--, 3 > s)
                        for (; 0 < s--;) E[D++] = F[r], H[F[r]]++;
                    else
                        for (; 0 < s;) A = 6 > s ? s : 6, A > s - 3 && A < s && (A = s - 3), E[D++] = 16, E[D++] = A - 3, H[16]++, s -= A
                }
                e = C ? E.subarray(0, D) : E.slice(0, D);
                ea = oa(H, 7);
                for (y = 0; 19 > y; y++) ia[y] = ea[Ia[y]];
                for (P = 19; 4 < P && 0 === ia[P - 1]; P--);
                ua = pa(ea);
                B.a(N - 257, 5, u);
                B.a(O - 1, 5, u);
                B.a(P - 4, 4, u);
                for (y = 0; y < P; y++) B.a(ia[y], 3, u);
                y = 0;
                for (va = e.length; y < va; y++)
                    if (Q =
                        e[y], B.a(ua[Q], ea[Q], u), 16 <= Q) {
                        y++;
                        switch (Q) {
                            case 16:
                                fa = 2;
                                break;
                            case 17:
                                fa = 3;
                                break;
                            case 18:
                                fa = 7;
                                break;
                            default:
                                throw "invalid code: " + Q;
                        }
                        B.a(e[y], fa, u)
                    }
                var ya = [sa, W],
                    za = [ta, X],
                    I, Aa, Z, la, Ba, Ca, Da, Ea;
                Ba = ya[0];
                Ca = ya[1];
                Da = za[0];
                Ea = za[1];
                I = 0;
                for (Aa = J.length; I < Aa; ++I)
                    if (Z = J[I], B.a(Ba[Z], Ca[Z], u), 256 < Z) B.a(J[++I], J[++I], u), la = J[++I], B.a(Da[la], Ea[la], u), B.a(J[++I], J[++I], u);
                    else if (256 === Z) break;
                this.b = B.finish();
                this.c = this.b.length;
                break;
            default:
                throw "invalid compression type";
        }
        return this.b
    };

    function qa(e, d) {
        this.length = e;
        this.g = d
    }
    var Fa = function() {
            function e(a) {
                switch (u) {
                    case 3 === a:
                        return [257, a - 3, 0];
                    case 4 === a:
                        return [258, a - 4, 0];
                    case 5 === a:
                        return [259, a - 5, 0];
                    case 6 === a:
                        return [260, a - 6, 0];
                    case 7 === a:
                        return [261, a - 7, 0];
                    case 8 === a:
                        return [262, a - 8, 0];
                    case 9 === a:
                        return [263, a - 9, 0];
                    case 10 === a:
                        return [264, a - 10, 0];
                    case 12 >= a:
                        return [265, a - 11, 1];
                    case 14 >= a:
                        return [266, a - 13, 1];
                    case 16 >= a:
                        return [267, a - 15, 1];
                    case 18 >= a:
                        return [268, a - 17, 1];
                    case 22 >= a:
                        return [269, a - 19, 2];
                    case 26 >= a:
                        return [270, a - 23, 2];
                    case 30 >= a:
                        return [271, a - 27, 2];
                    case 34 >= a:
                        return [272,
                            a - 31, 2
                        ];
                    case 42 >= a:
                        return [273, a - 35, 3];
                    case 50 >= a:
                        return [274, a - 43, 3];
                    case 58 >= a:
                        return [275, a - 51, 3];
                    case 66 >= a:
                        return [276, a - 59, 3];
                    case 82 >= a:
                        return [277, a - 67, 4];
                    case 98 >= a:
                        return [278, a - 83, 4];
                    case 114 >= a:
                        return [279, a - 99, 4];
                    case 130 >= a:
                        return [280, a - 115, 4];
                    case 162 >= a:
                        return [281, a - 131, 5];
                    case 194 >= a:
                        return [282, a - 163, 5];
                    case 226 >= a:
                        return [283, a - 195, 5];
                    case 257 >= a:
                        return [284, a - 227, 5];
                    case 258 === a:
                        return [285, a - 258, 0];
                    default:
                        throw "invalid length: " + a;
                }
            }
            var d = [],
                c, f;
            for (c = 3; 258 >= c; c++) f = e(c), d[c] = f[2] << 24 |
                f[1] << 16 | f[0];
            return d
        }(),
        Ga = C ? new Uint32Array(Fa) : Fa;

    function na(e, d) {
        function c(a, c) {
            var b = a.g,
                d = [],
                f = 0,
                e;
            e = Ga[a.length];
            d[f++] = e & 65535;
            d[f++] = e >> 16 & 255;
            d[f++] = e >> 24;
            var g;
            switch (u) {
                case 1 === b:
                    g = [0, b - 1, 0];
                    break;
                case 2 === b:
                    g = [1, b - 2, 0];
                    break;
                case 3 === b:
                    g = [2, b - 3, 0];
                    break;
                case 4 === b:
                    g = [3, b - 4, 0];
                    break;
                case 6 >= b:
                    g = [4, b - 5, 1];
                    break;
                case 8 >= b:
                    g = [5, b - 7, 1];
                    break;
                case 12 >= b:
                    g = [6, b - 9, 2];
                    break;
                case 16 >= b:
                    g = [7, b - 13, 2];
                    break;
                case 24 >= b:
                    g = [8, b - 17, 3];
                    break;
                case 32 >= b:
                    g = [9, b - 25, 3];
                    break;
                case 48 >= b:
                    g = [10, b - 33, 4];
                    break;
                case 64 >= b:
                    g = [11, b - 49, 4];
                    break;
                case 96 >= b:
                    g = [12, b -
                        65, 5
                    ];
                    break;
                case 128 >= b:
                    g = [13, b - 97, 5];
                    break;
                case 192 >= b:
                    g = [14, b - 129, 6];
                    break;
                case 256 >= b:
                    g = [15, b - 193, 6];
                    break;
                case 384 >= b:
                    g = [16, b - 257, 7];
                    break;
                case 512 >= b:
                    g = [17, b - 385, 7];
                    break;
                case 768 >= b:
                    g = [18, b - 513, 8];
                    break;
                case 1024 >= b:
                    g = [19, b - 769, 8];
                    break;
                case 1536 >= b:
                    g = [20, b - 1025, 9];
                    break;
                case 2048 >= b:
                    g = [21, b - 1537, 9];
                    break;
                case 3072 >= b:
                    g = [22, b - 2049, 10];
                    break;
                case 4096 >= b:
                    g = [23, b - 3073, 10];
                    break;
                case 6144 >= b:
                    g = [24, b - 4097, 11];
                    break;
                case 8192 >= b:
                    g = [25, b - 6145, 11];
                    break;
                case 12288 >= b:
                    g = [26, b - 8193, 12];
                    break;
                case 16384 >=
                b:
                    g = [27, b - 12289, 12];
                    break;
                case 24576 >= b:
                    g = [28, b - 16385, 13];
                    break;
                case 32768 >= b:
                    g = [29, b - 24577, 13];
                    break;
                default:
                    throw "invalid distance";
            }
            e = g;
            d[f++] = e[0];
            d[f++] = e[1];
            d[f++] = e[2];
            var k, m;
            k = 0;
            for (m = d.length; k < m; ++k) l[h++] = d[k];
            t[d[0]]++;
            w[d[3]]++;
            q = a.length + c - 1;
            x = null
        }
        var f, a, b, k, m, g = {},
            p, v, x, l = C ? new Uint16Array(2 * d.length) : [],
            h = 0,
            q = 0,
            t = new(C ? Uint32Array : Array)(286),
            w = new(C ? Uint32Array : Array)(30),
            da = e.f,
            z;
        if (!C) { for (b = 0; 285 >= b;) t[b++] = 0; for (b = 0; 29 >= b;) w[b++] = 0 }
        t[256] = 1;
        f = 0;
        for (a = d.length; f < a; ++f) {
            b =
                m = 0;
            for (k = 3; b < k && f + b !== a; ++b) m = m << 8 | d[f + b];
            g[m] === n && (g[m] = []);
            p = g[m];
            if (!(0 < q--)) {
                for (; 0 < p.length && 32768 < f - p[0];) p.shift();
                if (f + 3 >= a) {
                    x && c(x, -1);
                    b = 0;
                    for (k = a - f; b < k; ++b) z = d[f + b], l[h++] = z, ++t[z];
                    break
                }
                0 < p.length ? (v = Ha(d, f, p), x ? x.length < v.length ? (z = d[f - 1], l[h++] = z, ++t[z], c(v, 0)) : c(x, -1) : v.length < da ? x = v : c(v, 0)) : x ? c(x, -1) : (z = d[f], l[h++] = z, ++t[z])
            }
            p.push(f)
        }
        l[h++] = 256;
        t[256]++;
        e.j = t;
        e.i = w;
        return C ? l.subarray(0, h) : l
    }

    function Ha(e, d, c) {
        var f, a, b = 0,
            k, m, g, p, v = e.length;
        m = 0;
        p = c.length;
        a: for (; m < p; m++) {
            f = c[p - m - 1];
            k = 3;
            if (3 < b) {
                for (g = b; 3 < g; g--)
                    if (e[f + g - 1] !== e[d + g - 1]) continue a;
                k = b
            }
            for (; 258 > k && d + k < v && e[f + k] === e[d + k];) ++k;
            k > b && (a = f, b = k);
            if (258 === k) break
        }
        return new qa(b, d - a)
    }

    function oa(e, d) {
        var c = e.length,
            f = new ja(572),
            a = new(C ? Uint8Array : Array)(c),
            b, k, m, g, p;
        if (!C)
            for (g = 0; g < c; g++) a[g] = 0;
        for (g = 0; g < c; ++g) 0 < e[g] && f.push(g, e[g]);
        b = Array(f.length / 2);
        k = new(C ? Uint32Array : Array)(f.length / 2);
        if (1 === b.length) return a[f.pop().index] = 1, a;
        g = 0;
        for (p = f.length / 2; g < p; ++g) b[g] = f.pop(), k[g] = b[g].value;
        m = Ja(k, k.length, d);
        g = 0;
        for (p = b.length; g < p; ++g) a[b[g].index] = m[g];
        return a
    }

    function Ja(e, d, c) {
        function f(a) {
            var b = g[a][p[a]];
            b === d ? (f(a + 1), f(a + 1)) : --k[b];
            ++p[a]
        }
        var a = new(C ? Uint16Array : Array)(c),
            b = new(C ? Uint8Array : Array)(c),
            k = new(C ? Uint8Array : Array)(d),
            m = Array(c),
            g = Array(c),
            p = Array(c),
            v = (1 << c) - d,
            x = 1 << c - 1,
            l, h, q, t, w;
        a[c - 1] = d;
        for (h = 0; h < c; ++h) v < x ? b[h] = 0 : (b[h] = 1, v -= x), v <<= 1, a[c - 2 - h] = (a[c - 1 - h] / 2 | 0) + d;
        a[0] = b[0];
        m[0] = Array(a[0]);
        g[0] = Array(a[0]);
        for (h = 1; h < c; ++h) a[h] > 2 * a[h - 1] + b[h] && (a[h] = 2 * a[h - 1] + b[h]), m[h] = Array(a[h]), g[h] = Array(a[h]);
        for (l = 0; l < d; ++l) k[l] = c;
        for (q = 0; q < a[c - 1]; ++q) m[c -
            1][q] = e[q], g[c - 1][q] = q;
        for (l = 0; l < c; ++l) p[l] = 0;
        1 === b[c - 1] && (--k[0], ++p[c - 1]);
        for (h = c - 2; 0 <= h; --h) {
            t = l = 0;
            w = p[h + 1];
            for (q = 0; q < a[h]; q++) t = m[h + 1][w] + m[h + 1][w + 1], t > e[l] ? (m[h][q] = t, g[h][q] = d, w += 2) : (m[h][q] = e[l], g[h][q] = l, ++l);
            p[h] = 0;
            1 === b[h] && f(h)
        }
        return k
    }

    function pa(e) {
        var d = new(C ? Uint16Array : Array)(e.length),
            c = [],
            f = [],
            a = 0,
            b, k, m, g;
        b = 0;
        for (k = e.length; b < k; b++) c[e[b]] = (c[e[b]] | 0) + 1;
        b = 1;
        for (k = 16; b <= k; b++) f[b] = a, a += c[b] | 0, a <<= 1;
        b = 0;
        for (k = e.length; b < k; b++) {
            a = f[e[b]];
            f[e[b]] += 1;
            m = d[b] = 0;
            for (g = e[b]; m < g; m++) d[b] = d[b] << 1 | a & 1, a >>>= 1
        }
        return d
    };
    ba("Zlib.RawDeflate", ka);
    ba("Zlib.RawDeflate.prototype.compress", ka.prototype.h);
    var Ka = { NONE: 0, FIXED: 1, DYNAMIC: ma },
        V, La, $, Ma;
    if (Object.keys) V = Object.keys(Ka);
    else
        for (La in V = [], $ = 0, Ka) V[$++] = La;
    $ = 0;
    for (Ma = V.length; $ < Ma; ++$) La = V[$], ba("Zlib.RawDeflate.CompressionType." + La, Ka[La]);
}).call(this);

/** @license zlib.js 2012 - imaya [ https://github.com/imaya/zlib.js ] The MIT License */
(function() {
    'use strict';
    var k = void 0,
        aa = this;

    function r(c, d) {
        var a = c.split("."),
            b = aa;
        !(a[0] in b) && b.execScript && b.execScript("var " + a[0]);
        for (var e; a.length && (e = a.shift());) !a.length && d !== k ? b[e] = d : b = b[e] ? b[e] : b[e] = {}
    };
    var t = "undefined" !== typeof Uint8Array && "undefined" !== typeof Uint16Array && "undefined" !== typeof Uint32Array && "undefined" !== typeof DataView;

    function u(c) {
        var d = c.length,
            a = 0,
            b = Number.POSITIVE_INFINITY,
            e, f, g, h, l, n, m, p, s, x;
        for (p = 0; p < d; ++p) c[p] > a && (a = c[p]), c[p] < b && (b = c[p]);
        e = 1 << a;
        f = new(t ? Uint32Array : Array)(e);
        g = 1;
        h = 0;
        for (l = 2; g <= a;) {
            for (p = 0; p < d; ++p)
                if (c[p] === g) {
                    n = 0;
                    m = h;
                    for (s = 0; s < g; ++s) n = n << 1 | m & 1, m >>= 1;
                    x = g << 16 | p;
                    for (s = n; s < e; s += l) f[s] = x;
                    ++h
                }++ g;
            h <<= 1;
            l <<= 1
        }
        return [f, a, b]
    };

    function w(c, d) {
        this.g = [];
        this.h = 32768;
        this.c = this.f = this.d = this.k = 0;
        this.input = t ? new Uint8Array(c) : c;
        this.l = !1;
        this.i = y;
        this.p = !1;
        if (d || !(d = {})) d.index && (this.d = d.index), d.bufferSize && (this.h = d.bufferSize), d.bufferType && (this.i = d.bufferType), d.resize && (this.p = d.resize);
        switch (this.i) {
            case A:
                this.a = 32768;
                this.b = new(t ? Uint8Array : Array)(32768 + this.h + 258);
                break;
            case y:
                this.a = 0;
                this.b = new(t ? Uint8Array : Array)(this.h);
                this.e = this.u;
                this.m = this.r;
                this.j = this.s;
                break;
            default:
                throw Error("invalid inflate mode");
        }
    }
    var A = 0,
        y = 1;
    w.prototype.t = function() {
        for (; !this.l;) {
            var c = B(this, 3);
            c & 1 && (this.l = !0);
            c >>>= 1;
            switch (c) {
                case 0:
                    var d = this.input,
                        a = this.d,
                        b = this.b,
                        e = this.a,
                        f = d.length,
                        g = k,
                        h = k,
                        l = b.length,
                        n = k;
                    this.c = this.f = 0;
                    if (a + 1 >= f) throw Error("invalid uncompressed block header: LEN");
                    g = d[a++] | d[a++] << 8;
                    if (a + 1 >= f) throw Error("invalid uncompressed block header: NLEN");
                    h = d[a++] | d[a++] << 8;
                    if (g === ~h) throw Error("invalid uncompressed block header: length verify");
                    if (a + g > d.length) throw Error("input buffer is broken");
                    switch (this.i) {
                        case A:
                            for (; e + g >
                                b.length;) {
                                n = l - e;
                                g -= n;
                                if (t) b.set(d.subarray(a, a + n), e), e += n, a += n;
                                else
                                    for (; n--;) b[e++] = d[a++];
                                this.a = e;
                                b = this.e();
                                e = this.a
                            }
                            break;
                        case y:
                            for (; e + g > b.length;) b = this.e({ o: 2 });
                            break;
                        default:
                            throw Error("invalid inflate mode");
                    }
                    if (t) b.set(d.subarray(a, a + g), e), e += g, a += g;
                    else
                        for (; g--;) b[e++] = d[a++];
                    this.d = a;
                    this.a = e;
                    this.b = b;
                    break;
                case 1:
                    this.j(ba, ca);
                    break;
                case 2:
                    for (var m = B(this, 5) + 257, p = B(this, 5) + 1, s = B(this, 4) + 4, x = new(t ? Uint8Array : Array)(C.length), Q = k, R = k, S = k, v = k, M = k, F = k, z = k, q = k, T = k, q = 0; q < s; ++q) x[C[q]] =
                        B(this, 3);
                    if (!t) { q = s; for (s = x.length; q < s; ++q) x[C[q]] = 0 }
                    Q = u(x);
                    v = new(t ? Uint8Array : Array)(m + p);
                    q = 0;
                    for (T = m + p; q < T;) switch (M = D(this, Q), M) {
                        case 16:
                            for (z = 3 + B(this, 2); z--;) v[q++] = F;
                            break;
                        case 17:
                            for (z = 3 + B(this, 3); z--;) v[q++] = 0;
                            F = 0;
                            break;
                        case 18:
                            for (z = 11 + B(this, 7); z--;) v[q++] = 0;
                            F = 0;
                            break;
                        default:
                            F = v[q++] = M
                    }
                    R = t ? u(v.subarray(0, m)) : u(v.slice(0, m));
                    S = t ? u(v.subarray(m)) : u(v.slice(m));
                    this.j(R, S);
                    break;
                default:
                    throw Error("unknown BTYPE: " + c);
            }
        }
        return this.m()
    };
    var E = [16, 17, 18, 0, 8, 7, 9, 6, 10, 5, 11, 4, 12, 3, 13, 2, 14, 1, 15],
        C = t ? new Uint16Array(E) : E,
        G = [3, 4, 5, 6, 7, 8, 9, 10, 11, 13, 15, 17, 19, 23, 27, 31, 35, 43, 51, 59, 67, 83, 99, 115, 131, 163, 195, 227, 258, 258, 258],
        H = t ? new Uint16Array(G) : G,
        I = [0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 2, 2, 2, 2, 3, 3, 3, 3, 4, 4, 4, 4, 5, 5, 5, 5, 0, 0, 0],
        J = t ? new Uint8Array(I) : I,
        K = [1, 2, 3, 4, 5, 7, 9, 13, 17, 25, 33, 49, 65, 97, 129, 193, 257, 385, 513, 769, 1025, 1537, 2049, 3073, 4097, 6145, 8193, 12289, 16385, 24577],
        L = t ? new Uint16Array(K) : K,
        N = [0, 0, 0, 0, 1, 1, 2, 2, 3, 3, 4, 4, 5, 5, 6, 6, 7, 7, 8, 8, 9, 9, 10, 10, 11, 11, 12, 12, 13,
            13
        ],
        O = t ? new Uint8Array(N) : N,
        P = new(t ? Uint8Array : Array)(288),
        U, da;
    U = 0;
    for (da = P.length; U < da; ++U) P[U] = 143 >= U ? 8 : 255 >= U ? 9 : 279 >= U ? 7 : 8;
    var ba = u(P),
        V = new(t ? Uint8Array : Array)(30),
        W, ea;
    W = 0;
    for (ea = V.length; W < ea; ++W) V[W] = 5;
    var ca = u(V);

    function B(c, d) {
        for (var a = c.f, b = c.c, e = c.input, f = c.d, g = e.length, h; b < d;) {
            if (f >= g) throw Error("input buffer is broken");
            a |= e[f++] << b;
            b += 8
        }
        h = a & (1 << d) - 1;
        c.f = a >>> d;
        c.c = b - d;
        c.d = f;
        return h
    }

    function D(c, d) {
        for (var a = c.f, b = c.c, e = c.input, f = c.d, g = e.length, h = d[0], l = d[1], n, m; b < l && !(f >= g);) a |= e[f++] << b, b += 8;
        n = h[a & (1 << l) - 1];
        m = n >>> 16;
        if (m > b) throw Error("invalid code length: " + m);
        c.f = a >> m;
        c.c = b - m;
        c.d = f;
        return n & 65535
    }
    w.prototype.j = function(c, d) {
        var a = this.b,
            b = this.a;
        this.n = c;
        for (var e = a.length - 258, f, g, h, l; 256 !== (f = D(this, c));)
            if (256 > f) b >= e && (this.a = b, a = this.e(), b = this.a), a[b++] = f;
            else {
                g = f - 257;
                l = H[g];
                0 < J[g] && (l += B(this, J[g]));
                f = D(this, d);
                h = L[f];
                0 < O[f] && (h += B(this, O[f]));
                b >= e && (this.a = b, a = this.e(), b = this.a);
                for (; l--;) a[b] = a[b++ - h]
            }
        for (; 8 <= this.c;) this.c -= 8, this.d--;
        this.a = b
    };
    w.prototype.s = function(c, d) {
        var a = this.b,
            b = this.a;
        this.n = c;
        for (var e = a.length, f, g, h, l; 256 !== (f = D(this, c));)
            if (256 > f) b >= e && (a = this.e(), e = a.length), a[b++] = f;
            else {
                g = f - 257;
                l = H[g];
                0 < J[g] && (l += B(this, J[g]));
                f = D(this, d);
                h = L[f];
                0 < O[f] && (h += B(this, O[f]));
                b + l > e && (a = this.e(), e = a.length);
                for (; l--;) a[b] = a[b++ - h]
            }
        for (; 8 <= this.c;) this.c -= 8, this.d--;
        this.a = b
    };
    w.prototype.e = function() {
        var c = new(t ? Uint8Array : Array)(this.a - 32768),
            d = this.a - 32768,
            a, b, e = this.b;
        if (t) c.set(e.subarray(32768, c.length));
        else { a = 0; for (b = c.length; a < b; ++a) c[a] = e[a + 32768] }
        this.g.push(c);
        this.k += c.length;
        if (t) e.set(e.subarray(d, d + 32768));
        else
            for (a = 0; 32768 > a; ++a) e[a] = e[d + a];
        this.a = 32768;
        return e
    };
    w.prototype.u = function(c) {
        var d, a = this.input.length / this.d + 1 | 0,
            b, e, f, g = this.input,
            h = this.b;
        c && ("number" === typeof c.o && (a = c.o), "number" === typeof c.q && (a += c.q));
        2 > a ? (b = (g.length - this.d) / this.n[2], f = 258 * (b / 2) | 0, e = f < h.length ? h.length + f : h.length << 1) : e = h.length * a;
        t ? (d = new Uint8Array(e), d.set(h)) : d = h;
        return this.b = d
    };
    w.prototype.m = function() {
        var c = 0,
            d = this.b,
            a = this.g,
            b, e = new(t ? Uint8Array : Array)(this.k + (this.a - 32768)),
            f, g, h, l;
        if (0 === a.length) return t ? this.b.subarray(32768, this.a) : this.b.slice(32768, this.a);
        f = 0;
        for (g = a.length; f < g; ++f) {
            b = a[f];
            h = 0;
            for (l = b.length; h < l; ++h) e[c++] = b[h]
        }
        f = 32768;
        for (g = this.a; f < g; ++f) e[c++] = d[f];
        this.g = [];
        return this.buffer = e
    };
    w.prototype.r = function() {
        var c, d = this.a;
        t ? this.p ? (c = new Uint8Array(d), c.set(this.b.subarray(0, d))) : c = this.b.subarray(0, d) : (this.b.length > d && (this.b.length = d), c = this.b);
        return this.buffer = c
    };
    r("Zlib.RawInflate", w);
    r("Zlib.RawInflate.prototype.decompress", w.prototype.t);
    var X = { ADAPTIVE: y, BLOCK: A },
        Y, Z, $, fa;
    if (Object.keys) Y = Object.keys(X);
    else
        for (Z in Y = [], $ = 0, X) Y[$++] = Z;
    $ = 0;
    for (fa = Y.length; $ < fa; ++$) Z = Y[$], r("Zlib.RawInflate.BufferType." + Z, X[Z]);
}).call(this);
