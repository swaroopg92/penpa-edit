<script lang="ts">
  import { onMount } from "svelte";
  import { variantMetadata, variations } from "./variationCatalog";
  import {
    automaticBlockerFor,
    cspApproachFor,
    cspConstraintFunctionsFor,
    inputModesFor,
    solverTestCasesFor,
  } from "./variantMarks";

  export let page: "variants" | "detail" = "variants";

  let query = "";
  let status = "all";
  let tag = "all";
  let hasExampleFilter = "all";
  let darkTheme = false;
  let fontScale = 1;

  let sortColumn: "name" | "status" | "example" | "reviewed" = "name";
  let sortAscending = true;

  function handleSort(column: typeof sortColumn) {
    if (sortColumn === column) {
      sortAscending = !sortAscending;
    } else {
      sortColumn = column;
      sortAscending = true;
    }
  }

  $: if (typeof document !== "undefined") {
    document.documentElement.style.setProperty("--font-scale", fontScale.toString());
  }

  function toggleTheme() {
    darkTheme = !darkTheme;
    document.cookie = `color_theme=${darkTheme ? "2" : "1"};path=/;max-age=${60 * 60 * 24 * 365}`;
    document.documentElement.classList.toggle("dark", darkTheme);
  }

  function increaseFontSize() {
    fontScale += 0.1;
  }

  function highlightCode(node: HTMLElement) {
    if ((window as any).hljs) {
      (window as any).hljs.highlightElement(node);
    }
  }

  function decreaseFontSize() {
    fontScale = Math.max(0.5, fontScale - 0.1);
  }

  onMount(() => {
    const cookies = document.cookie.split(";");
    const themeCookie = cookies.find((c) =>
      c.trim().startsWith("color_theme="),
    );
    if (themeCookie) {
      const val = themeCookie.split("=")[1];
      darkTheme = val === "2";
    }
    document.documentElement.classList.toggle("dark", darkTheme);
    if (import.meta.env.DEV) loadMetadata();
  });

  const detailId =
    document.body.dataset.variantId ||
    new URLSearchParams(window.location.search).get("id") ||
    "classic";
  const detailVariation = variations.find(
    (variation) => variation.value === detailId,
  );

  $: normalizedQuery = query.trim().toLowerCase();
  $: availableTags = [...new Set(variations.flatMap((variation) => variation.tags))]
    .sort((first, second) => first.localeCompare(second));

  function handleFeelingLucky() {
    query = "";
    // Wait for the reactive statement to clear the query filter from `filteredVariations`,
    // or manually filter here. Since Svelte reactivity is async (microtask), it's easier
    // to manually get the filtered variants without the query.
    const luckyCandidates = variations.filter((variation) => {
      const matchesStatus = status === "all" || variation.status === status;
      const matchesTag = tag === "all" || variation.tags.includes(tag);
      const matchesExample = hasExampleFilter === "all" ||
        (hasExampleFilter === "yes" && variation.example) ||
        (hasExampleFilter === "no" && !variation.example);
      return matchesStatus && matchesTag && matchesExample;
    });

    if (luckyCandidates.length > 0) {
      const randomIndex = Math.floor(Math.random() * luckyCandidates.length);
      query = luckyCandidates[randomIndex].name;
    }
  }

  $: filteredVariations = variations.filter((variation) => {
    const matchesStatus = status === "all" || variation.status === status;
    const matchesTag = tag === "all" || variation.tags.includes(tag);
    const matchesExample = hasExampleFilter === "all" ||
      (hasExampleFilter === "yes" && variation.example) ||
      (hasExampleFilter === "no" && !variation.example);
    return (
      matchesStatus &&
      matchesTag &&
      matchesExample &&
      (!normalizedQuery ||
        [variation.name, variation.value, variation.rule, ...variation.tags].some((value) =>
          value.toLowerCase().includes(normalizedQuery),
        ))
    );
  });

  $: sortedVariations = [...filteredVariations].sort((a, b) => {
    let valA: any;
    let valB: any;

    if (sortColumn === "name") {
      valA = a.name.toLowerCase();
      valB = b.name.toLowerCase();
    } else if (sortColumn === "status") {
      const statusPriority: Record<string, number> = {
        available: 1,
        planned: 2,
        infeasible: 3,
      };
      valA = statusPriority[a.status] || 99;
      valB = statusPriority[b.status] || 99;
    } else if (sortColumn === "example") {
      valA = a.example ? 1 : 0;
      valB = b.example ? 1 : 0;
    } else if (sortColumn === "reviewed") {
      valA = a.reviewed ? 1 : 0;
      valB = b.reviewed ? 1 : 0;
    } else {
      return 0;
    }

    if (valA < valB) return sortAscending ? -1 : 1;
    if (valA > valB) return sortAscending ? 1 : -1;

    // Secondary sort: default to name ascending when primary values are equal
    if (sortColumn !== "name") {
      const nameA = a.name.toLowerCase();
      const nameB = b.name.toLowerCase();
      if (nameA < nameB) return -1;
      if (nameA > nameB) return 1;
    }
    return 0;
  });

  let metadataText = JSON.stringify(variantMetadata, null, 2);
  let isSaving = false;
  let saveMessage = "";
  let saveSuccess = false;

  function exampleUrl(example: string, variant: string, embed = false) {
    const base = new URL(".", document.baseURI);
    if (embed) {
      base.searchParams.set("embed", "true");
    }
    const stored = /[&]variants=/.test(example)
      ? example
      : `${example}&variants=${encodeURIComponent(`classic,${variant}`)}`;
    base.hash = `m=solve&tab=solve&v=0&p=${stored}`;
    return base.href;
  }

  function errorMessage(error: unknown) {
    if (error instanceof Error && error.message.trim()) return error.message;
    if (typeof error === "string" && error.trim()) return error;
    return "Unknown error. Check that the Vite development server was restarted.";
  }

  async function readApiResponse(response: Response) {
    const text = await response.text();
    const contentType = response.headers.get("content-type") || "";
    if (/<!doctype|<html/i.test(text) || !contentType.includes("application/json")) {
      throw new Error(
        "The development metadata API returned the wiki page instead of JSON. Restart `npm run dev` and try again.",
      );
    }
    let result: any;
    try {
      result = text ? JSON.parse(text) : {};
    } catch {
      throw new Error("The development metadata API returned invalid JSON.");
    }
    if (!response.ok) {
      throw new Error(result.error || result.message || `Request failed (${response.status}).`);
    }
    return result;
  }

  function parseMetadataEditor() {
    const parsed = JSON.parse(metadataText);
    if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) {
      throw new Error("The metadata root must be a JSON object.");
    }
    if (!Array.isArray(parsed.variants)) {
      throw new Error('The metadata must contain a "variants" array.');
    }
    return parsed;
  }

  function formatMetadata() {
    try {
      metadataText = JSON.stringify(parseMetadataEditor(), null, 2);
      saveSuccess = true;
      saveMessage = "JSON is valid and formatted.";
    } catch (err: any) {
      saveSuccess = false;
      saveMessage = `Invalid JSON: ${errorMessage(err)}`;
    }
  }

  async function loadMetadata() {
    try {
      const response = await fetch("/api/variant-metadata");
      metadataText = JSON.stringify(await readApiResponse(response), null, 2);
      saveMessage = "";
    } catch (err: any) {
      saveSuccess = false;
      saveMessage = `Could not reload metadata: ${errorMessage(err)}`;
    }
  }

  async function saveMetadata() {
    isSaving = true;
    saveMessage = "";
    try {
      const metadata = parseMetadataEditor();
      const response = await fetch("/api/variant-metadata", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(metadata),
      });
      const result = await readApiResponse(response);
      saveSuccess = true;
      saveMessage = result.message || "Metadata saved.";
      metadataText = JSON.stringify(metadata, null, 2);
    } catch (err: any) {
      saveSuccess = false;
      saveMessage = `Could not save metadata: ${errorMessage(err)}`;
    } finally {
      isSaving = false;
    }
  }
</script>

<svelte:head>
  <meta name="theme-color" content="#132a3a" />
</svelte:head>

<header class="site-header">
  <a class="brand" href="./">Back to editor</a>
  <nav aria-label="Reference pages" class="site-nav">
    <a
      class:active={page === "variants" || page === "detail"}
      href="./list.html">Variant wiki</a
    >
    <div class="nav-controls">
      <button type="button" class="nav-btn" on:click={decreaseFontSize} aria-label="Decrease font size">A-</button>
      <button type="button" class="nav-btn" on:click={increaseFontSize} aria-label="Increase font size">A+</button>
      <button type="button" class="nav-btn" on:click={toggleTheme} aria-label="Toggle light/dark theme">
        {darkTheme ? "☀️" : "🌙"}
      </button>
    </div>
  </nav>
</header>

<main>
  {#if page === "detail"}
    {#if detailVariation}
      <article class="variant-detail">
        <a class="back-link" href="./list.html"
          >Back to list of variants</a
        >
        <h1>{detailVariation.name}</h1>
        <div class="detail-status">
          {#if detailVariation.status === "available"}
            <span class="status implemented">available</span>
          {:else}
            <span
              class:backlog={detailVariation.status === "planned"}
              class:infeasible={detailVariation.status === "infeasible"}
              class="status"
            >
              {detailVariation.status === "infeasible" ? "infeasible" : "planned"}
            </span>
          {/if}
        </div>
        <div class="detail-layout">
          <div>
        <section>
          <h2>Rules</h2>
          {#each Object.entries(detailVariation.rules) as [size, rule]}
            <div class="rule-card">
              <strong>{size}</strong>
              <p>{rule}</p>
            </div>
          {/each}
        </section>
        <section>
          <h2>Input modes</h2>
          <ul>
            {#each inputModesFor(detailVariation) as mode}<li>{mode}</li>{/each}
          </ul>
        </section>
        {#if false}
        <section>
          <h2>CSP constraint function</h2>
          <p>{cspApproachFor(detailVariation)}</p>
          <h3>Partial validator</h3>
          <pre><code use:highlightCode class="language-javascript">{cspConstraintFunctionsFor(detailVariation).partial}</code></pre>
          <h3>Full validator</h3>
          <pre><code use:highlightCode class="language-javascript">{cspConstraintFunctionsFor(detailVariation).full}</code></pre>
          {#if detailVariation.status !== "available"}<p class="blocker">
              {automaticBlockerFor(detailVariation)}
            </p>{/if}
        </section>
        <section>
          <h2>Solver regression tests</h2>
          <p>
            The valid case must solve; the paired violation must be rejected.
          </p>
          <pre><code use:highlightCode class="language-javascript">{solverTestCasesFor(detailVariation)}</code></pre>
        </section>
        {/if}
        </div>
        {#if detailVariation.example}
          <aside class="variant-examples">
            <div class="iframe-container">
              <div class="iframe-header">
                <h2>Playable Example</h2>
                <a href={exampleUrl(detailVariation.example, detailVariation.value)} target="_blank" rel="noreferrer">Open in full editor ↗</a>
              </div>
              <iframe
                src={exampleUrl(detailVariation.example, detailVariation.value, true)}
                title="Playable {detailVariation.name} Example"
                style="width: 100%; height: 500px; border: none;">
              </iframe>
            </div>

          </aside>
        {/if}
        </div>
      </article>
    {:else}
      <section class="hero">
        <h1>Variant not found</h1>
        <p><a href="./list.html">Return to the variant wiki.</a></p>
      </section>
    {/if}
  {:else}
    <section class="hero">
      <h1>Sudoku Variant Reference</h1>
      <p>
        Rules derived from <a
          href="https://logic-puzzles.ropeko.ch/php/db/search.php">ropeko</a
        >. Refer to the original website for example puzzles and more!.
      </p>
      <div class="summary" aria-label="Catalog summary">
        <span><strong>{variations.length}</strong> variants</span>
        <span
          ><strong
            >{variations.filter((item) => item.status === "available")
              .length}</strong
          > Solver available</span
        >
        <span
          ><strong
            >{variations.filter(
              (item) => item.status === "planned",
            ).length}</strong
          > Planned
        </span>
        <span
          ><strong
            >{variations.filter(
              (item) => item.status === "infeasible",
            ).length}</strong
          > Infeasible
        </span>
      </div>
    </section>

    <section class="toolbar" aria-label="Variant table filters">
      <label for="variant-search-input">
        <span>Search variants</span>
        <input
          id="variant-search-input"
          bind:value={query}
          type="search"
          placeholder="Name, rule, tag…"
        />
      </label>
      <button type="button" class="lucky-btn" on:click={handleFeelingLucky}>
        Feeling lucky!
      </button>
      <label for="variant-csp-status-select">
        <span>Status</span>
        <select id="variant-csp-status-select" bind:value={status}>
          <option value="all">All</option>
          <option value="available">Available</option>
          <option value="planned">Planned</option>
          <option value="infeasible">Infeasible</option>
        </select>
      </label>
      <label for="variant-tag-select">
        <span>Tag</span>
        <select id="variant-tag-select" bind:value={tag}>
          <option value="all">All</option>
          {#each availableTags as availableTag}
            <option value={availableTag}>{availableTag}</option>
          {/each}
        </select>
      </label>
      <label for="variant-has-example-select">
        <span>Has example</span>
        <select id="variant-has-example-select" bind:value={hasExampleFilter}>
          <option value="all">All</option>
          <option value="yes">Yes</option>
          <option value="no">No</option>
        </select>
      </label>
      <span class="result-count">{filteredVariations.length} shown</span>
      <a class="suggest-link" href="https://github.com/lemononmars/penpa-edit/pulls" target="_blank" rel="noreferrer">Suggest a variant</a>
    </section>

    <div class="table-wrap">
      <table class="variant-table">
        <thead>
          <tr>
            <th
              class="sortable"
              tabindex="0"
              on:click={() => handleSort("name")}
              on:keydown={(e) => e.key === "Enter" && handleSort("name")}
              aria-sort={sortColumn === "name" ? (sortAscending ? "ascending" : "descending") : "none"}
            >
              Variant{#if sortColumn === "name"}<span class="sort-indicator">{sortAscending ? "▲" : "▼"}</span>{/if}
            </th>
            <th>Rule</th>
            <th
              class="sortable"
              tabindex="0"
              on:click={() => handleSort("status")}
              on:keydown={(e) => e.key === "Enter" && handleSort("status")}
              aria-sort={sortColumn === "status" ? (sortAscending ? "ascending" : "descending") : "none"}
            >
              Status{#if sortColumn === "status"}<span class="sort-indicator">{sortAscending ? "▲" : "▼"}</span>{/if}
            </th>
            <th
              class="sortable"
              tabindex="0"
              on:click={() => handleSort("example")}
              on:keydown={(e) => e.key === "Enter" && handleSort("example")}
              aria-sort={sortColumn === "example" ? (sortAscending ? "ascending" : "descending") : "none"}
            >
              Has example{#if sortColumn === "example"}<span class="sort-indicator">{sortAscending ? "▲" : "▼"}</span>{/if}
            </th>
            <th
              class="sortable"
              tabindex="0"
              on:click={() => handleSort("reviewed")}
              on:keydown={(e) => e.key === "Enter" && handleSort("reviewed")}
              aria-sort={sortColumn === "reviewed" ? (sortAscending ? "ascending" : "descending") : "none"}
            >
              Reviewed{#if sortColumn === "reviewed"}<span class="sort-indicator">{sortAscending ? "▲" : "▼"}</span>{/if}
            </th>
            <th>Tags</th>
          </tr>
        </thead>
        <tbody>
          {#each sortedVariations as variation (variation.value)}
            <tr>
              <th scope="row"
                ><a
                  class="variant-link"
                  href={`./list.html?id=${encodeURIComponent(variation.value)}`}
                  ><strong>{variation.name}</strong></a
                >
                <div class="other-names">
                  {#if variation.otherNames}
                    {#each variation.otherNames.split(",") as otherName}
                      <div class="other-name">{otherName.trim()}</div>
                    {/each}
                  {/if}
                </div>
              </th>
              <td class="rule">{variation.rule}</td>
              <td>
                {#if variation.status === "available"}
                  <span class="status implemented">Available</span>
                {:else}
                  <span
                    class:backlog={variation.status === "planned"}
                    class:infeasible={variation.status === "infeasible"}
                    class="status"
                  >
                    {variation.status === "infeasible" ? "Infeasible" : "Planned"}
                  </span>
                {/if}
              </td>
              <td style="text-align: center;">{variation.example ? "✅" : "❌"}</td>
              <td style="text-align: center;">{variation.reviewed ? "✅" : "❌"}</td>
              <td class="tags">
                {#each variation.tags as variantTag}
                  <button type="button" class="tag" on:click={() => (tag = variantTag)}>{variantTag}</button>
                {/each}
              </td>
            </tr>
          {/each}
        </tbody>
      </table>
    </div>
  {/if}


</main>

<footer>Generated from the repository variation catalog.</footer>

<style>
  :global(*) {
    box-sizing: border-box;
  }
  :global(html) {
    color: #1b2c38;
    background: #edf2f3;
    font-family:
      Inter,
      ui-sans-serif,
      system-ui,
      -apple-system,
      BlinkMacSystemFont,
      "Segoe UI",
      sans-serif;
  }
  :global(body) {
    margin: 0;
  }
  :global(button),
  :global(input),
  :global(select) {
    font: inherit;
  }
  .site-header {
    position: sticky;
    top: 0;
    z-index: 20;
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 24px;
    min-height: 64px;
    padding: 0 max(24px, calc((100vw - 1480px) / 2));
    color: #eaf3f5;
    background: #132a3a;
    box-shadow: 0 1px 0 rgba(255, 255, 255, 0.08);
  }
  .brand {
    color: inherit;
    font-size: calc(15px * var(--font-scale, 1));
    font-weight: 760;
    letter-spacing: 0.02em;
    text-decoration: none;
  }
  nav {
    display: flex;
    align-self: stretch;
    flex-grow: 1;
  }
  nav a {
    display: grid;
    place-items: center;
    padding: 0 16px;
    color: #bcd0d8;
    border-bottom: 3px solid transparent;
    font-size: calc(13px * var(--font-scale, 1));
    text-decoration: none;
  }
  nav a:hover,
  nav a.active {
    color: #fff;
    border-bottom-color: #e5b858;
  }
  .nav-controls {
    display: flex;
    align-items: center;
    gap: 8px;
    margin-left: auto;
  }
  .nav-btn {
    background: transparent;
    border: 1px solid rgba(255, 255, 255, 0.2);
    color: #eaf3f5;
    padding: 4px 8px;
    border-radius: 4px;
    cursor: pointer;
    font-size: calc(13px * var(--font-scale, 1));
  }
  .nav-btn:hover {
    background: rgba(255, 255, 255, 0.1);
  }
  main {
    width: min(1480px, calc(100% - 40px));
    margin: 0 auto;
    padding: 44px 0 64px;
  }
  .hero {
    max-width: 900px;
    margin-bottom: 30px;
  }
  h1 {
    margin: 0;
    color: #102938;
    font-family: Georgia, "Times New Roman", serif;
    font-size: clamp(38px, 6vw, 68px);
    font-weight: 500;
    letter-spacing: -0.035em;
  }
  .hero > p:last-of-type {
    max-width: 760px;
    margin: 14px 0 0;
    color: #526773;
    font-size: calc(18px * var(--font-scale, 1));
    line-height: 1.55;
  }
  .summary {
    display: flex;
    flex-wrap: wrap;
    gap: 10px;
    margin-top: 24px;
  }
  .summary span {
    padding: 9px 13px;
    color: #4b616c;
    border: 1px solid #ccdadc;
    border-radius: 4px;
    background: rgba(255, 255, 255, 0.6);
    font-size: calc(12px * var(--font-scale, 1));
  }
  .summary strong {
    margin-right: 4px;
    color: #183a4d;
    font-size: calc(15px * var(--font-scale, 1));
  }
  .toolbar {
    position: sticky;
    top: 64px;
    z-index: 15;
    display: flex;
    align-items: end;
    gap: 12px;
    padding: 13px 15px;
    border: 1px solid #cbd8da;
    background: rgba(247, 250, 250, 0.95);
    box-shadow: 0 5px 18px rgba(27, 52, 63, 0.08);
    backdrop-filter: blur(9px);
  }
  label {
    display: grid;
    gap: 5px;
    color: #536872;
    font-size: calc(11px * var(--font-scale, 1));
    font-weight: 750;
  }
  input,
  select {
    min-height: 36px;
    padding: 7px 9px;
    color: #203642;
    border: 1px solid #b9cbcf;
    border-radius: 3px;
    background: #fff;
  }
  input {
    width: min(360px, 42vw);
  }
  input:focus,
  select:focus {
    border-color: #267f95;
    outline: 3px solid rgba(38, 127, 149, 0.15);
  }
  .result-count {
    margin: 0 auto 9px 0;
    color: #657982;
    font-size: calc(12px * var(--font-scale, 1));
  }
  .table-wrap {
    width: 100%;
    overflow: auto;
    border: 1px solid #c7d4d6;
    border-top: 0;
    background: #fff;
    box-shadow: 0 12px 34px rgba(27, 52, 63, 0.08);
  }
  table {
    width: 100%;
    border-collapse: collapse;
    font-size: calc(12px * var(--font-scale, 1));
    line-height: 1.45;
  }
  th,
  td {
    padding: 11px 12px;
    border-right: 1px solid #e0e7e8;
    border-bottom: 1px solid #dbe4e5;
    text-align: left;
    vertical-align: top;
  }
  thead th {
    position: sticky;
    top: 0;
    z-index: 2;
    color: #e9f3f5;
    background: #1d4658;
    font-size: calc(10px * var(--font-scale, 1));
    letter-spacing: 0.07em;
    text-transform: uppercase;
  }
  tbody th {
    min-width: 165px;
    color: #173a4a;
    background: #f8fafa;
  }
  tbody tr:hover td,
  tbody tr:hover th {
    background-color: #f1f7f7;
  }
  td.rule {
    min-width: 320px;
    max-width: 520px;
    color: #465d68;
  }
  td.tags {
    min-width: 150px;
  }
  .tag {
    margin: 0 4px 4px 0;
    padding: 3px 7px;
    border: 1px solid #b9cbcf;
    border-radius: 999px;
    color: #315968;
    background: #edf5f6;
    font-size: calc(10px * var(--font-scale, 1));
    cursor: pointer;
  }
  .tag:hover {
    border-color: #267f95;
    background: #dceff2;
  }
  code {
    display: block;
    margin-top: 4px;
    color: #75878e;
    font-family: "SFMono-Regular", Consolas, monospace;
    font-size: calc(10px * var(--font-scale, 1));
    font-weight: 500;
  }
  .status {
    display: inline-flex;
    align-items: center;
    width: max-content;
    padding: 3px 7px;
    border-radius: 999px;
    white-space: nowrap;
    font-size: calc(10px * var(--font-scale, 1));
    font-weight: 750;
  }
  .status.implemented {
    color: #176245;
    background: #dff2e9;
  }
  .status.backlog {
    color: #8c4e1e;
    background: #f8e8d8;
  }
  .status.infeasible {
    color: #602d30;
    background: #fde8e9;
  }
  .variant-link {
    color: inherit;
    text-decoration-color: #9bb7bf;
    text-underline-offset: 3px;
  }
  .variant-detail {
    width: 100%;
  }
  .variant-detail .back-link {
    display: inline-block;
    margin-bottom: 24px;
    color: #267f95;
    font-size: calc(13px * var(--font-scale, 1));
  }
  .variant-detail h2 {
    margin: 0 0 12px;
    color: #183a4d;
    font-size: calc(18px * var(--font-scale, 1));
  }
  .detail-layout {
    display: flex;
    gap: 24px;
    align-items: flex-start;
  }
  .detail-layout > div:first-child {
    flex: 1;
    min-width: 0; /* allows shrinking */
  }
  .variant-examples {
    width: 50%;
    flex-shrink: 0;
    position: sticky;
    top: 24px;
  }
  .iframe-container {
    border: 1px solid #cfdbdd;
    border-radius: 8px;
    overflow: hidden;
    background: #fff;
    box-shadow: 0 8px 25px rgba(27, 52, 63, 0.05);
  }
  .iframe-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 12px 16px;
    background: #f8fafa;
    border-bottom: 1px solid #cfdbdd;
  }
  .iframe-header h2 {
    margin: 0 !important;
    font-size: 14px !important;
  }
  .iframe-header a {
    font-size: 12px;
    font-weight: 600;
  }
  .detail-layout {
    display: flex;
    gap: 24px;
    align-items: flex-start;
  }
  .detail-layout > div:first-child {
    flex: 1;
    min-width: 0; /* allows shrinking */
  }
  .variant-examples {
    width: 50%;
    flex-shrink: 0;
    position: sticky;
    top: 24px;
  }
  .iframe-container {
    border: 1px solid #cfdbdd;
    border-radius: 8px;
    overflow: hidden;
    background: #fff;
    box-shadow: 0 8px 25px rgba(27, 52, 63, 0.05);
  }
  .iframe-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 12px 16px;
    background: #f8fafa;
    border-bottom: 1px solid #cfdbdd;
  }
  .iframe-header h2 {
    margin: 0 !important;
    font-size: 14px !important;
  }
  .iframe-header a {
    font-size: 12px;
    font-weight: 600;
  }
  .detail-layout > div > section {
    margin-top: 22px;
    padding: 22px;
    border: 1px solid #cfdbdd;
    background: #fff;
    box-shadow: 0 8px 25px rgba(27, 52, 63, 0.05);
  }
  .detail-status {
    display: flex;
    flex-wrap: wrap;
    gap: 7px;
    margin-top: 18px;
  }
  .rule-card {
    display: grid;
    grid-template-columns: 72px 1fr;
    gap: 14px;
    padding: 12px 0;
    border-top: 1px solid #e0e7e8;
  }
  .rule-card:first-of-type {
    border-top: 0;
  }
  .rule-card p,
  .variant-detail section > p {
    margin: 0;
    color: #526773;
    line-height: 1.6;
  }
  .variant-detail ul {
    margin: 0;
    padding-left: 20px;
    color: #526773;
    line-height: 1.8;
  }
  .variant-detail pre {
    margin: 14px 0 0;
    padding: 16px;
    overflow: auto;
    border-radius: 4px;
    color: #eaf3f5;
    background: #132a3a;
  }
  .variant-detail pre code {
    display: inline;
    margin: 0;
    color: inherit;
    font-size: calc(12px * var(--font-scale, 1));
    line-height: 1.6;
  }
  .variant-detail .blocker {
    margin-top: 14px;
    padding: 12px;
    color: #8c4e1e;
    background: #fff4e9;
  }
  footer {
    padding: 24px;
    color: #708088;
    background: #dde7e8;
    text-align: center;
    font-size: calc(11px * var(--font-scale, 1));
  }
  /* Mobile-friendly stacked layout */
  @media (max-width: 1100px) {
    .detail-layout {
      flex-direction: column;
    }
    .variant-examples {
      width: 100%;
      position: static;
      max-width: 100%;
    }
  }
  @media (max-width: 900px) {
    .site-header {
      position: static;
      align-items: flex-start;
      padding: 16px 20px;
    }
    nav {
      flex-wrap: wrap;
    }
    nav a {
      min-height: 32px;
      padding: 0 9px;
    }
    main {
      width: min(100% - 24px, 1480px);
      padding-top: 30px;
    }
    .toolbar {
      top: 0;
      flex-wrap: wrap;
      align-items: end;
    }
    .result-count {
      margin-left: 0;
    }
  }
  @media (max-width: 560px) {
    .site-header {
      display: grid;
    }
    .hero > p:last-of-type {
      font-size: calc(16px * var(--font-scale, 1));
    }
    input {
      width: 100%;
    }
    .toolbar label:first-child {
      width: 100%;
    }
  }

  /* Dark Mode styles matching homepage */
  :global(html.dark) {
    color: #dde6ed !important;
    background: #17202a !important;
  }
  :global(html.dark) .site-header {
    background: #111a24 !important;
    border-bottom: 1px solid #1c2836 !important;
  }
  :global(html.dark) h1 {
    color: #eef4f8 !important;
  }
  :global(html.dark) .hero > p:last-of-type {
    color: #aebdca !important;
  }
  :global(html.dark) .summary span {
    color: #dde6ed !important;
    border-color: #40505f !important;
    background: #263340 !important;
  }
  :global(html.dark) .summary strong {
    color: #e5b858 !important;
  }
  :global(html.dark) .toolbar {
    border-color: #40505f !important;
    background: rgba(38, 51, 64, 0.95) !important;
    box-shadow: 0 5px 18px rgba(0, 0, 0, 0.25) !important;
  }
  :global(html.dark) label {
    color: #aebdca !important;
  }
  :global(html.dark) input,
  :global(html.dark) select {
    color: #d5dfe7 !important;
    border-color: #465563 !important;
    background: #1f2b35 !important;
  }
  :global(html.dark) input:focus,
  :global(html.dark) select:focus {
    border-color: #176fae !important;
    outline: 3px solid rgba(23, 111, 174, 0.15) !important;
  }
  :global(html.dark) .result-count {
    color: #8c9ba5 !important;
  }
  :global(html.dark) .table-wrap {
    border-color: #40505f !important;
    background: #263340 !important;
    box-shadow: 0 12px 34px rgba(0, 0, 0, 0.3) !important;
  }
  :global(html.dark) th,
  :global(html.dark) td {
    border-right-color: #40505f !important;
    border-bottom-color: #3b4b5a !important;
  }
  :global(html.dark) thead th {
    color: #eef4f8 !important;
    background: #1b2630 !important;
  }
  :global(html.dark) tbody th {
    color: #dde6ed !important;
    background: #232f3b !important;
  }
  :global(html.dark) tbody tr:hover td,
  :global(html.dark) tbody tr:hover th {
    background-color: #2b3a4a !important;
  }
  :global(html.dark) td.rule {
    color: #dde6ed !important;
  }
  :global(html.dark) code {
    color: #8c9ba5 !important;
  }
  :global(html.dark) .variant-link {
    color: #2b8bc7 !important;
  }
  :global(html.dark) .other-name {
    color: #8c9ba5 !important;
  }
  .other-name {
    font-weight: normal;
    font-size: 0.9em;
    color: #526773;
  }
  .lucky-btn {
    padding: 6px 12px;
    background: #267f95;
    color: #fff;
    border: none;
    border-radius: 4px;
    cursor: pointer;
    font-weight: 600;
  }
  .lucky-btn:hover {
    background: #1d6375;
  }
  :global(html.dark) .lucky-btn {
    background: #176fae;
  }
  :global(html.dark) .lucky-btn:hover {
    background: #12588b;
  }
  .suggest-link {
    margin-left: auto;
    font-size: 14px;
    font-weight: 600;
    color: #2b8bc7;
    text-decoration: none;
  }
  .suggest-link:hover {
    text-decoration: underline;
  }
  :global(html.dark) .suggest-link {
    color: #4da6bd !important;
  }
  :global(html.dark) .variant-detail h2 {
    color: #dde6ed !important;
  }
  :global(html.dark) .detail-layout > div > section {
    border-color: #40505f !important;
    background: #263340 !important;
    box-shadow: 0 8px 25px rgba(0, 0, 0, 0.3) !important;
  }
  :global(html.dark) .rule-card {
    border-top-color: #40505f !important;
  }
  :global(html.dark) .rule-card p,
  :global(html.dark) .variant-detail section > p {
    color: #dde6ed !important;
  }
  :global(html.dark) .variant-detail ul {
    color: #dde6ed !important;
  }
  :global(html.dark) .variant-detail pre {
    background: #111a24 !important;
  }
  :global(html.dark) .variant-detail .blocker {
    color: #ffb4b4 !important;
    background: #542f35 !important;
  }
  :global(html.dark) footer {
    color: #8c9ba5 !important;
    background: #1b2630 !important;
  }
  :global(html.dark) .iframe-container {
    border-color: #40505f;
    background: #263340;
  }
  :global(html.dark) .iframe-header {
    background: #1b2630;
    border-bottom-color: #40505f;
  }
  :global(html.dark) .iframe-header h2 {
    color: #dde6ed;
  }
  :global(html.dark) .iframe-header a {
    color: #4da6bd;
  }
  :global(html.dark) .back-link {
    color: #2b8bc7 !important;
  }
  thead th.sortable {
    cursor: pointer;
    user-select: none;
  }
  thead th.sortable:hover {
    background: #143544;
  }
  :global(html.dark) thead th.sortable:hover {
    background: #253340 !important;
  }
  .sort-indicator {
    display: inline-block;
    margin-left: 4px;
    font-size: 0.9em;
  }
</style>
