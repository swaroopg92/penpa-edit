import { cpSync, copyFileSync, mkdirSync, rmSync } from "node:fs";
import { join } from "node:path";

const root = process.cwd();
const docsDir = join(root, "docs");
const distDir = join(root, "dist");
const generatedWorkersDir = join(root, "generated", "workers");

const directories = ["css", "fonts", "js"];
const files = ["favicon.svg", "app-icon.png", "identity.js", "points.md"];

mkdirSync(distDir, { recursive: true });

for (const directory of directories) {
  const target = join(distDir, directory);
  rmSync(target, { force: true, recursive: true });
  cpSync(join(docsDir, directory), target, { recursive: true });
}

for (const file of files) {
  copyFileSync(join(docsDir, file), join(distDir, file));
}

for (const worker of ["sudoku_solver_worker_bundle.js", "sudoku_generator_worker_bundle.js"]) {
  copyFileSync(join(generatedWorkersDir, worker), join(distDir, "js", worker));
}
