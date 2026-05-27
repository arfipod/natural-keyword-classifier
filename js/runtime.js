(function () {
    "use strict";

    const A = [38, 38, 40, 40, 37, 39, 37, 39, 66, 65];
    const B = 420;
    const C = 620;
    const D = 72;
    const E = 70;
    const F = 156;
    const G = 1420;
    const H = 0.00175;
    const I = -0.49;
    const J = 0.18;
    const K = "_nkc_ui_m";
    const P = "_nkc_ui_n";
    const X = "_nkc_ui_o";
    const Q = 10;
    const R = 20;
    const S = 24;
    const T = [
        [[1, 1, 1, 1]],
        [[1, 0, 0], [1, 1, 1]],
        [[0, 0, 1], [1, 1, 1]],
        [[1, 1], [1, 1]],
        [[0, 1, 1], [1, 1, 0]],
        [[0, 1, 0], [1, 1, 1]],
        [[1, 1, 0], [0, 1, 1]]
    ];
    const U = ["#38bdf8", "#2563eb", "#f97316", "#eab308", "#22c55e", "#a855f7", "#ef4444"];
    const Y = [83, 111, 114, 114, 121, 44, 32, 110, 111, 32, 109, 111, 114, 101, 32, 103, 97, 109, 101, 115, 46, 32, 75, 101, 101, 112, 32, 119, 111, 114, 107, 105, 110, 103, 33];
    const L = {};
    const M = {
        a: 0,
        b: { x: 112, y: C / 2, r: 16, v: 0 },
        c: [],
        d: 0,
        e: qa(),
        f: 0,
        g: 0,
        h: 0,
        i: 0,
        j: null,
        l: 0
    };
    const V = {
        a: 0,
        b: [],
        c: null,
        d: 0,
        e: 0,
        f: 0,
        g: qa(P),
        h: 0
    };
    const Z = {
        a: 0,
        b: [],
        c: [],
        d: [],
        e: null,
        f: 0,
        g: qa(X),
        h: 1,
        i: 0,
        j: 0,
        k: 0
    };

    let N = 0;
    let O = false;
    let W = 0;

    function oa() {
        if (L.z) {
            return;
        }

        L.z = document.createElement("style");
        L.z.textContent = "body.x9{overflow:hidden}.x0{position:fixed;inset:0;z-index:2000;display:grid;place-items:center;padding:16px;background:rgba(15,23,42,.62)}.x0[hidden]{display:none}.x1{width:min(100%,460px);overflow:hidden;border:1px solid rgba(255,255,255,.28);border-radius:8px;background:#fff;box-shadow:0 24px 70px rgba(15,23,42,.36)}.x2{display:flex;gap:10px;align-items:center;justify-content:space-between;padding:10px 12px;background:#111827;color:#fff}.x3{display:flex;gap:12px;align-items:center;font-variant-numeric:tabular-nums}.x3 span{min-width:42px}.x4{width:34px;height:34px;padding:0;border:1px solid rgba(255,255,255,.22);border-radius:6px;background:rgba(255,255,255,.08);color:#fff;line-height:1}.x4:hover{background:rgba(255,255,255,.18)}.x5{padding:14px 14px 10px;background:#e0f2fe}.x6{display:block;width:100%;max-height:min(70vh,620px);border:1px solid #94a3b8;border-radius:8px;background:#7dd3fc;aspect-ratio:42/62;touch-action:manipulation}.x7{display:flex;justify-content:center;padding:0 14px 14px;background:#e0f2fe}.x8{min-width:86px;padding:9px 18px;border-radius:6px}.x10{position:fixed;inset:0;z-index:2100;display:grid;place-items:center;padding:18px;background:rgba(2,6,23,.58)}.x10[hidden]{display:none}.x11{width:min(100%,360px);padding:22px;border-radius:8px;background:#fff;color:#111827;text-align:center;box-shadow:0 24px 70px rgba(2,6,23,.38)}.x11 p{margin:0 0 16px;line-height:1.4}.x11 button{min-width:74px}";
        document.head.appendChild(L.z);
    }

    function pa() {
        if (O) {
            return;
        }

        O = true;
        window.addEventListener("keydown", ra);
    }

    function qa(a = K) {
        try {
            return Number.parseInt(localStorage.getItem(a), 10) || 0;
        } catch {
            return 0;
        }
    }

    function ra(a) {
        const b = a.keyCode || a.which;

        if (ta() || a.repeat || a.altKey || a.ctrlKey || a.metaKey) {
            return;
        }

        if (b === A[N]) {
            N += 1;

            if (N === A.length) {
                N = 0;
                ua();
            }

            return;
        }

        N = b === A[0] ? 1 : 0;
    }

    function sa() {
        try {
            localStorage.setItem(K, String(M.e));
        } catch {
        }
    }

    function ua0() {
        try {
            localStorage.setItem(P, String(V.g));
        } catch {
        }
    }

    function va1() {
        try {
            localStorage.setItem(X, String(Z.g));
        } catch {
        }
    }

    function ta() {
        return L.a && !L.a.hidden;
    }

    function ua() {
        va();
        M.k = document.activeElement;
        L.a.hidden = false;
        document.body.classList.add("x9");
        M.l = 0;
        W = 0;
        xa(0);
        ya();
        za();
        Ba();
        L.i.focus();
    }

    function va() {
        if (L.a) {
            return;
        }

        oa();
        L.a = document.createElement("div");
        L.a.className = "x0";
        L.a.hidden = true;

        const a = document.createElement("section");
        a.className = "x1";
        a.setAttribute("role", "dialog");
        a.setAttribute("aria-modal", "true");

        const b = document.createElement("header");
        b.className = "x2";

        const c = document.createElement("div");
        c.className = "x3";

        L.d = wa("0");
        L.e = wa("* 0");
        c.append(L.d.a, L.e.a);

        L.f = document.createElement("button");
        L.f.className = "x4";
        L.f.type = "button";
        L.f.textContent = "x";

        b.append(c, L.f);

        const d = document.createElement("div");
        d.className = "x5";

        L.b = document.createElement("canvas");
        L.b.className = "x6";
        L.c = L.b.getContext("2d");
        d.appendChild(L.b);

        const e = document.createElement("div");
        e.className = "x7";

        L.i = document.createElement("button");
        L.i.className = "x8";
        L.i.type = "button";
        L.i.textContent = ">";
        e.appendChild(L.i);

        a.append(b, d, e);
        L.a.appendChild(a);
        document.body.appendChild(L.a);
    }

    function wa(a) {
        const b = document.createElement("span");
        const c = document.createElement("strong");

        c.textContent = a;
        b.appendChild(c);

        return { a: b, b: c };
    }

    function xa(a) {
        M.a = a;
        M.b.y = C / 2;
        M.b.v = 0;
        M.c = [];
        M.d = 0;
        M.f = 620;
        M.g = 0;
        M.h = 0;
        L.i.textContent = a === 2 ? "R" : ">";
        Aa();
    }

    function ya() {
        L.f.addEventListener("click", Ca);
        L.i.addEventListener("click", Da);
        L.b.addEventListener("pointerdown", Ea);
        window.addEventListener("keydown", Fa);
        window.addEventListener("resize", za);
    }

    function za() {
        const a = Math.min(window.devicePixelRatio || 1, 2);

        L.b.width = B * a;
        L.b.height = C * a;
        L.c.setTransform(a, 0, 0, a, 0, 0);
        La();
    }

    function Aa() {
        if (M.l === 2) {
            L.d.b.textContent = String(Z.f);
            L.e.b.textContent = `* ${Z.g}`;
            return;
        }

        if (M.l === 1) {
            L.d.b.textContent = String(V.d);
            L.e.b.textContent = `* ${V.g}`;
            return;
        }

        L.d.b.textContent = String(M.d);
        L.e.b.textContent = `* ${M.e}`;
    }

    function Ba() {
        cancelAnimationFrame(M.j);
        M.i = 0;
        M.j = requestAnimationFrame(Ga);
    }

    function Ca() {
        if (!ta()) {
            return;
        }

        L.a.hidden = true;
        document.body.classList.remove("x9");
        L.f.removeEventListener("click", Ca);
        L.i.removeEventListener("click", Da);
        L.b.removeEventListener("pointerdown", Ea);
        window.removeEventListener("keydown", Fa);
        window.removeEventListener("resize", za);
        cancelAnimationFrame(M.j);
        M.j = null;
        if (L.m) {
            L.m.hidden = true;
        }

        if (M.k && typeof M.k.focus === "function") {
            M.k.focus();
        }
    }

    function Da() {
        if (M.l === 2) {
            if (Z.a === 1) {
                wa1();
                return;
            }

            xa1();
            return;
        }

        if (M.l === 1) {
            if (V.a === 1) {
                va0();
                return;
            }

            wa0();
            return;
        }

        if (M.a === 1) {
            Ha();
            return;
        }

        xa(1);
        Ha();
    }

    function Ea(a) {
        a.preventDefault();
        Da();
    }

    function Fa(a) {
        const b = a.keyCode || a.which;

        if (!ta()) {
            return;
        }

        if (xa0(b)) {
            a.preventDefault();
            return;
        }

        if (b === 27) {
            a.preventDefault();
            Ca();
            return;
        }

        if (M.l === 1) {
            ya0(a, b);
            return;
        }

        if (M.l === 2) {
            ya1(a, b);
            return;
        }

        if (b === 32 || b === 38) {
            a.preventDefault();
            Da();
        }
    }

    function Ga(a) {
        const b = M.i ? Math.min(a - M.i, 34) : 16;

        M.i = a;

        if (M.l === 2) {
            if (Z.a === 1) {
                za1(b);
            }
        } else if (M.l === 1) {
            if (V.a === 1) {
                za0(b);
            }
        } else if (M.a === 1) {
            Ia(b);
        } else {
            Ja(b);
        }

        La();
        M.j = requestAnimationFrame(Ga);
    }

    function Ha() {
        M.b.v = I;
    }

    function Ia(a) {
        M.f -= a;
        M.g = (M.g + J * a) % 28;
        M.b.v += H * a;
        M.b.y += M.b.v * a;

        if (M.f <= 0) {
            Ka();
            M.f = G;
        }

        M.c.forEach((b) => {
            b.x -= J * a;

            if (!b.d && b.x + E < M.b.x) {
                b.d = true;
                M.d += 1;
                Aa();
            }
        });

        M.c = M.c.filter((a) => a.x + E > -10);

        if (Ma()) {
            Na();
        }
    }

    function Ja(a) {
        M.h += a;
        M.g = (M.g + J * a) % 28;
        M.b.y = C / 2 + Math.sin(M.h / 260) * 8;
    }

    function Ka() {
        const a = 78;
        const b = C - D - F - 92;
        const c = a + Math.random() * (b - a);

        M.c.push({
            x: B + 18,
            a: c,
            b: c + F,
            d: false
        });
    }

    function La() {
        if (!L.c) {
            return;
        }

        if (M.l === 2) {
            Aa1();
            return;
        }

        if (M.l === 1) {
            Aa0();
            return;
        }

        Oa();
        Pa();
        Qa();
        Ra();
    }

    function Ma() {
        const a = M.b;

        if (a.y - a.r < 0 || a.y + a.r > C - D) {
            return true;
        }

        return M.c.some((b) => {
            const c = a.x + a.r > b.x && a.x - a.r < b.x + E;
            const d = a.y - a.r < b.a || a.y + a.r > b.b;

            return c && d;
        });
    }

    function Na() {
        M.a = 2;
        L.i.textContent = "R";

        if (M.d > M.e) {
            M.e = M.d;
            sa();
        }

        Aa();
    }

    function xa0(a) {
        if (M.l > 2 || (L.m && !L.m.hidden)) {
            return false;
        }

        if (a === A[W]) {
            W += 1;

            if (W === A.length) {
                W = 0;
                if (M.l === 0) {
                    ba0();
                } else if (M.l === 1) {
                    ba1();
                } else {
                    Ca1();
                }
                return true;
            }

            return false;
        }

        W = a === A[0] ? 1 : 0;
        return false;
    }

    function ya0(a, b) {
        if (b === 13 || b === 32) {
            a.preventDefault();
            Da();
            return;
        }

        if (V.a !== 1) {
            return;
        }

        if (b === 37) {
            a.preventDefault();
            ca0(-1);
        } else if (b === 39) {
            a.preventDefault();
            ca0(1);
        } else if (b === 40) {
            a.preventDefault();
            da0();
        } else if (b === 38) {
            a.preventDefault();
            va0();
        }
    }

    function za0(a) {
        V.f -= a;

        if (V.f <= 0) {
            da0();
            V.f = Math.max(150, 620 - Math.floor(V.d / 500) * 42);
        }
    }

    function ba0() {
        M.l = 1;
        V.g = qa(P);
        W = 0;
        wa0(0);
        za();
    }

    function wa0(a = 1) {
        V.a = a;
        V.b = Array.from({ length: R }, () => Array(Q).fill(0));
        V.c = ea0();
        V.d = 0;
        V.e = 0;
        V.f = 620;
        L.i.textContent = a === 2 ? "R" : ">";
        Aa();
    }

    function ca0(a) {
        if (!fa0(V.c, a, 0, V.c.a)) {
            V.c.x += a;
        }
    }

    function da0() {
        if (V.a !== 1) {
            wa0(1);
            return;
        }

        if (!fa0(V.c, 0, 1, V.c.a)) {
            V.c.y += 1;
            return;
        }

        ga0();
        ha0();
        V.c = ea0();

        if (fa0(V.c, 0, 0, V.c.a)) {
            ia0();
        }
    }

    function ea0() {
        const a = Math.floor(Math.random() * T.length);

        return {
            a: T[a].map((b) => b.slice()),
            b: a + 1,
            x: Math.floor((Q - T[a][0].length) / 2),
            y: 0
        };
    }

    function fa0(a, b, c, d) {
        for (let e = 0; e < d.length; e += 1) {
            for (let f = 0; f < d[e].length; f += 1) {
                if (!d[e][f]) {
                    continue;
                }

                const g = a.x + b + f;
                const h = a.y + c + e;

                if (g < 0 || g >= Q || h >= R || (h >= 0 && V.b[h][g])) {
                    return true;
                }
            }
        }

        return false;
    }

    function ga0() {
        V.c.a.forEach((a, b) => {
            a.forEach((a, c) => {
                const d = V.c.y + b;
                const e = V.c.x + c;

                if (a && d >= 0) {
                    V.b[d][e] = V.c.b;
                }
            });
        });
    }

    function ha0() {
        let a = 0;

        for (let b = V.b.length - 1; b >= 0; b -= 1) {
            if (V.b[b].every(Boolean)) {
                V.b.splice(b, 1);
                V.b.unshift(Array(Q).fill(0));
                a += 1;
                b += 1;
            }
        }

        if (a > 0) {
            V.e += a;
            V.d += [0, 100, 300, 500, 800][a] || a * 220;
            Aa();
        }
    }

    function ia0() {
        V.a = 2;
        L.i.textContent = "R";

        if (V.d > V.g) {
            V.g = V.d;
            ua0();
        }

        Aa();
    }

    function va0() {
        if (!V.c || V.a !== 1) {
            return;
        }

        const a = V.c.a[0].map((_, b) => V.c.a.map((c) => c[b]).reverse());

        for (const b of [0, -1, 1, -2, 2]) {
            if (!fa0(V.c, b, 0, a)) {
                V.c.x += b;
                V.c.a = a;
                return;
            }
        }
    }

    function Aa0() {
        const a = L.c;
        const b = (B - Q * S) / 2;
        const c = 46;

        a.fillStyle = "#0f172a";
        a.fillRect(0, 0, B, C);
        a.fillStyle = "#172033";
        a.fillRect(b - 10, c - 10, Q * S + 20, R * S + 20);
        a.fillStyle = "#020617";
        a.fillRect(b, c, Q * S, R * S);

        V.b.forEach((d, e) => {
            d.forEach((d, f) => {
                if (d) {
                    Ba0(b + f * S, c + e * S, U[d - 1]);
                }
            });
        });

        if (V.c) {
            V.c.a.forEach((d, e) => {
                d.forEach((d, f) => {
                    if (d) {
                        Ba0(b + (V.c.x + f) * S, c + (V.c.y + e) * S, U[V.c.b - 1]);
                    }
                });
            });
        }

        a.strokeStyle = "rgba(148, 163, 184, 0.16)";
        a.lineWidth = 1;

        for (let d = 0; d <= Q; d += 1) {
            a.beginPath();
            a.moveTo(b + d * S, c);
            a.lineTo(b + d * S, c + R * S);
            a.stroke();
        }

        for (let d = 0; d <= R; d += 1) {
            a.beginPath();
            a.moveTo(b, c + d * S);
            a.lineTo(b + Q * S, c + d * S);
            a.stroke();
        }
    }

    function Ba0(a, b, c) {
        const d = L.c;

        d.fillStyle = c;
        d.fillRect(a + 1, b + 1, S - 2, S - 2);
        d.fillStyle = "rgba(255, 255, 255, 0.24)";
        d.fillRect(a + 3, b + 3, S - 7, 4);
        d.fillStyle = "rgba(15, 23, 42, 0.22)";
        d.fillRect(a + 3, b + S - 6, S - 7, 3);
    }

    function ba1() {
        M.l = 2;
        Z.g = qa(X);
        W = 0;
        xa1(0);
        za();
    }

    function xa1(a = 1) {
        Z.a = a;
        Z.c = [];
        Z.d = [];
        Z.e = { x: B / 2, y: C - 70, w: 38, h: 18 };
        Z.f = 0;
        Z.h = 1;
        Z.i = 0;
        Z.j = 0;
        Z.k = 0;
        Ea1();
        L.i.textContent = a === 2 ? "R" : ">";
        Aa();
    }

    function ya1(a, b) {
        if (b === 13 || b === 32) {
            a.preventDefault();
            Da();
            return;
        }

        if (Z.a !== 1) {
            return;
        }

        if (b === 37) {
            a.preventDefault();
            Z.e.x = Math.max(28, Z.e.x - 18);
        } else if (b === 39) {
            a.preventDefault();
            Z.e.x = Math.min(B - 28, Z.e.x + 18);
        }
    }

    function za1(a) {
        const b = Z.b.filter((a) => a.a);

        Z.i += a;
        Z.j += a;
        Z.k = Math.max(0, Z.k - a);

        b.forEach((b) => {
            b.x += Z.h * (0.026 + Math.min(Z.f / 40000, 0.024)) * a;
        });

        if (b.some((a) => a.x < 22 || a.x + a.w > B - 22)) {
            Z.h *= -1;
            b.forEach((a) => {
                a.y += 16;
            });
        }

        Z.c.forEach((b) => {
            b.y -= 0.38 * a;
        });
        Z.d.forEach((b) => {
            b.y += 0.23 * a;
        });

        Z.c.forEach((a) => {
            b.some((b) => {
                if (a.a === false || !Ia1(a, { x: b.x, y: b.y, w: b.w, h: b.h })) {
                    return false;
                }

                a.a = false;
                b.a = false;
                Z.f += 20;
                Aa();
                return true;
            });
        });

        if (Z.i > 760 && b.length > 0) {
            const a = b[Math.floor(Math.random() * b.length)];
            Z.d.push({ x: a.x + a.w / 2, y: a.y + a.h + 4, w: 4, h: 12 });
            Z.i = Math.random() * -360;
        }

        Z.c = Z.c.filter((a) => a.a !== false && a.y > -20);
        Z.d = Z.d.filter((a) => a.y < C + 20);

        if (Z.d.some((a) => Ia1(a, { x: Z.e.x - Z.e.w / 2, y: Z.e.y, w: Z.e.w, h: Z.e.h }))
            || b.some((a) => a.y + a.h >= Z.e.y - 6)) {
            Fa1();
            return;
        }

        if (b.length === 0) {
            Z.f += 150;
            Ea1();
            Aa();
        }
    }

    function wa1() {
        if (Z.a !== 1) {
            xa1(1);
            return;
        }

        if (Z.k > 0) {
            return;
        }

        Z.c.push({ x: Z.e.x - 2, y: Z.e.y - 14, w: 4, h: 14 });
        Z.k = 260;
    }

    function Ca1() {
        Da1();
        L.m.hidden = false;
        L.n.focus();
    }

    function Da1() {
        if (L.m) {
            return;
        }

        L.m = document.createElement("div");
        L.m.className = "x10";
        L.m.hidden = true;
        L.m.setAttribute("role", "dialog");
        L.m.setAttribute("aria-modal", "true");

        const a = document.createElement("div");
        const b = document.createElement("p");

        a.className = "x11";
        b.textContent = String.fromCharCode(...Y);
        L.n = document.createElement("button");
        L.n.type = "button";
        L.n.textContent = "OK";
        L.n.addEventListener("click", () => {
            L.m.hidden = true;
            L.i.focus();
        });
        a.append(b, L.n);
        L.m.appendChild(a);
        document.body.appendChild(L.m);
    }

    function Ea1() {
        Z.b = [];

        for (let a = 0; a < 5; a += 1) {
            for (let b = 0; b < 8; b += 1) {
                Z.b.push({
                    x: 54 + b * 38,
                    y: 76 + a * 30,
                    w: 24,
                    h: 17,
                    a: true,
                    b: a
                });
            }
        }
    }

    function Fa1() {
        Z.a = 2;
        L.i.textContent = "R";

        if (Z.f > Z.g) {
            Z.g = Z.f;
            va1();
        }

        Aa();
    }

    function Aa1() {
        const a = L.c;

        a.fillStyle = "#020617";
        a.fillRect(0, 0, B, C);
        a.fillStyle = "rgba(226, 232, 240, 0.62)";

        for (let b = 0; b < 54; b += 1) {
            const c = (b * 73) % B;
            const d = (b * 47 + Z.j * 0.012) % C;
            a.fillRect(c, d, 2, 2);
        }

        Z.b.forEach((a) => {
            if (a.a) {
                Ba1(a);
            }
        });

        L.c.fillStyle = "#f8fafc";
        Z.c.forEach((a) => {
            L.c.fillRect(a.x, a.y, a.w, a.h);
        });
        L.c.fillStyle = "#fb7185";
        Z.d.forEach((a) => {
            L.c.fillRect(a.x, a.y, a.w, a.h);
        });

        L.c.fillStyle = "#22d3ee";
        L.c.beginPath();
        L.c.moveTo(Z.e.x, Z.e.y - 16);
        L.c.lineTo(Z.e.x - Z.e.w / 2, Z.e.y + Z.e.h);
        L.c.lineTo(Z.e.x + Z.e.w / 2, Z.e.y + Z.e.h);
        L.c.closePath();
        L.c.fill();
        L.c.fillStyle = "#67e8f9";
        L.c.fillRect(Z.e.x - 6, Z.e.y + 2, 12, 7);

        if (Z.a !== 1) {
            L.c.fillStyle = "rgba(15, 23, 42, 0.34)";
            L.c.fillRect(58, 250, B - 116, 84);
            L.c.fillStyle = "rgba(255, 255, 255, 0.86)";
            L.c.beginPath();
            L.c.moveTo(B / 2 - 13, 278);
            L.c.lineTo(B / 2 - 13, 306);
            L.c.lineTo(B / 2 + 15, 292);
            L.c.closePath();
            L.c.fill();
        }
    }

    function Ba1(a) {
        const b = L.c;
        const c = ["#84cc16", "#22c55e", "#14b8a6", "#38bdf8", "#818cf8"][a.b % 5];

        b.fillStyle = c;
        b.fillRect(a.x, a.y + 5, a.w, a.h - 5);
        b.fillRect(a.x + 4, a.y, a.w - 8, 7);
        b.fillStyle = "rgba(2, 6, 23, 0.4)";
        b.fillRect(a.x + 5, a.y + 9, 4, 4);
        b.fillRect(a.x + a.w - 9, a.y + 9, 4, 4);
    }

    function Ia1(a, b) {
        return a.x < b.x + b.w
            && a.x + a.w > b.x
            && a.y < b.y + b.h
            && a.y + a.h > b.y;
    }

    function Oa() {
        const a = L.c;
        const b = a.createLinearGradient(0, 0, 0, C);

        b.addColorStop(0, "#7dd3fc");
        b.addColorStop(0.64, "#dbeafe");
        b.addColorStop(1, "#fef3c7");
        a.fillStyle = b;
        a.fillRect(0, 0, B, C);
        Sa(78, 88, 1);
        Sa(292, 142, 0.82);
        Sa(184, 230, 0.58);
    }

    function Pa() {
        M.c.forEach((a) => {
            Ta(a.x, 0, E, a.a, true);
            Ta(a.x, a.b, E, C - D - a.b, false);
        });
    }

    function Qa() {
        const a = L.c;
        const b = C - D;

        a.fillStyle = "#f59e0b";
        a.fillRect(0, b, B, D);
        a.fillStyle = "#22c55e";
        a.fillRect(0, b, B, 12);
        a.fillStyle = "rgba(120, 53, 15, 0.22)";

        for (let c = -28 - M.g; c < B + 28; c += 28) {
            a.fillRect(c, b + 32, 15, 4);
        }
    }

    function Ra() {
        const a = L.c;
        const b = M.b;
        const c = Math.max(-0.45, Math.min(0.72, b.v * 1.7));

        a.save();
        a.translate(b.x, b.y);
        a.rotate(c);
        a.fillStyle = "#facc15";
        a.beginPath();
        a.ellipse(0, 0, 18, 15, 0, 0, Math.PI * 2);
        a.fill();
        a.fillStyle = "#fb923c";
        a.beginPath();
        a.moveTo(14, -2);
        a.lineTo(30, 3);
        a.lineTo(14, 8);
        a.closePath();
        a.fill();
        a.fillStyle = "#fde68a";
        a.beginPath();
        a.ellipse(-6, 7, 10, 6, -0.4, 0, Math.PI * 2);
        a.fill();
        a.fillStyle = "#ffffff";
        a.beginPath();
        a.arc(8, -7, 5, 0, Math.PI * 2);
        a.fill();
        a.fillStyle = "#111827";
        a.beginPath();
        a.arc(10, -7, 2, 0, Math.PI * 2);
        a.fill();
        a.restore();
    }

    function Sa(a, b, c) {
        const d = L.c;

        d.save();
        d.translate(a, b);
        d.scale(c, c);
        d.fillStyle = "rgba(255, 255, 255, 0.84)";
        d.beginPath();
        d.arc(0, 12, 19, Math.PI, 0);
        d.arc(24, 4, 24, Math.PI, 0);
        d.arc(54, 14, 18, Math.PI, 0);
        d.rect(-20, 12, 92, 22);
        d.fill();
        d.restore();
    }

    function Ta(a, b, c, d, e) {
        const f = L.c;
        const g = 20;
        const h = e ? b + d - g : b;

        f.fillStyle = "#16a34a";
        Ua(f, a, b, c, d, 7);
        f.fill();
        f.fillStyle = "#86efac";
        f.fillRect(a + 10, b + 8, 9, Math.max(0, d - 16));
        f.fillStyle = "#15803d";
        Ua(f, a - 6, h, c + 12, g, 7);
        f.fill();
    }

    function Ua(a, b, c, d, e, f) {
        const g = Math.min(f, d / 2, e / 2);

        a.beginPath();
        a.moveTo(b + g, c);
        a.lineTo(b + d - g, c);
        a.quadraticCurveTo(b + d, c, b + d, c + g);
        a.lineTo(b + d, c + e - g);
        a.quadraticCurveTo(b + d, c + e, b + d - g, c + e);
        a.lineTo(b + g, c + e);
        a.quadraticCurveTo(b, c + e, b, c + e - g);
        a.lineTo(b, c + g);
        a.quadraticCurveTo(b, c, b + g, c);
        a.closePath();
    }

    if (document.readyState === "loading") {
        document.addEventListener("DOMContentLoaded", pa);
    } else {
        pa();
    }
})();
