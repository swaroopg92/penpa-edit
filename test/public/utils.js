const forEach = (testCases, func) => {
    for (let testCase of testCases) {
        it(testCase[0], func(...testCase));
    }
}

const fetchJson = async (url, method = "GET", body = undefined, options = {}) => {
    if (body !== undefined) {
        body = JSON.stringify(body);
    }
    const response = await fetch(url, {
        ...options,
        method,
        body,
        headers: {
            "Content-Type": "application/json"
        }
    });
    return response.json();
}

function shuffle(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
}
