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
        // Aho
        ["Aho 1", "https://puzz.link/p?aho/10/10/.k9h4n4t9h4i6i4p8ici2h3t6n6h3k5"],
        ["Aho 2", "https://puzz.link/p?aho/11/7/-14lch-15zw11v-16p"],
        ["Aho 3", "https://puzz.link/p?aho/v:/11/11/k.m6i5g4i6h.j3j.i.j1l9h2o.h.l.j.i.j5j1h2i6g.i4m.k"],
        // Akari
        ["Akari 1", "https://puzz.link/p?akari/10/10/..g.h.i.j.k.l.t0143bzzp"],
        ["Akari 2", "https://puzz.link/p?akari/10/10/jbh.rchcpah.n.jbpchcp.jah"],
        ["Akari 3", "https://puzz.link/p?akari/20/20/h.k.h.kbz.ha.gb6.hab.hbl.h.zk.h.lbbiab.hb.h.zh.gbg6b.g.i6.zz.g.i6b.g.i.g.zh.hb.h.hbbib.l.hbzi.h.n.ha.ha.gb.gb.hbzbi.h.kb"],
        ["Akari 4", "https://puzz.link/p?akari/40/40/i..i8.g.gco1...i1.h.g.hd.i.g...t1.j6.g.hcgch.bo1..jah.g.g.gbh.h.q1.n.j.g.gbi.g.qco.j.g.l.bobqbh..lcobxbi.rbsbmbpbzi.r.mcgckci.sck.j.rdpblbhbkbg.r.n1.j.q.rcl..i6.m7.h.ocl7.i.gbm.h.oakb.i6.qcm.m.i.h.h.p..obj.jb.h.n..g.n.lbi.gbg.p.o.k.kbbg6clbbich1bj6.j.g.n.h.k.h0..l.h.j...n.i.j......bi6bi.gblbgbh1.......i.g.l.g.n.i.i.h....g.c1cmbm66.h.h.g..gb.l1.b.o5.g.hbgcbbj....1.mcg.g.g7.j2.o1....gbgbk..g..g.u...g.g.ibk.g71.bs.h.g.i.jbbi.g.pbh1b.hbg..h.h65.hcmbkbj1cbk.z.j1..p.g.x1.h1..cn1.hbt..6...l1.......bdkbj6.g..g.n.......b.r.h.g.g..n.........h1bl2bg.6.g.n1..........g...i...k.jcm........ib..bl6.g.m"],
        // Aqre
        ["Aqre 1", "https://puzz.link/p?aqre/10/10/vvvs000fvvu0007vvv00vv00vv00vv00vv002020210221g0120200211g2121212120"],
        ["Aqre 2", "https://puzz.link/p?aqre/6/11/vvvvvvvvvvv0820h4928g41012345221514131210"],
        ["Aqre 3", "https://puzz.link/p?aqre/7/7/0bdm3dmg0fg0r6o0fg40g123"],
        ["Aqre 4", "https://puzz.link/p?aqre/10/10/tpro1k3fovm0f8s00004sog0dk03tgm162g0000g000000000000"],
        // Araf
        ["Araf 1", "https://puzz.link/p?araf/8/8/p45h7h44h87l8j2l3-10gabi5icbo"],
        ["Araf 2", "https://puzz.link/p?araf/15/7/111g5a5g1fagaaazp125g898g817g464zp118g888g111g411"],
        ["Araf 3", "https://puzz.link/p?araf/10/10/1h4h1h7i6h6heldh34n5icrai8nc9hblahah3ibh-32h-32hd"],
        ["Araf 4", "https://puzz.link/p?araf/4/3/+100-10j.i0g"],
        // Ayeheya (Ekawayeh)
        ["Ayeheya 1", "https://puzz.link/p?ayeheya/10/10/14284gd0qj160c0o1g00000s00vv00v00v005g4o"],
        ["Ayeheya 2", "https://puzz.link/p?ayeheya/10/10/aolhb22044088qhl3a1g001no0s703tg0000p"],
        ["Ayeheya 3", "https://puzz.link/p?ayeheya/10/15/2hd2q5kb82hduq5nrf2ultbqnlfu0000f00c0cf0f0f00u0u0000000j4s2"],
        ["Ayeheya 4", "https://puzz.link/p?ayeheya/11/7/00i5i5ktkpkp00fv003v0es00fv0p"],
        // Balance Loop
        ["Balance Loop 1", "https://puzz.link/p?balance/9/9/dm1ich1o0i1pcpdido1h1i0m0"],
        ["Balance Loop 2", "https://puzz.link/p?balance/5/2/kbg011"],
        ["Balance Loop 3", "https://puzz.link/p?balance/10/10/-24-22-20-1e-1c-1a-18-16-14g-25-23-21-1f-1d-1b-19-17-15zzzzg"],
        // Castle Wall
        ["Castle 1", "https://puzz.link/p?castle/12/12/k223d142b141f224f234o212h236i133d123b243o034a122d131q136d145d215d246k"],
        ["Castle 2", "https://puzz.link/p?castle/10/10/k14110.10.10.03200.00.00.b10.b10.00.10.10.00.b10.b10.00.10.10.00.b10.10.10.10.00.00.00.00.b01300.00.00.22420.20.20.b00.20.20.00.22.00.00.20.b00.20.a00.22.00.a20.b00.00.00.00.20.20.20.20.k"],
        ["Castle 3", "https://puzz.link/p?castle/9/5/242g232b00.c00.c00.a00.a00.10.00.c00.c00.b242g232"],
        ["Castle 4", "https://puzz.link/p?castle/17/17/20.22922722d22822722922822b22b22a22b22a22a22722822f249p243p247p249p246p245p247p247p247p246p244p245p244p248p247p248p"],
        ["Castle 5", "https://puzz.link/p?castle/10/10/c224g243f123e122123p242d233d222d232p11311.e114f233g213c"],
        ["Castle 6", "https://puzz.link/p?castle/6/3/011022033044000a11.12.13.14.10.a2-13e32-23e42-33e529622563a"],
        // Cave
        ["Cave 1", "https://puzz.link/p?cave/10/10/7i6i7j6j3i5i6w8p6w2i7i5j3j6i3ib"],
        ["Cave 2", "https://puzz.link/p?cave/19/11/5g5g757g5i5i7775g5g7g7g5i5i7g7d9dgdbdgdi7i9g95g5g5g5g5i5i7g75g5g5g5g755g735g777y5g5g733g753g5h5g5g5g5g5i5i63g5g5g5g-14g-14-10-10g-14-10-10g-14g-10-14g-14g737g5i5i5h5i5g5g733g733g5h5g62"],
        ["Cave 3", "https://puzz.link/p?cave/7/5/g.g3.g3i3g.3g3r3h3h3"],
        // Cojun
        ["Cojun 1", "https://puzz.link/p?cojun/8/8/qhebtquqmqj0l7s7c8vo1up0zzh4v1j"],
        ["Cojun 2", "https://puzz.link/p?cojun/10/10/5k88hh20i142e2c5880g3o03vs0001fs02030g123g4g5"],
        // Compass
        ["Compass 1", "https://puzz.link/p?compass/10/6/....0......0.0....0.000013426897acdbe-10-11f-10=100%100+100g....h....i....j....k....zn0000"],
        ["Compass 2", "https://puzz.link/p?compass/10/10/r4..2j.4.3i3..5l5.2.l2..5m5...r4..3m.4..l2...l.325i3.1.j...4r"],
        ["Compass 3", "https://puzz.link/p?compass/6/6/m05..h..43t.1.2h11..m"],
        ["Compass 4", "https://puzz.link/p?compass/7/7/n..24i14..q22..q32..i.33.n"],
        ["Compass 5", "https://puzz.link/p?compass/8/8/x2.02i1.86i.056i.042h3.40i0.31i.200i.031x"],
        // Country Road
        ["Country Road 1", "https://puzz.link/p?country/12/12/4s6ndj8iorsml2p8llbdekqu9504hq8lvi2bt54jun8vv95nsi88c05g4g3i2i1i25o4g"],
        ["Country Road 2", "https://puzz.link/p?country/20/15/10156ggr62indoe611d38431oonjrhv7hltmb6t90d6hdme4rc8jcp26ge7vo7vvo32vk8tv1v7uefro67hg208e82hg953tva7tu0fg0fv6m1u0ei5g24k54g2l7g557k92h3g3g2g3"],
        ["Country Road 3", "https://puzz.link/p?country/6/6/1jrrg0e300svh3"],
        // Detour
        ["Detour 1", "https://puzz.link/p?detour/10/10/182g307gfcug03464c07vovn00rgvnvnvg80g4g35dh2g21g6g1g"],
        ["Detour 2", "https://puzz.link/p?detour/8/8/10820g41g4000s000007v01g5gcg2"],
        ["Detour 3", "https://puzz.link/p?detour/8/8/a2gh4928h49000vs00o0vg00g1g435h5"],
        // Double Back
        ["Double Back 1", "https://puzz.link/p?doubleback/10/10/o1g300000000162c4o007vvvvvvvvvvv7f70"],
        ["Double Back 2", "https://puzz.link/p?doubleback/8/8/b2stfautich00cq80j2gk0u0"],
        ["Double Back 3", "https://puzz.link/p?doubleback/10/10/aqkqpdas5sbtnatdl27ms31of1k6803vfsne000000001g1g00000000"],
        // Easy as ABC
        ["Easy as ABC 1", "https://puzz.link/p?easyasabc/5/5/3/123j654h987.0-ff-33"],
        ["Easy as ABC 2", "https://puzz.link/p?easyasabc/15/13/3/.0123456789abcdef-10-11-12-13-14-15-16-17-18-19-1a-1b-1c-1d-1e-1f-20-21-22-23-24-25-26-27-28-29-2a-2b-2c-2d-2e-2f-30-31-32-33-34i."],
        ["Easy as ABC 3", "https://puzz.link/p?easyasabc/6/6/3/g1g1g12g2g1g1g1g1h1g2g1"],
        ["Easy as ABC 4", "https://puzz.link/p?easyasabc/9/9/7/i61313h75174g65g6272h5g436161g7g"],
        // Factors
        ["Factors 1", "https://puzz.link/p?factors/15/15/2ii9p6jlepctpvvnvvcvtsnrvfnvumfuafuqrdigoivvuvjufvv6veme19dokvv1ovoo31to5vv0vsrduvfv*5028-4d-3c6-b4-10-90+249-5a-46-6e+2a0-30-3f+4e0-2d-1c-37-84-30-fce-28+16c-87-87-1e-84+190-62-30+555+604-1e-36$4ec40-b6-6c-8f-1e-3c-606-82+898-9a+288*457e+1b0-20-2ac-283-54-48-96+870=6f8-28-75-62-78e-1e+276-46+438a+7d2c-3c-3c-75-3c-30-37-5b6b+654-20%b50+222+258-48"],
        ["Factors 2", "https://puzz.link/p?factors/9/9/nbuurdjudmrrun8cv6pvvdtnvsr7pg39-2d-2a-308-20-38f8-1e-1267-1c7-1e-48-18-18-2d983a-303e-30fc9-23-36287-48-15-30-14"],
        ["Factors 3", "https://puzz.link/p?factors/9/9/bvftapbukqlvnugu0fvvmbujfvvg3o-202-18-1b-28-2338-3f-368-12e-282-48*6950-12696-1c-1bf-30-2a-10-2d98-23-28c-122-207-36"],
        // Fillmat
        ["Fillmat 1", "https://puzz.link/p?fillmat/9/10/2u3g2a2d4e2d3a3g2s2b2b2e"],
        ["Fillmat 2", "https://puzz.link/p?fillmat/5/5/e.a..b.a.a.d..a.a"],
        // Fillomino
        ["Fillomino 1", "https://puzz.link/p?fillomino/5/5/-10-10-10-10-10-108.8-10-10.1.-10-108.8-10-10-10g-10-10"],
        ["Fillomino 2", "https://puzz.link/p?fillomino/7/3/159u159"],
        ["Fillomino 3", "https://puzz.link/p?fillomino/10/10/q-138g84ga3h46g42g33r46g44ga8h12g15g58r21g28g87h42g14g4-13q"],
        ["Fillomino 4", "https://puzz.link/p?fillomino/7/10/r6l8l5l2lah3i5h9i9i4c4o"],
        // Firefly (Hotaru Beam)
        ["Firefly 1", "https://puzz.link/p?firefly/10/10/k40f20c41j22b24g2.3.b21b10b4.2.g21b12e12d32c10f30k"],
        ["Firefly 2", "https://puzz.link/p?firefly/7/7/e3.h1.13a0.f0.f0.a151543h1.b3.a"],
        ["Firefly 3", "https://puzz.link/p?firefly/9/9/c25b45c24k23c2340a44c3.m4.c3.a301.c25k13c33b13c"],
        // Minor bug. This parses correctly but isn't rendered right because it's zero rows thick.
        ["Firefly 4", "https://puzz.link/p?firefly/10/1/4.h0./"],
        // Geradeweg
        ["Geradeweg 1", "https://puzz.link/p?geradeweg/17/10/j6m1q4g4o55o54i1s1o2h3p6h3o2s1i35o53o2g3q6m.+100j"],
        ["Geradeweg 2", "https://puzz.link/p?geradeweg/10/10/g11111111g1111111111l1g11i11g111111111g11111111h1111111111111111g1111g111111111111g11111111g"],
        // Haisu
        ["Haisu 1", "https://puzz.link/p?haisu/18/18/511-120000000g014009002800i004g014009002800i004g014009002800g00000000000vvu000000000000000000000000000000000000000000000007vvg00009j2zzg1o5p6zs8zx2j8n7y3z4o4zh7zzh6h5h3zs5q"],
        ["Haisu 2", "https://puzz.link/p?haisu/4/4/44216n8d902m1m"],
        ["Haisu 3", "https://puzz.link/p?haisu/8/8/527704h490018a00e0000s060030o455g77zt6t"],
        // Hanare-gumi
        ["Hanare-gumi 1", "https://puzz.link/p?hanare/6/6/35vbm8uaihjfzv"],
        ["Hanare-gumi 2", "https://puzz.link/p?hanare/8/8/bdbiufrpnii0u6s5t4195qcgh2zs6i3p5i5n"],
        // Hashiwokakero (Bridges)
        ["Hashiwokakero 1", "https://puzz.link/p?hashikake/5/5/1234g1-10+100=100g.h.i.l."],
        ["Hashiwokakero 2", "https://puzz.link/p?hashi/9/9/h2g3g.q.g1i3g.o2i1i2o.g2i2g1q.g3g3h"],
        ["Hashiwokakero 3", "https://puzz.link/p?bridges/17/13/l2h1w2i3h2i3zi1h3p1g2k2g1h3r1k4g4h4h4i3h2u1g2l1g3n1g3y1j.g3g3g3h3r2j.h3g.g2"],
        ["Hashiwokakero 4", "https://puzz.link/p?hashi/41/19/v3k6k3zzzk2i3g2o3i4zzw3i3g1m3k1i3g2zzs3g3i3k4s2g3g4zzzm3k2m3g2zzk3i5i1g3k2s3i2g3g4zzg4g3g1s4i3u3g5zzi2i2g2k1s3k1zzy1k4k1s1zzi2g1i2g4k4i4k4i6k4k4"],
        // Heyawake
        ["Heyawake 1", "https://puzz.link/p?heyawake/10/10/274ssohvv000000000focossvvvvvv00000012h34001101h10g-11"],
        ["Heyawake 2", "https://puzz.link/p?heyawake/10/8/4k94j266sdc488g0206rv300cro0074g321g26"],
        ["Heyawake 3", "https://puzz.link/p?heyawake/12/12/5k2q1d0mgb85k2q0d06g381k0q00000u0001vg0007ou0ofg3tg00065g63242362i"],
        ["Heyawake 4", "https://puzz.link/p?heyawake/17/17/ju1vv0vvnm0bv07vg3gfvv7vvhvvuvvvevvnfv07vg3vo003001g00oe1v00fsvs17vo1vpvfufo001g03g0006001g1vs01v00fvvvvvsvvv0s2zj2k2m"],
        // Hitori
        ["Hitori 1", "https://puzz.link/p?hitori/5/5/1-6i5-1v-2h1n-196-lx-3f45-iu91n-co-269cy5-1v-2h"],
        ["Hitori 2", "https://puzz.link/p?hitori/8/8/.%.632..1.6..1.12.23..%3.%7..7..5.6.35%..7.7..7.2.%6.2.%.1..1.1./"],
        ["Hitori 3", "https://puzz.link/p?hitori/8/8/8416325715684121262378436475273858613542475783762346528431821615"],
        ["Hitori 4", "https://puzz.link/p?hitori/9/6/number15burgerkingfootlettucethelastthingyouwantinyourburger"],
        // Juosan
        ["Juosan 1", "https://puzz.link/p?juosan/8/8/c3000000000003g00000000042g"],
        ["Juosan 2", "https://puzz.link/p?juosan/11/12/04fu7ukjl4btl6idrvifnvrtrvs0vd9vrshu97v9kiv4p4410ag1421521322524622g5g184551g134231g"],
        ["Juosan 3", "https://puzz.link/p?juosan/v:/10/10/at3rduvovcu0t8q15af0mn0gm5f0rpvovv7sg1g7h81414g4g6g611h4j"],
        ["Juosan 4", "https://puzz.link/p?juosan/10/10/b2m7d6q9njdn5daqls01ou8767g16u8fo00m46a6g23g66g24g364g434g"],
        // Kakuro
        ["Kakuro 1", "https://puzz.link/p?kakuro/10/16/70Z3lg7ma0.sE0ladnQapgOoJgo6aoSfoZ0.ofgmJ0mcCvVim0EmCOoD0bho77oIfoa0ogJp4Knhal0Zs.0am0gl..5IDccZ4HhiDBcgd"],
        ["Kakuro 2", "https://puzz.link/p?kakuro/11/11/.6Bn.HDm4go3Er6go70mFOqj0Can6apOclg4lfapabna0h0qAdm3ModAr0Oo.m.0an..geajgTga74CIac"],
        ["Kakuro 3", "https://puzz.link/p?kakuro/2/2/k...-5"],
        ["Kakuro 4", "https://puzz.link/p?kakuro/5/5/kC-e-c-z..-8lff-giO"],
        ["Kakuro 5", "https://puzz.link/p?kakuro/6/6/m-eoI5lD-t.l-co-bm8-e-i97ggc"],
        // Kropki
        ["Kropki 1", "https://puzz.link/p?kropki/1/10/h3e"],
        ["Kropki 2", "https://puzz.link/p?kropki/10/1/h3e"],
        ["Kropki 3", "https://puzz.link/p?kropki/13/13/09000100000003312139b30ia4caa4caki2i0gna3002cng3cng40004090000d910000000000000i009000000000099300l030190"],
        ["Kropki 4", "https://puzz.link/p?kropki/7/7/ddc0330l00729c6ic6e9j0i94d04"],
        ["Kropki 5", "https://puzz.link/p?kropki/9/4/00000599cccdde000006"],
        // Kurochute
        ["Kurochute 1", "https://puzz.link/p?kurochute/13/13/31i33j13h3g3g47k.h1k71j4h1i2i2m2m531j1g53m1h13k33i3i6g1k34m1j1i5h3n4k41k39h1g32i13"],
        ["Kurochute 2", "https://puzz.link/p?kurochute/6/7/h12341p1l2p21234h"],
        ["Kurochute 3", "https://puzz.link/p?kurochute/9/9/h1h22k32h1h351j25i2h1g3g1k13i2h1h222j2i33h1i2h33h"],
        // Kurodoko
        ["Kurodoko 1", "https://puzz.link/p?kurodoko/10/10/3n5k2l5j4s5h76n98h3s4j4l4k3n4"],
        ["Kurodoko 2", "https://puzz.link/p?kurodoko/12/12/9l9l5l4l2l7l5l3l4l3h5p7h3l7l4l8l8l2l7l5l7l7"],
        ["Kurodoko 3", "https://puzz.link/p?kurodoko/4/4/g4g3.l.3g3g"],
        ["Kurodoko 4", "https://puzz.link/p?kurodoko/9/9/man5h365i4zo4i684h4n8m"],
        // Look-Air
        ["Look-Air 1", "https://puzz.link/p?lookair/10/10/3a1k3c1a1f1b0b5d1g2f2g3d5b1b3f1a0c3k1a3"],
        ["Look-Air 2", "https://puzz.link/p?lookair/12/3/m5b0b.b0m"],
        // Kurotto
        ["Kurotto 1", "https://puzz.link/p?kurotto/10/10/sah2j.8.h.4.h6l6g4.l.8i9h9j.7.h.7.h5l5t6h3i"],
        ["Kurotto 2", "https://puzz.link/p?kurotto/13/12/g1g1h.h0g1h2g0h4h4g1h3g1h.h2g4i2h.g1h2j.h2g.h.j6h.g.h3i6g2h5h5g4h2g.h.h3g.h5g.h.h8g9i3h.g.h6j5h3g.h.j7h.g.h9h"],
        ["Kurotto 3", "https://puzz.link/p?kurotto/4/4/g4g3.l.3g3g"],
        ["Kurotto 4", "https://puzz.link/p?kurotto/9/17/i123zg5h2g2h66h3g3h.7h.g4h4x567i4.5x5h7g4h56h8g5h.7h.g6h7zg234i"],
        // LITS
        ["LITS 1", "https://puzz.link/p?lits/12/8/11084o2iif51gg8040vf3vu577erlpvfnvu"],
        ["LITS 2", "https://puzz.link/p?lits/8/8/5ajmi9mhai2g514bdn32f340"],
        ["LITS 3", "https://puzz.link/p?lits/6/6/lldoa4043q6c"],
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
        // Meandering Numbers 
        ["Meandering Numbers 1", "https://puzz.link/p?meander/10/10/5k88hh20i142e2c5880g3o03vs0001fs02030g123g4g5"],
        ["Meandering Numbers 2", "https://puzz.link/p?meander/6/6/d01gb04gc6sezv"],
        ["Meandering Numbers 3", "https://puzz.link/p?meander/10/10/0105187060b050g000funo7ivg02fo827s00zzzzz"],
        ["Meandering Numbers 4", "https://puzz.link/p?meander/10/10/11bindeqt11bin5easc8c60000vvf8300700i8n2zzk8zt1k1"],
        // Mochikoro
        ["Mochikoro 1", "https://puzz.link/p?mochikoro/10/10/..3l4k3j2u6i3m3r2w4i4l2j2g3h"],
        ["Mochikoro 2", "https://puzz.link/p?mochikoro/10/10/4t4i35zq3y+100k2r3j-10i"],
        ["Mochikoro 3", "https://puzz.link/p?mochikoro/7/7/3i2q3i2m4i3q1i3"],
        // Mochinyoro
        ["Mochinyoro 1", "https://puzz.link/p?mochinyoro/10/10/q-14l6zzzhcleq"],
        ["Mochinyoro 2", "https://puzz.link/p?mochinyoro/15/3/1-10+100...zx."],
        ["Mochinyoro 3", "https://puzz.link/p?mochinyoro/12/12/zl3k6zn5k3n4k7zn4k7zl"],
        // Moon or Sun
        ["Moon or Sun 1", "https://puzz.link/p?moonsun/10/10/4488q1m3bmld8iglha003s08seg100e0u201dqpdhqdepddqddhqneqqmqqqqqpdqndhp9"],
        ["Moon or Sun 2", "https://puzz.link/p?moonsun/10/10/54a94i93264d0qil0200vs03vs1stv0fu0vsk6lja01621i415ak6biai3b0c6bg6gi030"],
        ["Moon or Sun 3", "https://puzz.link/p?moonsun/7/7/000000000000000000306k916560a9i7900"],
        ["Moon or Sun 4", "https://puzz.link/p?moonsun/7/7/2b2a2imi0i38h49mi873300390i0a262970"],
        // Nagenawa
        ["Nagenawa 1", "https://puzz.link/p?nagenawa/8/8/04h800f00o00e08602ga1040-380000"],
        ["Nagenawa 2", "https://puzz.link/p?nagenawa/4/4/iqg21g462"],
        ["Nagenawa 3", "https://puzz.link/p?nagenawa/7/7/mbfs1vmj8dp9rusktgh5g01g0012003i"],
        ["Nagenawa 4", "https://puzz.link/p?nagenawa/9/6/5hn6cd5lkko663vr30o121122112122"],
        // Nanro
        ["Nanro 1", "https://puzz.link/p?nanro/10/10/497t25cekj5onpni7hfamlvv8864nva203gup1m3k1m1j4m2k2j2w4j3k4m2l"],
        ["Nanro 2", "https://puzz.link/p?nanro/16/16/af5nfaavltvbavn99b1mj29g1i8ldg2iidvbbunnvaavlkv2l05585da59a9a2r8vl8flfvqbvuluulvqr92ia2kauk2kk0t5i3h2g4h3zi2m2i3g3zl2g2n3m2z2o32o3z3m2n4g2zl3g2i2m5zi4h4g3h2j"],
        ["Nanro 3", "https://puzz.link/p?nanro/6/6/6lk5lcd1rrgm4i2n2n2r3"],
        ["Nanro 4", "https://puzz.link/p?nanro/8/8/ic30o61gc2i0fs080080g1vgh2s1zr3t"],
        // Nonogram
        ["Nonogram 1", "https://puzz.link/p?nonogram/4/10/123h456h789habcn1g2g3g4g3g2g1g"],
        ["Nonogram 2", "https://puzz.link/p?nonogram/50/45/-14zh627z312218w4142215v22113126u23216x22747x6c225x11f24x22-12214w21-1354x4-1434y2d75y225367w21532541u55534211u241224211t21423431u1254232v3b2314w21a336w1182321v3533311v3133311v414341w3113421v54412x948z1758y23533x36312x47212x5632y7723y8a55ycc1dy-1836z-14215y1623225v311534w12464x11335334u37121218u23117227u12113245u1211121325s34112134u122124av12211aw638z-1dzjb38zh633229y612221ax71126135w7126524x872425y425127y3222555x323e33y413-1133y4697213x647823y61567z336611y31374621w23358621w223545511v32353a5x3553184x3343571x5547721x65342731w94442711w211434274v1311344262u111355732v23431f12w2344e21x1445c14x1232a22x3321222x75311212w13223114w9341113x2113215x12114by12346z1235zg165zh246zh216zh247zh527zh356zh"],
        ["Nonogram 3", "https://puzz.link/p?nonogram/20/14/2l12k112j112j711j91k5121i74k414j48k48k4214i94k73k28k252j81k44k33k4l44n92na12m1912l11611k5421l5126l2812l165m524m4an3ando8o"],
        // Norinori
        ["Norinori 1", "https://puzz.link/p?norinori/18/10/365btauumbakihchaf0o3q67cbjcg8kki94dtj2oorju6tnmontv0vgb4ssnvsb9v3g"],
        ["Norinori 2", "https://puzz.link/p?norinori/10/10/ebdcb96kfaulotutil9qscvm7ivh0aumd8mc"],
        ["Norinori 3", "https://puzz.link/p?norinori/10/10/09binldaqlaqkl8qg4fg04v803fuk0ovu0vu"],
        // Numberlink
        ["Numberlink 1", "https://puzz.link/p?numberlink/11/11/-2bap-2ft-15zrazy-2fg-2bn-15o"],
        ["Numberlink 2", "https://puzz.link/p?numlin/11/11/g1m2h6x6i7h5g7k5p4j8y1g3u8g2n3m4g"],
        ["Numberlink 3", "https://puzz.link/p?numlin/10/10/1w2h3k4k6g5i7k2n8k5i4g1k8k6h7w3"],
        ["Numberlink 4", "https://puzz.link/p?numlin/10/10/j48315g977k512g2g48s3g66j6i22j55g9m76g49g93g1g188g4j7g44k3h"],
        ["Numberlink 5", "https://puzz.link/p?numlin/7/7/l6g1l2l3l4l5l654321"],
        // Nuribou
        ["Nuribou 1", "https://puzz.link/p?nuribou/10/10/k2i37zhal8k7h2zhfw3m2g"],
        ["Nuribou 2", "https://puzz.link/p?nuribou/9/9/n2u.i8o9i4o5i.u1n"],
        ["Nuribou 3", "https://puzz.link/p?nuribou/10/10/s+200h-13i-13zzznbi1h2i"],
        // Nurikabe
        ["Nurikabe 1", "https://puzz.link/p?nurikabe/v:/6/6/4j4p6h4p6j6"],
        ["Nurikabe 2", "https://puzz.link/p?nurikabe/10/10/1k4u1j7i3r6y1w-11m3n2"],
        ["Nurikabe 3", "https://puzz.link/p?nurikabe/10/10/zh3j5t3g3hat3g3h9zr"],
        ["Nurikabe 4", "https://puzz.link/p?nurikabe/18/10/w3g8k1i4n1k5j1i1k9r1l2n3j3n9t1l2h2i1j5h2j7l4n6y"],
        ["Nurikabe 5", "https://puzz.link/p?nurikabe/7/7/1s5zm.i3g2"],
        // Nurimaze
        ["Nurimaze 1", "https://puzz.link/p?nurimaze/10/10/nnvfvfvuntvvvv7vrmedmfrunvbvnnvfnmdr81b49384e46483j4g3r28"],
        ["Nurimaze 2", "https://puzz.link/p?nurimaze/12/12/mmvnfrbrbrnrntndn9rbrbrlll8dtkmurvprptpmtjuvrftvottuvg4i1n383r4f4j2w3q"],
        ["Nurimaze 3", "https://puzz.link/p?nurimaze/13/13/007vvuuvvtj6vvvvrvvmcrvvvrvvu000etpvv7vstrjnefbptf7estrjtubvprn0w1o3m3zzd2w"],
        ["Nurimaze 4", "https://puzz.link/p?nurimaze/7/7/bvvvfvvuobk9vitsno1535354i494i4545352"],
        // Nurimisaki
        ["Nurimisaki 1", "https://puzz.link/p?nurimisaki/12/12/h3l4k.l.m.j2n.k3o.h.j.m3r3m2j.i.i3j.i2i2t2k"],
        ["Nurimisaki 2", "https://puzz.link/p?nurimisaki/44/44/i3g.g.g.g.g.h.o.g.g.g.g.g.g.g.j.zg.x.zn.v.j.g.j2h.k.g.k.g.k.g.i3i.k.g.k.g.k.g.k.g.n.m.m.m.m.m.h.i.m.m.m.m.n3m.g.k.g.k.g.k.g.k.h.j.g.k.g.k.g.k.g.k3g.k3l.m.m.m.m.i.j.m.m.m.m.m.j.g.k.g.k.g.k.g.k.g.i.i3k.g.k.g.s.g.j.i.m.m.o.k.p3i.m.m.k2o.n.m.g.k.g.s.g.k.h.j.g.s.g.k.g.k.g.r.k.o.m.m.i3.i.o2k.m.m.o.h.g.s.g3k.g.k.g.i.i.k.g.k.g.k.g.k.g.v.m.m.m.m.h..h.m.m.m.m.v.g.k.g.k.g.k.g.k.i.i.g.k3g.k.g.s.g.h.o.m.m.k2o.i.3i.m.m.o.k.r.g.k.g.k.g.s.g.j.h.k.g.s.g.k.g.m.n.o2k.m.m.i3p.k.o.m.m.i.j.g.s.g.k.g.k3i.i.g.k.g.k.g.k.g.k.g.j.m.m.m.m.m.j.i.m.m.m.m.l3k.g3k.g.k.g.k.g.k.g.j.h.k.g.k.g.k.g.k.g.m3n.m.m.m.m.i.h.m.m.m.m.m.n.g.k.g.k.g.k.g.k.i3i.g.k.g.k.g.k.h2j.g.j.zi.zg.x.zg.j.g.g.g.g.g.g3g.o.h.g.g.g.g.g3i"],
        ["Nurimisaki 3", "https://puzz.link/p?nurimisaki/9/9/h3g5g3y.o2m3o.y3g2g.h"],
        // Onsen-meguri (Onsen)
        ["Onsen-meguri 1", "https://puzz.link/p?onsen/10/18/85264cappjb7n4c4pjr32fd5qeoqm8s908u000o18ee0gm97g1s826s66c778ite822zh7j6zzzzzzj3j8zh"],
        ["Onsen-meguri 2", "https://puzz.link/p?onsen/9/9/275aepgrdtati48vsf5vmkto5d11rgzs3h4zzj"],
        // Paintarea
        ["Paintarea 1", "https://puzz.link/p?paintarea/10/10/vfmnvettvfttvvnqufvvvvsevqvvfmvfbt1rm2q2m2.h1.m2q1m"],
        ["Paintarea 2", "https://puzz.link/p?paintarea/10/7/2327evvvrv2sgfu6cal1a0c8vzzr"],
        // Pencils
        ["Pencils 1", "https://puzz.link/p?pencils/6/6/1234k5.ghij-10zq-ff"],
        ["Pencils 2", "https://puzz.link/p?pencils/8/8/1o1k1k1l1o111m1n1m11m1k1m1o1l1m1l1l"],
        ["Pencils 3", "https://puzz.link/p?pencils/6/6/2kilgphk1w4kin5"],
        ["Pencils 4", "https://puzz.link/p?pencils/11/11/oi2kglgsgnhin2kgngkgl32uhkjkiyhogphlg2gv4l2jho3j"],
        // Putteria
        ["Putteria 1", "https://puzz.link/p?putteria/10/10/4b5pf5aprd948qbr8hjiejbftaadvscftra6zzzzz"],
        ["Putteria 2", "https://puzz.link/p?putteria/8/8/adcaagl55ac0dntnvpnvjrng0123456789abcdef1g1z1z1h1"],
        // Regional Yajilin (Yajilin Regions)
        ["Regional Yajilin 1", "https://puzz.link/p?yajilin-regions/11/6/0457vvfnvnpkvun421100422g2123g1g1"],
        ["Regional Yajilin 2", "https://puzz.link/p?yajilin-regions/8/8/b2om8i4108q00s3vg1s00sg0q"],
        ["Regional Yajilin 3", "https://puzz.link/p?yajilin-regions/16/3/007005005vvv00005000h"],
        ["Regional Yajilin 4", "https://puzz.link/p?yajilin-regions/12/10/189cmfufuj9ipcvsvt6i2gfn1okc076jsv7ihg0sa3nog2231g232g2h213"],
        // Renban (Renban-Madoguchi)
        ["Renban 1", "https://puzz.link/p?renban/10/10/5k88hh20i142e2c5880g3o03vs0001fs02030g123g4g5"],
        ["Renban 2", "https://puzz.link/p?renban/8/8/rlbb326f5bb09aq7mv636310m1gco3sch3wdh4l"],
        // Ring-ring
        ["Ring-ring 1", "https://puzz.link/p?ringring/15/10/2540a304.26e5646a14351"],
        ["Ring-ring 2", "https://puzz.link/p?ringring/7/7/2ia"],
        ["Ring-ring 3", "https://puzz.link/p?ringring/14/10/k5a.87u"],
        ["Ring-ring 4", "https://puzz.link/p?ringring/10/10/3be82fh4e0"],
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
        // Shikaku
        ["Shikaku 1", "https://puzz.link/p?shikaku/10/10/x3gag.s9m.p.m8s-10g.gax"],
        ["Shikaku 2", "https://puzz.link/p?shikaku/24/14/-1ezh-1ep9h-18zzfp-10zt-2at8zzvct9zt-1epezz-2ah-15pazh-18"],
        ["Shikaku 3", "https://puzz.link/p?shikaku/8/8/2222y.j55j66j.y3333"],
        // Shimaguni (Islands)
        ["Shimaguni 1", "https://puzz.link/p?shimaguni/15/10/319eqrdmkg4t6bsufv7lo3r7jk9acr3408vvv7rs3hod4kgv21rk7lpzg5g3i"],
        ["Shimaguni 2", "https://puzz.link/p?shimaguni/4/4/7qoo90h2g"],
        ["Shimaguni 3", "https://puzz.link/p?shimaguni/40/10/5bc9s7d2amojovom9dcncvctmqlelultbtbtbtbo7qnqnqn2jlflelf576v6t6uab2d3r2s8l4qml9so3o3orov0575456fg0g8g0gc6o3g0011g000200f70000o0f0h0101207cn4k4k7v3v3r3uzoagaah4zq"],
        // Simple Loop
        ["Simple Loop 1", "https://puzz.link/p?simpleloop/12/12/40860g10m0kc0o0m3480q0g0008h2"],
        ["Simple Loop 2", "https://puzz.link/p?simpleloop/6/6/1g1g06o0"],
        ["Simple Loop 3", "https://puzz.link/p?simpleloop/10/10/ovof472311ggo8s4u0v0"],
        ["Simple Loop 4", "https://puzz.link/p?simpleloop/v:/11/11/0408080080k400g014000024g"],
        // Skyscrapers
        ["Skyscrapers 1", "https://puzz.link/p?skyscrapers/2/1/j1g"],
        ["Skyscrapers 2", "https://puzz.link/p?building/5/5/g2l4g2h4h4h2"],
        ["Skyscrapers 3", "https://puzz.link/p?skyscrapers/6/6/h4j2h2g3g3h4g5g2g2"],
        ["Skyscrapers 4", "https://puzz.link/p?skyscrapers/3/5/1235433212312321"],
        // Slant (Gokigen)
        ["Slant 1", "https://puzz.link/p?gokigen/10/10/hc5b0bgcgdg7217bidj8778d7ag676617377dgcg8c6317222d6221clbga"],
        ["Slant 2", "https://puzz.link/p?gokigen/7/7/kag2d27ag6bh26c91cjbg5cgehci"],
        ["Slant 3", "https://puzz.link/p?gokigen/7/7/gag7bg4cgch3dh3ch928dk7ag4bh.ic"],
        // Slitherlink
        ["Slitherlink 1", "https://puzz.link/p?slither/12/10/6b2b76cbbc6ah7656d76dd1dcg6bh56b516b8dcc6bgbbg62d0a3c"],
        ["Slitherlink 2", "https://puzz.link/p?slitherlink/9/9/233333332dk388583d8d38cg73d7c38212173d7c3721317c"],
        ["Slitherlink 3", "https://puzz.link/p?slither/5/5/gch1222ch331bg222"],
        ["Slitherlink 4", "https://puzz.link/p?slither/6/10/h1dgadddg1cgdddcg2cgddbdg1d"],
        // Snake
        ["Snake 1", "https://puzz.link/p?snake/2/2/99g11"],
        ["Snake 2", "https://puzz.link/p?snake/6/6/600000600000g4g333g4g333"],
        ["Snake 3", "https://puzz.link/p?snake/9/9/0600000000000000000000000603g4g5g6g72g3g4g5g6"],
        ["Snake 4", "https://puzz.link/p?snake/11/11/00000000000000000000000000000000000000000957664857598o9"],
        // Starbattle
        ["Starbattle 1", "https://puzz.link/p?starbattle/10/10/2/5g252c2qkgbakk98igse7g88cp3730so000u"],
        ["Starbattle 2", "https://puzz.link/p?starbattle/10/10/2/l95las9vb5mmurbelo2m849c5gp068ci9029"],
        ["Starbattle 3", "https://puzz.link/p?starbattle/12/12/2/g0410igil9ck6q3l12glrcp12c081pu07do1ge6c0g0m0628gdkcn0"],
        ["Starbattle 4", "https://puzz.link/p?starbattle/13/13/2/40142jhssb4ij4491m8d6b0io4k8ab003vosuc02181v3e00o00fo3g00073phsg"],
        ["Starbattle 5", "https://puzz.link/p?starbattle/9/9/42/12a955kh37khi20fe0g13toea1c07g"],
        // Stostone
        ["Stostone 1", "https://puzz.link/p?stostone/8/8/kd38q6hkd38g03g1tvg0js00h8p"],
        ["Stostone 2", "https://puzz.link/p?stostone/12/12/0g082c9jcpm8h48jcpmchi42210001vpmdg00go7v0o800djcvs000h3933346222566"],
        ["Stostone 3", "https://puzz.link/p?stostone/17/10/2449j7hv7afpdju6j6cg000000000000etp32cgo3430c0p3avvvo0000000000326765532g"],
        // Sudoku
        ["Sudoku 4x4 1", "https://puzz.link/p?sudoku/4/4/g2j1h1j3g"],
        ["Sudoku 4x4 2", "https://puzz.link/p?sudoku/4/4/i1g2j4g3i"],
        ["Sudoku 6x6 1", "https://puzz.link/p?sudoku/6/6/61j3g2j4g3j5g4j6g5j12"],
        ["Sudoku 6x6 2", "https://puzz.link/p?sudoku/6/6/g3h2g5j6h1l4h6j3g5g6h"],
        ["Sudoku 9x9 1", "https://puzz.link/p?sudoku/9/9/123456789789123456456789123231564897897231564564897231312645978978312645645978312"],
        ["Sudoku 9x9 2", "https://puzz.link/p?sudoku/9/9/15i96l17i7g65i42k1g5368h2i7g2p3h5g48g2g9k3h7i6"],
        ["Sudoku 9x9 3", "https://puzz.link/p?sudoku/9/9/91h8h343m5i1g3k1i3h5i9i8h7i5k7g5i6m787h4h26"],
        // Sukoro
        ["Sukoro 1", "https://puzz.link/p?sukoro/5/4/1c2b3d4..e"],
        ["Sukoro 2", "https://puzz.link/p?sukoro/8/8/b1a2a21a1a2a2b1a2a2a1b2a2a2a12a1a2a2b1a1a2a21a1a2a2b1a2a1a1"],
        // Sukoro-room
        ["Sukoro-room 1", "https://puzz.link/p?sukororoom/10/10/blvvffvvu5cvvftulub6uv2ue7ljuvdjn4cnq1..zzl1q"],
        ["Sukoro-room 2", "https://puzz.link/p?sukororoom/v:/10/10/mtuvvjtvdfvuebdumn6vvfpb8ujuufntuvtmk2zzx3k"],
        // Symmetry Area
        ["Symmetry Area 1", "https://puzz.link/p?symmarea/17/7/9i9i3i3i77i5i5i5i3qfsfsfq3i9i9i1i31i3i3i3i9"],
        ["Symmetry Area 2", "https://puzz.link/p?symmarea/10/10/g1g13g1g1q2n27k1h1p3n21h1l2z1g1h2g1g"],
        ["Symmetry Area 3", "https://puzz.link/p?symmarea/12/12/z1lbj3k17j736x12p26y15j584j-1bj-14q1u"],
        // Tapa
        ["Tapa 1", "https://puzz.link/p?tapa/12/11/a0a1a2a3a4a5a6a7a8a9abacadaeafagahaiajakalamanaoapaqarasatauavawaxayazb0b1b2b3b4b5b6b7b8b9babcbdbebfbgbhbibjbkblbmbnbobpbqbrbsbtbubvbwbxbybzc0c1c2c3c4c5c6c7c8c9cacbcdcecfcgchcicjckclcmcncocpcqcrcsctcucvcwcxcyczd0d1d2d3d4d5d6d7d80123456789m."],
        ["Tapa 2", "https://puzz.link/p?tapa/10/10/rbmbmsblblsbmbmrbmbmsafafsagagr"],
        ["Tapa 3", "https://puzz.link/p?tapa/12/12/taekajmbmkaeha9kaema8kaqznadka7ma9kaahalka9ma9k6t"],
        ["Tapa 4", "https://puzz.link/p?tapa/7/19/n5ialqbqia9ka7uafibmqbqqchiaaua7k1iafq7iaen"],
        // Tapa-Like Loop
        ["Tapa-Like Loop 1", "https://puzz.link/p?tapaloop/7/4/.0128ha0aaasbabrh+10+2u+7l+aii-10-87-fe-ml-ts-9mg"],
        ["Tapa-Like Loop 2", "https://puzz.link/p?tapaloop/v:/13/13/i2uaih2h2s2w-fej-fekaiqaij2saitagi+46iaii2maiu+46k2r"],
        ["Tapa-Like Loop 3", "https://puzz.link/p?tapaloop/10/10/2i3i2zh2i3i2z2i3i2zh2i3i2"],
        ["Tapa-Like Loop 4", "https://puzz.link/p?tapaloop/12/12/zm+2pj+2pvadnarl22p22laenalv+2ojabzm"],
        ["Tapa-Like Loop 5", "https://puzz.link/p?tapaloop/15/15/habha9gaagaixajziaanb0n2oa9iaii+2pva9haji-9fiakhajzarib0xb0j-feiasziain+2omaiiajl3"],
        // Tents
        ["Tents 1", "https://puzz.link/p?tents/20/20/py0o001123456789abcdefghi0j0k0l0m0n0o0p0q0r0s0t0u0v0w0x0y0z00jkl0"],
        ["Tents 2", "https://puzz.link/p?tents/9/9/2i2i1i221i31a0c42124b1a112"],
        ["Tents 3", "https://puzz.link/p?tents/17/17/g4o3i2n33nl63b6211411253hj3228811537197125226153333hl33351513335123314"],
        ["Tents 4", "https://puzz.link/p?tents/12/11/g111h1h11g1213i21g1ndd2240hzl0978h"],
        ["Tents 5", "https://puzz.link/p?tents/10/10/zj1861a2163d2181182112"],
        ["Tents 6", "https://puzz.link/p?tents/8/8/g1g1g1g11g1g1g1gj2263a353d31"],
        // Tentaisho (Spiral Galaxies)
        ["Tentaisho 1", "https://puzz.link/p?tentaisho/10/10/znezzjezzmezweu4ezlezzrezjeze"],
        ["Tentaisho 2", "https://puzz.link/p?tentaisho/16/10/neme8cenezkezlcerezzqewezzlae2ezmegeyevez8eo44eq6ezzeneek84em"],
        ["Tentaisho 3", "https://puzz.link/p?tentaisho/5/5/o3ey72fs2fl"],
        ["Tentaisho 4", "https://puzz.link/p?tentaisho/9/9/elaegezs62fkf7eqegekfgezifkbc3ejezsc2ehe"],
        // Toichika 2
        ["Toichika-2 1", "https://puzz.link/p?toichika2/15/15/2ii9p6jlepctpvvnvvcvtsnrvfnvumfuafuqrdigoivvuvjufvv6veme19dokvv1ovoo31to5vv0vsrduvfv*5028-4d-3c6-b4-10-90+249-5a-46-6e+2a0-30-3f+4e0-2d-1c-37-84-30-fce-28+16c-87-87-1e-84+190-62-30+555+604-1e-36$4ec40-b6-6c-8f-1e-3c-606-82+898-9a+288*457e+1b0-20-2ac-283-54-48-96+870=6f8-28-75-62-78e-1e+276-46+438a+7d2c-3c-3c-75-3c-30-37-5b6b+654-20%b50+222+258-48"],
        ["Toichika-2 2", "https://puzz.link/p?toichika2/12/12/4s6ndj8iorsml2p8llbdekqu9504hq8lvi2bt54jun8vv95nsi88c05g4g3i2i1i25o4g"],
        ["Toichika-2 3", "https://puzz.link/p?toichika2/20/15/10156ggr62indoe611d38431oonjrhv7hltmb6t90d6hdme4rc8jcp26ge7vo7vvo32vk8tv1v7uefro67hg208e82hg953tva7tu0fg0fv6m1u0ei5g24k54g2l7g557k92h3g3g2g3"],
        // Uso-tatami
        ["Uso-tatami 1", "https://puzz.link/p?usotatami/10/10/6e7b3a8j2e4c...b21e4c2b4b414d12c3d2d..j8a2b7e6"],
        ["Uso-tatami 2", "https://puzz.link/p?usotatami/6/4/c2c1h3c4c"],
        // View
        ["View 1", "https://puzz.link/p?view/8/8/k0g1g0i2h031h1g2k2j4k2g1h012h2i2g1g1k"],
        ["View 2", "https://puzz.link/p?view/10/10/2g0g0r1i4g1j5g4i2j3k4g2j2q0i2g1v4l3j2"],
        // Yajikazu (Yajisan-Kazusan)
        ["Yajikazu 1", "https://puzz.link/p?yajikazu/6/6/912a912b912c912b912a912b912d912c912c912b912a912"],
        ["Yajikazu 2", "https://puzz.link/p?yajikazu/10/10/f32i32b23f32i32b213ab3ab3ab3a11b11b11b33i3313b13b131312b14b14b14l"],
        ["Yajikazu 3", "https://puzz.link/p?yajikazu/10/10/21-33e7a4222e44f21b41j31e33g22h31g11e33j34b42f35e3041a1413"],
        ["Yajikazu 4", "https://puzz.link/p?yajikazu/7/7/c42e4142f42d12d22c32f3213e32c"],
        ["Yajikazu 5", "https://puzz.link/p?yajikazu/6/3/1122334400a1.2.3.4.0.a-13e3-23e4-33e5962563"],
        // Yajilin
        ["Yajilin 1", "https://puzz.link/p?yajilin/b/10/10/n2222c11b42r11f21b11f21r12b41c3112n"],
        ["Yajilin 2", "https://puzz.link/p?yajilin/b/9/9/a21220.c212242h41h0.d0.f0.k0.f11d41h42h"],
        ["Yajilin 3", "https://puzz.link/p?yajilin/9/9/a21220.0.0.0.212242h42h0.d0.c0.b0.e0.e0.b0.c0.d41h41h"],
        ["Yajilin 4", "https://puzz.link/p?yajilin/11/11/zq33k1241111111221111zi34m12c11d"],
        ["Yajilin 5", "https://puzz.link/p?yajilin/10/10/40u23k10h20l10h20k13l40i"],
        ["Yajilin 6", "https://puzz.link/p?yajilin/b/11/11/m31e23e23c23g10a22i32j12j32j40j31j31p"],
        ["Yajilin 7", "https://puzz.link/p?yajilin/6/3/1122334400a1.2.3.4.0.a-13e3-23e4-33e5962563"],
        // Yin-Yang
        ["Yin-Yang 1", "https://puzz.link/p?yinyang/v:/6/6/l2a70001f0kb"],
        ["Yin-Yang 2", "https://puzz.link/p?yinyang/v:/14/8/59000k00074i00027a8ala6j620g793b606n39"],
        ["Yin-Yang 3", "https://puzz.link/p?yinyang/12/5/02903a2o490i392o0290"],
        ["Yin-Yang 4", "https://puzz.link/p?yinyang/14/10/000003fji00i3i669j099i31109960kl0320g010a000000"],
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

        const contents = {
            ...penpa.pu.pu_q
        };
        // These are not native objects but class instances
        delete contents.command_undo;
        delete contents.command_redo;

        const data = {
            contents,
            genre_tags: penpa.$('#genre_tags_opt').select2("val"),
            grid_size: [penpa.pu.nx0, penpa.pu.ny0],
            grid_type: penpa.pu.gridtype,
            mode: penpa.pu.mode,
            outside_spacing: penpa.pu.space,
        };
        const body = {
            filename,
            data: JSON.stringify(data),
            updateSnapshots,
        };
        const snapshot = await fetchJson(`/snapshot`, "POST", body);

        const expected = snapshot.data ? JSON.parse(snapshot.data) : "SNAPSHOT NOT FOUND";
        assert.deepEqual(expected, data, `Snapshots differ: expected=${JSON.stringify(expected)}, actual=${JSON.stringify(data)}`);
    });
});
