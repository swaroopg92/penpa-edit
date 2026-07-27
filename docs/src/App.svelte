<script lang="ts">
  import { onMount } from "svelte";
  import { guideFor, variantRules } from "./variantRules";
  import {
    installVariationCatalog,
    outsideVariationValues,
    variationByValue,
    variantMetadata,
  } from "./variationCatalog";
  import { markChoiceFor } from "./variantMarks";
  import { metadataVariantIdForActiveVariants } from "./exampleSave.mjs";
  import ToastContainer, { type ToastItem, type ToastType } from "./ToastContainer.svelte";

  if (typeof window !== "undefined") {
    (window as any).SudokuSolverRuleText = Object.fromEntries(
      Object.entries(variantRules).map(([key, val]) => [key.replace(/\s+/g, ""), val.rule])
    );
    variantMetadata.variants.forEach((v) => {
      (window as any).SudokuSolverRuleText[v.id] = v.rules["9x9"] || Object.values(v.rules)[0] || "";
      (window as any).SudokuSolverRuleText[v.name.toLowerCase().replace(/[^a-z0-9]/g, "")] = v.rules["9x9"] || Object.values(v.rules)[0] || "";
    });
  }

  let toasts: ToastItem[] = [];
  let nextToastId = 1;

  function showToast(
    message: string,
    type: ToastType = "info",
    title?: string,
    duration = 4000
  ) {
    if (!message) return;
    const id = nextToastId++;
    const newToast: ToastItem = { id, type, title, message, duration };
    toasts = [newToast, ...toasts.filter(t => t.id !== id)].slice(0, 4);

    if (duration > 0) {
      window.setTimeout(() => {
        dismissToast(id);
      }, duration);
    }
  }

  function dismissToast(id: number) {
    toasts = toasts.filter(t => t.id !== id);
  }

  if (typeof window !== "undefined") {
    (window as any).showToast = showToast;
    window.alert = (msg: string) => {
      showToast(String(msg), "warning");
    };
    (window as any).Swal = {
      fire: (opts: any) => {
        if (typeof opts === "string") {
          showToast(opts, "info");
          return Promise.resolve({ isConfirmed: true, isDismissed: false });
        }
        const icon = opts?.icon;
        const type: ToastType = icon === "error" ? "error" : icon === "warning" ? "warning" : icon === "success" ? "success" : "info";
        const title = opts?.title;
        const msg = opts?.text || opts?.html || opts?.title || "";
        showToast(msg, type, title !== msg ? title : undefined);
        return Promise.resolve({ isConfirmed: true, isDismissed: false });
      }
    };
  }

  $: isNoSolution = /no solution|invalid|unsatisfiable|unsupported|conflict/i.test(lastLogLine);


  type VariantOption = { value: string; label: string; group: string };
  type VariantTab =
    | "no-input"
    | "line"
    | "cage"
    | "shading"
    | "outside"
    | "cell"
    | "edge"
    | "intersection";

  let boardHost: HTMLElement;
  let variantHost: HTMLElement;
  let logHost: HTMLElement;
  let legacyControlsHost: HTMLElement;
  let variants: VariantOption[] = [];
  let selectedVariant = "classic";
  let layer = "solution";
  let autoEnabled = false;
  let initialized = false;
  let zoom = 1;
  let variantMenuOpen = false;
  let inputVariantMenuOpen = false;
  let studioModal:
    | "confirm-grid"
    | "confirm-generate"
    | "screenshot"
    | "info"
    | null = null;
  let actionMenu: "new-grid" | "transform" | "clone" | null = null;
  let newGridSize: 6 | 7 | 8 | 9 = 9;
  let keepVariants = false;
  let hoveredVariant: string | null = null;
  let activeVariantId: string | null = null;
  let activeVariantHasExample = false;
  let activeVariantReviewed = false;
  let noteMode = "1";
  let currentVariant = "classic";
  let variantSearch = "";
  let variantTab: VariantTab = "no-input";
  let screenshotType: "png" | "jpg" | "svg" = "png";
  let screenshotBorder = false;
  let screenshotName = "Classic";
  let darkTheme = true;
  let mobileActiveTab: "none" | "controls" | "actions" | "solver" = "none";
  let solverRunning = false;
  function checkUrlFlag(name: string) {
    if (typeof window === "undefined") return false;
    const sources = [
      window.location.search,
      window.location.hash.replace(/^#/, "?"),
    ];
    for (const source of sources) {
      const params = new URLSearchParams(source);
      if (!params.has(name)) continue;
      const value = (params.get(name) || "").trim().toLowerCase();
      return !["0", "false", "no", "off"].includes(value);
    }
    return false;
  }
  function checkIsEmbedded() {
    if (typeof window === "undefined") return false;
    return (
      new URLSearchParams(window.location.search).has("embed") ||
      new URLSearchParams(window.location.hash.replace(/^#/, "?")).has("embed") ||
      window.location.search.includes("embed") ||
      window.location.hash.includes("embed")
    );
  }
  let isEmbedded = checkIsEmbedded();
  let hideLeftSidebar = checkUrlFlag("hideSidebar");
  let lastLogLine = "Idle";
  let fullLogContent = "";
  let fullLogExpanded = false;
  let generatorVariants: string[] = ["classic"];
  let generatorNegative = { kropki: false, doublekropki: false, xv: false, battenburg: false };
  let generatorSource: "new" | "existing" = "new";
  let toolTitle = "Sudoku input";
  let toolDescription =
    "Click a cell, then type a digit. Use Tab to cycle through available input tools.";
  let ruleTitle = "Classic Sudoku";
  let ruleVariant = "classic";
  let ruleDescription =
    "Place each digit exactly once in every row, column, and box.";
  let toolPanelMode = "Sudoku";
  type ToolPanelOption = {
    value: string;
    label: string;
    input?: string;
    action?: "backspace" | "delete";
    submode?: string;
    sym?: string;
    num?: number;
  };
  let toolPanelOptions: ToolPanelOption[] = [];
  let toolPanelSelected = new Set<string>();
  let slotColumns: boolean[] = [];
  let mobilePanelPosition: "above" | "below" = "above";

  const variantTabs: Array<{ value: VariantTab; label: string }> = [
    { value: "no-input", label: "No input" },
    { value: "line", label: "Line" },
    { value: "cage", label: "Cage" },
    { value: "shading", label: "Shading" },
    { value: "outside", label: "Outside" },
    { value: "cell", label: "Cell" },
    { value: "edge", label: "Edge" },
    { value: "intersection", label: "Intersection" },
  ];

  const inputTypeIcons: Record<VariantTab, string> = {
    "no-input": "∅",
    line: "╱",
    cage: "▧",
    shading: "◩",
    outside: "↘",
    cell: "□",
    edge: "⊟",
    intersection: "✣",
  };

  function legacyClick(id: string) {
    document.getElementById(id)?.click();
    queueMicrotask(syncState);
  }

  function clearMarks() {
    legacyClick("sudoku_reset");
    chooseLayer("problem");
  }

  function toggleMobilePanelPosition() {
    mobilePanelPosition = mobilePanelPosition === "above" ? "below" : "above";
    window.localStorage.setItem(
      "penpa-mobile-input-panel-position",
      mobilePanelPosition,
    );
    queueMicrotask(fitBoard);
  }

  function legacyPress(id: string) {
    document.getElementById(id)?.dispatchEvent(
      new MouseEvent("mousedown", {
        bubbles: true,
        cancelable: true,
        button: 0,
      }),
    );
    queueMicrotask(syncState);
  }

  function chooseLayer(nextLayer: "problem" | "solution" | "modes") {
    layer = nextLayer;
    if (typeof (window as any).pu === "undefined") return;
    if (nextLayer !== "problem") {
      (window as any).SudokuTools?.finishIrregularEditor?.();
    }
    variantMenuOpen = false;
    legacyPress(nextLayer === "solution" ? "pu_a_label" : "pu_q_label");
    if (nextLayer === "modes") queueMicrotask(moveLegacyControls);
    queueMicrotask(() => {
      syncState();
      syncToolPanel();
    });
  }

  function chooseNoteMode(mode: "1" | "2" | "3") {
    noteMode = mode;
    (window as any).pu?.submode_check?.(`sub_sudoku${mode}`);
    queueMicrotask(syncState);
  }

  function syncToolPanel() {
    const pu = (window as any).pu;
    if (pu?.irregular_mode) {
      toolPanelMode = "Regions";
      toolPanelOptions = [];
      toolPanelSelected = new Set<string>();
      return;
    }
    const mode = pu?.mode?.[pu?.mode?.qa]?.edit_mode || "sudoku";
    const setting = pu?.mode?.[pu?.mode?.qa]?.[mode] || [];
    const submode = String(setting[0] || "");
    const variant = String(pu?.activeSudokuVariant || "classic");
    currentVariant = variant;

    const size = Math.max(
      1,
      Math.min(
        9,
        Number(pu?.ny || 9) -
          Number(pu?.space?.[0] || 0) -
          Number(pu?.space?.[1] || 0),
      ),
    );
    const isZeroEight = ["0to8", "08arrow", "08skyscrapers"].includes(variant);

    const arrows = ["←", "↖", "↑", "↗", "→", "↘", "↓", "↙"];
    toolPanelMode =
      mode === "symbol"
        ? "Shape"
        : mode === "combi"
          ? "Composite"
          : mode === "number"
            ? "Number"
            : "Sudoku";
    if (
      mode === "number" &&
      (variant === "inequality" || variant === "blocksumrelations")
    ) {
      toolPanelOptions = [
        { value: "<", label: "<" },
        { value: "^", label: "^" },
        { value: ">", label: ">" },
        { value: "v", label: "v" },
      ];
    } else if (mode === "number" && variant === "wildcard") {
      toolPanelOptions = [
        { value: "<", label: "<" },
        { value: ">", label: ">" },
      ];
    } else if (mode === "number" && variant === "xv") {
      toolPanelOptions = [
        { value: "V", label: "V" },
        { value: "X", label: "X" },
      ];
    } else if (mode === "number" && variant === "xivi") {
      toolPanelOptions = [
        { value: "VI", label: "VI" },
        { value: "XI", label: "XI" },
      ];
    } else if (mode === "number" && variant === "multiplication") {
      toolPanelOptions = [{ value: "×", label: "×" }];
    } else if (
      (mode === "symbol" || [
        "search9",
        "search6",
        "smallestneighbours",
        "biggestneighbours",
        "pointtonext",
        "pointtoprevious",
        "twindetector",
        "sumdetector",
        "eliminate",
        "quadmax",
        "quadmin",
        "rossini",
      ].includes(variant)) &&
      /^arrow_/.test(submode)
    ) {
      if (
        [
          "eliminate",
          "quadmax",
          "quadmin",
          "little killer",
          "product little killer",
        ].includes(variant)
      ) {
        toolPanelOptions = [1, 3, 5, 7].map((index) => ({
          value: String(index + 1),
          label: arrows[index],
          sym: submode,
          num: index + 1,
        }));
      } else if (variant === "rossini") {
        toolPanelOptions = [0, 2, 4, 6].map((index) => ({
          value: String(index + 1),
          label: arrows[index],
          sym: submode,
          num: index + 1,
        }));
      } else {
        toolPanelOptions = arrows.map((label, index) => ({
          value: String(index + 1),
          label,
          sym: submode,
          num: index + 1,
        }));
      }
    } else if (
      (variant === "kropki" || variant === "clockfaces") &&
      (submode === "circle_SS" || mode === "symbol")
    ) {
      toolPanelOptions = [
        { value: "1", label: "White", sym: "circle_SS", num: 1 },
        { value: "2", label: "Black", sym: "circle_SS", num: 2 },
      ];
    } else if (variant === "sudokuwithstars") {
      toolPanelOptions = [
        ...Array.from({ length: 7 }, (_, index) => ({
          value: String(index + 1),
          label: String(index + 1),
        })),
        { value: "star", input: "1", label: "★", submode: "star", sym: "star", num: 1 },
      ];
    } else if (variant === "braille") {
      toolPanelOptions = Array.from({ length: 4 }, (_, index) => ({
        value: String(index + 1),
        label: String(index + 1),
        sym: "braille",
        num: index + 1,
      }));
    } else if (variant === "lc") {
      toolPanelOptions = [
        { value: "L", label: "L", submode: "3", input: "L" },
        { value: "C", label: "C", submode: "3", input: "C" },
      ];
    } else if (variant === "upperrightheavykiller") {
      toolPanelOptions = Array.from({ length: 10 }, (_, index) => ({
        value: String(index),
        label: String(index),
        submode: "3",
      }));
    } else if (variant === "anticonsecutive" || variant === "nonconsecutive") {
      toolPanelOptions = [{ value: "X", label: "X", submode: "cross", sym: "cross", num: 1 }];
    } else if (variant === "termination") {
      toolPanelOptions = [{ value: "0", label: "0" }];
    } else if (
      (variant === "consecutive" ||
        variant === "evensumpairs" ||
        variant === "oddsumpairs" ||
        variant === "fadedkropki" ||
        variant === "oneortwodifferencepairs") &&
      (submode === "circle_SS" || mode === "symbol" || mode === "sudoku")
    ) {
      toolPanelOptions = [{ value: "1", label: "White", sym: "circle_SS", num: 1 }];
    } else if (variant === "fullorhalf") {
      toolPanelOptions = [
        { value: "full", input: "1", label: "Full ○", submode: "circle_SS", sym: "circle_SS", num: 1 },
        { value: "half", input: "1", label: "Half □", submode: "square_SS", sym: "square_SS", num: 1 },
      ];
    } else if (variant === "teneleven") {
      toolPanelOptions = [{ value: "1", label: "Gray bar", sym: "bars_G", num: 1 }];
    } else if (
      [
        "sumnine",
        "diagonalsumisnine",
        "xydifference",
        "perfectsquares",
        "primesums",
        "twodigitprimenumbers",
        "fives",
      ].includes(variant) &&
      (submode === "diamond_SS" || mode === "symbol" || mode === "sudoku")
    ) {
      toolPanelOptions = [{ value: "1", label: "Diamond", sym: "diamond_SS", num: 1 }];
    } else if (
      variant === "doublekropki" &&
      (submode === "diamond_SS" || mode === "symbol")
    ) {
      toolPanelOptions = [
        { value: "1", label: "White", sym: "diamond_SS", num: 1 },
        { value: "2", label: "Black", sym: "diamond_SS", num: 2 },
      ];
    } else if (variant === "battenburg") {
      toolPanelOptions = [{ value: "1", label: "Battenburg", sym: "sudokuetc", num: 1 }];
    } else if (variant === "odd even") {
      toolPanelOptions = [
        { value: "odd", input: "3", label: "Odd ○", submode: "circle_L", sym: "circle_L", num: 1 },
        { value: "even", input: "3", label: "Even □", submode: "square_L", sym: "square_L", num: 2 },
      ];
    } else if (variant === "mastermind") {
      toolPanelOptions = [
        { value: "mastermind-black", input: "1", label: "Black ●", submode: "circle_SS", sym: "circle_SS", num: 2 },
        { value: "mastermind-white", input: "2", label: "White ○", submode: "circle_SS", sym: "circle_SS", num: 1 },
        { value: "mastermind-cross", input: "3", label: "Cross ⨯", submode: "cross", sym: "cross", num: 1 },
      ];
    } else if (variant === "trio") {
      toolPanelOptions = [
        { value: "trio-low", input: "3", label: "1–3 ○", submode: "circle_L", sym: "circle_L", num: 1 },
        { value: "trio-mid", input: "3", label: "4–6 □", submode: "square_L", sym: "square_L", num: 2 },
        { value: "trio-high", input: "3", label: "7–9 △", submode: "triup_L", sym: "triup_L", num: 1 },
      ];
    } else if (
      mode === "symbol" &&
      ["equalsums", "equalproducts", "equaldifferences", "equalratios"].includes(
        variant,
      )
    ) {
      toolPanelOptions = [{ value: "4", label: "×", sym: "cross", num: 1 }];
    } else if (
      mode === "symbol" &&
      [
        "diagonallyconsecutive",
        "diagonal sum is nine",
        "diagonal tens",
      ].includes(variant)
    ) {
      toolPanelOptions = [
        { value: "1", label: "Left diagonal" },
        { value: "2", label: "Right diagonal" },
      ];
    } else if (
      mode === "number" ||
      [
        "killer", "upperrightheavykiller", "productkiller", "solokiller", "sumorproductkiller",
        "threedigitnumberskiller", "outsidekiller", "sandwich", "evensandwich", "doublesandwich",
        "paritysandwich", "sumsandwich", "xsums", "bouncingxsums", "skyscraper", "sumskyscrapers",
        "parityskyscrapers", "littlekiller", "weightedlittlekiller", "productlittlekiller",
        "japanesesums", "bigsmalljapanesesums", "oddevensum", "samesum", "triplesum", "partitionedsums",
        "positionsums", "innerframesum", "wrongoutsidesum", "sumnexttonine", "diagonalsumisnine",
        "diagonaltens", "teneleven", "tenspositionproducts", "multiplication", "clock", "tableaux"
      ].includes(variant)
    ) {
      const digits = [1, 2, 3, 4, 5, 6, 7, 8, 9, 0];
      toolPanelOptions = digits.map((val) => ({
        value: String(val),
        label: String(val),
        submode: variant === "upperrightheavykiller" ? "3" : undefined,
      }));
    } else if (["symbol", "number", "sudoku"].includes(mode)) {
      const symbolname = mode === "symbol" ? String(pu?.mode?.[pu?.mode?.qa]?.symbol?.[0] || "circle_L") : undefined;
      const count = mode === "symbol"
        ? Number(pu?.onoff_symbolmode_list?.[symbolname] || 9)
        : size;
      toolPanelOptions = Array.from(
        { length: count },
        (_, index) => {
          const numVal = isZeroEight ? index : index + 1;
          return {
            value: String(numVal),
            label: String(numVal),
            sym: symbolname,
            num: numVal,
          };
        },
      );
    } else {
      toolPanelOptions = [];
    }
    if (toolPanelOptions.length) {
      toolPanelOptions = [
        ...toolPanelOptions,
        { value: "backspace", label: "⌫", action: "backspace" },
        { value: "delete", label: "Clear", action: "delete" },
      ];
    }
    const entry = pu?.[pu?.mode?.qa]?.symbol?.[pu?.cursol];
    const selected = new Set<string>();
    if (mode === "symbol" && entry?.[1] === submode) {
      if (Array.isArray(entry[0]))
        entry[0].forEach((enabled: number, index: number) => {
          if (enabled === 1) selected.add(String(index + 1));
        });
      else if (entry[0]) selected.add(String(entry[0]));
    }
    if (mode === "symbol" && variant === "odd even" && entry) {
      if (entry[1] === "circle_L") selected.add("odd");
      if (entry[1] === "square_L") selected.add("even");
    }
    if (mode === "symbol" && variant === "trio" && entry) {
      if (entry[1] === "circle_L") selected.add("trio-low");
      if (entry[1] === "square_L") selected.add("trio-mid");
      if (entry[1] === "triup_L") selected.add("trio-high");
    }
    toolPanelSelected = selected;
  }

  function applyToolPanelOption(option: ToolPanelOption) {
    const pu = (window as any).pu;
    if (!pu) return;
    if (option.submode && pu.mode?.[pu.mode.qa]?.symbol) {
      pu.subsymbolmode?.(option.submode, true);
    }
    if (option.action === "backspace") pu.key_backspace?.();
    else if (option.action === "delete") pu.key_space?.(46, false, false);
    else {
      const inputStr = option.input || option.value;
      for (const char of inputStr) {
        pu.key_number?.(char);
      }
    }
    pu.redraw?.();
    queueMicrotask(() => {
      syncState();
      syncToolPanel();
    });
  }

  function useToolPanelOption(event: Event, option: ToolPanelOption) {
    event.preventDefault();
    event.stopPropagation();
    applyToolPanelOption(option);
  }

  function renderSymbol(
    node: HTMLCanvasElement,
    params: { sym?: string; num?: number; darkTheme?: boolean },
  ) {
    function draw() {
      const pu = (window as any).pu;
      if (!node || !params.sym || params.num === undefined) return;
      const ctx = node.getContext("2d");
      if (!ctx) return;
      const dpr = window.devicePixelRatio || 1;
      const w = 24;
      const h = 24;
      node.width = w * dpr;
      node.height = h * dpr;
      node.style.width = `${w}px`;
      node.style.height = `${h}px`;
      ctx.save();
      ctx.scale(dpr, dpr);
      ctx.clearRect(0, 0, w, h);

      if (pu && typeof pu.draw_symbol_select === "function") {
        const origSize = pu.size;
        pu.size = 20;
        try {
          pu.draw_symbol_select(
            ctx,
            w / 2,
            h / 2,
            params.num,
            params.sym,
            "panel",
            "panel",
          );
        } catch (e) {
          // ignore error
        } finally {
          pu.size = origSize;
        }
      }
      ctx.restore();
    }
    draw();
    return {
      update(newParams: { sym?: string; num?: number; darkTheme?: boolean }) {
        params = newParams;
        draw();
      },
    };
  }

  function toolPanelNumberShortcut(event: KeyboardEvent) {
    const target = event.target as HTMLElement | null;
    if (
      target?.closest(
        "input, textarea, select, [contenteditable='true'], .modal, .swal2-container",
      )
    )
      return;
    const match = /^(?:Digit|Numpad)([1-9])$/.exec(event.code);
    if (!match) return;
    const option = toolPanelOptions.filter((item) => !item.action)[
      Number(match[1]) - 1
    ];
    if (!option) return;
    event.preventDefault();
    event.stopImmediatePropagation();
    applyToolPanelOption(option);
  }

  function revealAllModes() {
    const select = document.getElementById(
      "mode_choices",
    ) as HTMLSelectElement | null;
    if (!select) return;
    Array.from(select.options).forEach((option) => (option.selected = true));
    select.dispatchEvent(new Event("change", { bubbles: true }));
    (window as any).advancecontrol_on?.();
    queueMicrotask(syncState);
  }

  function variantInputFamilies(value: string): VariantTab[] {
    const catalog = variationByValue.get(value);
    if (catalog?.inputType.categories.length)
      return catalog.inputType.categories;
    const setting = (window as any).penpa_constraints?.setting?.[value];
    const modes: string[] = setting?.modeset || [];
    const families = new Set<VariantTab>();
    if (outsideVariationValues.has(value) || setting?.outside)
      families.add("outside");
    if (catalog?.tags?.includes("region") || modes.includes("cage"))
      families.add("cage");
    if (modes.includes("surface")) families.add("shading");
    if (modes.includes("line") || modes.includes("special"))
      families.add("line");
    if (!families.size) {
      const choice = catalog ? markChoiceFor(catalog) : null;
      if (choice?.position === "none" || value === "classic") {
        families.add("no-input");
      } else if (choice?.position === "edge") {
        families.add("edge");
      } else if (choice?.position === "corner") {
        families.add("intersection");
      } else {
        families.add("cell");
      }
    }
    return [...families];
  }

  function primaryVariantTab(value: string): VariantTab {
    const families = variantInputFamilies(value);
    return (
      (
        [
          "outside",
          "cage",
          "shading",
          "line",
          "no-input",
          "cell",
          "edge",
          "intersection",
        ] as VariantTab[]
      ).find((tab) => families.includes(tab)) || "no-input"
    );
  }

  function activeVariantValues() {
    const pu = (window as any).pu;
    return Array.isArray(pu?.activeSudokuVariants)
      ? (pu.activeSudokuVariants as string[])
      : [pu?.activeSudokuVariant || "classic"];
  }

  function conflictingVariant(value: string) {
    const regionGridVariants = ["irregular", "scattered", "deficit", "surplus", "toroidal"];
    if (regionGridVariants.includes(value)) {
      return (
        activeVariantValues().find(
          (active) => active !== value && regionGridVariants.includes(active),
        ) || null
      );
    }
    const restricted = variantInputFamilies(value).filter(
      (family) => family !== "no-input",
    );
    if (!restricted.length) return null;
    return (
      activeVariantValues().find(
        (active) =>
          active !== value &&
          active !== "classic" &&
          !regionGridVariants.includes(active) &&
          variantInputFamilies(active).some((family) =>
            restricted.includes(family),
          ),
      ) || null
    );
  }

  function unavailableVariant(value: string) {
    const pu = (window as any).pu;
    const size =
      Number(pu?.ny || 0) -
      Number(pu?.space?.[0] || 0) -
      Number(pu?.space?.[1] || 0);
    if (size === 9) return "";
    if (value === "windoku") return "Windoku requires a 9 × 9 grid";
    if (value === "argyle") return "Argyle requires a 9 × 9 grid";
    return "";
  }

  $: visibleVariantOptions = (() => {
    const query = variantSearch.trim().toLowerCase();
    return variants
      .filter(
        (variant) =>
          (variationByValue.get(variant.value)?.status === "available" || variant.value === "classic") &&
          (!query ? primaryVariantTab(variant.value) === variantTab : true) &&
          (!query ||
            variant.label.toLowerCase().includes(query) ||
            variant.value.toLowerCase().includes(query)),
      )
      .sort((a, b) => a.label.localeCompare(b.label));
  })();

  function ensureOutsideSpace(target = 1, sides = [0, 1, 2, 3]) {
    const pu = (window as any).pu;
    if (!pu?.space || !pu.grid_is_square?.()) return;
    const operations = [
      "resize_top",
      "resize_bottom",
      "resize_left",
      "resize_right",
    ];
    operations.forEach((operation, index) => {
      if (!sides.includes(index)) return;
      let missing = Math.max(0, target - Number(pu.space[index] || 0));
      while (missing-- > 0) pu[operation]?.(1, "white");
    });
    window.requestAnimationFrame(fitBoard);
  }

  function chooseVariant(value: string) {
    if (conflictingVariant(value) || unavailableVariant(value)) return;
    if (!["irregular", "scattered", "deficit", "surplus", "toroidal"].includes(value)) {
      (window as any).SudokuTools?.finishIrregularEditor?.();
    }
    selectedVariant = value;
    variantMenuOpen = false;
    inputVariantMenuOpen = false;
    const select = document.getElementById(
      "constraints_settings_opt",
    ) as HTMLSelectElement | null;
    if (!select) return;
    select.value = selectedVariant;
    select.dispatchEvent(new Event("change", { bubbles: true }));
    variantSearch = "";
    if (
      select.value === selectedVariant &&
      (["little killer", "sandwich", "skyscraper", "mastermind"].includes(selectedVariant) ||
        outsideVariationValues.has(selectedVariant))
    ) {
      const leftTopOnly = [
        "sandwich",
        "edgedifference",
        "evensandwich",
        "oddsandwich",
        "before9",
        "before1after9",
        "nextto9",
        "outsideconsecutive",
        "outsidekiller",
        "parityskyscrapers",
        "positionsums",
        "japanesesums",
        "oddsums",
        "bigsmalljapanesesums",
      ].includes(selectedVariant);
      let layers = [
        "outside",
        "outside234",
        "evensandwich",
        "oddsandwich",
        "mastermind",
      ].includes(selectedVariant)
        ? 3
        : 1;
      if (selectedVariant === "before1after9") layers = 2;
      if (selectedVariant === "positionsums") layers = 2;
      if (["bigsmalljapanesesums", "japanesesums", "partitionedsums"].includes(selectedVariant)) layers = 5;
      ensureOutsideSpace(
        layers,
        selectedVariant === "triplesum"
          ? [2]
          : leftTopOnly
            ? [0, 2]
            : [0, 1, 2, 3],
      );
    }
  }

  function readSlotColumns() {
    const pu = (window as any).pu;
    const size = Math.max(
      1,
      Number(pu?.ny || 9) -
        Number(pu?.space?.[0] || 0) -
        Number(pu?.space?.[1] || 0),
    );
    const startRow = 2 + Number(pu?.space?.[0] || 0);
    const startCol = 2 + Number(pu?.space?.[2] || 0);
    slotColumns = Array.from({ length: size }, (_, col) =>
      Array.from({ length: size }, (_, row) =>
        Boolean(
          pu?.pu_q?.surface?.[startCol + col + (startRow + row) * pu.nx0],
        ),
      ).every(Boolean),
    );
  }

  function toggleSlotColumn(col: number) {
    const pu = (window as any).pu;
    if (!pu) return;
    const size = slotColumns.length;
    const startRow = 2 + Number(pu.space?.[0] || 0);
    const startCol = 2 + Number(pu.space?.[2] || 0);
    const next = !slotColumns[col];
    pu.undoredo_counter++;
    for (let row = 0; row < size; row++) {
      const key = startCol + col + (startRow + row) * pu.nx0;
      if (next) pu.set_value?.("surface", key, 1, null);
      else pu.remove_surface?.(key);
    }
    pu.redraw?.();
    readSlotColumns();
  }

  function updateToolDescription() {
    const active = variantHost?.querySelector<HTMLButtonElement>(
      ".sudoku-variant-mode.active",
    );
    const variant =
      active?.dataset.variant ||
      (window as any).pu?.activeSudokuVariant ||
      "classic";
    const mode = active?.dataset.mode || "sudoku";
    const submode = active?.dataset.submode || "1";
    const guide = guideFor(variant);
    ruleVariant = variant;
    ruleTitle = guide.title;
    ruleDescription = guide.rule;
    toolTitle =
      mode === "number" && variant === "killer"
        ? "Killer sum"
        : guide.title + " tool";
    toolDescription =
      mode === "number" && variant === "killer"
        ? "Select a cage, then enter its total in the cage's upper-left corner."
        : submode === "11" && variant === "killer"
          ? "Enter the total in the upper-left corner of the selected cage."
          : guide.usage;
  }

  function previewRule(variant: string | null) {
    hoveredVariant = variant;
  }

  function requestNewGrid(size: 6 | 7 | 8 | 9) {
    newGridSize = size;
    keepVariants = false;
    actionMenu = null;
    studioModal = "confirm-grid";
  }

  function createGrid(preserveVariants: boolean) {
    keepVariants = preserveVariants;
    const variantsToKeep = preserveVariants
      ? activeVariantValues().filter((variant) => variant !== "classic")
      : [];
    const gridType = document.getElementById(
      "gridtype",
    ) as HTMLSelectElement | null;
    const rows = document.getElementById("nb_size2") as HTMLInputElement | null;
    const columns = document.getElementById(
      "nb_size1",
    ) as HTMLInputElement | null;
    if (!gridType || !rows || !columns) return;
    gridType.value = "sudoku";
    gridType.dispatchEvent(new Event("change", { bubbles: true }));
    rows.value = String(newGridSize);
    columns.value = String(newGridSize);
    (window as any).sudotokuNewGridSize = newGridSize;
    // Native Penpa selects the Sudoku box layout through these hidden size
    // switches. The numeric fields alone are ignored for a new Sudoku grid.
    ["nb_sudoku5", "nb_sudoku6", "nb_sudoku8"].forEach((id) => {
      const option = document.getElementById(id) as HTMLInputElement | null;
      if (option) {
        option.checked =
          (id === "nb_sudoku5" && newGridSize === 6) ||
          (id === "nb_sudoku6" && newGridSize === 8);
      }
    });
    if (!keepVariants) {
      (window as any).SudokuTools?.resetForNewGrid?.();
    }
    (window as any).create_newboard?.();
    (window as any).SudokuTools?.renderVariantTools?.();
    variantsToKeep.forEach((variant) => chooseVariant(variant));
    actionMenu = null;
    studioModal = null;
    window.requestAnimationFrame(fitBoard);
  }

  function requestGenerator() {
    const pu = (window as any).pu;
    generatorVariants = Array.isArray(pu?.activeSudokuVariants)
      ? [...pu.activeSudokuVariants]
      : [pu?.activeSudokuVariant || "classic"];
    if (!generatorVariants.includes("classic"))
      generatorVariants.unshift("classic");
    generatorNegative = {
      kropki: pu?.kropkiNegativeConstraint === true,
      doublekropki: pu?.doublekropkiNegativeConstraint === true,
      xv: pu?.xvNegativeConstraint === true,
      battenburg: pu?.battenburgNegativeConstraint === true,
    };
    const outside = Number(pu?.space?.[0] || 0) + Number(pu?.space?.[1] || 0);
    const size = Number(pu?.ny || 9) - outside;
    newGridSize = [6, 7, 8, 9].includes(size)
      ? (size as 6 | 7 | 8 | 9)
      : 9;
    actionMenu = null;
    studioModal = "confirm-generate";
  }

  function confirmGenerator() {
    const size = newGridSize;
    const variantsToGenerate = [...generatorVariants];
    const negative = { ...generatorNegative };
    if (
      generatorSource !== "existing" &&
      (negative.kropki ||
        negative.doublekropki ||
        negative.xv ||
        negative.battenburg ||
        (size === 6 && variantsToGenerate.includes("anti diagonal")))
    ) {
      studioModal = null;
      const reason =
        negative.kropki || negative.doublekropki || negative.xv || negative.battenburg
          ? "Symmetric generation with a negative edge/corner rule is not implemented yet."
          : "Anti-diagonal generation currently requires a 9 × 9 grid.";
      (window as any).Swal?.fire?.({
        icon: "warning",
        title: "Cannot generate this combination",
        text: reason,
      });
      return;
    }
    studioModal = null;
    const sourcePuzzle = {
      board: (window as any).SudokuSolver?.readBoard?.(
        (window as any).pu,
        false,
      ),
      constraints: (window as any).SudokuSolver?.readConstraints?.(
        (window as any).pu,
      ),
      preserveExisting: true,
    };
    window.setTimeout(
      () =>
        (window as any).SudokuTools?.generatePuzzle?.(
          size,
          variantsToGenerate,
          negative,
          sourcePuzzle,
        ),
      0,
    );
  }

  function transform(id: string) {
    legacyPress(id);
    window.requestAnimationFrame(fitBoard);
  }

  function verifyUniqueSolution() {
    const pu = (window as any).pu;
    const SudokuSolver = (window as any).SudokuSolver;
    const SudokuCSP = (window as any).SudokuCSP;
    if (!pu || !SudokuSolver || !SudokuCSP) {
      return { success: false, msg: "Solver is not loaded." };
    }
    if (!SudokuSolver.isClassicSudoku(pu)) {
      return {
        success: false,
        msg: "The solver only supports 6x6, 7x7, 8x8, or 9x9 Sudoku or square grids. Uniqueness cannot be verified.",
      };
    }
    try {
      const board = SudokuSolver.readBoard(pu, false);
      const constraints = SudokuSolver.readConstraints(pu);
      const problem = SudokuCSP.createProblem(board, constraints);
      const solutions = problem.enumerateAnswers(2);
      if (solutions.length === 0) {
        return { success: false, msg: "The puzzle has no solution." };
      }
      if (solutions.length > 1) {
        return {
          success: false,
          msg: "The puzzle does not have a unique solution (multiple solutions found).",
        };
      }
      return { success: true, solution: solutions[0] };
    } catch (e: any) {
      return { success: false, msg: "Solver error: " + e.message };
    }
  }

  function duplicateUrl(forPenpa: boolean) {
    const pu = (window as any).pu;
    if (!pu?.maketext_duplicate) return;
    let generated = pu.maketext_duplicate() as string;
    if (
      Array.isArray(pu.activeSudokuVariants) &&
      pu.activeSudokuVariants.length
    ) {
      generated +=
        "&variants=" + encodeURIComponent(pu.activeSudokuVariants.join(","));
    }
    const hash = generated.includes("#")
      ? generated.slice(generated.indexOf("#"))
      : "";
    const target = forPenpa
      ? `https://swaroopg92.github.io/penpa-edit/${hash}`
      : `${window.location.origin}${window.location.pathname}${hash}`;
    actionMenu = null;
    window.open(target, "_blank", "noopener");
  }

  function toggleActionMenu(
    menu: "new-grid" | "transform" | "clone",
  ) {
    actionMenu = actionMenu === menu ? null : menu;
  }

  function activeVariantTitle() {
    const pu = (window as any).pu;
    const active = Array.isArray(pu?.activeSudokuVariants)
      ? pu.activeSudokuVariants.filter(
          (variant: string) => variant !== "classic",
        )
      : [];
    return active.length
      ? active
          .map((variant: string) => guideFor(variant).title)
          .join(" ")
      : "Classic Sudoku";
  }

  function activeVariantFilename() {
    return activeVariantTitle();
  }

  let shareUrl = "";
  let showShareUrl = false;
  let shareLoading = false;
  let shareAuthor = "";
  let autoShorten = false;
  let verifyUniqueness = true;

  let userSettingsState = {
    sudoku_centre_size: "1",
    sudoku_normal_size: "1",
    generator_symmetry: "rotational180",
    generator_difficulty_minimal: true,
    generator_clues_on_marks: true,
    start_grid_size: "9",
    start_grid_type: "blank",
    reload_button: false,
    local_storage: true,
    auto_save_history: false,
    author: "",
  };

  function openShareModal() {
    shareUrl = "";
    showShareUrl = false;
    shareLoading = false;
    if (typeof (window as any).UserSettings !== "undefined") {
      shareAuthor = (window as any).UserSettings.author || "";
      autoShorten = Boolean((window as any).UserSettings.shorten_links);
    }
    studioModal = "share";
  }

  function applyShareMetadata() {
    if (typeof (window as any).pu !== "undefined" && (window as any).pu) {
      const pu = (window as any).pu;
      pu.title = "";
      pu.rules = "";
      pu.author = shareAuthor || "";
    }
    if (typeof (window as any).UserSettings !== "undefined") {
      (window as any).UserSettings.author = shareAuthor || "";
      (window as any).UserSettings.shorten_links = autoShorten;
    }
  }

  async function handleShareEdit() {
    if (shareLoading) return;
    shareLoading = true;
    showShareUrl = true;
    shareUrl = "";
    applyShareMetadata();

    await new Promise((resolve) => setTimeout(resolve, 50));

    try {
      await new Promise((resolve) => setTimeout(resolve, 20));
      let res: any = "";
      if ((window as any).savetext_edit) {
        res = await (window as any).savetext_edit();
      }
      const txtEl = document.getElementById("savetextarea") as HTMLTextAreaElement;
      shareUrl = res || txtEl?.value || "";
      if (txtEl && shareUrl) txtEl.value = shareUrl;
    } catch (e) {
      console.error(e);
    } finally {
      shareLoading = false;
    }
  }

  async function handleShareSolve() {
    if (shareLoading) return;
    shareLoading = true;
    showShareUrl = false;
    shareUrl = "";
    applyShareMetadata();

    await new Promise((resolve) => setTimeout(resolve, 50));

    try {
      showShareUrl = true;
      await new Promise((resolve) => setTimeout(resolve, 20));
      let res: any = "";
      if ((window as any).savetext_solve) {
        res = await (window as any).savetext_solve();
      }
      const txtEl = document.getElementById("savetextarea") as HTMLTextAreaElement;
      shareUrl = res || txtEl?.value || "";
      if (txtEl && shareUrl) txtEl.value = shareUrl;
    } catch (e) {
      console.error(e);
    } finally {
      shareLoading = false;
    }
  }

  function copyShareUrl() {
    const txtEl = document.getElementById("savetextarea") as HTMLTextAreaElement;
    const urlToCopy = txtEl?.value || shareUrl;
    if (urlToCopy) {
      navigator.clipboard.writeText(urlToCopy);
      if (typeof (window as any).Swal !== "undefined") {
        (window as any).Swal.fire({ icon: "success", title: "Copied!", timer: 1500, showConfirmButton: false });
      }
    }
  }

  function openShareUrl() {
    const txtEl = document.getElementById("savetextarea") as HTMLTextAreaElement;
    const urlToOpen = txtEl?.value || shareUrl;
    if (urlToOpen) {
      window.open(urlToOpen, "_blank", "noopener");
    }
  }

  function openSettingsModal() {
    if (typeof (window as any).UserSettings !== "undefined") {
      const US = (window as any).UserSettings;
      userSettingsState = {
        sudoku_centre_size: String(US.sudoku_centre_size || "1"),
        sudoku_normal_size: String(US.sudoku_normal_size || "1"),
        generator_symmetry: String(US.generator_symmetry || "rotational180"),
        generator_difficulty_minimal: Boolean(US.generator_difficulty_minimal),
        generator_clues_on_marks: Boolean(US.generator_clues_on_marks),
        start_grid_size: String(US.start_grid_size || "9"),
        start_grid_type: String(US.start_grid_type || "blank"),
        reload_button: Boolean(US.reload_button),
        local_storage: Boolean(US.local_storage),
        auto_save_history: Boolean(US.auto_save_history),
        author: String(US.author || ""),
      };
    }
    studioModal = "settings";
  }

  function updateSetting(key: string, val: any) {
    if (typeof (window as any).UserSettings !== "undefined") {
      (window as any).UserSettings[key] = val;
    }
    userSettingsState = { ...userSettingsState, [key]: val };
  }

  function openScreenshot() {
    screenshotType = "png";
    screenshotBorder = false;
    screenshotName = activeVariantFilename();
    studioModal = "screenshot";
  }

  function prepareScreenshot() {
    const typeIds = { png: "nb_type1", jpg: "nb_type2", svg: "nb_type3" };
    (
      document.getElementById(
        typeIds[screenshotType],
      ) as HTMLInputElement | null
    )?.click();
    const border = document.getElementById(
      screenshotBorder ? "nb_margin1" : "nb_margin2",
    ) as HTMLInputElement | null;
    if (border) border.checked = true;
    const title = document.getElementById(
      "nb_title2",
    ) as HTMLInputElement | null;
    const rules = document.getElementById(
      "nb_rules2",
    ) as HTMLInputElement | null;
    if (title) title.checked = true;
    if (rules) rules.checked = true;
    const filename = document.getElementById(
      "saveimagename",
    ) as HTMLInputElement | null;
    if (filename) filename.value = screenshotName || activeVariantFilename();
  }

  function downloadScreenshot(target: "problem" | "solution") {
    prepareScreenshot();
    const pu = (window as any).pu;
    const settings = (window as any).UserSettings;
    const tools = (window as any).SudokuTools;
    const filename = document.getElementById(
      "saveimagename",
    ) as HTMLInputElement | null;
    const originalName =
      filename?.value || screenshotName || activeVariantFilename();
    const originalVisibility = settings?.show_solution;
    const originalAuto = tools?.autoEnabled;
    const solutionName = originalName.replace(
      /(\.(?:png|jpe?g|svg))$/i,
      "_Sol$1",
    );
    if (filename)
      filename.value =
        target === "solution"
          ? solutionName === originalName
            ? `${originalName}_Sol`
            : solutionName
          : originalName;
    if (tools) tools.autoEnabled = false;
    if (settings) settings.show_solution = target === "solution";
    else pu?.redraw?.();
    (window as any).saveimage_download?.();
    if (settings) settings.show_solution = originalVisibility;
    if (tools) tools.autoEnabled = originalAuto;
    if (filename) filename.value = originalName;
    pu?.redraw?.();
  }

  function exportScreenshot(target: "problem" | "solution" | "both") {
    if (target === "solution" || target === "both") {
      const res = verifyUniqueSolution();
      if (!res.success) {
        if ((window as any).Swal) {
          (window as any).Swal.fire({
            icon: "warning",
            title: "Cannot Download Solution",
            text: res.msg,
          });
        } else {
          alert(res.msg);
        }
        return;
      }
      const pu = (window as any).pu;
      const SudokuSolver = (window as any).SudokuSolver;
      if (pu && SudokuSolver) {
        SudokuSolver.applySolution(pu, res.solution);
      }
    }
    if (target === "both") {
      downloadScreenshot("problem");
      downloadScreenshot("solution");
    } else {
      downloadScreenshot(target);
    }
    studioModal = null;
  }

  async function loadExample() {
    const pu = (window as any).pu;
    if (!pu) return;
    const variantId = metadataVariantIdForActiveVariants(
      pu.activeSudokuVariants,
      variantMetadata.variants,
    );
    if (!variantId) return;
    const metadataVariant = variantMetadata.variants.find((v) => v.id === variantId);
    if (!metadataVariant?.example) return;
    const example = metadataVariant.example;
    const stored = /[&]variants=/.test(example)
      ? example
      : `${example}&variants=${encodeURIComponent(`classic,${variantId}`)}`;
    const url = `?m=solve&p=${stored}`;
    if (typeof (window as any).import_url === "function") {
      await (window as any).import_url(url);
      syncState();
    }
  }

  async function saveExample() {
    const res = verifyUniqueSolution();
    if (!res.success) {
      if ((window as any).Swal) {
        (window as any).Swal.fire({
          icon: "warning",
          title: "Cannot Save Example",
          text: res.msg,
        });
      } else {
        alert(res.msg);
      }
      return;
    }
    const pu = (window as any).pu;
    if (!pu?.maketext_solve) return;

    const variantId = metadataVariantIdForActiveVariants(
      pu.activeSudokuVariants,
      variantMetadata.variants,
    );
    if (!variantId) {
      (window as any).Swal?.fire({
        icon: "warning",
        title: "Cannot Save Example",
        text: "Select exactly one non-Classic variant before saving its wiki example.",
      });
      return;
    }
    const solvingUrl = pu.maketext_solve?.() as string | undefined;
    const marker = "#m=solve&p=";
    const markerIndex = solvingUrl?.indexOf(marker) ?? -1;
    if (markerIndex < 0) {
      alert("Could not generate a solving URL for this example.");
      return;
    }
    let example = solvingUrl!.slice(markerIndex + marker.length);
    if (!/[&]variants=/.test(example)) {
      example +=
        "&variants=" +
        encodeURIComponent(
          Array.isArray(pu.activeSudokuVariants)
            ? pu.activeSudokuVariants.join(",")
            : `classic,${variantId}`,
        );
    }

    try {
      const response = await fetch("/api/save-example", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          variantId,
          example
        })
      });
      if (response.ok) {
        if ((window as any).Swal) {
          (window as any).Swal.fire({
            icon: "success",
            title: "Success",
            text: `Example for ${variantId} saved successfully.`,
            timer: 2000,
            showConfirmButton: false
          });
        }
      } else {
        const text = await response.text();
        if ((window as any).Swal) {
          (window as any).Swal.fire({
            icon: "error",
            title: "Error",
            text: text,
          });
        }
      }
    } catch (e: any) {
      if ((window as any).Swal) {
        (window as any).Swal.fire({
          icon: "error",
          title: "Error",
          text: e.message,
        });
      }
    }
  }

  async function confirmOverwriteExample() {
    if ((window as any).Swal) {
      const result = await (window as any).Swal.fire({
        icon: "warning",
        title: "Overwrite Example?",
        text: "This will replace the existing example puzzle for this variant.",
        showCancelButton: true,
        confirmButtonText: "Overwrite",
        cancelButtonText: "Cancel",
      });
      if (result.isConfirmed) {
        await saveExample();
      }
    } else if (confirm("Overwrite the existing example puzzle for this variant?")) {
      await saveExample();
    }
  }

  async function handleToggleReviewed(event: Event) {
    const target = event.target as HTMLInputElement;
    const reviewed = target.checked;
    const variantId = metadataVariantIdForActiveVariants(
      (window as any).pu?.activeSudokuVariants,
      variantMetadata.variants,
    );
    if (!variantId) return;

    try {
      const response = await fetch("/api/toggle-reviewed", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ variantId, reviewed }),
      });
      if (response.ok) {
        const metadataVariant = variantMetadata.variants.find((v) => v.id === variantId);
        if (metadataVariant) {
          metadataVariant.reviewed = reviewed;
          activeVariantReviewed = reviewed;
        }
      }
    } catch (e) {
      console.error(e);
    }
  }

  function toggleTheme() {
    darkTheme = !darkTheme;
    document.documentElement.classList.toggle("dark", darkTheme);
    const settings = (window as any).UserSettings;
    if (settings) {
      // THEME_LIGHT=1, THEME_DARK=2 (see settings.js)
      settings.color_theme = darkTheme ? 2 : 1;
    }
  }

  function moveLegacyControls() {
    if (!legacyControlsHost) return;
    ["legacy_mode_controls", "submode_button", "stylemode_button"].forEach(
      (id) => {
        const node = document.getElementById(id);
        if (!node) return;
        node.classList.remove("is_hidden");
        legacyControlsHost.appendChild(node);
      },
    );
    const settings = (window as any).UserSettings;
    if (settings?.panel_shown) settings.panel_shown = false;
  }

  function closeModalFromBackdrop(event: MouseEvent) {
    if (event.target === event.currentTarget) studioModal = null;
  }

  function variantIcon(variant: string) {
    return inputTypeIcons[primaryVariantTab(variant)];
  }

  function applyZoom() {
    const board = document.getElementById("puzzle-container");
    if (board) board.style.transform = `scale(${zoom})`;
  }

  function fitBoard() {
    const board = document.getElementById("puzzle-container");
    if (!board || !boardHost) return;
    const width = board.offsetWidth;
    const height = board.offsetHeight;
    if (!width || !height) return;
    zoom = Math.max(
      0.55,
      Math.min(
        2.4,
        (boardHost.clientWidth - 28) / width,
        (boardHost.clientHeight - 28) / height,
      ),
    );
    applyZoom();
  }

  function changeZoom(delta: number) {
    zoom = Math.max(0.5, Math.min(2.5, Math.round((zoom + delta) * 10) / 10));
    applyZoom();
  }

  function syncState() {
    const pu = (window as any).pu;
    if (pu) {
      activeVariantId = metadataVariantIdForActiveVariants(
        pu.activeSudokuVariants,
        variantMetadata.variants,
      );
      if (activeVariantId) {
        const metadataVariant = variantMetadata.variants.find((v) => v.id === activeVariantId);
        activeVariantHasExample = Boolean(metadataVariant?.example);
        activeVariantReviewed = Boolean(metadataVariant?.reviewed);
      } else {
        activeVariantHasExample = false;
        activeVariantReviewed = false;
      }
    } else {
      activeVariantId = null;
      activeVariantHasExample = false;
      activeVariantReviewed = false;
    }
    const select = document.getElementById(
      "constraints_settings_opt",
    ) as HTMLSelectElement | null;
    if (select?.options.length) {
      variants = Array.from(select.options)
        .map((option) => ({
          value: option.value,
          // Never expose the internal option value as the menu label. The
          // catalog is backed directly by variant_metadata.json's `name` field.
          label:
            variationByValue.get(option.value)?.name ||
            option.textContent ||
            "Unnamed variant",
          group:
            (option.parentElement as HTMLOptGroupElement | null)?.label ||
            "Variants",
        }))
        .sort((a, b) => a.label.localeCompare(b.label));
      selectedVariant = select.value || "classic";
    }
    if (isEmbedded) {
      layer = "solution";
      if (typeof (window as any).pu !== "undefined" && (window as any).pu?.mode?.qa !== "pu_a") {
        chooseLayer("solution");
      }
    } else if (layer !== "modes") {
      layer = document.getElementById("pu_a")?.checked ? "solution" : "problem";
    }
    noteMode = String((window as any).pu?.mode?.pu_a?.sudoku?.[0] || "1");
    if (layer === "solution") variantMenuOpen = false;
    autoEnabled =
      document
        .getElementById("sudoku_auto_solver")
        ?.classList.contains("auto-solver-active") || false;
    solverRunning =
      document.body.classList.contains("sudoku-solver-running") ||
      document.body.classList.contains("sudoku-solve-check-running");
    const logOutput = document.getElementById("sudoku-solver-log-output");
    if (logOutput) {
      fullLogContent = logOutput.textContent || "";
      const lines = fullLogContent.trim().split("\n").filter(Boolean);
      lastLogLine = lines[lines.length - 1] || "Idle";
    }
    updateToolDescription();
    syncToolPanel();
    if (selectedVariant === "slotmachine") readSlotColumns();
  }

  function cycleInputMode(event: KeyboardEvent) {
    const target = event.target as HTMLElement | null;
    if (
      target?.closest(
        "input, textarea, select, [contenteditable='true'], .modal, .swal2-container",
      )
    )
      return;
    if (layer === "solution" && ["KeyZ", "KeyX", "KeyC"].includes(event.code)) {
      noteMode =
        event.code === "KeyZ" ? "1" : event.code === "KeyX" ? "3" : "2";
    }
    if (
      event.key !== "Tab" ||
      layer === "solution" ||
      layer === "modes" ||
      studioModal
    )
      return;
    event.preventDefault();
    event.stopImmediatePropagation();
    const modes = Array.from(
      variantHost?.querySelectorAll<HTMLButtonElement>(
        ".sudoku-variant-mode",
      ) || [],
    ).filter((button) => !button.disabled);
    if (!modes.length) return;
    const active = modes.findIndex((button) =>
      button.classList.contains("active"),
    );
    const direction = event.shiftKey ? -1 : 1;
    const next =
      active < 0
        ? direction > 0
          ? 0
          : modes.length - 1
        : (active + direction + modes.length) % modes.length;
    modes[next].click();
    modes[next].focus({ preventScroll: true });
  }

  function moveLegacyNodes() {
    const board = document.getElementById("puzzle-container");
    const variantTools = document.getElementById("sudoku-variant-tools");
    const log = document.getElementById("sudoku-solver-log");
    const autoSolver = document.getElementById("sudoku_auto_solver");
    const solveOnce = document.getElementById("sudoku_solve_once");
    const solveClear = document.getElementById("sudoku_solve_clear");
    const logHeader = log?.querySelector(".sudoku-solver-log-header");
    if (
      !board ||
      !variantTools ||
      !log ||
      !autoSolver ||
      !solveOnce ||
      !logHeader ||
      !document.getElementById("canvas")
    )
      return false;
    boardHost.appendChild(board);
    variantHost.appendChild(variantTools);
    logHost.appendChild(log);
    logHeader.insertBefore(
      autoSolver,
      document.getElementById("sudoku-solver-status"),
    );
    logHeader.insertBefore(
      solveOnce,
      document.getElementById("sudoku-solver-status"),
    );
    if (solveClear) {
      logHeader.insertBefore(
        solveClear,
        document.getElementById("sudoku-solver-status"),
      );
    }
    moveLegacyControls();
    syncState();
    initialized = true;
    window.requestAnimationFrame(() => window.requestAnimationFrame(fitBoard));
    window.setTimeout(fitBoard, 120);
    window.setTimeout(fitBoard, 500);
    return true;
  }

  onMount(() => {
    hideLeftSidebar = checkUrlFlag("hideSidebar");
    isEmbedded =
      new URLSearchParams(window.location.search).has("embed") ||
      new URLSearchParams(window.location.hash.replace(/^#/, "?")).has("embed") ||
      window.location.search.includes("embed") ||
      window.location.hash.includes("embed");
    const savedPanelPosition = window.localStorage.getItem(
      "penpa-mobile-input-panel-position",
    );
    if (savedPanelPosition === "above" || savedPanelPosition === "below") {
      mobilePanelPosition = savedPanelPosition;
    } else if (isEmbedded) {
      mobilePanelPosition = "below";
    }
    let observer: MutationObserver | undefined;
    let resizeObserver: ResizeObserver | undefined;
    let syncFrame = 0;
    const requestSync = () => {
      if (syncFrame) return;
      syncFrame = window.requestAnimationFrame(() => {
        syncFrame = 0;
        syncState();
      });
    };
    const syncDisplayTheme = (event: Event) => {
      const detail = (event as CustomEvent<{ dark: boolean }>).detail;
      darkTheme = Boolean(detail?.dark);
    };
    const start = () => {
      installVariationCatalog();
      if (!moveLegacyNodes()) return false;
      if (isEmbedded) chooseLayer("solution");
      const settings = (window as any).UserSettings;
      if (settings) {
        if (settings.color_theme === 2) {
          darkTheme = true;
        } else if (settings.color_theme === 1) {
          darkTheme = false;
        }
      }
      document.documentElement.classList.toggle("dark", darkTheme);
      observer = new MutationObserver(requestSync);
      [
        document.getElementById("constraints_settings_opt"),
        document.getElementById("sudoku_auto_solver"),
      ]
        .filter(Boolean)
        .forEach((node) =>
          observer.observe(node, {
            attributes: true,
            childList: true,
            subtree: true,
          }),
        );
      resizeObserver = new ResizeObserver(fitBoard);
      resizeObserver.observe(boardHost);
      const board = document.getElementById("puzzle-container");
      if (board) resizeObserver.observe(board);
      return true;
    };
    const begin = () => {
      if (start()) return;
      const retry = window.setInterval(() => {
        if (start()) window.clearInterval(retry);
      }, 50);
      window.setTimeout(() => window.clearInterval(retry), 10000);
    };
    if (document.readyState === "complete") begin();
    else
      window.addEventListener("load", () => window.setTimeout(begin, 0), {
        once: true,
      });
    document.addEventListener("keydown", cycleInputMode, true);
    document.addEventListener("keydown", toolPanelNumberShortcut, true);
    document.addEventListener("pointerup", requestSync);
    document.addEventListener("sudoku-solved", requestSync);
    document.addEventListener("penpa-theme-change", syncDisplayTheme);
    const closeVariantMenu = (event: PointerEvent) => {
      const target = event.target as HTMLElement | null;
      if (!target?.closest(".variant-menu, .variant-search-control")) {
        variantMenuOpen = false;
      }
      if (!target?.closest(".input-mode-variant-menu, .mobile-add-variant")) {
        inputVariantMenuOpen = false;
      }
      if (!target?.closest(".action-dropdown")) actionMenu = null;
      if (
        !target?.closest(
          ".controls-top-drawer, .penpa-actions, .log-host, .mobile-header, .column.actions",
        )
      ) {
        mobileActiveTab = "none";
      }
    };
    const clearConflictHighlights = () => {
      const pu = (window as any).pu;
      if (pu && pu.conflict_cells && pu.conflict_cells.length > 0) {
        pu.conflict_cells.length = 0;
        pu.redraw?.();
      }
    };
    document.addEventListener("pointerdown", closeVariantMenu);
    document.addEventListener("pointerdown", clearConflictHighlights);
    document.addEventListener("keydown", clearConflictHighlights);
    return () => {
      observer?.disconnect();
      resizeObserver?.disconnect();
      if (syncFrame) window.cancelAnimationFrame(syncFrame);
      document.removeEventListener("keydown", cycleInputMode, true);
      document.removeEventListener("keydown", toolPanelNumberShortcut, true);
      document.removeEventListener("pointerup", requestSync);
      document.removeEventListener("sudoku-solved", requestSync);
      document.removeEventListener("penpa-theme-change", syncDisplayTheme);
      document.removeEventListener("pointerdown", closeVariantMenu);
      document.removeEventListener("pointerdown", clearConflictHighlights);
      document.removeEventListener("keydown", clearConflictHighlights);
    };
  });
</script>

<svelte:head>
  <title>Sudotoku</title>
  <meta
    name="description"
    content="A Sudoku setter and solver powered by Penpa+."
  />
</svelte:head>

<div
  class="studio-shell"
  class:ready={initialized}
  class:dark={darkTheme}
  class:embedded={isEmbedded}
  class:hide-left-sidebar={hideLeftSidebar}
>
  <ToastContainer {toasts} onDismiss={dismissToast} />

  <div class="mobile-header">
    {#if isEmbedded}
      <div class="mobile-header-row">
        <button
          type="button"
          on:click={() => legacyClick("sudoku_solve_once")}
        >
          <span><i class="fa fa-magic" aria-hidden="true"></i></span> Solve
        </button>
        <button
          type="button"
          on:click={() => legacyClick("sudoku_solve_clear")}
        >
          <span><i class="fa fa-undo" aria-hidden="true"></i></span> Undo
        </button>
        <button
          type="button"
          on:click={clearMarks}
        >
          <span>↺</span> Reset
        </button>
      </div>
    {:else}
      <div class="mobile-header-row">
        <button
          type="button"
          class:active={mobileActiveTab === "controls"}
          on:click={() => (mobileActiveTab = mobileActiveTab === "controls" ? "none" : "controls")}
        >
          <span>⚙</span> Controls
        </button>
        <button
          type="button"
          class:active={mobileActiveTab === "actions"}
          on:click={() => (mobileActiveTab = mobileActiveTab === "actions" ? "none" : "actions")}
        >
          <span>☰</span> Actions
        </button>
      </div>
      <div class="mobile-header-row solver-row">
        <button
          type="button"
          class="solver-btn"
          class:active={autoEnabled}
          on:click={() => legacyClick("sudoku_auto_solver")}
        >
          <span><i class="fa fa-refresh" aria-hidden="true"></i></span>
          <span>{autoEnabled ? "ON" : "OFF"}</span>
        </button>
        <button
          type="button"
          class="solver-btn"
          on:click={() => legacyClick("sudoku_solve_once")}
        >
          <span><i class="fa fa-magic" aria-hidden="true"></i></span> Solve
        </button>
        <button
          type="button"
          class="solver-btn"
          on:click={() => legacyClick("sudoku_undo")}
        >
          <span>↶</span> Undo
        </button>
        <div class="solver-status">
          <span class="status-indicator" class:running={solverRunning && !isNoSolution} class:error-bulb={isNoSolution} title={isNoSolution ? "No solution found" : (solverRunning ? "Solver running" : "Solver idle")}></span>
          <span class="log-text">{lastLogLine}</span>
        </div>
      </div>
    {/if}
  </div>
  <main
    class="studio-grid"
    class:embedded-right={isEmbedded && mobilePanelPosition === "below"}
  >
    <aside class="column controls" aria-label="Puzzle controls">
      <div
        class="controls-top-drawer"
        class:open={mobileActiveTab === "controls"}
      >
        <section>
          <div class="segmented">
            {#if currentVariant !== "sudokuwithstars"}
              <button
                class:active={layer === "problem"}
                on:click={() => chooseLayer("problem")}
                ><i class="fa fa-pencil" aria-hidden="true"></i>Set</button
              >
            {/if}
            <button
              class:active={layer === "solution"}
              on:click={() => chooseLayer("solution")}
              ><i class="fa fa-check" aria-hidden="true"></i>{currentVariant === "sudokuwithstars" ? "Star" : "Solve"}</button
            >
            <button
              class:active={layer === "modes"}
              on:click={() => chooseLayer("modes")}
              ><i class="fa fa-sliders" aria-hidden="true"></i>Misc</button
            >
          </div>
          {#if layer === "solution"}
            <div class="note-modes" aria-label="Note input style">
              <button
                type="button"
                class:active={noteMode === "1"}
                on:click={() => chooseNoteMode("1")}
                >Normal <kbd>z</kbd></button
              >
              <button
                type="button"
                class:active={noteMode === "3"}
                on:click={() => chooseNoteMode("3")}
                >Center <kbd>x</kbd></button
              >
              <button
                type="button"
                class:active={noteMode === "2"}
                on:click={() => chooseNoteMode("2")}
                >Corner <kbd>c</kbd></button
              >
            </div>
          {/if}
        </section>

        <section
          class="variant-picker"

          class:hidden-section={layer !== "problem"}
        >
          <div class="variant-search-control">
            <input
              disabled={layer === "solution"}
              aria-label="Add variant"
              aria-expanded={variantMenuOpen}
              bind:value={variantSearch}
              on:focus={() => (variantMenuOpen = true)}
              on:input={() => (variantMenuOpen = true)}
              placeholder="Add variant"
            />
            <span class="variant-chevron">+</span>
          </div>
          {#if variantMenuOpen}
            <div
              class="variant-menu"
              role="menu"
              tabindex="-1"
              on:mouseleave={() => previewRule(null)}
            >
              <div
                class="variant-tabs"
                role="tablist"
                aria-label="Variant input type"
              >
                {#each variantTabs as tab}
                  <button
                    type="button"
                    role="tab"
                    aria-selected={variantTab === tab.value}
                    class:active={variantTab === tab.value}
                    on:click={() => (variantTab = tab.value)}
                  >
                    <span class="tab-icon">{inputTypeIcons[tab.value]}</span>
                    <span>{tab.label}</span>
                  </button>
                {/each}
              </div>
              {#each [...new Set(visibleVariantOptions.map((variant) => variant.group))] as group}
                <div class="variant-menu-group">{group}</div>
                {#each visibleVariantOptions.filter((variant) => variant.group === group) as variant}
                  {@const conflict = conflictingVariant(variant.value)}
                  {@const unavailable = unavailableVariant(variant.value)}
                  <button
                    role="menuitem"
                    class:current={variant.value === selectedVariant}
                    disabled={Boolean(conflict || unavailable)}
                    title={unavailable ||
                      (conflict
                        ? `${guideFor(conflict).title} already uses this input type`
                        : "")}
                    on:mouseenter={() => previewRule(variant.value)}
                    on:focus={() => previewRule(variant.value)}
                    on:click={() => chooseVariant(variant.value)}
                  >
                    <span class="variant-icon"
                      >{variantIcon(variant.value)}</span
                    >
                    <span>{variant.label}</span>
                    <span class="capability-badges">
                      {#if variationByValue.get(variant.value)?.example}
                        <span
                          class="example-badge"
                          title="Example puzzle available"
                          aria-label="Example puzzle available">📖</span
                        >
                      {/if}
                      {#if variationByValue.get(variant.value)?.status === "available"}
                        <span
                          class="csp-badge"
                          title="CSP solver implemented"
                          aria-label="CSP solver implemented">⬢</span
                        >
                      {:else}
                        <span class="unsupported-badge" title="Planned"
                          >Planned</span
                        >
                      {/if}
                    </span>
                    {#if conflict}<span class="input-conflict"
                        >Used by {guideFor(conflict).title}</span
                      >{/if}
                    {#if unavailable}<span class="input-conflict"
                        >9 × 9 only</span
                      >{/if}
                  </button>
                {/each}
              {/each}
            </div>
            {#if hoveredVariant}
              <div class="variant-rule-preview" role="tooltip">
                <strong>{guideFor(hoveredVariant).title}</strong>
                <span>{guideFor(hoveredVariant).rule}</span>
              </div>
            {/if}
          {/if}
        </section>

        {#if layer === "solution"}
          <section
            class="tool-help"
            class:hidden-section={layer === "modes"}
            aria-live="polite"
          >
            <div>
              <span class="help-label">Tool usage</span>
              <strong>{toolTitle}</strong>
              <p>{toolDescription}</p>
            </div>
          </section>
        {/if}

        <section
          class="legacy-modes-section"
          class:hidden-section={layer !== "modes"}
        >
          <div class="modes-heading">
            <h2>Mode controls</h2>
            <button type="button" on:click={revealAllModes}>Reveal all</button>
          </div>
          <div
            bind:this={legacyControlsHost}
            class="legacy-controls-host"
          ></div>
        </section>
      </div>

      <section
        class="input-modes-section"
        class:hidden-section={layer === "modes"}
        class:panel-above={mobilePanelPosition === "above"}
        class:panel-below={mobilePanelPosition === "below"}
      >
        {#if !isEmbedded}
        <div class="input-modes-heading">
          <h2>Input modes</h2>
          <kbd class="tab-key-hint" title="Press Tab to cycle input modes"
            >Tab ↹</kbd
          >
        </div>
        {/if}
        <div class="input-mode-tools">
          <div bind:this={variantHost} class="legacy-variant-host"></div>
          <button
            type="button"
            class="mobile-add-variant"
            class:hidden-section={layer === "solution"}
            aria-expanded={inputVariantMenuOpen}
            on:click={() =>
              (inputVariantMenuOpen = !inputVariantMenuOpen)}
            >+</button
          >
          <span class="input-mode-scroll-hint" aria-hidden="true">▾</span>
        </div>
        {#if inputVariantMenuOpen}
          <div
            class="variant-menu input-mode-variant-menu"
            role="menu"
            tabindex="-1"
            on:mouseleave={() => previewRule(null)}
          >
            <div class="variant-search-control mobile-variant-search">
              <input
                disabled={layer === "solution"}
                aria-label="Add variant"
                bind:value={variantSearch}
                placeholder="Add variant"
              />
              <span class="variant-chevron">+</span>
            </div>
            <div
              class="variant-tabs"
              role="tablist"
              aria-label="Variant input type"
            >
              {#each variantTabs as tab}
                <button
                  type="button"
                  role="tab"
                  aria-selected={variantTab === tab.value}
                  class:active={variantTab === tab.value}
                  on:click={() => (variantTab = tab.value)}
                >
                  <span class="tab-icon">{inputTypeIcons[tab.value]}</span>
                  <span>{tab.label}</span>
                </button>
              {/each}
            </div>
            {#each [...new Set(visibleVariantOptions.map((variant) => variant.group))] as group}
              <div class="variant-menu-group">{group}</div>
              {#each visibleVariantOptions.filter((variant) => variant.group === group) as variant}
                {@const conflict = conflictingVariant(variant.value)}
                {@const unavailable = unavailableVariant(variant.value)}
                <button
                  role="menuitem"
                  class:current={variant.value === selectedVariant}
                  disabled={Boolean(conflict || unavailable)}
                  title={unavailable ||
                    (conflict
                      ? `${guideFor(conflict).title} already uses this input type`
                      : "")}
                  on:mouseenter={() => previewRule(variant.value)}
                  on:focus={() => previewRule(variant.value)}
                  on:click={() => chooseVariant(variant.value)}
                >
                  <span class="variant-icon">{variantIcon(variant.value)}</span>
                  <span>{variant.label}</span>
                  <span class="capability-badges">
                    {#if variationByValue.get(variant.value)?.example}
                      <span
                        class="example-badge"
                        title="Example puzzle available"
                        aria-label="Example puzzle available">📖</span
                      >
                    {/if}
                    {#if variationByValue.get(variant.value)?.status === "available"}
                      <span
                        class="csp-badge"
                        title="CSP solver implemented"
                        aria-label="CSP solver implemented">⬢</span
                      >
                    {:else}
                      <span class="unsupported-badge" title="Planned"
                        >Planned</span
                      >
                    {/if}
                  </span>
                  {#if conflict}<span class="input-conflict"
                      >Used by {guideFor(conflict).title}</span
                    >{/if}
                  {#if unavailable}<span class="input-conflict"
                      >9 × 9 only</span
                    >{/if}
                </button>
              {/each}
            {/each}
          </div>
          {#if hoveredVariant}
            <div class="variant-rule-preview mobile-variant-rule-preview" role="tooltip">
              <strong>{guideFor(hoveredVariant).title}</strong>
              <span>{guideFor(hoveredVariant).rule}</span>
            </div>
          {/if}
        {/if}
        {#if selectedVariant === "slotmachine"}
          <div class="slot-column-controls" aria-label="Slot Machine columns">
            {#each slotColumns as checked, index}
              <label for="slot-column-{index}"
                ><input
                  id="slot-column-{index}"
                  type="checkbox"
                  {checked}
                  on:change={() => toggleSlotColumn(index)}
                />Column {index + 1}</label
              >
            {/each}
          </div>
        {/if}
      </section>

      {#if toolPanelOptions.length}
        <div
          class="input-panel-section desktop-input-panel"
          aria-label={`${toolPanelMode} input panel section`}
        >
          <span class="help-label">Input · Penpa {toolPanelMode}</span>
          <div
            class="tool-input-panel"
            aria-label={`${toolPanelMode} input panel`}
          >
            {#each toolPanelOptions as option, index}
              <button
                type="button"
                class:selected={toolPanelSelected.has(option.value)}
                class:panel-action={Boolean(option.action)}
                on:pointerdown={(event) => useToolPanelOption(event, option)}
              >
                {#if option.sym && option.num !== undefined}
                  <canvas
                    use:renderSymbol={{ sym: option.sym, num: option.num, darkTheme }}
                    class="symbol-canvas"
                  ></canvas>
                {:else}
                  {option.label}
                {/if}
                {#if !option.action && index < 9}<kbd>{index + 1}</kbd>{/if}
              </button>
            {/each}
          </div>
        </div>
      {/if}
      {#if toolPanelOptions.length}
        <section
          class="input-panel-section mobile-input-panel"
          class:panel-above={mobilePanelPosition === "above"}
          class:panel-below={mobilePanelPosition === "below"}
          aria-label={`${toolPanelMode} mobile input panel section`}
        >
          <div class="mobile-input-panel-header">
            <span>Input · Penpa {toolPanelMode}</span>
            <button type="button" on:click={toggleMobilePanelPosition}>
              Move {mobilePanelPosition === "above" ? (isEmbedded ? "right" : "below") : "above"}
            </button>
          </div>
          {#if layer === "solution" && toolPanelMode === "Sudoku"}
            <div
              class="note-modes mobile-note-modes"
              aria-label="Note input style"
            >
              <button
                type="button"
                class:active={noteMode === "1"}
                on:click={() => chooseNoteMode("1")}
                >Normal <kbd>z</kbd></button
              >
              <button
                type="button"
                class:active={noteMode === "3"}
                on:click={() => chooseNoteMode("3")}
                >Center <kbd>x</kbd></button
              >
              <button
                type="button"
                class:active={noteMode === "2"}
                on:click={() => chooseNoteMode("2")}
                >Corner <kbd>c</kbd></button
              >
            </div>
          {/if}
          <div
            class="tool-input-panel"
            aria-label={`${toolPanelMode} mobile input panel`}
          >
            {#each toolPanelOptions as option, index}
              <button
                type="button"
                class:selected={toolPanelSelected.has(option.value)}
                class:panel-action={Boolean(option.action)}
                on:pointerdown={(event) => useToolPanelOption(event, option)}
              >
                {#if option.sym && option.num !== undefined}
                  <canvas
                    use:renderSymbol={{ sym: option.sym, num: option.num, darkTheme }}
                    class="symbol-canvas"
                  ></canvas>
                {:else}
                  {option.label}
                {/if}
                {#if !option.action && index < 9}<kbd>{index + 1}</kbd>{/if}
              </button>
            {/each}
          </div>
        </section>
      {/if}
    </aside>

    <section class="column board-column" aria-label="Puzzle board">
      <div class="zoom-controls" aria-label="Board zoom">
        <button on:click={() => changeZoom(-0.1)} aria-label="Zoom out"
          >−</button
        >
        <button class="zoom-value" on:click={fitBoard} title="Fit board"
          >{Math.round(zoom * 100)}%</button
        >
        <button on:click={() => changeZoom(0.1)} aria-label="Zoom in">+</button>
      </div>
      <div bind:this={boardHost} class="board-host">
        {#if !initialized}
          <div class="skeleton-board-container" aria-label="Preparing puzzle board">
            <img src="./grid-placeholder.png" alt="Sudoku Grid" class="placeholder-grid-img" />
            <div class="board-loading-overlay">
              <span class="busy-grid-pulse" aria-hidden="true">
                <i></i><i></i><i></i>
                <i></i><i></i><i></i>
                <i></i><i></i><i></i>
              </span>
              <p class="loading">Preparing Penpa board…</p>
            </div>
          </div>
        {/if}
      </div>
      <div
        class="board-busy-overlay"
        aria-live="polite"
        aria-label="Solver running"
      >
        <span class="busy-grid-pulse" aria-hidden="true">
          <i></i><i></i><i></i>
          <i></i><i></i><i></i>
          <i></i><i></i><i></i>
        </span>
        <strong>Solver running…</strong>
        <small>The board is locked until this run finishes.</small>
        <button on:click={() => (window as any).SudokuTools?.stopWork?.()}
          >Stop</button
        >
      </div>
    </section>

    <aside
      class="column actions"
      class:open={mobileActiveTab === "actions"}
      aria-label="Solver and Penpa controls"
    >
      <section bind:this={logHost} class="log-host"></section>

      <section class="penpa-actions">
        <h2>Penpa actions</h2>
        <div class="action-list">
          <div class="action-group">
            <div class="action-dropdown">
              <button
                aria-haspopup="menu"
                aria-expanded={actionMenu === "new-grid"}
                on:click={() => toggleActionMenu("new-grid")}
                ><span>▦</span>New grid <b>⌄</b></button
              >
              {#if actionMenu === "new-grid"}
                <div class="action-menu compact-menu" role="menu">
                  <button role="menuitem" on:click={() => requestNewGrid(6)}
                    >6 × 6</button
                  >
                  <button role="menuitem" on:click={() => requestNewGrid(7)}
                    >7 × 7</button
                  >
                  <button role="menuitem" on:click={() => requestNewGrid(8)}
                    >8 × 8</button
                  >
                  <button role="menuitem" on:click={() => requestNewGrid(9)}
                    >9 × 9</button
                  >
                </div>
              {/if}
            </div>
            <button on:click={requestGenerator}
              ><span>✦</span>Generate</button
            >
            <div class="action-dropdown">
              <button
                aria-haspopup="menu"
                aria-expanded={actionMenu === "transform"}
                on:click={() => toggleActionMenu("transform")}
                ><span>◇</span>Transform <b>⌄</b></button
              >
              {#if actionMenu === "transform"}
                <div class="action-menu transform-menu" role="menu">
                  <button
                    role="menuitem"
                    on:click={() => transform("rt_left")}
                    title="Rotate left">↶</button
                  >
                  <button
                    role="menuitem"
                    on:click={() => transform("rt_right")}
                    title="Rotate right">↷</button
                  >
                  <button
                    role="menuitem"
                    on:click={() => transform("rt_LR")}
                    title="Flip horizontal">↔</button
                  >
                  <button
                    role="menuitem"
                    on:click={() => transform("rt_UD")}
                    title="Flip vertical">↕</button
                  >
                </div>
              {/if}
            </div>
          </div>
          <div class="action-group">
            <div class="action-dropdown">
              <button
                aria-haspopup="menu"
                aria-expanded={actionMenu === "clone"}
                on:click={() => toggleActionMenu("clone")}
                ><span>⧉</span>Clone <b>⌄</b></button
              >
              {#if actionMenu === "clone"}
                <div class="action-menu" role="menu">
                  <button role="menuitem" on:click={() => duplicateUrl(false)}
                    >Clone here</button
                  >
                  <button role="menuitem" on:click={() => duplicateUrl(true)}
                    >Clone to Penpa</button
                  >
                </div>
              {/if}
            </div>
            <button on:click={openScreenshot}><span>▣</span>Screenshot</button>
            <button on:click={openShareModal}><span>↗</span>Share</button>
          </div>
          <div class="action-group">
            <button on:click={openSettingsModal}><span>⚙</span>Settings</button>
            <button on:click={toggleTheme}
              ><span>{darkTheme ? "☀" : "◐"}</span>{darkTheme
                ? "Light"
                : "Dark"}</button
            >
            <button on:click={() => legacyPress("input_url")}
              ><span>⇩</span>Load</button
            >
          </div>
          <div class="action-group final-actions">
            <button on:click={() => legacyClick("sudoku_undo")}
              ><span>↶</span>Undo</button
            >
            <button on:click={clearMarks}
              ><span>↺</span>Clear mark</button
            >
            <button on:click={() => legacyClick("sudoku_redo")}
              ><span>↷</span>Redo</button
            >
          </div>
          <div class="action-group bottom-actions">
            {#if activeVariantHasExample}
              <button on:click={loadExample}><span><i class="fa fa-book" aria-hidden="true"></i></span>Load Example</button>
              {#if import.meta.env.DEV}
                <button on:click={confirmOverwriteExample}><span><i class="fa fa-floppy-o" aria-hidden="true"></i></span>Overwrite Example</button>
              {/if}
            {:else if import.meta.env.DEV}
              <button on:click={saveExample}><span><i class="fa fa-floppy-o" aria-hidden="true"></i></span>Save Example</button>
            {/if}
            <button
              class="info-action"
              title="About this editor"
              aria-label="About this editor"
              on:click={() => (studioModal = "info")}
              ><span>ⓘ</span>About</button
            >
          </div>
        </div>
      </section>
    </aside>
  </main>
</div>

{#if studioModal}
  <div
    class="studio-modal-backdrop"
    role="presentation"
    on:click={closeModalFromBackdrop}
  >
    <div
      class="studio-modal"
      role="dialog"
      aria-modal="true"
      aria-labelledby="studio-modal-title"
      tabindex="-1"
    >
      <button
        class="studio-modal-close"
        aria-label="Close"
        on:click={() => (studioModal = null)}>×</button
      >
      {#if studioModal === "confirm-grid"}
        <h2 id="studio-modal-title">
          Create a new {newGridSize} × {newGridSize} grid?
        </h2>
        <p>
          This replaces the current puzzle, variants, solver state, and undo
          history.
        </p>
        <div class="studio-modal-actions">
          <button on:click={() => (studioModal = null)}>Cancel</button>
          <button on:click={() => createGrid(true)}>Keep variants</button>
          <button class="primary" on:click={() => createGrid(false)}
            >Classic</button
          >
        </div>
      {:else if studioModal === "confirm-generate"}
        <h2 id="studio-modal-title">Generate from existing clues</h2>
        <p>
          {generatorVariants.length == 0
            ? "This will be a Classic Sudoku."
            : generatorVariants.length == 1
              ? "This will be " + generatorVariants.join() + " Sudoku"
              : "This will be " + generatorVariants.join(", ") + " Sudoku"}
        </p>
        <div class="studio-modal-actions">
          <button on:click={() => (studioModal = null)}>Cancel</button>
          <button class="primary" on:click={confirmGenerator}>Generate</button>
        </div>
      {:else if studioModal === "screenshot"}
        <h2 id="studio-modal-title">Screenshot</h2>
        <div class="screenshot-row">
          <label class="modal-field-inline">
            <span>File type</span>
            <select bind:value={screenshotType} class="modal-select">
              <option value="png">PNG</option>
              <option value="jpg">JPEG</option>
              <option value="svg">SVG</option>
            </select>
          </label>
          <label class="modal-field-checkbox">
            <input type="checkbox" bind:checked={screenshotBorder} />
            <span>White border</span>
          </label>
        </div>
        <label for="screenshot-name-input" class="modal-field"
          >Filename<input
            id="screenshot-name-input"
            bind:value={screenshotName}
          /></label
        >
        <div class="download-row">
          <span class="download-label">Download:</span>
          <div class="studio-modal-actions screenshot-actions">
            <button on:click={() => exportScreenshot("problem")}>Problem</button>
            <button on:click={() => exportScreenshot("solution")}>Solution</button>
            <button class="primary" on:click={() => exportScreenshot("both")}>Both</button>
          </div>
        </div>
      {:else if studioModal === "share"}
        <h2 id="studio-modal-title">Share Puzzle</h2>
        <div class="share-row-combined">
          <label class="modal-field-inline">
            <span>Author</span>
            <input
              type="text"
              bind:value={shareAuthor}
              placeholder="Creator name"
              on:input={() => updateSetting('author', shareAuthor)}
              class="modal-input"
              style="width: 120px;"
            />
          </label>
          <label class="modal-field-checkbox">
            <input type="checkbox" bind:checked={autoShorten} id="auto_shorten_chk" />
            <span>Shortened</span>
          </label>
          <label class="modal-field-checkbox">
            <input type="checkbox" bind:checked={verifyUniqueness} id="verify_uniqueness_chk" />
            <span>Uniqueness</span>
          </label>
        </div>

        <div class="studio-modal-actions share-url-buttons" style="justify-content: center; margin-top: 16px;">
          <button on:click={handleShareEdit} disabled={shareLoading}>
            {#if shareLoading}
              <span class="btn-spinner"></span>
            {:else}
              <i class="fa fa-pencil-square-o" aria-hidden="true"></i>
            {/if}
            Editing URL
          </button>
          <button on:click={handleShareSolve} disabled={shareLoading}>
            {#if shareLoading}
              <span class="btn-spinner"></span>
            {:else}
              <i class="fa fa-play-circle" aria-hidden="true"></i>
            {/if}
            Solving URL
          </button>
        </div>

        {#if shareLoading}
          <div class="share-loading-box">
            <div class="busy-grid-pulse" aria-hidden="true">
              <i></i><i></i><i></i>
            </div>
            <span>Generating URL…</span>
          </div>
        {/if}

        {#if showShareUrl}
          <div class="share-url-output" style="margin-top: 14px; {shareLoading ? 'display:none;' : ''}">
            <div id="modal-save-body1">
              <textarea
                id="savetextarea"
                class="modal-textarea"
                readonly
                rows="2"
                style="width: 100%; font-size: 12px;"
                bind:value={shareUrl}
              ></textarea>
            </div>
            <div class="studio-modal-actions" style="margin-top: 8px; justify-content: center;">
              <button on:click={copyShareUrl}
                ><i class="fa fa-copy" aria-hidden="true"></i> Copy</button
              >
              <button on:click={openShareUrl}
                ><i class="fa fa-external-link" aria-hidden="true"></i> Open</button
              >
            </div>
          </div>
        {/if}

      {:else if studioModal === "settings"}
        <h2 id="studio-modal-title">General Settings</h2>

        <div class="settings-section">
          <h3>Puzzle Display</h3>
          <div class="modal-settings-grid">
            <label>
              <span>Default Author</span>
              <input
                type="text"
                value={userSettingsState.author}
                placeholder="Creator name"
                on:input={(e) => updateSetting('author', e.currentTarget.value)}
                class="modal-input"
                style="width: 130px;"
              />
            </label>
            <label>
              <span>Sudoku Pencil Marks</span>
              <select
                id="sudoku_settings_opt"
                value={userSettingsState.sudoku_centre_size}
                on:change={(e) => updateSetting('sudoku_centre_size', e.currentTarget.value)}
                class="modal-select"
              >
                <option value="1">Dynamic</option>
                <option value="2">Large</option>
                <option value="3">Small</option>
              </select>
            </label>
            <label>
              <span>Sudoku Normal</span>
              <select
                id="sudoku_settings_normal_opt"
                value={userSettingsState.sudoku_normal_size}
                on:change={(e) => updateSetting('sudoku_normal_size', e.currentTarget.value)}
                class="modal-select"
              >
                <option value="1">Centered</option>
                <option value="2">Bottom</option>
              </select>
            </label>
          </div>
        </div>

        <div class="settings-section" style="margin-top: 14px;">
          <h3>Generator</h3>
          <div class="modal-settings-grid">
            <label>
              <span>Symmetry</span>
              <select
                id="generator_symmetry_opt"
                value={userSettingsState.generator_symmetry}
                on:change={(e) => updateSetting('generator_symmetry', e.currentTarget.value)}
                class="modal-select"
              >
                <option value="none">None</option>
                <option value="rotational180">180 rotational</option>
                <option value="all_axis">All axis</option>
              </select>
            </label>
            <label>
              <span>Minimal clues</span>
              <input
                type="checkbox"
                id="generator_difficulty_minimal_opt"
                checked={userSettingsState.generator_difficulty_minimal}
                on:change={(e) => updateSetting('generator_difficulty_minimal', e.currentTarget.checked)}
              />
            </label>
            <label>
              <span>Clues on marks</span>
              <input
                type="checkbox"
                id="generator_clues_on_marks_opt"
                checked={userSettingsState.generator_clues_on_marks}
                on:change={(e) => updateSetting('generator_clues_on_marks', e.currentTarget.checked)}
              />
            </label>
          </div>
        </div>

        <div class="settings-section" style="margin-top: 14px;">
          <h3>Initial Grid Settings</h3>
          <div class="modal-settings-grid">
            <label>
              <span>Starting Grid Size</span>
              <select
                id="start_grid_size_opt"
                value={userSettingsState.start_grid_size}
                on:change={(e) => updateSetting('start_grid_size', e.currentTarget.value)}
                class="modal-select"
              >
                <option value="9">9 × 9</option>
                <option value="6">6 × 6</option>
              </select>
            </label>
            <label>
              <span>Generated</span>
              <input
                type="checkbox"
                id="start_generated_opt"
                checked={userSettingsState.start_grid_type === 'generated'}
                on:change={(e) => updateSetting('start_grid_type', e.currentTarget.checked ? 'generated' : 'blank')}
              />
            </label>
          </div>
        </div>

        <div class="settings-section" style="margin-top: 14px;">
          <h3>Saving & Storage</h3>
          <div class="modal-settings-grid">
            <label>
              <span>Local storage saving</span>
              <input
                type="checkbox"
                id="allow_local_storage_chk"
                checked={userSettingsState.local_storage}
                on:change={(e) => updateSetting('local_storage', e.currentTarget.checked)}
              />
            </label>
            <label>
              <span>Auto save history</span>
              <input
                type="checkbox"
                id="auto_save_history_chk"
                checked={userSettingsState.auto_save_history}
                on:change={(e) => updateSetting('auto_save_history', e.currentTarget.checked)}
              />
            </label>
          </div>
        </div>

        <div class="settings-section" style="margin-top: 14px;">
          <h3>App Display</h3>
          <div class="modal-settings-grid">
            <label>
              <span>Reload prevention</span>
              <input
                type="checkbox"
                id="reload_button"
                checked={userSettingsState.reload_button}
                on:change={(e) => updateSetting('reload_button', e.currentTarget.checked ? 1 : 2)}
              />
            </label>
          </div>
        </div>

        <div class="studio-modal-actions" style="margin-top: 20px; justify-content: center;">
          <button class="primary" on:click={() => (studioModal = null)}>Close</button>
        </div>
      {:else}
        <h2 id="studio-modal-title">About Sudotoku</h2>
        <p>
          Sudotoku (Sudoku + Toku (解く = to solve)) is a Sudoku setter and
          solver powered by Penpa+. Feel free to use this to create and share
          your own puzzles!
        </p>
        <div class="info-copy">
          <strong>Credits</strong>
          <p>
            <a
              href="https://swaroopg92.github.io/penpa-edit/"
              target="_blank"
              rel="noreferrer">Penpa+</a
            > for the amazing puzzle editor.
          </p>
          <p>
            <a
              href="https://semiexp.net/apps/sudoku-editor/index.html"
              target="_blank"
              rel="noreferrer">Sudoku Editor Plus</a
            >
            for CSP solver inspiration. This website uses a vibecoded CSP implementation,
            but I hope to learn to integrate
            <a
href="https://github.com/semiexp/cspuz_core"
              target="_blank"
              rel="noreferrer">cspuz_core</a
            > someday.
          </p>
          <p>
            <a
              href="https://logic-puzzles.ropeko.ch/php/db/search.php"
              target="_blank"
              rel="noreferrer">Logic Puzzles</a
            > for the variant database!
          </p>
          <p>Codex for making this ambitious project possible.</p>
          <h2 id="studio-modal-title">Disclaimer</h2>
          <p>
            The solver runs on your device, and it does not collect nor send any
            of your data.
          </p>
          <a href="./list.html" target="_blank" rel="noreferrer"
            >See list of variants ↗</a
          >
          <a
            href="https://github.com/lemononmars/penpa-edit"
            target="_blank"
            rel="noreferrer">View this project on GitHub ↗</a
          >
        </div>
        <div class="studio-modal-actions">
          <button class="primary" on:click={() => (studioModal = null)}
            >Back to setting Sudoku</button
          >
        </div>
      {/if}
    </div>
  </div>
{/if}

<style>
  :global(.svelte-home body) {
    margin: 0;
    min-width: 0;
    background: #eef1f5;
    color: #1d2633;
    font-family:
      Inter,
      ui-sans-serif,
      system-ui,
      -apple-system,
      BlinkMacSystemFont,
      "Segoe UI",
      sans-serif;
  }
  :global(.svelte-home button),
  :global(.svelte-home input),
  :global(.svelte-home select),
  :global(.svelte-home textarea),
  :global(.svelte-home kbd),
  :global(.svelte-home legend),
  :global(.svelte-home label),
  :global(.svelte-home table),
  :global(.svelte-home pre),
  :global(.svelte-home code) {
    font-family: inherit;
  }
  :global(.svelte-home #header),
  :global(.svelte-home #tool-container),
  :global(.svelte-home #bottom_button) {
    display: none !important;
  }
  :global(.svelte-home #app-container) {
    display: contents;
  }
  :global(.svelte-home #svelte-app) {
    min-height: 100vh;
  }
  .studio-shell {
    min-height: 100vh;
    --primary-color: #176fae;
    --primary-color-dark: #0d6099;
    --primary-color-light: #eaf4fb;
    --primary-color-rgb: 23, 111, 174;
  }
  .studio-grid {
    display: grid;
    grid-template-columns: minmax(230px, 290px) minmax(430px, 1fr) minmax(
        250px,
        310px
      );
    gap: 14px;
    padding: 14px;
    box-sizing: border-box;
    min-height: calc(100vh - 64px);
  }
  .column {
    min-width: 0;
  }
  .controls,
  .actions {
    display: flex;
    flex-direction: column;
    gap: 12px;
  }
  section:not(.board-column) {
    padding: 14px;
    border: 1px solid #d4dbe3;
    border-radius: 10px;
    background: #fff;
    box-shadow: 0 2px 8px rgba(23, 34, 49, 0.06);
  }
  h2,
  .control-label {
    display: block;
    margin: 0 0 9px;
    font-size: 12px;
    font-weight: 750;
    text-transform: uppercase;
    letter-spacing: 0.08em;
    color: #536170;
  }
  button {
    font: inherit;
  }
  button {
    cursor: pointer;
  }
  .segmented {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
  }
  .segmented button {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    gap: 5px;
    padding: 4px 6px;
    min-height: 28px;
    border: 1px solid #bfc9d4;
    background: #f7f9fb;
    font-size: 11px;
  }
  .segmented button:first-child {
    border-radius: 6px 0 0 6px;
  }
  .segmented button + button {
    border-left: 0;
  }
  .segmented button:last-child {
    border-radius: 0 6px 6px 0;
  }
  .note-modes {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    margin-top: 6px;
  }
  .note-modes button {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    gap: 4px;
    padding: 3px 4px;
    min-height: 26px;
    height: 26px;
    border: 1px solid #bfc9d4;
    border-right: 0;
    background: #f7f9fb;
    font-size: 11px;
    white-space: nowrap;
  }
  .note-modes button:first-child {
    border-radius: 6px 0 0 6px;
  }
  .note-modes button:last-child {
    border-right: 1px solid #bfc9d4;
    border-radius: 0 6px 6px 0;
  }
  .note-modes kbd {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    min-width: 14px;
    height: 14px;
    padding: 0 3px;
    font-size: 9px;
    font-weight: 700;
    font-family: inherit;
    text-transform: lowercase;
    color: #4a5568;
    background: #edf2f7;
    border: 1px solid #cbd5e0;
    border-bottom-width: 2px;
    border-radius: 3px;
    line-height: 1;
    box-sizing: border-box;
  }
  .note-modes button.active kbd {
    color: #1a202c;
    background: #ffffff;
    border-color: #cbd5e0;
  }
  button.active {
    background: var(--primary-color) !important;
    color: white !important;
    border-color: var(--primary-color) !important;
  }
  .variant-picker {
    position: relative;
    z-index: 20;
  }
  .variant-search-control {
    display: grid;
    grid-template-columns: 1fr 18px;
    align-items: center;
    width: 100%;
    max-width: 100%;
    box-sizing: border-box;
    min-height: 32px;
    padding: 4px 8px;
    border: 1px solid #bfc9d4;
    border-radius: 6px;
    color: #263443;
    background: #fff;
    text-align: left;
  }
  .variant-search-control:focus-within {
    border-color: var(--primary-color);
    box-shadow: 0 0 0 3px rgba(var(--primary-color-rgb), 0.12);
  }
  .variant-search-control input {
    width: 100%;
    min-width: 0;
    padding: 0;
    border: 0;
    outline: 0;
    color: #263443;
    background: transparent;
    font: inherit;
  }
  .variant-search-control:has(input:disabled) {
    background: #f0f2f4;
  }
  .variant-icon {
    display: inline-grid;
    place-items: center;
    width: 20px;
    height: 20px;
    font-family: "Segoe UI Symbol", sans-serif;
    font-size: 15px;
    line-height: 1;
  }
  .variant-chevron {
    color: #73808d;
    text-align: right;
  }
  .variant-menu {
    position: absolute;
    top: calc(100% - 8px);
    right: 0;
    left: 0;
    box-sizing: border-box;
    z-index: 25;
    max-height: min(430px, 65vh);
    padding: 6px;
    border: 1px solid #bdc8d3;
    border-radius: 8px;
    overflow: hidden auto;
    background: #fff;
    box-shadow: 0 12px 30px rgba(23, 34, 49, 0.2);
  }
  .variant-menu-group {
    padding: 7px 8px 4px;
    color: #778390;
    font-size: 10px;
    font-weight: 750;
    letter-spacing: 0.08em;
    text-transform: uppercase;
  }
  .variant-tabs {
    position: sticky;
    top: -6px;
    z-index: 3;
    display: grid;
    grid-template-columns: repeat(4, minmax(0, 1fr));
    gap: 3px;
    margin: -6px -6px 4px;
    padding: 6px;
    border-bottom: 1px solid #dbe2e8;
    background: #fff;
  }
  .variant-menu .variant-tabs button {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    min-height: 32px;
    padding: 3px 2px;
    border: 1px solid #cbd5de;
    border-radius: 4px;
    color: #526271;
    background: #f7f9fb;
    text-align: center;
    font-size: 9px;
    font-weight: 750;
    line-height: 1.1;
  }
  .variant-menu .variant-tabs .tab-icon {
    font-size: 11px;
    line-height: 1;
    margin-bottom: 1px;
  }
  .variant-menu .variant-tabs button.active {
    color: #fff;
    border-color: var(--primary-color);
    background: var(--primary-color);
  }
  .variant-menu button {
    display: grid;
    grid-template-columns: 25px minmax(0, 1fr) auto auto;
    align-items: center;
    width: 100%;
    min-height: 34px;
    padding: 5px 8px;
    border: 0;
    border-radius: 5px;
    color: #263443;
    background: transparent;
    text-align: left;
  }
  .variant-menu button:hover,
  .variant-menu button.current {
    background: var(--primary-color-light);
    color: var(--primary-color-dark);
  }
  .variant-menu > button:disabled {
    color: #94a0a8;
    background: #f3f5f6;
    cursor: not-allowed;
  }
  .input-conflict {
    color: #9b5d2d;
    font-size: 8px;
    font-weight: 750;
    white-space: nowrap;
  }
  .capability-badges {
    display: inline-flex;
    align-items: center;
    justify-content: flex-end;
    gap: 5px;
  }
  .csp-badge {
    color: #16805d;
    font-size: 11px;
  }
  .unsupported-badge {
    padding: 2px 4px;
    border-radius: 4px;
    color: #a33c3c;
    background: #fbe9e9;
    font-size: 8px;
    font-weight: 800;
    letter-spacing: 0.03em;
  }
  .variant-rule-preview {
    position: absolute;
    top: 54px;
    left: calc(100% + 8px);
    z-index: 26;
    pointer-events: none;
    display: grid;
    gap: 3px;
    width: 220px;
    box-sizing: border-box;
    padding: 10px 11px;
    border: 1px solid #bdc8d3;
    border-radius: 7px;
    color: #536170;
    background: #fff;
    box-shadow: 0 10px 28px rgba(23, 34, 49, 0.18);
    font-size: 10px;
    line-height: 1.4;
  }
  .variant-rule-preview strong {
    color: #263443;
    font-size: 11px;
  }
  .legacy-variant-host {
    display: flex;
    flex-direction: column;
    width: 100%;
    min-width: 100%;
    flex: 1 1 100%;
    align-items: stretch;
    gap: 6px;
  }
  :global(.svelte-home .legacy-variant-host .sudoku-variant-tools) {
    display: flex;
    flex-direction: column;
    width: 100%;
    min-width: 100%;
    flex: 1 1 100%;
    align-items: stretch;
    gap: 6px;
    border: 0;
    padding: 0;
  }
  :global(.svelte-home .legacy-variant-host button) {
    min-height: 32px;
  }
  .board-column {
    display: flex;
    justify-content: center;
    align-items: flex-start;
    overflow: auto;
  }
  .board-host {
    width: 100%;
    min-height: 520px;
    display: flex;
    justify-content: center;
    align-items: flex-start;
  }
  :global(.svelte-home .board-host #puzzle-container) {
    width: auto;
    max-width: 100%;
    margin: 0;
    padding: 8px;
    background: white;
    border: 1px solid #d4dbe3;
    border-radius: 10px;
    box-shadow: 0 4px 18px rgba(23, 34, 49, 0.1);
  }
  :global(.svelte-home #dvique.irregular-editing) {
    position: relative;
  }
  :global(.svelte-home .irregular-region-editor) {
    position: absolute;
    inset: 0;
    z-index: 8;
    pointer-events: auto;
  }
  :global(.svelte-home .irregular-region-editor input) {
    position: absolute;
    box-sizing: border-box;
    transform: translate(-50%, -50%);
    margin: 0;
    padding: 0;
    border: 1px solid transparent;
    border-radius: 5px;
    outline: none;
    background: rgba(255, 255, 255, 0.78);
    color: #173f78;
    font-weight: 700;
    line-height: 1;
    text-align: center;
    pointer-events: auto;
  }
  :global(.svelte-home .irregular-region-editor input:hover) {
    border-color: #8aa9ca;
  }
  :global(.svelte-home .irregular-region-editor input:focus) {
    border-color: #176fae;
    background: rgba(232, 243, 255, 0.96);
    box-shadow: 0 0 0 2px rgba(23, 111, 174, 0.2);
  }
  :global(.svelte-home .board-host #puzzleinfo),
  :global(.svelte-home .board-host #contestinfo) {
    display: none;
  }
  .loading {
    margin-top: 80px;
    color: #6d7986;
  }
  .action-list {
    display: grid;
    gap: 6px;
  }
  .action-list button:not([role="menuitem"]) {
    display: flex;
    align-items: center;
    gap: 10px;
    padding: 8px 10px;
    border: 1px solid #c8d1da;
    border-radius: 6px;
    background: #f9fbfc;
    text-align: left;
  }
  .action-list button:not([role="menuitem"]) span {
    width: 22px;
    text-align: center;
    color: var(--primary-color);
    font-size: 17px;
  }
  .log-host {
    padding: 0 !important;
    overflow: hidden;
  }
  :global(.svelte-home .log-host .sudoku-solver-log) {
    width: 100%;
    margin: 0;
    border: 0;
    box-shadow: none;
  }
  @media (max-width: 1050px) {
    .studio-grid {
      grid-template-columns: 240px minmax(400px, 1fr);
    }
    .actions {
      grid-column: 1 / -1;
      display: grid;
      grid-template-columns: repeat(2, minmax(0, 1fr));
    }
    .log-host {
      grid-column: 1 / -1;
    }
  }
  @media (max-width: 760px) {
    .studio-grid {
      grid-template-columns: 1fr;
    }
    .controls,
    .actions {
      display: flex;
      grid-column: auto;
    }
    .board-column {
      order: -1;
    }
  }

  /* Fixed, full-viewport Svelte workspace. */
  :global(html.svelte-home),
  :global(html.svelte-home body) {
    width: 100%;
    height: 100%;
    overflow: hidden;
  }
  :global(.svelte-home #svelte-app),
  .studio-shell {
    width: 100vw;
    height: 100vh;
    min-height: 0;
    overflow: hidden;
  }
  .studio-grid {
    width: 100%;
    height: 100%;
    min-height: 0;
    grid-template-columns: clamp(215px, 20vw, 285px) minmax(0, 1fr) clamp(
        245px,
        22vw,
        315px
      );
    gap: 10px;
    padding: 10px;
    overflow: hidden;
  }
  .column,
  .actions {
    height: 100%;
    min-height: 0;
    overflow: hidden;
  }
  .controls {
    height: 100%;
    min-height: 0;
    overflow: visible;
  }
  .controls,
  .actions {
    display: flex;
    grid-column: auto;
    gap: 6px;
  }
  section:not(.board-column) {
    padding: 11px;
    border-radius: 8px;
    box-shadow: 0 1px 5px rgba(23, 34, 49, 0.06);
  }
  .input-modes-section {
    flex: 0 0 auto;
    min-height: 0;
    overflow: hidden;
  }
  .input-modes-heading {
    display: flex;
    align-items: center;
    gap: 7px;
  }
  .input-modes-heading h2 {
    margin: 0;
  }
  .input-mode-tools {
    display: flex;
    min-width: 0;
  }
  .input-mode-tools .legacy-variant-host {
    flex: 1;
    min-width: 0;
  }
  .mobile-add-variant {
    display: none;
  }
  .input-mode-scroll-hint {
    display: none;
  }
  .tab-key-hint {
    padding: 1px 5px;
    border: 1px solid #aebbc7;
    border-bottom-width: 2px;
    border-radius: 4px;
    color: #536170;
    background: #f8fafc;
    font:
      700 9px/1.5 system-ui,
      sans-serif;
  }
  .hidden-section {
    display: none !important;
  }
  .legacy-modes-section {
    flex: 1;
    min-height: 0;
    display: flex;
    flex-direction: column;
    overflow: hidden auto;
  }
  .tool-help {
    flex: 1;
    min-height: 0;
    display: grid;
    align-content: start;
    gap: 8px;
  }
  .tool-help > div + div {
    display: flex;
    flex: 1;
    min-height: 0;
    flex-direction: column;
    padding-top: 8px;
    border-top: 1px solid #e2e7eb;
  }
  .tool-help .help-label {
    display: block;
    margin-bottom: 5px;
    color: #7b8793;
    font-size: 9px;
    font-weight: 750;
    letter-spacing: 0.08em;
    text-transform: uppercase;
  }
  .tool-help strong {
    display: block;
    margin-bottom: 6px;
    color: #263443;
    font-size: 13px;
  }
  .rule-wiki-link {
    color: inherit;
    text-decoration: underline;
    text-decoration-color: #9db6c8;
    text-underline-offset: 3px;
  }
  .rule-wiki-link:hover {
    color: var(--primary-color);
    text-decoration-color: currentColor;
  }
  .tool-help p {
    margin: 0;
    color: #667482;
    font-size: 11px;
    line-height: 1.5;
  }
  .modes-heading {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 8px;
  }
  .modes-heading h2 {
    margin: 0;
  }
  .modes-heading button {
    min-height: 28px;
    padding: 3px 9px;
    border: 1px solid #bdc8d3;
    border-radius: 5px;
    color: var(--primary-color);
    background: #fff;
    font-size: 10px;
    font-weight: 700;
  }
  .tool-input-panel {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(34px, 1fr));
    gap: 4px;
    margin-top: 8px;
    padding: 6px;
    border: 1px solid #d7dee5;
    border-radius: 7px;
    background: #f8fafc;
  }
  .tool-input-panel button {
    position: relative;
    min-width: 34px;
    min-height: 32px;
    padding: 3px 5px;
    border: 1px solid #bdc8d3;
    border-radius: 5px;
    color: #344353;
    background: #fff;
    font-size: 12px;
    font-weight: 700;
    touch-action: manipulation;
  }
  .tool-input-panel button kbd {
    position: absolute;
    right: 2px;
    bottom: 1px;
    color: currentColor;
    font:
      7px/1 ui-monospace,
      SFMono-Regular,
      Consolas,
      monospace;
    opacity: 0.55;
  }
  .symbol-canvas {
    display: inline-block;
    vertical-align: middle;
    pointer-events: none;
    width: 24px;
    height: 24px;
  }
  .tool-input-panel button:hover,
  .tool-input-panel button.selected {
    color: #fff;
    border-color: var(--primary-color);
    background: var(--primary-color);
  }
  .tool-input-panel button.panel-action {
    color: #8a3b3b;
    font-size: 10px;
  }
  .tool-input-panel button.panel-action:hover {
    color: #fff;
    border-color: #b94b4b;
    background: #b94b4b;
  }
  .input-panel-section {
    flex: 0 0 auto;
    padding: 10px;
    border: 1px solid #d7dee5;
    border-radius: 8px;
    background: #fff;
    box-shadow: 0 1px 5px rgba(23, 34, 49, 0.06);
  }
  .input-panel-section .help-label {
    display: block;
    margin-bottom: 5px;
    color: #536170;
    font-size: 10px;
    font-weight: 750;
    letter-spacing: 0.04em;
    text-transform: uppercase;
  }
  .input-panel-section .tool-input-panel {
    margin-top: 0;
    padding: 0;
    border: 0;
    background: transparent;
  }
  .mobile-input-panel {
    display: none;
  }

  /* Svelte-styled Penpa input modes and per-variant icons. */
  :global(.svelte-home .legacy-variant-host .sudoku-variant-tools) {
    align-content: flex-start;
    gap: 4px;
  }
  :global(.svelte-home .legacy-variant-host button) {
    min-height: 34px !important;
    height: 34px !important;
    padding: 0 10px !important;
    border: 1px solid #bdc8d3 !important;
    border-radius: 6px !important;
    color: #263443 !important;
    background: #f8fafc !important;
    box-shadow: none !important;
    font-size: 12px !important;
    font-weight: 650;
  }
  :global(.svelte-home .legacy-variant-host .sudoku-variant-title) {
    display: inline-flex;
    align-items: center;
    min-height: 34px;
    box-sizing: border-box;
    padding: 0 10px;
    border: 1px solid #bdc8d3;
    border-radius: 6px 0 0 6px;
    color: #263443;
    background: #eef2f6;
    font-size: 12px;
    font-weight: 750;
    white-space: nowrap;
  }
  :global(.svelte-home .legacy-variant-host button:hover) {
    border-color: var(--primary-color) !important;
    background: #eef7fd !important;
  }
  :global(.svelte-home .legacy-variant-host button.active) {
    color: #fff !important;
    border-color: var(--primary-color) !important;
    background: var(--primary-color) !important;
  }
  :global(.svelte-home .sudoku-variant-group) {
    --variant-icon: "◇";
    display: flex !important;
    flex-direction: column !important;
    width: 100% !important;
    margin-bottom: 3px !important;
    border: 1px solid #cbd5e1 !important;
    border-radius: 4px !important;
    background: #f8fafc !important;
    overflow: hidden !important;
    gap: 0 !important;
  }
  :global(.svelte-home .sudoku-variant-header) {
    display: flex !important;
    align-items: center !important;
    justify-content: flex-start !important;
    gap: 5px !important;
    padding: 3px 6px !important;
    font-size: 11px !important;
    font-weight: 650 !important;
    color: inherit !important;
    background: #e2e8f0 !important;
    cursor: pointer !important;
    user-select: none !important;
    min-height: 22px !important;
  }
  :global(.svelte-home .variant-accordion-chevron) {
    font-size: 9px !important;
    color: #64748b !important;
    width: 10px !important;
    display: inline-block !important;
    flex-shrink: 0 !important;
  }
  :global(.svelte-home .variant-accordion-icon) {
    font-size: 11px !important;
    color: var(--primary-color) !important;
    display: inline-block !important;
    flex-shrink: 0 !important;
  }
  :global(.svelte-home .sudoku-variant-title) {
    display: inline-flex !important;
    align-items: center !important;
    font-size: 11px !important;
    font-weight: 700 !important;
    color: inherit !important;
    border: 0 !important;
    background: transparent !important;
    padding: 0 !important;
    margin: 0 !important;
    line-height: 1.2 !important;
  }
  :global(.svelte-home .sudoku-variant-close) {
    margin-left: auto !important;
    font-size: 11px !important;
    font-weight: 400 !important;
    color: #64748b !important;
    background: transparent !important;
    border: 0 !important;
    padding: 0 3px !important;
    cursor: pointer !important;
    opacity: 0.65 !important;
    line-height: 1 !important;
    min-width: 0 !important;
    height: auto !important;
    flex-shrink: 0 !important;
  }
  :global(.svelte-home .sudoku-variant-close:hover) {
    opacity: 1 !important;
    color: #ef4444 !important;
    background: transparent !important;
  }
  :global(.svelte-home .sudoku-variant-row) {
    display: flex !important;
    align-items: center !important;
    flex-wrap: wrap !important;
    gap: 3px !important;
    padding: 3px 6px !important;
    border-top: 1px solid #cbd5e1 !important;
    background: #ffffff !important;
  }
  :global(.svelte-home .sudoku-variant-row button) {
    min-height: 20px !important;
    height: 20px !important;
    padding: 1px 6px !important;
    font-size: 10px !important;
    line-height: 1.2 !important;
    border-radius: 3px !important;
  }
  :global(.svelte-home .sudoku-variant-rule) {
    padding: 4px 8px !important;
    font-size: 10px !important;
    line-height: 1.35 !important;
    color: #334155 !important;
    background: #f1f5f9 !important;
    border-top: 1px solid #cbd5e1 !important;
  }
  :global(.svelte-home .sudoku-variant-rule .variant-rule-text) {
    margin: 0 !important;
    color: inherit !important;
  }
  :global(.studio-shell.dark .sudoku-variant-group) {
    border-color: #334155 !important;
    background: #1e293b !important;
  }
  :global(.studio-shell.dark .sudoku-variant-header) {
    color: #f8fafc !important;
    background: #0f172a !important;
  }
  :global(.studio-shell.dark .variant-accordion-chevron) {
    color: #94a3b8 !important;
  }
  :global(.studio-shell.dark .sudoku-variant-close) {
    color: #94a3b8 !important;
  }
  :global(.studio-shell.dark .sudoku-variant-close:hover) {
    color: #f87171 !important;
  }
  :global(.studio-shell.dark .sudoku-variant-row) {
    border-top-color: #334155 !important;
    background: #1e293b !important;
  }
  :global(.studio-shell.dark .sudoku-variant-rule) {
    color: #cbd5e1 !important;
    background: #0f172a !important;
    border-top-color: #334155 !important;
  }
  :global(.studio-shell.dark .sudoku-variant-rule .variant-rule-text) {
    color: #cbd5e1 !important;
  }
  :global(.svelte-home .sudoku-variant-group[data-variant="odd even"]) {
    --variant-icon: "◐";
  }
  :global(.svelte-home .sudoku-variant-group[data-variant="diagonal"]) {
    --variant-icon: "╳";
  }
  :global(.svelte-home .sudoku-variant-group[data-variant="anti diagonal"]) {
    --variant-icon: "⨯";
  }
  :global(.svelte-home .sudoku-variant-group[data-variant="anti king"]) {
    --variant-icon: "♔";
  }
  :global(.svelte-home .sudoku-variant-group[data-variant="anti knight"]) {
    --variant-icon: "♞";
  }
  :global(.svelte-home .sudoku-variant-group[data-variant="non consecutive"]) {
    --variant-icon: "↮";
  }
  :global(.svelte-home .sudoku-variant-group[data-variant="arrow"]) {
    --variant-icon: "➜";
  }
  :global(.svelte-home .sudoku-variant-group[data-variant="thermo"]) {
    --variant-icon: "♨";
  }
  :global(.svelte-home .sudoku-variant-group[data-variant="killer"]) {
    --variant-icon: "Σ";
  }
  :global(.svelte-home .sudoku-variant-group[data-variant="kropki"]) {
    --variant-icon: "●";
  }
  :global(.svelte-home .sudoku-variant-group[data-variant="doublekropki"]) {
    --variant-icon: "♦";
  }
  :global(.svelte-home .sudoku-variant-group[data-variant="palindrome"]) {
    --variant-icon: "↔";
  }
  :global(.svelte-home .sudoku-variant-group[data-variant="xv"]) {
    --variant-icon: "Ⅹ";
  }
  :global(.svelte-home .sudoku-variant-group[data-variant="battenburg"]) {
    --variant-icon: "▦";
  }
  :global(.svelte-home .sudoku-variant-group[data-variant="skyscraper"]) {
    --variant-icon: "▥";
  }
  :global(.svelte-home .sudoku-variant-group[data-variant="sandwich"]) {
    --variant-icon: "☰";
  }

  :global(.svelte-home .sudoku-variant-tools > .sudoku-variant-mode::before) {
    content: "9";
    display: inline-grid;
    place-items: center;
    width: 17px;
    height: 17px;
    margin-right: 6px;
    border: 1px solid currentColor;
    border-radius: 3px;
    font-size: 10px;
  }
  :global(.svelte-home .legacy-variant-host .sudoku-variant-close) {
    padding: 0 3px !important;
    color: #73808d !important;
  }
  :global(.svelte-home .sudoku-variant-group > button) {
    margin: 0 !important;
    border-left-width: 0 !important;
    border-radius: 0 !important;
  }
  :global(.svelte-home .sudoku-variant-group > button:first-child) {
    border-radius: 0 !important;
  }
  :global(.svelte-home .sudoku-variant-group > button:last-child) {
    border-radius: 0 6px 6px 0 !important;
  }
  :global(.svelte-home .sudoku-kropki-negative),
  :global(.svelte-home .sudoku-doublekropki-negative),
  :global(.svelte-home .sudoku-xv-negative),
  :global(.svelte-home .sudoku-battenburg-negative) {
    padding: 0 8px !important;
    font-size: 10px !important;
  }

  /* Board is maximized and visually zoomed only inside its own column. */
  .board-column {
    position: relative;
    order: initial;
    align-items: stretch;
    overflow: hidden;
    border: 1px solid #d4dbe3;
    border-radius: 9px;
    background: #fff;
  }
  .board-host {
    width: 100%;
    height: 100%;
    min-height: 0;
    align-items: center;
    overflow: hidden;
  }
  :global(.svelte-home .board-host #puzzle-container) {
    flex: 0 0 auto;
    max-width: none;
    padding: 0;
    border: 0;
    border-radius: 0;
    box-shadow: none;
    transform-origin: center center;
    transition: transform 0.12s ease-out;
  }
  .zoom-controls {
    display: none !important;
  }
  .zoom-controls button {
    height: 32px;
    padding: 0;
    border: 0;
    border-right: 1px solid #d4dbe3;
    background: transparent;
    color: #263443;
    font-weight: 700;
  }
  .zoom-controls button:last-child {
    border-right: 0;
  }
  .zoom-controls .zoom-value {
    font-size: 11px;
    font-weight: 650;
  }

  /* Right column: solver log first, followed by grouped Penpa actions. */
  .log-host {
    order: -1;
    flex: 0 0 196px;
    min-height: 0;
  }
  :global(.svelte-home .log-host .sudoku-solver-log) {
    height: 100%;
    box-sizing: border-box;
    padding: 0;
    border: 1px solid #d4dbe3;
    border-radius: 8px;
    overflow: hidden;
    color: #263443;
    background: #fff;
  }
  :global(.svelte-home .log-host .sudoku-solver-log-header) {
    display: flex !important;
    align-items: center !important;
    justify-content: flex-start !important;
    gap: 6px !important;
    min-height: 48px;
    box-sizing: border-box;
    margin: 0;
    padding: 6px 10px;
    color: #263443;
    background: #f4f7f9;
    border-bottom: 1px solid #d9e0e6;
  }
  :global(.svelte-home .log-host #sudoku_auto_solver),
  :global(.svelte-home .log-host #sudoku_solve_once),
  :global(.svelte-home .log-host #sudoku_solve_clear) {
    display: inline-flex !important;
    flex-direction: column !important;
    align-items: center !important;
    justify-content: center !important;
    width: 58px !important;
    min-width: 58px !important;
    max-width: 58px !important;
    height: 40px !important;
    margin: 0 !important;
    padding: 3px 2px !important;
    border: 1px solid #bfcad4;
    border-radius: 6px;
    color: var(--primary-color);
    background: #fff;
    font-size: 10px;
    font-weight: 700;
    line-height: 1.1;
  }
  :global(.svelte-home .log-host #sudoku_auto_solver i),
  :global(.svelte-home .log-host #sudoku_solve_once i),
  :global(.svelte-home .log-host #sudoku_solve_clear i) {
    font-size: 13px;
    margin-bottom: 2px;
  }
  :global(.svelte-home .log-host #sudoku_auto_solver.active) {
    color: #fff;
    border-color: var(--primary-color);
    background: var(--primary-color);
  }
  :global(.svelte-home #sudoku-solver-status) {
    display: inline-flex;
    align-items: center;
    gap: 7px;
    color: #65727f;
    font-size: 11px;
    font-weight: 650;
  }
  :global(.svelte-home .log-host #sudoku-solver-status) {
    margin-left: auto !important;
    justify-self: end !important;
  }
  :global(.svelte-home #sudoku-solver-status::before) {
    content: "";
    width: 8px;
    height: 8px;
    border-radius: 50%;
    background: #7f8c98;
    box-shadow: 0 0 0 3px rgba(127, 140, 152, 0.13);
  }
  :global(.svelte-home body.sudoku-solver-mode #sudoku-solver-status::before) {
    background: #48c78e;
    box-shadow: 0 0 0 3px rgba(72, 199, 142, 0.16);
  }
  :global(.svelte-home .log-host progress) {
    width: calc(100% - 20px);
    height: 6px;
    margin: 8px 10px 0;
    accent-color: #42a5e8;
  }
  :global(.svelte-home .log-host #sudoku-solver-log-output) {
    box-sizing: border-box !important;
    height: 110px !important;
    max-height: 110px !important;
    margin: 6px 8px 8px !important;
    padding: 6px 8px !important;
    overflow-y: auto !important;
    line-height: 1.4 !important;
    white-space: pre-wrap !important;
    color: #435160 !important;
    background: #fff !important;
    border: 1px solid #e0e5ea !important;
    border-radius: 5px !important;
    font-size: 11px !important;
  }
  :global(body.sudoku-solver-running) .board-host #puzzle-container {
    pointer-events: none;
    cursor: progress;
  }
  .board-busy-overlay {
    position: absolute;
    inset: 0;
    z-index: 10;
    display: none;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 8px;
    pointer-events: all;
    color: #263443;
    background: rgba(247, 250, 252, 0.82);
    backdrop-filter: blur(3px);
    cursor: progress;
  }
  :global(body.sudoku-solver-running) .board-busy-overlay {
    display: flex;
  }
  .board-busy-overlay small {
    color: #65727f;
    font-size: 11px;
  }
  .board-busy-overlay button {
    min-width: 96px;
    min-height: 34px;
    margin-top: 4px;
    border: 1px solid var(--primary-color);
    border-radius: 6px;
    color: #fff;
    background: var(--primary-color);
    font-weight: 700;
  }
  .busy-grid-pulse {
    display: grid;
    grid-template-columns: repeat(3, 10px);
    grid-template-rows: repeat(3, 10px);
    gap: 4px;
    justify-content: center;
    align-items: center;
    margin: 0 auto 6px;
  }
  .busy-grid-pulse i {
    width: 10px;
    height: 10px;
    border-radius: 50%;
    background: var(--primary-color, #2563eb);
    animation: pulse3x3 1.2s infinite ease-in-out;
  }
  .busy-grid-pulse i:nth-child(1) { animation-delay: 0s; }
  .busy-grid-pulse i:nth-child(2) { animation-delay: 0.1s; }
  .busy-grid-pulse i:nth-child(3) { animation-delay: 0.2s; }
  .busy-grid-pulse i:nth-child(4) { animation-delay: 0.1s; }
  .busy-grid-pulse i:nth-child(5) { animation-delay: 0.2s; }
  .busy-grid-pulse i:nth-child(6) { animation-delay: 0.3s; }
  .busy-grid-pulse i:nth-child(7) { animation-delay: 0.2s; }
  .busy-grid-pulse i:nth-child(8) { animation-delay: 0.3s; }
  .busy-grid-pulse i:nth-child(9) { animation-delay: 0.4s; }

  @keyframes pulse3x3 {
    0%, 100% { transform: scale(0.4); opacity: 0.3; }
    50% { transform: scale(1.1); opacity: 1; }
  }

  .skeleton-board-container {
    position: relative;
    display: flex;
    align-items: center;
    justify-content: center;
    width: min(340px, 85vw);
    height: min(340px, 85vw);
    margin: auto;
    border-radius: 8px;
    overflow: hidden;
  }
  .placeholder-grid-img {
    width: 100%;
    height: 100%;
    object-fit: contain;
    display: block;
    border-radius: 6px;
    background: #ffffff;
  }
  :global(html.dark) .placeholder-grid-img {
    filter: invert(0.92) hue-rotate(180deg);
  }
  .board-loading-overlay {
    position: absolute;
    inset: 0;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 12px;
    background: rgba(255, 255, 255, 0.72);
    backdrop-filter: blur(4px);
    z-index: 2;
  }
  :global(html.dark) .board-loading-overlay {
    background: rgba(18, 26, 36, 0.76);
  }
  .board-loading-overlay .loading {
    margin: 0;
    font-size: 13px;
    font-weight: 600;
    color: #1e293b;
  }
  :global(html.dark) .board-loading-overlay .loading {
    color: #e2e8f0;
  }
  .penpa-actions {
    flex: 1;
    min-height: 0;
    overflow: visible;
  }
  .action-list {
    display: grid;
    gap: 6px;
  }
  .action-group {
    display: grid;
    grid-template-columns: repeat(3, minmax(0, 1fr));
    gap: 4px;
    padding-bottom: 6px;
    border-bottom: 1px solid #e2e7eb;
  }
  .action-group:last-child {
    padding-bottom: 0;
    border-bottom: 0;
  }
  .action-dropdown {
    position: relative;
    min-width: 0;
  }
  .action-dropdown > button {
    width: 100%;
  }
  .action-dropdown > button b {
    margin-left: auto;
    color: #71808d;
    font-size: 10px;
  }
  .action-menu {
    position: absolute;
    top: calc(100% + 5px);
    left: 0;
    z-index: 40;
    display: grid;
    width: max(150px, 100%);
    padding: 5px;
    border: 1px solid #bdc8d3;
    border-radius: 7px;
    background: #fff;
    box-shadow: 0 10px 28px rgba(23, 34, 49, 0.2);
  }
  .action-menu button {
    width: 100%;
    min-height: 32px;
    padding: 6px 8px;
    border: 0;
    background: transparent;
    text-align: left;
    white-space: nowrap;
  }
  .action-menu button:hover {
    color: var(--primary-color-dark);
    background: var(--primary-color-light);
  }
  .action-list button:not([role="menuitem"]) {
    min-width: 0;
    min-height: 38px;
    gap: 6px;
    padding: 6px 7px;
    overflow: hidden;
    font-size: 11px;
    white-space: nowrap;
  }
  .action-list button:not([role="menuitem"]) span {
    width: 17px;
    flex: 0 0 17px;
  }
  .bottom-actions {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
  .info-copy {
    display: grid;
    gap: 6px;
  }
  .info-copy strong {
    color: var(--about-foreground, #263443);
    font-size: 12px;
  }
  .info-copy p {
    margin: 0 0 8px;
  }
  .info-copy a {
    color: var(--about-link, #176fae);
    font-weight: 700;
    text-decoration: none;
  }

  /* Existing Penpa modal content, presented as a Svelte-themed dialog. */
  :global(.svelte-home .modal),
  :global(.svelte-home #modal-image),
  :global(.svelte-home #modal-bg-image),
  :global(.svelte-home #modal-save),
  :global(.svelte-home #modal-newsize),
  :global(.svelte-home #modal-input),
  :global(.svelte-home #modal-load),
  :global(.svelte-home #modal-keys),
  :global(.svelte-home #modal-save2),
  :global(.svelte-home #modal-save-tag),
  :global(.svelte-home #modal-replay) {
    z-index: 1000;
    overflow: hidden;
    background: rgba(15, 24, 35, 0.62);
    backdrop-filter: blur(5px);
  }
  :global(.svelte-home .modal-content),
  :global(.svelte-home #modal-image-content),
  :global(.svelte-home #modal-save-content),
  :global(.svelte-home #modal-save2-content),
  :global(.svelte-home #modal-replay-content),
  :global(.svelte-home #modal-input-content),
  :global(.svelte-home #modal-load-content),
  :global(.svelte-home #modal-save-tag-content) {
    top: 50%;
    transform: translateY(-50%);
    box-sizing: border-box;
    max-width: min(720px, calc(100vw - 40px));
    max-height: calc(100vh - 40px);
    margin: 0 auto;
    padding: 50px 22px 20px;
    border: 1px solid #cbd5df;
    border-radius: 12px;
    overflow: hidden auto;
    color: #1d2633;
    background: #fff;
    box-shadow: 0 24px 70px rgba(0, 0, 0, 0.3);
  }
  :global(.svelte-home .modal-header) {
    height: 40px;
    line-height: 40px;
    border-radius: 11px 11px 0 0;
    color: #fff;
    background: #172231;
    font-size: 15px;
    font-weight: 700;
  }
  :global(.svelte-home .modal-content button),
  :global(.svelte-home .modal-content input[type="button"]),
  :global(.svelte-home .modal .nb_button input[type="button"]),
  :global(.svelte-home .modal .nb_button button) {
    min-height: 34px;
    padding: 7px 12px;
    border: 1px solid #bfcad4;
    border-radius: 6px;
    color: #263443;
    background: #f7f9fb;
  }
  :global(.svelte-home .modal .nb_button input[type="button"]:hover),
  :global(.svelte-home .modal .nb_button button:hover) {
    border-color: var(--primary-color);
    color: var(--primary-color-dark);
    background: var(--primary-color-light);
  }
  :global(.svelte-home .modal input[type="text"]),
  :global(.svelte-home .modal input[type="number"]),
  :global(.svelte-home .modal textarea),
  :global(.svelte-home .modal select) {
    box-sizing: border-box;
    max-width: 100%;
    padding: 8px 10px;
    border: 1px solid #bdc8d3;
    border-radius: 6px;
    color: #263443;
    background: #fbfcfd;
  }
  :global(.svelte-home .modal input:focus),
  :global(.svelte-home .modal textarea:focus),
  :global(.svelte-home .modal select:focus) {
    border-color: var(--primary-color);
    outline: 3px solid rgba(var(--primary-color-rgb), 0.13);
  }
  :global(.svelte-home .modal-subheader) {
    padding: 7px 9px;
    border-radius: 5px;
    color: #25425a;
    background: #edf3f7;
  }

  /* Focused Svelte dialogs and matching Penpa confirmation styling. */
  .studio-modal-backdrop {
    --modal-primary-background: #176fae;
    --modal-primary-foreground: #ffffff;
    --about-background: #ffffff;
    --about-foreground: #1d2633;
    --about-muted: #64717e;
    --about-link: #176fae;
    position: fixed;
    inset: 0;
    z-index: 1200;
    display: grid;
    place-items: center;
    padding: 20px;
    background: rgba(15, 24, 35, 0.62);
    backdrop-filter: blur(5px);
  }
  .legacy-controls-host {
    display: grid;
    gap: 6px;
    margin-top: 6px;
  }
  .slot-column-controls {
    display: grid;
    grid-template-columns: repeat(3, minmax(0, 1fr));
    gap: 5px;
    margin-top: 8px;
  }
  .slot-column-controls label {
    display: flex;
    align-items: center;
    gap: 5px;
    min-height: 28px;
    padding: 3px 6px;
    border: 1px solid #bdc8d3;
    border-radius: 5px;
    background: #fff;
    font-size: 10px;
    font-weight: 700;
  }
  :global(.svelte-home .legacy-controls-host #legacy_mode_controls),
  :global(.svelte-home .legacy-controls-host #submode_button),
  :global(.svelte-home .legacy-controls-host #stylemode_button) {
    display: block !important;
    padding: 6px;
    border: 1px solid #d7dee5;
    border-radius: 7px;
    color: #263443;
    background: #f8fafc;
    line-height: 2.1;
  }
  :global(.svelte-home .legacy-controls-host #tab_selection) {
    display: none !important;
  }
  :global(.svelte-home .legacy-controls-host .label_mode) {
    color: #536170;
    font-weight: 750;
  }
  :global(.svelte-home .legacy-controls-host input[type="radio"]) {
    display: none !important;
  }
  :global(.svelte-home .legacy-controls-host input[type="radio"] + label) {
    display: inline-flex;
    min-height: 28px;
    box-sizing: border-box;
    align-items: center;
    margin: 1px;
    padding: 3px 8px;
    border: 1px solid #bdc8d3;
    border-radius: 5px;
    color: #344353;
    background: #fff;
    cursor: pointer;
    font-size: 10px;
    line-height: 1.2;
  }
  :global(
      .svelte-home .legacy-controls-host input[type="radio"]:checked + label
    ) {
    color: #fff;
    border-color: var(--primary-color);
    background: var(--primary-color);
  }
  :global(
      .svelte-home
        .legacy-controls-host
        input[type="radio"]:focus-visible
        + label
    ) {
    outline: 3px solid rgba(var(--primary-color-rgb), 0.18);
  }
  :global(.svelte-home .legacy-controls-host #mode_symbol .nav),
  :global(.svelte-home .legacy-controls-host #mode_combi .nav) {
    display: flex;
    flex-wrap: wrap;
    gap: 4px;
    width: auto;
    height: auto;
    margin: 2px 0;
    padding: 0;
    line-height: 1.2;
  }
  :global(.svelte-home .legacy-controls-host #mode_symbol .nav > li),
  :global(.svelte-home .legacy-controls-host #mode_combi .nav > li) {
    position: relative;
    width: auto;
    height: auto;
    margin: 0;
  }
  :global(.svelte-home .legacy-controls-host #mode_symbol .nav li > span),
  :global(.svelte-home .legacy-controls-host #mode_combi .nav li > span) {
    display: inline-flex;
    box-sizing: border-box;
    min-height: 28px;
    align-items: center;
    padding: 3px 8px;
    border: 1px solid #bdc8d3;
    border-radius: 5px;
    color: #344353;
    background: #fff;
    font-size: 10px;
    line-height: 1.2;
  }
  :global(.svelte-home .legacy-controls-host #mode_symbol .nav li ul),
  :global(.svelte-home .legacy-controls-host #mode_combi .nav li ul) {
    top: 100%;
    left: 0;
    z-index: 80;
    padding: 4px;
    border: 1px solid #bdc8d3;
    border-radius: 6px;
    background: #f8fafc;
    box-shadow: 0 7px 18px rgba(23, 34, 49, 0.18);
  }
  :global(.svelte-home .legacy-controls-host #mode_symbol .nav > li > ul),
  :global(.svelte-home .legacy-controls-host #mode_combi .nav > li > ul) {
    margin-top: 1px;
  }
  :global(
      .svelte-home .legacy-controls-host #mode_symbol .nav > li > ul li > ul
    ),
  :global(
      .svelte-home .legacy-controls-host #mode_combi .nav > li > ul li > ul
    ) {
    top: 0;
    left: calc(100% + 2px);
    margin: 0;
  }
  :global(
      .svelte-home .legacy-controls-host #mode_symbol .nav li ul li ul::before
    ),
  :global(
      .svelte-home .legacy-controls-host #mode_combi .nav li ul li ul::before
    ) {
    display: none;
  }
  .modal-settings-grid {
    display: grid;
    grid-template-columns: 1fr auto;
    align-items: center;
    row-gap: 8px;
    column-gap: 12px;
  }
  .modal-settings-grid label {
    display: contents;
  }
  .modal-settings-grid span {
    font-size: 13px;
    font-weight: 600;
  }
  .modal-input,
  .modal-textarea {
    box-sizing: border-box;
    padding: 5px 8px;
    border: 1px solid #bdc8d3;
    border-radius: 6px;
    background: #fff;
    color: inherit;
    font: inherit;
    outline: none;
  }
  .modal-input:focus,
  .modal-textarea:focus {
    border-color: var(--primary-color);
    box-shadow: 0 0 0 3px rgba(var(--primary-color-rgb), 0.12);
  }
  :global(html.dark) .modal-input,
  :global(html.dark) .modal-textarea {
    background: #1e2d3a;
    border-color: #3c4f60;
    color: #c8d6e0;
  }
  .share-row-combined {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    justify-content: center;
    gap: 12px;
    margin-top: 10px;
  }
  .share-loading-box {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 10px;
    margin-top: 14px;
    padding: 12px;
    border-radius: 6px;
    background: rgba(23, 111, 174, 0.08);
    color: var(--primary-color, #176fae);
    font-size: 13px;
    font-weight: 600;
  }
  .btn-spinner {
    display: inline-block;
    width: 12px;
    height: 12px;
    border: 2px solid currentColor;
    border-right-color: transparent;
    border-radius: 50%;
    animation: btn-spin 0.6s linear infinite;
  }
  @keyframes btn-spin {
    to { transform: rotate(360deg); }
  }
  .share-url-buttons {
    margin-top: 12px;
    justify-content: flex-start;
  }
  .settings-section h3 {
    margin: 10px 0 6px;
    font-size: 11px;
    font-weight: 750;
    letter-spacing: 0.06em;
    text-transform: uppercase;
    color: #536170;
    border-bottom: 1px solid #e0e8ef;
    padding-bottom: 4px;
  }
  :global(html.dark) .settings-section h3 {
    color: #7fa0b8;
    border-bottom-color: #3c4f60;
  }
  .studio-modal {
    position: relative;
    box-sizing: border-box;
    width: min(390px, calc(100vw - 32px));
    padding: 20px;
    border: 1px solid #cbd5df;
    border-radius: 12px;
    color: var(--about-foreground);
    background: var(--about-background);
    box-shadow: 0 24px 70px rgba(0, 0, 0, 0.3);
  }
  .studio-modal h2 {
    margin: 0 34px 6px 0;
    color: var(--about-foreground);
    font-size: 19px;
    letter-spacing: 0;
    text-transform: none;
  }
  .studio-modal p {
    margin: 0 0 18px;
    color: var(--about-muted);
    font-size: 13px;
  }
  .studio-modal-close {
    position: absolute;
    top: 12px;
    right: 12px;
    width: 32px;
    height: 32px;
    border: 0;
    border-radius: 6px;
    color: var(--about-muted);
    background: transparent;
    font-size: 22px;
  }
  .modal-field {
    display: grid;
    gap: 7px;
    margin-top: 14px;
    color: #536170;
    font-size: 12px;
    font-weight: 700;
  }
  .modal-field input {
    box-sizing: border-box;
    width: 100%;
    padding: 9px 10px;
    border: 1px solid #bdc8d3;
    border-radius: 6px;
    color: #263443;
    background: #fff;
  }
  .choice-group {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
  }
  .choice-group.three {
    grid-template-columns: repeat(3, 1fr);
  }
  .choice-group button {
    min-height: 36px;
    border: 1px solid #bdc8d3;
    border-right: 0;
    background: #f7f9fb;
  }
  .choice-group button:first-child {
    border-radius: 6px 0 0 6px;
  }
  .choice-group button:last-child {
    border-right: 1px solid #bdc8d3;
    border-radius: 0 6px 6px 0;
  }
  .screenshot-row {
    display: flex;
    align-items: center;
    gap: 20px;
    margin-bottom: 14px;
  }
  .modal-field-inline {
    display: flex;
    align-items: center;
    gap: 8px;
    font-size: 13px;
    font-weight: 600;
  }
  .modal-field-checkbox {
    display: flex;
    align-items: center;
    gap: 6px;
    font-size: 13px;
    font-weight: 600;
    cursor: pointer;
  }
  .modal-select {
    padding: 6px 10px;
    border: 1px solid #bdc8d3;
    border-radius: 6px;
    background: #fff;
    color: inherit;
    font: inherit;
  }
  .download-row {
    display: flex;
    align-items: center;
    gap: 12px;
    margin-top: 16px;
  }
  .download-label {
    font-size: 13px;
    font-weight: 600;
    white-space: nowrap;
  }
  .download-row .studio-modal-actions {
    margin-top: 0;
    width: 100%;
  }
  :global(html.dark) .modal-select {
    background: #1e2d3a;
    border-color: #3c4f60;
    color: #c8d6e0;
  }
  .studio-modal-actions {
    display: flex;
    justify-content: flex-end;
    gap: 8px;
    margin-top: 20px;
  }
  .studio-modal-actions.screenshot-actions {
    flex-wrap: wrap;
  }
  .studio-modal-actions.screenshot-actions button {
    flex: 1 1 125px;
  }
  .studio-modal-actions button {
    min-width: 90px;
    min-height: 36px;
    padding: 7px 14px;
    border: 1px solid #bdc8d3;
    border-radius: 6px;
    background: #f7f9fb;
  }
  .studio-modal-actions button.primary {
    color: var(--modal-primary-foreground);
    border-color: var(--modal-primary-background);
    background: var(--modal-primary-background);
  }
  :global(html.dark) .studio-modal-backdrop {
    --modal-primary-background: #125f91;
    --modal-primary-foreground: #ffffff;
    --about-background: #263340;
    --about-foreground: #dde6ed;
    --about-muted: #aebdca;
    --about-link: #42a5e8;
  }
  :global(html.dark) .studio-modal-actions button:not(.primary) {
    color: var(--about-foreground);
    border-color: #536473;
    background: #32414f;
  }
  :global(.svelte-home .swal2-container) {
    z-index: 1300;
    background: rgba(15, 24, 35, 0.62);
    backdrop-filter: blur(5px);
  }
  :global(.svelte-home .swal2-popup) {
    border: 1px solid #cbd5df;
    border-radius: 12px;
    box-shadow: 0 24px 70px rgba(0, 0, 0, 0.3);
  }
  :global(.svelte-home .swal2-title) {
    color: #172231;
    font-size: 20px;
  }
  :global(.svelte-home .swal2-confirm),
  :global(.svelte-home .swal2-cancel) {
    min-height: 36px;
    border-radius: 6px !important;
  }

  /* Native Penpa keypad remains a user-invoked floating panel. */
  :global(.svelte-home #float-key) {
    z-index: 1150;
    box-sizing: border-box;
    border: 1px solid #bdc8d3;
    border-radius: 8px;
    overflow: hidden;
    background: #fff;
    box-shadow: 0 16px 40px rgba(23, 34, 49, 0.25);
  }
  :global(.svelte-home #float-key-header) {
    box-sizing: border-box;
    height: 36px;
    border-radius: 0;
    color: #263443;
    background: #edf3f7;
    cursor: move;
  }
  :global(.svelte-home #float-key-header h4) {
    margin: 0;
    line-height: 36px;
    font-size: 12px;
  }
  :global(.svelte-home #float-key-body) {
    padding: 8px;
    background: #fff;
  }
  :global(.svelte-home #float-key-menu li),
  :global(.svelte-home #float-key-select li) {
    border-radius: 5px;
    color: #263443;
    background: #f3f6f8;
  }
  :global(.svelte-home #float-canvas) {
    border-radius: 7px;
  }

  .studio-shell.dark {
    background: #17202a;
  }
  .studio-shell.dark section:not(.board-column) {
    color: #dde6ed;
    border-color: #40505f;
    background: #263340;
  }
  .studio-shell.dark .board-column,
  .studio-shell.dark .board-host {
    border-color: #40505f;
    background: #1b2630;
  }
  .studio-shell.dark .board-busy-overlay {
    color: #eef4f8;
    background: rgba(27, 38, 48, 0.86);
  }
  .studio-shell.dark .board-busy-overlay small {
    color: #b8c5cf;
  }
  .studio-shell.dark :global(.board-host #puzzle-container) {
    background: #1b2630;
  }
  .studio-shell.dark h2,
  .studio-shell.dark .control-label {
    color: #aebdca;
  }
  .studio-shell.dark .action-list button:not([role="menuitem"]) {
    color: #e1e8ee;
    border-color: #4b5a68;
    background: #32414f;
  }
  .studio-shell.dark :global(.log-host .sudoku-solver-log) {
    color: #dce6ef;
    border-color: #40505f;
    background: #263340;
  }
  .studio-shell.dark :global(.log-host .sudoku-solver-log-header) {
    color: #eef4f8;
    border-color: #40505f;
    background: #2e3d4a;
  }
  .studio-shell.dark :global(.log-host #sudoku_auto_solver),
  .studio-shell.dark :global(.log-host #sudoku_solve_once),
  .studio-shell.dark :global(.log-host #sudoku_solve_clear),
  .studio-shell.dark :global(.sudoku-kropki-negative),
  .studio-shell.dark :global(.sudoku-doublekropki-negative),
  .studio-shell.dark :global(.sudoku-xv-negative),
  .studio-shell.dark :global(.sudoku-battenburg-negative) {
    color: #dce5ec !important;
    border-color: #536473 !important;
    background: #263340 !important;
  }
  .studio-shell.dark :global(.log-host #sudoku_auto_solver.active),
  .studio-shell.dark :global(.sudoku-kropki-negative.active),
  .studio-shell.dark :global(.sudoku-doublekropki-negative.active),
  .studio-shell.dark :global(.sudoku-xv-negative.active),
  .studio-shell.dark :global(.sudoku-battenburg-negative.active) {
    color: #fff !important;
    border-color: #176fae !important;
    background: #176fae !important;
  }
  .studio-shell.dark :global(#sudoku-solver-status) {
    color: #b8c5cf;
  }
  .studio-shell.dark :global(.log-host #sudoku-solver-log-output) {
    color: #d5dfe7 !important;
    border-color: #465563 !important;
    background: #1f2b35 !important;
  }
  .studio-shell.dark :global(#float-key),
  .studio-shell.dark :global(#float-key-body) {
    color: #dde6ed;
    background: #263340;
  }
  .studio-shell.dark :global(#float-key-header) {
    color: #eef4f8;
    background: #32414f;
  }
  .studio-shell.dark :global(#canvas) {
    background: #fff !important;
  }
  .studio-shell.dark .tool-help strong {
    color: #eef4f8;
  }
  .studio-shell.dark .tool-help p {
    color: #bac6cf;
  }
  .studio-shell.dark .tool-help > div + div {
    border-color: #40505f;
  }
  .studio-shell.dark .modes-heading button,
  .studio-shell.dark .tool-input-panel button {
    color: #dce5ec;
    border-color: #536473;
    background: #263340;
  }
  .studio-shell.dark .tool-input-panel {
    border-color: #4b5a68;
    background: #32414f;
  }
  .studio-shell.dark .input-panel-section {
    border-color: #4b5a68;
    background: #32414f;
  }
  .studio-shell.dark .input-panel-section .help-label {
    color: #b7c5cf;
  }
  .studio-shell.dark .slot-column-controls label {
    color: #dce5ec;
    border-color: #536473;
    background: #263340;
  }
  .studio-shell.dark .tool-input-panel button:hover,
  .studio-shell.dark .tool-input-panel button.selected {
    color: #fff;
    border-color: #2b8bc7;
    background: var(--primary-color);
  }
  .studio-shell.dark .action-group {
    border-color: #40505f;
  }
  .studio-shell.dark .variant-rule-preview {
    color: #c2ced7;
    border-color: #40505f;
    background: #263340;
  }
  .studio-shell.dark .variant-rule-preview strong {
    color: #eef4f8;
  }
  .studio-shell.dark .csp-badge {
    color: #64d3aa;
  }
  .studio-shell.dark .unsupported-badge {
    color: #ffb4b4;
    background: #542f35;
  }
  .studio-shell.dark .action-menu {
    border-color: #4b5a68;
    background: #263340;
  }
  .studio-shell.dark .action-menu button {
    color: #dde6ed !important;
  }
  .studio-shell.dark .action-menu button:hover {
    color: #fff !important;
    background: #3a4a58 !important;
  }
  .studio-shell.dark :global(.legacy-controls-host #legacy_mode_controls),
  .studio-shell.dark :global(.legacy-controls-host #submode_button),
  .studio-shell.dark :global(.legacy-controls-host #stylemode_button) {
    color: #e1e8ee;
    border-color: #4b5a68;
    background: #32414f;
  }
  .studio-shell.dark :global(.legacy-controls-host .label_mode) {
    color: #b7c5cf;
  }
  .studio-shell.dark
    :global(.legacy-controls-host input[type="radio"] + label) {
    color: #dce5ec;
    border-color: #536473;
    background: #263340;
  }
  .studio-shell.dark
    :global(.legacy-controls-host input[type="radio"]:checked + label) {
    color: #fff;
    border-color: #2b8bc7;
    background: var(--primary-color);
  }
  .studio-shell.dark :global(.legacy-controls-host #mode_symbol .nav li > span),
  .studio-shell.dark :global(.legacy-controls-host #mode_combi .nav li > span),
  .studio-shell.dark :global(.legacy-controls-host #mode_symbol .nav li ul),
  .studio-shell.dark :global(.legacy-controls-host #mode_combi .nav li ul) {
    color: #dce5ec;
    border-color: #536473;
    background: #263340;
  }
  .studio-shell.embedded {
    height: 100% !important;
    width: 100% !important;
  }
  .studio-shell.embedded .mobile-header {
    display: flex;
  }
  .studio-shell.embedded .column.actions,
  .studio-shell.embedded .controls-top-drawer,
  .studio-shell.embedded .legacy-modes-section {
    display: none !important;
  }
  .studio-grid.embedded-right {
    flex-direction: row !important;
    align-items: stretch !important;
  }
  .studio-grid.embedded-right .board-column {
    flex: 1 1 auto !important;
    order: 1 !important;
    height: 100% !important;
  }
  .studio-grid.embedded-right .column.controls {
    order: 2 !important;
    display: flex !important;
    flex-direction: column !important;
    width: 220px !important;
    min-width: 220px !important;
    max-width: 220px !important;
    height: 100% !important;
    border-left: 1px solid #d4dbe3 !important;
    background: #fff;
    overflow-y: auto;
  }
  .studio-shell.dark .studio-grid.embedded-right .column.controls {
    border-left-color: #40505f !important;
    background: #263340;
  }
  .studio-grid.embedded-right .input-modes-section {
    order: 1 !important;
    width: 100% !important;
    margin: 0 !important;
    padding: 8px 10px !important;
    border-radius: 0 !important;
    border: none !important;
    border-bottom: 1px solid #d4dbe3 !important;
  }
  .studio-shell.dark .studio-grid.embedded-right .input-modes-section {
    border-bottom-color: #40505f !important;
  }
  .studio-grid.embedded-right .mobile-input-panel {
    order: 2 !important;
    width: 100% !important;
    max-width: 100% !important;
    height: auto !important;
    max-height: none !important;
    margin: 0 !important;
    padding: 8px 10px !important;
    border-radius: 0 !important;
    border: none !important;
    box-shadow: none !important;
  }
  .studio-grid.embedded-right .mobile-input-panel .tool-input-panel {
    display: grid !important;
    grid-template-columns: repeat(3, 1fr) !important;
    gap: 6px !important;
  }

  .mobile-header {
    display: none;
  }

  @media (max-width: 768px) {
    .studio-shell .mobile-header {
      display: flex;
      flex-direction: column;
      background: #202b36;
      padding: 8px;
      gap: 8px;
      width: 100%;
      height: auto;
      box-sizing: border-box;
      border-bottom: 1px solid #10161c;
      flex-shrink: 0;
      z-index: 101;
    }
    .studio-shell .mobile-header button {
      padding: 6px 12px;
      font-size: 12px;
      font-weight: 700;
      border: 1px solid #344353;
      border-radius: 6px;
      color: #bdc8d3;
      background: #2a3744;
      cursor: pointer;
      transition:
        background 0.2s,
        color 0.2s;
    }
    .studio-shell .mobile-header button.active {
      background: var(--primary-color);
      color: #fff;
      border-color: var(--primary-color);
    }
    .studio-shell {
      display: flex;
      flex-direction: column;
      overflow: hidden;
      height: 100vh;
      width: 100vw;
    }
    .studio-grid {
      display: flex;
      flex-direction: column;
      flex: 1;
      min-height: 0;
      height: auto;
      padding: 0;
      gap: 0;
      overflow: hidden;
      position: relative;
    }
    .board-column {
      flex: 1;
      min-height: 0;
      width: 100%;
      height: 100%;
      order: 2;
      overflow: auto;
      position: relative;
      background: #f8fafc;
      padding: 10px 0;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
    }
    .board-host {
      width: min(100%, 100dvh);
      min-height: 0;
      height: auto;
      aspect-ratio: 1 / 1;
      flex: 0 1 auto;
    }

    .studio-shell .controls-top-drawer {
      display: none;
    }
    .studio-shell .controls-top-drawer.open {
      display: flex;
      flex-direction: column;
      gap: 10px;
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      background: #ffffff;
      border-bottom: 2px solid #bdc8d3;
      box-shadow: 0 10px 30px rgba(0, 0, 0, 0.15);
      padding: 12px;
      z-index: 100;
      max-height: 65vh;
      overflow-y: auto;
    }
    .studio-shell.dark .controls-top-drawer.open {
      background: #263340;
      border-color: #40505f;
    }

    .studio-shell .column.controls {
      display: contents;
    }

    .studio-shell .legacy-modes-section {
      order: 4;
      background: #ffffff;
      border-top: 1px solid #d7dee5;
      padding: 8px 8px calc(8px + env(safe-area-inset-bottom, 12px)) 8px;
      box-sizing: border-box;
    }
    .studio-shell.dark .legacy-modes-section {
      background: #263340;
      border-top-color: #40505f;
    }

    .studio-shell .column.actions {
      display: none;
    }
    .studio-shell .column.actions.open {
      display: block;
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      background: #ffffff;
      border-bottom: 2px solid #bdc8d3;
      box-shadow: 0 10px 30px rgba(0, 0, 0, 0.15);
      padding: 12px;
      z-index: 100;
      max-height: 65vh;
      overflow-y: auto;
      height: auto;
    }
    .studio-shell.dark .column.actions.open {
      background: #263340;
      border-color: #40505f;
    }

    .input-modes-section.panel-above,
    .studio-shell .input-modes-section.panel-below {
      order: 1;
      margin: 8px 8px 0 8px !important;
      padding: 6px 12px !important;
      background: #fff;
      border: 1px solid #d4dbe3;
      border-bottom: none;
      border-radius: 10px 10px 0 0;
      box-shadow: 0 -2px 8px rgba(23, 34, 49, 0.04);
      box-sizing: border-box;
      width: calc(100% - 16px);
      z-index: 5;
    }
    .studio-shell .input-modes-section.panel-below {
      order: 3;
    }
    .input-modes-section.panel-above h2,
    .studio-shell .input-modes-section.panel-below h2 {
      display: none;
    }
    .tab-key-hint,
    .studio-shell .mobile-input-panel .tool-input-panel kbd {
      display: none;
    }
    .studio-shell .input-mode-tools {
      display: flex;
      flex-direction: column;
      gap: 6px;
      align-items: stretch;
      position: relative;
    }
    .studio-shell .mobile-add-variant {
      display: inline-flex;
      justify-content: center;
      align-items: center;
      min-height: 32px;
      padding: 5px 9px;
      border: 1px solid #bdc8d3;
      border-radius: 5px;
      color: var(--primary-color);
      background: #fff;
      font-size: 13px;
      font-weight: 750;
      white-space: nowrap;
      cursor: pointer;
      margin-top: 4px;
    }
    .mobile-variant-rule-preview {
      position: relative;
      width: 100%;
      box-sizing: border-box;
      margin-top: 6px;
    }
    .studio-shell.dark .input-modes-section.panel-above,
    .studio-shell.dark .input-modes-section.panel-below {
      background: #32414f;
      border-color: #40505f;
    }

    :global(.svelte-home .studio-shell .legacy-variant-host .sudoku-variant-tools) {
      display: flex !important;
      flex-direction: column !important;
      flex-wrap: nowrap !important;
      overflow-y: auto !important;
      max-height: 180px !important;
      padding: 2px 0 !important;
      width: 100% !important;
    }
    :global(.svelte-home .studio-shell .legacy-variant-host button) {
      flex-shrink: 0 !important;
    }
    .studio-shell .input-mode-scroll-hint {
      display: flex;
      position: absolute;
      z-index: 2;
      top: 2px;
      right: 0;
      bottom: 2px;
      width: 24px;
      align-items: center;
      justify-content: flex-end;
      padding-right: 3px;
      pointer-events: none;
      color: var(--primary-color);
      background: linear-gradient(90deg, transparent, #fff 55%);
      font-size: 22px;
      font-weight: 800;
    }
    .studio-shell.dark .input-mode-scroll-hint {
      background: linear-gradient(90deg, transparent, #32414f 55%);
    }
    .studio-shell .input-panel-section {
      padding: 6px !important;
      box-shadow: none !important;
      border: 1px solid #e2e8f0 !important;
      border-radius: 6px !important;
    }
    .studio-shell.dark .input-panel-section {
      border-color: #4b5a68 !important;
    }
    .studio-shell .input-panel-section .help-label {
      display: none;
    }
    .studio-shell .desktop-input-panel {
      display: none;
    }
    .studio-shell .mobile-input-panel {
      display: block;
      flex: 0 0 auto;
      width: calc(100% - 16px);
      max-height: 32vh;
      margin: 8px;
      overflow-y: auto;
      box-sizing: border-box;
      background: #fff;
    }
    .studio-shell .mobile-input-panel.panel-above {
      order: 1;
      margin-top: 0 !important;
      margin-bottom: 8px !important;
      border-radius: 0 0 10px 10px;
      border-top: none;
      box-shadow: 0 4px 8px rgba(23, 34, 49, 0.06);
    }
    .studio-shell .mobile-input-panel.panel-below {
      order: 3;
      margin-top: 0 !important;
      margin-bottom: max(8px, env(safe-area-inset-bottom)) !important;
      border-radius: 0 0 10px 10px;
      border-top: none;
      box-shadow: 0 4px 8px rgba(23, 34, 49, 0.06);
    }
    .studio-shell.dark .mobile-input-panel {
      background: #32414f;
    }

    .studio-shell .variant-picker .variant-menu {
      position: absolute;
      top: calc(100% + 6px);
      bottom: auto;
      left: 0;
      right: 0;
      max-height: min(52vh, 430px);
      overflow-y: auto;
      z-index: 200;
      border-radius: 12px 12px 0 0;
      box-shadow: 0 -4px 20px rgba(0, 0, 0, 0.15);
      background: #ffffff;
      border: 1px solid #bdc8d3;
    }
    .studio-shell .input-mode-variant-menu {
      position: fixed;
      inset: auto 8px max(8px, env(safe-area-inset-bottom)) 8px;
      z-index: 300;
      max-height: min(62vh, 520px);
      overflow-y: auto;
      border-radius: 10px;
    }
    .studio-shell.dark .variant-picker .variant-menu {
      background: #263340;
      border-color: #40505f;
    }
    .studio-shell .mobile-input-panel-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 8px;
      margin-bottom: 6px;
      color: #536170;
      font-size: 10px;
      font-weight: 750;
      letter-spacing: 0.04em;
      text-transform: uppercase;
    }
    .studio-shell.dark .mobile-input-panel-header {
      color: #b7c5cf;
    }
    .studio-shell .mobile-input-panel-header button {
      flex: 0 0 auto;
      min-height: 28px;
      padding: 4px 9px;
      border: 1px solid #bdc8d3;
      border-radius: 5px;
      color: var(--primary-color);
      background: #fff;
      font-size: 10px;
      font-weight: 700;
      letter-spacing: normal;
      text-transform: none;
    }
    .studio-shell .mobile-note-modes {
      margin: 0 0 6px;
    }
    .studio-shell .mobile-note-modes button {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      gap: 4px;
      min-height: 26px;
      height: 26px;
      padding: 3px 4px;
    }
    .studio-shell .controls-top-drawer .note-modes span {
      display: none;
    }
    .studio-shell.dark .mobile-input-panel-header button {
      color: #dce5ec;
      border-color: #536473;
      background: #263340;
    }
    .studio-shell .mobile-header-row {
      display: flex;
      width: 100%;
      gap: 8px;
    }
    .studio-shell .mobile-header-row button {
      flex: 1;
      padding: 6px 12px;
      font-size: 12px;
      font-weight: 700;
      border: 1px solid #344353;
      border-radius: 6px;
      color: #bdc8d3;
      background: #2a3744;
      cursor: pointer;
      transition:
        background 0.2s,
        color 0.2s;
    }
    .studio-shell .mobile-header-row button.active {
      background: var(--primary-color);
      color: #fff;
      border-color: var(--primary-color);
    }
    .studio-shell .reviewed-checkbox {
      display: inline-flex;
      align-items: center;
      gap: 6px;
      font-size: 12px;
      color: #9ab0c2;
      cursor: pointer;
      user-select: none;
      padding: 4px 6px;
      background: #1a242f;
      border: 1px solid #344353;
      border-radius: 6px;
    }
    .studio-shell .reviewed-checkbox input[type="checkbox"] {
      cursor: pointer;
      accent-color: var(--primary-color);
      margin: 0;
    }
    .studio-shell .mobile-header-row.solver-row {
      display: flex;
      align-items: center;
      gap: 6px;
      margin-top: 4px;
      padding: 4px 6px;
      background: #1a242f;
      border-radius: 6px;
    }
    .studio-shell.dark .mobile-header-row.solver-row {
      background: #1b2630;
    }
    .studio-shell .solver-btn {
      flex: 0 0 74px !important;
      width: 74px !important;
      min-width: 74px !important;
      max-width: 74px !important;
      justify-content: center !important;
      text-align: center !important;
      box-sizing: border-box !important;
      padding: 4px 4px !important;
      font-size: 11px !important;
      min-height: 28px !important;
      white-space: nowrap !important;
      display: inline-flex;
      align-items: center;
      gap: 3px;
      border: 1px solid #344353;
      border-radius: 6px;
      color: #bdc8d3;
      background: #2a3744;
      cursor: pointer;
    }
    .studio-shell .solver-btn.active {
      background: var(--primary-color) !important;
      color: #fff !important;
      border-color: var(--primary-color) !important;
    }
    .studio-shell .solver-status {
      flex: 1;
      display: inline-flex;
      align-items: center;
      gap: 5px;
      padding: 0 6px;
      min-width: 0;
    }
    .studio-shell .solver-status .status-indicator {
      width: 6px;
      height: 6px;
      border-radius: 50%;
      background: #7f8c98;
      box-shadow: 0 0 0 2px rgba(127, 140, 152, 0.13);
      flex-shrink: 0;
    }
    .studio-shell .solver-status .status-indicator.running {
      background: #48c78e;
      box-shadow: 0 0 0 2px rgba(72, 199, 142, 0.16);
    }
    .studio-shell .solver-status .log-text {
      flex: 1;
      min-width: 0;
      color: #bdc8d3;
      font-size: 10px;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }
    .studio-shell .log-host {
      display: none !important;
    }
  }

  :global(.svelte-home .log-host #sudoku_auto_solver),
  :global(.svelte-home .log-host #sudoku_solve_once),
  :global(.svelte-home .log-host #sudoku_solve_clear) {
    width: auto !important;
    padding: 0 8px !important;
    display: inline-flex !important;
    align-items: center !important;
    gap: 5px !important;
    white-space: nowrap !important;
  }

  .status-indicator {
    width: 8px;
    height: 8px;
    border-radius: 50%;
    background: #7f8c98;
    box-shadow: 0 0 0 3px rgba(127, 140, 152, 0.13);
    flex-shrink: 0;
  }
  .status-indicator.running {
    background: #48c78e;
    box-shadow: 0 0 0 3px rgba(72, 199, 142, 0.16);
  }
  .status-indicator.error-bulb {
    background: #ef4444 !important;
    box-shadow: 0 0 0 3px rgba(239, 68, 68, 0.35), 0 0 10px rgba(239, 68, 68, 0.8) !important;
    animation: bulbGlow 1.2s infinite ease-in-out;
  }

  @keyframes bulbGlow {
    0%, 100% { opacity: 1; box-shadow: 0 0 0 3px rgba(239, 68, 68, 0.35), 0 0 10px rgba(239, 68, 68, 0.8); }
    50% { opacity: 0.7; box-shadow: 0 0 0 2px rgba(239, 68, 68, 0.2), 0 0 5px rgba(239, 68, 68, 0.4); }
  }
  .log-text {
    flex: 1;
    font-size: 11px;
    color: #435160;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .studio-shell.dark .log-text {
    color: #d5dfe7;
  }

  /* Modal light theme overrides */
  :global(html:not(.dark) #modal-save-content),
  :global(html:not(.dark) #modal-save2-content),
  :global(html:not(.dark) #modal-save-tag-content),
  :global(html:not(.dark) #modal-replay-content),
  :global(html:not(.dark) #modal-input-content),
  :global(html:not(.dark) #modal-load-content) {
    border-color: #cbd5df !important;
    color: #1d2633 !important;
    background: #ffffff !important;
  }
  :global(html:not(.dark) .modal .nb_button input[type="button"]),
  :global(html:not(.dark) .modal .nb_button button) {
    border-color: #bfcad4 !important;
    color: #263443 !important;
    background: #ffffff !important;
  }
  :global(html:not(.dark) .modal .nb_button input[type="button"]:hover),
  :global(html:not(.dark) .modal .nb_button button:hover) {
    border-color: var(--primary-color) !important;
    color: var(--primary-color-dark) !important;
    background: var(--primary-color-light) !important;
  }
  :global(html:not(.dark) .modal input[type="text"]),
  :global(html:not(.dark) .modal textarea),
  :global(html:not(.dark) .modal select) {
    border-color: #bdc8d3 !important;
    color: #263443 !important;
    background: #fbfcfd !important;
  }
  :global(html:not(.dark) .modal .modal-subheader) {
    color: #536170 !important;
  }
  :global(html:not(.dark) .modal .label_nb),
  :global(html:not(.dark) .modal label) {
    color: #263443 !important;
  }

  /* Modal dark theme overrides */
  :global(html.dark .modal-content),
  :global(html.dark #modal-save-content),
  :global(html.dark #modal-save2-content),
  :global(html.dark #modal-save-tag-content),
  :global(html.dark #modal-replay-content),
  :global(html.dark #modal-input-content),
  :global(html.dark #modal-load-content) {
    border-color: #40505f !important;
    color: #dde6ed !important;
    background: #263340 !important;
  }
  :global(html.dark .modal .nb_button input[type="button"]),
  :global(html.dark .modal .nb_button button) {
    border-color: #536473 !important;
    color: #dce5ec !important;
    background: #263340 !important;
  }
  :global(html.dark .modal .nb_button input[type="button"]:hover),
  :global(html.dark .modal .nb_button button:hover) {
    border-color: #2b8bc7 !important;
    color: #fff !important;
    background: var(--primary-color) !important;
  }
  :global(html.dark .modal input[type="text"]),
  :global(html.dark .modal textarea),
  :global(html.dark .modal select) {
    border-color: #465563 !important;
    color: #d5dfe7 !important;
    background: #1f2b35 !important;
  }
  :global(html.dark .modal .modal-subheader) {
    color: #aebdca !important;
  }

  .action-menu.transform-menu {
    grid-template-columns: repeat(4, 1fr) !important;
    width: auto !important;
    min-width: 0 !important;
  }
  .action-menu.transform-menu button {
    text-align: center !important;
    font-size: 16px !important;
    padding: 6px !important;
  }
  .action-menu.compact-menu {
    grid-template-columns: repeat(2, 1fr) !important;
    width: auto !important;
    min-width: 0 !important;
  }
  .action-menu.compact-menu button {
    text-align: center !important;
    font-size: 12px !important;
    padding: 6px !important;
  }

  :global(.modal .nb_button button.copy-success) {
    border-color: #2ec866 !important;
    color: #fff !important;
    background: #23a950 !important;
  }

  .studio-shell.dark .variant-search-control {
    border-color: #465563 !important;
    color: #d5dfe7 !important;
    background: #1f2b35 !important;
  }
  .studio-shell.dark .variant-search-control input {
    color: #d5dfe7 !important;
  }
  .studio-shell.dark .variant-menu {
    border-color: #4b5a68 !important;
    background: #263340 !important;
    box-shadow: 0 12px 30px rgba(0, 0, 0, 0.4) !important;
  }
  .studio-shell.dark .variant-tabs {
    border-bottom-color: #40505f !important;
    background: #263340 !important;
  }
  .studio-shell.dark .variant-tabs button {
    border-color: #536473 !important;
    color: #dce5ec !important;
    background: #263340 !important;
  }
  .studio-shell.dark .variant-tabs button.active {
    background: var(--primary-color) !important;
    border-color: var(--primary-color) !important;
    color: #fff !important;
  }
  .studio-shell.dark .variant-menu button[role="menuitem"] {
    color: #dce5ec !important;
    background: transparent !important;
  }
  .studio-shell.dark .variant-menu button[role="menuitem"]:hover {
    background: #32414f !important;
    color: #fff !important;
  }
  .studio-shell.dark .variant-menu button[role="menuitem"].current {
    background: var(--primary-color) !important;
    color: #fff !important;
  }
  .studio-shell.dark .variant-rule-preview {
    border-color: #4b5a68 !important;
    background: #263340 !important;
    color: #c2ced7 !important;
  }

  @media (min-width: 769px) {
    .studio-shell.hide-left-sidebar .studio-grid {
      grid-template-columns:
        minmax(0, 1fr)
        clamp(245px, 22vw, 315px) !important;
    }
    .studio-shell.hide-left-sidebar .studio-grid .column.controls {
      display: none !important;
    }
  }
</style>
