export function replaceGridSizeNine(text, size, enabled = false) {
    if (!enabled || size === 9) return text;
    return text
        .replace(/\bnine\b/gi, String(size))
        .replace(/\b9\b/g, String(size));
}
