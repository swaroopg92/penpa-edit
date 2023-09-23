const Branding = {
    // For messages speaking in the first person
    appOwner: "Swaroop",
    // For dismissing popups
    okButtonText: "ok 🙂",
    // Titles specific to popup types
    errorTitle: "Swaroop says",
    infoTitle: "Swaroop says",

    solveTitle: undefined,
    solveDefaultMessage: "Congratulations 🙂",
    solveOKButtonText: "Hurray!",

    incorrectMessage: "Keep trying 🙂",

    // Usage Button Amendments
    addUsageButtons: {
        // "Submission Rules for GMPuzzles": "https://tinyurl.com/GMPuzzlesFormatting"
    },

    googleTag: 'G-2WQYM10ZE7'
};

(function  () {
    const usageButtons = document.getElementById('usageButtons');
    for (let buttonName in Branding.addUsageButtons) {
        let button = document.createElement('a');
        button.setAttribute('href', Branding.addUsageButtons[buttonName]);
        button.setAttribute('target', '_blank');
        button.classList.add('button');
        button.textContent = buttonName;
        usageButtons.appendChild(button);
    }

    if (Branding.googleTag) {
        let script = document.createElement("script");
        script.type = "text/javascript";
        script.src = "https://www.googletagmanager.com/gtag/js?id=" + Branding.googleTag;
        script.async = true;
        document.head.appendChild(script);

        window.dataLayer = window.dataLayer || [];
        function gtag() { dataLayer.push(arguments); }
        gtag('js', new Date());
        gtag('config', Branding.googleTag);
    }
})();