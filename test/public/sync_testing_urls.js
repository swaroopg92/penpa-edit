/**
 * sync_testing_urls.js
 *
 * Syncs example_urls.js from TESTING.md.
 * TESTING.md is the source of truth for puzzle example URLs.
 *
 * Usage:
 *   node test/public/sync_testing_urls.js
 *   const { syncExampleUrls } = require('./public/sync_testing_urls.js')
 */

/**
 * Parse TESTING.md source into sections and entries (reverse of generateTestingMd).
 * Entry names are derived from section name + index (e.g., "Aho 1", "Aho 2").
 */
function parseTestingMd(source) {
    var lines = source.split('\n');
    var sections = [];
    var currentSection = null;
    var currentDomain = 'puzzlink';

    for (var i = 0; i < lines.length; i++) {
        var line = lines[i];

        // Detect domain markers (only in HTML comments)
        if (line.indexOf('<!-- ============') !== -1) {
            if (line.indexOf('https://puzz.link/p') !== -1 || line.indexOf('http://pzv.jp/p.html') !== -1) {
                currentDomain = 'puzzlink';
            }
            if (line.indexOf('https://pzprxs.vercel.app/p') !== -1) {
                currentDomain = 'pzprxs';
            }
            continue;
        }

        // Detect section headers (<summary>SectionName</summary>)
        var summaryMatch = line.match(/<summary>(.+?)<\/summary>/);
        if (summaryMatch) {
            currentSection = { comment: summaryMatch[1].trim(), domain: currentDomain, entries: [] };
            sections.push(currentSection);
            continue;
        }

        // Detect URL entries (* https://...)
        var urlMatch = line.match(/^\*\s+(https?:\/\/[^\s]+)/);
        if (urlMatch && currentSection) {
            var url = urlMatch[1];
            var name = currentSection.comment + ' ' + (currentSection.entries.length + 1);
            currentSection.entries.push({ name: name, url: url });
        }
    }

    return sections;
}

/**
 * Validate TESTING.md source for structural correctness.
 * Checks: every <details> has a <summary>, every section has URLs,
 * no duplicate section names, and no dangling <details> without closing </details>.
 */
function validateTestingMd(source) {
    var lines = source.split('\n');
    var errors = [];
    var inDetails = false;
    var currentSummary = null;
    var sectionUrls = [];
    var sectionNames = [];

    for (var i = 0; i < lines.length; i++) {
        var line = lines[i];
        var trimmed = line.trim();

        // Track <details> open/close
        if (trimmed.indexOf('<details>') !== -1) {
            if (inDetails) {
                errors.push('line ' + (i + 1) + ': nested <details> without closing </details>');
            }
            inDetails = true;
            sectionUrls = [];
            currentSummary = null;
        }

        if (trimmed.indexOf('</details>') !== -1) {
            if (!inDetails) {
                errors.push('line ' + (i + 1) + ': </details> without matching <details>');
            }
            if (currentSummary === null) {
                errors.push('line ' + (i + 1) + ': <details> block missing <summary>');
            } else if (sectionUrls.length === 0) {
                errors.push('section "' + currentSummary + '" has no example URLs');
            }
            inDetails = false;
        }

        // Track <summary>
        var summaryMatch = trimmed.match(/<summary>(.+?)<\/summary>/);
        if (summaryMatch) {
            currentSummary = summaryMatch[1].trim();
            if (sectionNames.indexOf(currentSummary) !== -1) {
                errors.push('line ' + (i + 1) + ': duplicate section name "' + currentSummary + '"');
            }
            sectionNames.push(currentSummary);
        }

        // Track URL entries
        var urlMatch = trimmed.match(/^\*\s+(https?:\/\/[^\s]+)/);
        if (urlMatch && inDetails) {
            sectionUrls.push(urlMatch[1]);
        }
    }

    // Check for unclosed <details> at end of file
    if (inDetails) {
        errors.push('end of file: unclosed <details> block');
    }

    var sections = sectionNames.length;
    var totalUrls = 0;
    // Count actual URLs
    for (var j = 0; j < lines.length; j++) {
        var urlLine = lines[j].trim();
        if (urlLine.match(/^\*\s+(https?:\/\/[^\s]+)/)) {
            totalUrls++;
        }
    }

    return {
        errors: errors,
        sections: sections,
        entries: totalUrls,
    };
}

/**
 * Generate the JS code for example_urls.js from sections.
 */
function generateExampleUrls(sections) {
    var lines = [];
    var currentDomain = null;

    lines.push('// ====== This file is generated from TESTING.md. Do not edit it directly. ======');
    lines.push('');
    lines.push('const EXAMPLE_URLS = [');

    for (var i = 0; i < sections.length; i++) {
        var section = sections[i];

        if (section.domain !== currentDomain) {
            currentDomain = section.domain;
            if (currentDomain === 'puzzlink') {
                lines.push('    // ============ https://puzz.link/p or http://pzv.jp/p.html ============');
            } else if (currentDomain === 'pzprxs') {
                lines.push('    // ============ https://pzprxs.vercel.app/p ============');
            }
        }

        lines.push('    // ' + section.comment);
        for (var j = 0; j < section.entries.length; j++) {
            var entry = section.entries[j];
            lines.push('    ["' + entry.name + '", "' + entry.url + '"],');
        }
    }

    lines.push('];');
    lines.push('');

    return lines.join('\n');
}

// deal with standalone runner
if (typeof module !== 'undefined' && module.exports) {
    var fs = require('fs');
    var path = require('path');

    var EXAMPLE_URLS_JS = path.join(__dirname, 'example_urls.js');
    var TESTING_MD = path.join(__dirname, '..', '..', 'TESTING.md');

    /**
     * Sync example_urls.js from TESTING.md.
     * TESTING.md is the source of truth; example_urls.js is generated.
     */
    function syncExampleUrls(update) {
        var source = fs.readFileSync(TESTING_MD, 'utf-8');
        var sections = parseTestingMd(source);

        var total = 0;
        for (var i = 0; i < sections.length; i++) {
            total += sections[i].entries.length;
        }
        var info = { success: true, sections: sections.length, entries: total };

        if (update) {
            var code = generateExampleUrls(sections);
            fs.writeFileSync(EXAMPLE_URLS_JS, code, 'utf-8');
        }
        return info;
    }

    module.exports = {
        parseTestingMd: parseTestingMd,
        validateTestingMd: validateTestingMd,
        generateExampleUrls: generateExampleUrls,
        syncExampleUrls: syncExampleUrls,
    };

    if (require.main === module) {
        var r = syncExampleUrls(true);
        if (r.success) {
            console.log('example_urls.js updated from TESTING.md: ' + r.sections + ' sections, ' + r.entries + ' entries');
        } else {
            console.error(r.error);
            process.exit(1);
        }
    }
}
