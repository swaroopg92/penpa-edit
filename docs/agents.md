# Penpa-Edit Architecture & Codebase Overview

This document outlines the high-level architecture and structure of the `penpa-edit` project, which is a web application for creating and solving Sudokus and other logic puzzles.

## AI Agent Instructions
When modifying or adding to this codebase, the following rules must be strictly adhered to:
1. **Minimal Modifications:** No unnecessary reformatting of code. Only modify sections where it is strictly needed to accomplish the task.
2. **Readability:** Keep code simple and human-understandable. Avoid overly complex one-liners or convoluted logic where simpler alternatives exist.
3. **No Hallucinations:** Avoid hallucinating code or logic. If there is any doubt about the correct approach or side effects of a change, ask the user for confirmation before proceeding.
4. **Documentation:** When adding new code, include descriptions for new functions and add comments where applicable to explain complex or non-obvious logic.

## Core Concepts

The codebase is predominantly written in vanilla JavaScript (ES6+), utilizing the HTML5 Canvas API for rendering the grid and interactive elements. It relies on a few external libraries for specific functionalities (like `sweetalert2` for modals, `spectrum` for color picking, `select2` for dropdowns, and `zlib`/`lz-string`/`encoding` for URL parameter compression).

*   **Puzzles:** The system models a grid using abstract data structures where intersections, cells, edges, and points are heavily referenced to determine neighbors and valid interactions.
*   **Grid Types:** The application supports different geometric grid types (Square, Hexagonal, Triangular, etc.). Each grid type handles its own geometry, point creation, and coordinate translation.
*   **Modes & Submodes:** Interaction is broken down into various modes (e.g., placing lines, painting surfaces, writing numbers). Submodes specify the exact behavior (e.g., drawing normal lines vs. edge lines, placing different shapes).
*   **Event Handling:** Mouse and touch events are processed centrally and mapped to grid interactions depending on the active mode and grid state.

## Folder Structure

The main codebase resides within the `docs` directory. Here is a breakdown of the key directories and files:

### Root Level (`docs/`)
*   `index.html`: The main entry point. It sets up the UI shell, loads scripts, and initializes the canvas.
*   `_config.yml`: GitHub Pages configuration (likely setting up themes or Jekyll).
*   `identity.js`: Contains configuration variables related to the application's identity. This includes Google Analytics tags, the application owner's name (used for personalized messages in the tool like "Swaroop says"), text for dismissal buttons, and customized messages for solving puzzles. It also handles the dynamic insertion of the Google tag script into the document head.

### Styles (`docs/css/`)
Contains custom styles and styles for external libraries.
*   `style.css`: Primary application styling.
*   `light_theme.css`, `dark_theme.css`: Theming files.
*   `base-structure.css`: Foundational layout styles.
*   Other library CSS: `font-awesome.min.css`, `vanillaSelectBox.css`, `spectrum.css`, `select2.css`.

### Scripts (`docs/js/`)
The core logic resides here.
*   **Initialization & Global State:**
    *   `main.js`: Setup script. Handles device detection, local storage setup, UI bindings (color picker), boot sequence, and global event listener attachment (mouse/touch events on canvas, keyboard events).
    *   `general.js`: likely contains utility functions or common application logic.
    *   `settings.js`: Manages user preferences and application settings.

*   **Core Puzzle Engine:**
    *   `class_p.js`: Defines fundamental data structures (`Point`, `Stack`) and potentially the base `Puzzle` class, which handles history, state, and generic grid operations.
    *   `modes.js`: Defines the mappings for tools to actual modes and submodes for different geometries.
    *   `interface.js`: Acts as the bridge between user input (from `main.js` listeners) and the puzzle state modification.
    *   `timer.js`: Handles logic for the solving timer.

*   **Grid Geometries (Subclasses):**
    *   `class_square.js`: Implements the `Puzzle_square` class, handling point creation, drawing, and constraints specific to square grids.
    *   `class_hex.js`: Implements hexagonal grids.
    *   `class_tri.js`: Implements triangular grids.
    *   `class_pyramid.js`, `class_uniform.js`, `class_panel.js`: other grid topologies.

*   **Features:**
    *   `puzzlink.js`: Logic for parsing and generating puzzlink/penpa URLs (serialization/deserialization).
    *   `constraints.js`: Manages logical constraints for solving or validating puzzles.
    *   `conflicts.js`: Handles conflict detection within the grid (e.g., duplicate numbers in a Sudoku row).
    *   `customcolor.js`: Logic for the custom color palette interactions.
    *   `genre_tags.js`: Manages tags associated with puzzle genres.
    *   `translate.js`: Internationalization and translation support.
    *   `conversion.js`: Unclear, possibly related to converting between different puzzle formats or older penpa versions.
    *   `style.js`: Could be dynamic styling or canvas drawing style configuration.

### Libraries (`docs/js/libs/`)
Third-party dependencies:
*   `jquery-3.7.0.min.js`: DOM manipulation.
*   `sweetalert2@11.js`: Modal dialogs.
*   `spectrum.js`: Color picker.
*   `select2.full.js`: Advanced dropdowns.
*   `zlib.js`, `encoding.js`: For data compression/encoding in URLs.
*   `canvas2svg.js`: For exporting canvas contents to SVG.
*   `gif.js`, `gif.worker.js`: For generating animated GIFs of puzzle solutions.
*   `md5.min.js`: Cryptography utility.
*   `purify.min.js`: DOMPurify for XSS sanitization.
*   `vanillaSelectBox.js`: Dropdown utility.
*   `CanvasRenderingContext2D.ext.js`: Extensions for standard Canvas context.

## Coding Style
*   **Vanilla JS (ES6+):** The code utilizes classes (`class Point`, `class Puzzle_square`), `let`/`const`, and arrow functions.
*   **State Management:** State appears to be managed predominantly within instantiated objects (like the `pu` object often referenced in these types of architectures) rather than a global state container like Redux. The puzzle state handles its own undo/redo stacks.
*   **Canvas Rendering:** Drawing is manual and imperative via `CanvasRenderingContext2D`.
*   **Event Handling:** Centralized event listeners in `main.js` delegate to specific handlers based on application state.

## Entry Point & Execution Flow
1.  `index.html` loads. It defines the meta tags, loads styles, and synchronously loads scripts (this might be a performance bottleneck, though `async=false` guarantees execution order).
2.  `main.js` executes on `onload`. It initializes UI elements.
3.  The `boot()` function (likely defined in `general.js` or `interface.js`) is called to initialize the specific puzzle instance (e.g., `Puzzle_square`).
4.  Event listeners for `mousedown`, `mousemove`, `mouseup` etc., are bound to the canvas. When triggered, they interact with the active puzzle instance (`pu` or similar variable) to modify state and trigger redraws.