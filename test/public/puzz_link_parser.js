let assert = chai.assert;

describe("puzz.link parser", () => {
    let penpa, updateSnapshots;

    before(() => {
        penpa = document.getElementById("penpa").contentWindow;
        updateSnapshots = document.getElementById("update-snapshots").checked;
    });

    it("connects to the test server", async () => {
        assert.equal("pong", await fetchJson("/ping"));
    })

    const urls = [
        // Akari
        ["Akari 1", "https://puzz.link/p?akari/10/10/..g.h.i.j.k.l.t0143bzzp"],
        ["Akari 2", "https://puzz.link/p?akari/10/10/jbh.rchcpah.n.jbpchcp.jah"],
        ["Akari 3", "https://puzz.link/p?akari/20/20/h.k.h.kbz.ha.gb6.hab.hbl.h.zk.h.lbbiab.hb.h.zh.gbg6b.g.i6.zz.g.i6b.g.i.g.zh.hb.h.hbbib.l.hbzi.h.n.ha.ha.gb.gb.hbzbi.h.kb"],
        ["Akari 4", "https://puzz.link/p?akari/40/40/i..i8.g.gco1...i1.h.g.hd.i.g...t1.j6.g.hcgch.bo1..jah.g.g.gbh.h.q1.n.j.g.gbi.g.qco.j.g.l.bobqbh..lcobxbi.rbsbmbpbzi.r.mcgckci.sck.j.rdpblbhbkbg.r.n1.j.q.rcl..i6.m7.h.ocl7.i.gbm.h.oakb.i6.qcm.m.i.h.h.p..obj.jb.h.n..g.n.lbi.gbg.p.o.k.kbbg6clbbich1bj6.j.g.n.h.k.h0..l.h.j...n.i.j......bi6bi.gblbgbh1.......i.g.l.g.n.i.i.h....g.c1cmbm66.h.h.g..gb.l1.b.o5.g.hbgcbbj....1.mcg.g.g7.j2.o1....gbgbk..g..g.u...g.g.ibk.g71.bs.h.g.i.jbbi.g.pbh1b.hbg..h.h65.hcmbkbj1cbk.z.j1..p.g.x1.h1..cn1.hbt..6...l1.......bdkbj6.g..g.n.......b.r.h.g.g..n.........h1bl2bg.6.g.n1..........g...i...k.jcm........ib..bl6.g.m"],
        // Ayeheya (Ekawayeh)
        ["Ayeheya 1", "https://puzz.link/p?ayeheya/10/10/14284gd0qj160c0o1g00000s00vv00v00v005g4o"],
        ["Ayeheya 2", "https://puzz.link/p?ayeheya/10/10/aolhb22044088qhl3a1g001no0s703tg0000p"],
        ["Ayeheya 3", "https://puzz.link/p?ayeheya/10/15/2hd2q5kb82hduq5nrf2ultbqnlfu0000f00c0cf0f0f00u0u0000000j4s2"],
        ["Ayeheya 4", "https://puzz.link/p?ayeheya/11/7/00i5i5ktkpkp00fv003v0es00fv0p"],
        // Balance Loop
        ["Balance Loop 1", "https://puzz.link/p?balance/9/9/dm1ich1o0i1pcpdido1h1i0m0"],
        ["Balance Loop 2", "https://puzz.link/p?balance/5/2/kbg011"],
        ["Balance Loop 3", "https://puzz.link/p?balance/10/10/-24-22-20-1e-1c-1a-18-16-14g-25-23-21-1f-1d-1b-19-17-15zzzzg"],
        // Country Road
        ["Country Road 1", "https://puzz.link/p?country/12/12/4s6ndj8iorsml2p8llbdekqu9504hq8lvi2bt54jun8vv95nsi88c05g4g3i2i1i25o4g"],
        ["Country Road 2", "https://puzz.link/p?country/20/15/10156ggr62indoe611d38431oonjrhv7hltmb6t90d6hdme4rc8jcp26ge7vo7vvo32vk8tv1v7uefro67hg208e82hg953tva7tu0fg0fv6m1u0ei5g24k54g2l7g557k92h3g3g2g3"],
        ["Country Road 3", "https://puzz.link/p?country/6/6/1jrrg0e300svh3"],
        // Detour
        ["Detour 1", "https://puzz.link/p?detour/10/10/182g307gfcug03464c07vovn00rgvnvnvg80g4g35dh2g21g6g1g"],
        ["Detour 2", "https://puzz.link/p?detour/8/8/10820g41g4000s000007v01g5gcg2"],
        ["Detour 3", "https://puzz.link/p?detour/8/8/a2gh4928h49000vs00o0vg00g1g435h5"],
        // Haisu
        ["Haisu 1", "https://puzz.link/p?haisu/18/18/511-120000000g014009002800i004g014009002800i004g014009002800g00000000000vvu000000000000000000000000000000000000000000000007vvg00009j2zzg1o5p6zs8zx2j8n7y3z4o4zh7zzh6h5h3zs5q"],
        ["Haisu 2", "https://puzz.link/p?haisu/4/4/44216n8d902m1m"],
        ["Haisu 3", "https://puzz.link/p?haisu/8/8/527704h490018a00e0000s060030o455g77zt6t"],
        // Heyawake
        ["Heyawake 1", "https://puzz.link/p?heyawake/10/10/274ssohvv000000000focossvvvvvv00000012h34001101h10g-11"],
        ["Heyawake 2", "https://puzz.link/p?heyawake/10/8/4k94j266sdc488g0206rv300cro0074g321g26"],
        ["Heyawake 3", "https://puzz.link/p?heyawake/12/12/5k2q1d0mgb85k2q0d06g381k0q00000u0001vg0007ou0ofg3tg00065g63242362i"],
        ["Heyawake 4", "https://puzz.link/p?heyawake/17/17/ju1vv0vvnm0bv07vg3gfvv7vvhvvuvvvevvnfv07vg3vo003001g00oe1v00fsvs17vo1vpvfufo001g03g0006001g1vs01v00fvvvvvsvvv0s2zj2k2m"],
        // Kakuro
        ["Kakuro 1", "https://puzz.link/p?kakuro/10/16/70Z3lg7ma0.sE0ladnQapgOoJgo6aoSfoZ0.ofgmJ0mcCvVim0EmCOoD0bho77oIfoa0ogJp4Knhal0Zs.0am0gl..5IDccZ4HhiDBcgd"],
        ["Kakuro 2", "https://puzz.link/p?kakuro/11/11/.6Bn.HDm4go3Er6go70mFOqj0Can6apOclg4lfapabna0h0qAdm3ModAr0Oo.m.0an..geajgTga74CIac"],
        ["Kakuro 3", "https://puzz.link/p?kakuro/2/2/k...-5"],
        ["Kakuro 4", "https://puzz.link/p?kakuro/5/5/kC-e-c-z..-8lff-giO"],
        ["Kakuro 5", "https://puzz.link/p?kakuro/6/6/m-eoI5lD-t.l-co-bm8-e-i97ggc"],
        // Kurochute
        ["Kurochute 1", "https://puzz.link/p?kurochute/13/13/31i33j13h3g3g47k.h1k71j4h1i2i2m2m531j1g53m1h13k33i3i6g1k34m1j1i5h3n4k41k39h1g32i13"],
        ["Kurochute 2", "https://puzz.link/p?kurochute/6/7/h12341p1l2p21234h"],
        ["Kurochute 3", "https://puzz.link/p?kurochute/9/9/h1h22k32h1h351j25i2h1g3g1k13i2h1h222j2i33h1i2h33h"],
        // Kurodoko
        ["Kurodoko 1", "https://puzz.link/p?kurodoko/10/10/3n5k2l5j4s5h76n98h3s4j4l4k3n4"],
        ["Kurodoko 2", "https://puzz.link/p?kurodoko/12/12/9l9l5l4l2l7l5l3l4l3h5p7h3l7l4l8l8l2l7l5l7l7"],
        ["Kurodoko 3", "https://puzz.link/p?kurodoko/4/4/g4g3.l.3g3g"],
        ["Kurodoko 4", "https://puzz.link/p?kurodoko/9/9/man5h365i4zo4i684h4n8m"],
        // Kurotto
        ["Kurotto 1", "https://puzz.link/p?kurotto/10/10/sah2j.8.h.4.h6l6g4.l.8i9h9j.7.h.7.h5l5t6h3i"],
        ["Kurotto 2", "https://puzz.link/p?kurotto/13/12/g1g1h.h0g1h2g0h4h4g1h3g1h.h2g4i2h.g1h2j.h2g.h.j6h.g.h3i6g2h5h5g4h2g.h.h3g.h5g.h.h8g9i3h.g.h6j5h3g.h.j7h.g.h9h"],
        ["Kurotto 3", "https://puzz.link/p?kurotto/4/4/g4g3.l.3g3g"],
        ["Kurotto 4", "https://puzz.link/p?kurotto/9/17/i123zg5h2g2h66h3g3h.7h.g4h4x567i4.5x5h7g4h56h8g5h.7h.g6h7zg234i"],
        // Masyu
        ["Masyu 1", "https://puzz.link/p?masyu/15/10/i0a02000000ik20620i6i0a021c049c209490j0100a0019329"],
        ["Masyu 2", "https://puzz.link/p?mashu/13/9/013009k10a3a39310c9313693i016030j039a20"],
        ["Masyu 3", "https://puzz.link/p?mashu/v:/10/10/000000060i23601000000001i200f90000"],
        // Mid-loop
        ["Mid-loop 1", "https://puzz.link/p?midloop/10/10/13579b37b9bdfwffgfzzzzzzzzzzzzz"],
        ["Mid-loop 2", "https://puzz.link/p?midloop/9/10/yfxfy7fz77fzj7fxbfx7bfx7fgfudfzgfg"],
        ["Mid-loop 3", "https://puzz.link/p?midloop/10/10/tfxfh7fxfzn7bfzhfztfzjfh7ftfpft77bfzhfi"],
        // Maxi Loop
        ["Maxi Loop 1", "https://puzz.link/p?maxi/10/10/37e0001tug030kdb00c2d00299pbgg3hg5j44s"],
        ["Maxi Loop 2", "https://puzz.link/p?maxi/24/16/424k150i894l5b98il295aiaa599aakl5ahakla5aikl9aaah995ai92l4abaiki8942i0kh0g4u020i1sjo9s4of43620jpgj68c4pj75001g1g00kspj462cp1jp08co4u347i3p7g9080f4673759b64879768352663589664786467589b685b"],
        // Moon or Sun
        ["Moon or Sun 1", "https://puzz.link/p?moonsun/10/10/4488q1m3bmld8iglha003s08seg100e0u201dqpdhqdepddqddhqneqqmqqqqqpdqndhp9"],
        ["Moon or Sun 2", "https://puzz.link/p?moonsun/10/10/54a94i93264d0qil0200vs03vs1stv0fu0vsk6lja01621i415ak6biai3b0c6bg6gi030"],
        ["Moon or Sun 3", "https://puzz.link/p?moonsun/7/7/000000000000000000306k916560a9i7900"],
        ["Moon or Sun 4", "https://puzz.link/p?moonsun/7/7/2b2a2imi0i38h49mi873300390i0a262970"],
        // Nanro
        ["Nanro 1", "https://puzz.link/p?nanro/10/10/497t25cekj5onpni7hfamlvv8864nva203gup1m3k1m1j4m2k2j2w4j3k4m2l"],
        ["Nanro 2", "https://puzz.link/p?nanro/16/16/af5nfaavltvbavn99b1mj29g1i8ldg2iidvbbunnvaavlkv2l05585da59a9a2r8vl8flfvqbvuluulvqr92ia2kauk2kk0t5i3h2g4h3zi2m2i3g3zl2g2n3m2z2o32o3z3m2n4g2zl3g2i2m5zi4h4g3h2j"],
        ["Nanro 3", "https://puzz.link/p?nanro/6/6/6lk5lcd1rrgm4i2n2n2r3"],
        ["Nanro 4", "https://puzz.link/p?nanro/8/8/ic30o61gc2i0fs080080g1vgh2s1zr3t"],
        // Nurikabe
        ["Nurikabe 1", "https://puzz.link/p?nurikabe/v:/6/6/4j4p6h4p6j6"],
        ["Nurikabe 2", "https://puzz.link/p?nurikabe/10/10/1k4u1j7i3r6y1w-11m3n2"],
        ["Nurikabe 3", "https://puzz.link/p?nurikabe/10/10/zh3j5t3g3hat3g3h9zr"],
        ["Nurikabe 4", "https://puzz.link/p?nurikabe/18/10/w3g8k1i4n1k5j1i1k9r1l2n3j3n9t1l2h2i1j5h2j7l4n6y"],
        ["Nurikabe 5", "https://puzz.link/p?nurikabe/7/7/1s5zm.i3g2"],
        // Nurimisaki
        ["Nurimisaki 1", "https://puzz.link/p?nurimisaki/12/12/h3l4k.l.m.j2n.k3o.h.j.m3r3m2j.i.i3j.i2i2t2k"],
        ["Nurimisaki 2", "https://puzz.link/p?nurimisaki/44/44/i3g.g.g.g.g.h.o.g.g.g.g.g.g.g.j.zg.x.zn.v.j.g.j2h.k.g.k.g.k.g.i3i.k.g.k.g.k.g.k.g.n.m.m.m.m.m.h.i.m.m.m.m.n3m.g.k.g.k.g.k.g.k.h.j.g.k.g.k.g.k.g.k3g.k3l.m.m.m.m.i.j.m.m.m.m.m.j.g.k.g.k.g.k.g.k.g.i.i3k.g.k.g.s.g.j.i.m.m.o.k.p3i.m.m.k2o.n.m.g.k.g.s.g.k.h.j.g.s.g.k.g.k.g.r.k.o.m.m.i3.i.o2k.m.m.o.h.g.s.g3k.g.k.g.i.i.k.g.k.g.k.g.k.g.v.m.m.m.m.h..h.m.m.m.m.v.g.k.g.k.g.k.g.k.i.i.g.k3g.k.g.s.g.h.o.m.m.k2o.i.3i.m.m.o.k.r.g.k.g.k.g.s.g.j.h.k.g.s.g.k.g.m.n.o2k.m.m.i3p.k.o.m.m.i.j.g.s.g.k.g.k3i.i.g.k.g.k.g.k.g.k.g.j.m.m.m.m.m.j.i.m.m.m.m.l3k.g3k.g.k.g.k.g.k.g.j.h.k.g.k.g.k.g.k.g.m3n.m.m.m.m.i.h.m.m.m.m.m.n.g.k.g.k.g.k.g.k.i3i.g.k.g.k.g.k.h2j.g.j.zi.zg.x.zg.j.g.g.g.g.g.g3g.o.h.g.g.g.g.g3i"],
        ["Nurimisaki 3", "https://puzz.link/p?nurimisaki/9/9/h3g5g3y.o2m3o.y3g2g.h"],
        // Onsen-meguri (Onsen)
        ["Onsen-meguri 1", "https://puzz.link/p?onsen/10/18/85264cappjb7n4c4pjr32fd5qeoqm8s908u000o18ee0gm97g1s826s66c778ite822zh7j6zzzzzzj3j8zh"],
        ["Onsen-meguri 2", "https://puzz.link/p?onsen/9/9/275aepgrdtati48vsf5vmkto5d11rgzs3h4zzj"],
        // Ripple
        ["Ripple 1", "https://puzz.link/p?ripple/10/10/c9hb4nfmueupv8ke11br7s3pk2r61hbqnsfezzzzz"],
        ["Ripple 2", "https://puzz.link/p?ripple/5/5/d6lqqf3ei1g3s2g1i"],
        ["Ripple 3", "https://puzz.link/p?ripple/6/6/4444440fo3u0m3h1i6l3g52g4g2i5h4"],
        ["Ripple 4", "http://pzv.jp/p?ripple/10/10/35srcenac8p9p4obgjqo5u0rnkfnnnfqvov4zzzzz"],
        // Shakashaka
        ["Shakashaka 1", "https://puzz.link/p?shakashaka/10/10/g4.g5bcgdhei.l....w01436555000azp"],
        ["Shakashaka 2", "https://puzz.link/p?shakashaka/10/10/rch.m.k.lcgbv.ldgcqcjchb"],
        ["Shakashaka 3", "https://puzz.link/p?shakashaka/12/12/.hcc6.rbrchbdh.mczck.jbehdrbp.gbcc"],
        ["Shakashaka 4", "https://puzz.link/p?shakashaka/17/17/bmbibw.g.ibh.l.n1.ch.g.ibh.z.kbm.pck.g.o.g.mcncmei.y.kboal00aj.ibzi.kbm"],
        ["Shakashaka 5", "https://puzz.link/p?shakashaka/25/9/lcici.k.zl.111.h..ccg72....jbgbg.g.i.i.l.ibg.h.gbh.j.g.ibg.h.gbhbi.k.1.jbg.1.1.zlbi.kci.l"],
        // Skyscrapers
        ["Skyscrapers 1", "https://puzz.link/p?skyscrapers/2/1/j1g"],
        ["Skyscrapers 2", "https://puzz.link/p?building/5/5/g2l4g2h4h4h2"],
        ["Skyscrapers 3", "https://puzz.link/p?skyscrapers/6/6/h4j2h2g3g3h4g5g2g2"],
        ["Skyscrapers 4", "https://puzz.link/p?skyscrapers/3/5/1235433212312321"],
        // Slitherlink
        ["Slitherlink 1", "https://puzz.link/p?slither/12/10/6b2b76cbbc6ah7656d76dd1dcg6bh56b516b8dcc6bgbbg62d0a3c"],
        ["Slitherlink 2", "https://puzz.link/p?slitherlink/9/9/233333332dk388583d8d38cg73d7c38212173d7c3721317c"],
        ["Slitherlink 3", "https://puzz.link/p?slither/5/5/gch1222ch331bg222"],
        ["Slitherlink 4", "https://puzz.link/p?slither/6/10/h1dgadddg1cgdddcg2cgddbdg1d"],
        // Starbattle
        ["Starbattle 1", "https://puzz.link/p?starbattle/10/10/2/5g252c2qkgbakk98igse7g88cp3730so000u"],
        ["Starbattle 2", "https://puzz.link/p?starbattle/10/10/2/l95las9vb5mmurbelo2m849c5gp068ci9029"],
        ["Starbattle 3", "https://puzz.link/p?starbattle/12/12/2/g0410igil9ck6q3l12glrcp12c081pu07do1ge6c0g0m0628gdkcn0"],
        ["Starbattle 4", "https://puzz.link/p?starbattle/13/13/2/40142jhssb4ij4491m8d6b0io4k8ab003vosuc02181v3e00o00fo3g00073phsg"],
        ["Starbattle 5", "https://puzz.link/p?starbattle/9/9/2/12a955kh37khi20fe0g13toea1c07g"],
        // Sudoku
        ["Sudoku 4x4 1", "https://puzz.link/p?sudoku/4/4/g2j1h1j3g"],
        ["Sudoku 4x4 2", "https://puzz.link/p?sudoku/4/4/i1g2j4g3i"],
        ["Sudoku 6x6 1", "https://puzz.link/p?sudoku/6/6/61j3g2j4g3j5g4j6g5j12"],
        ["Sudoku 6x6 2", "https://puzz.link/p?sudoku/6/6/g3h2g5j6h1l4h6j3g5g6h"],
        ["Sudoku 9x9 1", "https://puzz.link/p?sudoku/9/9/123456789789123456456789123231564897897231564564897231312645978978312645645978312"],
        ["Sudoku 9x9 2", "https://puzz.link/p?sudoku/9/9/15i96l17i7g65i42k1g5368h2i7g2p3h5g48g2g9k3h7i6"],
        ["Sudoku 9x9 3", "https://puzz.link/p?sudoku/9/9/91h8h343m5i1g3k1i3h5i9i8h7i5k7g5i6m787h4h26"],
    ];
    const testCases = [];

    for (let url of urls) {
        testCases.push([
            // The display text shown in test results
            url[0] + " (" + url[1] + ")",
            // puzz.link url
            url[1],
            // snapshot filename
            "puzzlink_" + url[0].toLowerCase().replace(/[^\w]/g, "_") + ".json",
        ])
    }

    forEach(testCases, (_, puzzlink_url, filename) => async () => {
        penpa.decode_puzzlink(puzzlink_url);

        const data = {
            mode: penpa.pu.mode,
            pu_q: penpa.pu.pu_q,
            usertab_choices: penpa.usertab_choices,
        };
        const body = {
            filename,
            data: JSON.stringify(data),
            updateSnapshots,
        };
        const snapshot = await fetchJson(`/snapshot`, "POST", body);

        const expected = snapshot.data ? JSON.parse(snapshot.data) : "SNAPSHOT NOT FOUND";
        assert.deepEqual(expected, data);
    });
});
