let assert = chai.assert;

describe("Test puzz.link parser", () => {
    let penpa, updateSnapshots;

    before(() => {
        window.__parsingOk = true;
        penpa = document.getElementById("penpa").contentWindow;
        updateSnapshots = document.getElementById("update-snapshots").checked;
    });

    afterEach(function () {
        if (this.currentTest.state === 'failed') {
            window.__parsingOk = false;
        }
    });

    beforeEach(function () {
        if (!window.__parsingOk) {
            this.skip();
        }
    });

    it("connects to the test server", async () => {
        assert.equal("pong", await fetchJson("/ping"));
    });

    const urls = shuffle([...EXAMPLE_URLS]);  // shuffle the tests
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
        penpa.import_url(puzzlink_url);

        const contents = {
            ...penpa.pu.pu_q
        };
        // These are not native objects but class instances
        delete contents.command_undo;
        delete contents.command_redo;
        delete contents.command_replay;

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
        const snapshot = await fetchJson("/snapshot", "POST", body);

        const expected = snapshot.data ? JSON.parse(snapshot.data) : "SNAPSHOT NOT FOUND";
        assert.deepEqual(expected, data, "Snapshots differ");
    });
});
