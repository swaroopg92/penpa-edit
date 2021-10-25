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
            url[0] + "(" + url[1] + ")",
            // puzz.link url
            url[1],
            // snapshot filename
            "puzzlink_" + url[0].toLowerCase().replace(/[^\w]/g, "_"),
        ])
    }

    forEach(testCases, (_, puzzlink_url, filename) => async () => {
        penpa.decode_puzzlink(puzzlink_url);

        const data = penpa.pu.pu_q;
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
