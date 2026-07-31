import { defineConfig } from "vite";
import { svelte, vitePreprocess } from "@sveltejs/vite-plugin-svelte";
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";
import {
  MAX_DEV_API_BODY_BYTES,
  resolveContainedPath,
  validateMutationHeaders,
  validateVariantId,
  validateVariantMetadata
} from "./scripts/vite-security.mjs";

const metadataPath = resolve(process.cwd(), "variant_metadata.json");

function readMetadata() {
  return validateVariantMetadata(JSON.parse(readFileSync(metadataPath, "utf8")));
}

function devApiPlugin() {
  return {
    name: "dev-api",
    configureServer(server) {
      server.middlewares.use((req, res, next) => {
        const pathname = new URL(req.url || "/", "http://localhost").pathname.replace(/\/+$/, "");
        const sendJson = (status, payload) => {
          res.statusCode = status;
          res.setHeader("Content-Type", "application/json; charset=utf-8");
          res.end(JSON.stringify(payload));
        };
        const mutationPaths = new Set([
          "/api/variant-metadata",
          "/api/add-variant",
          "/api/save-example",
          "/api/toggle-reviewed"
        ]);
        const isMutation = mutationPaths.has(pathname) && ["POST", "PUT", "PATCH", "DELETE"].includes(req.method || "");
        if (isMutation) {
          const headerError = validateMutationHeaders(req.headers, Boolean(req.socket.encrypted));
          if (headerError) {
            sendJson(headerError.status, { error: headerError.error });
            req.resume();
            return;
          }
        }
        const readJsonBody = (callback) => {
          const chunks = [];
          let byteLength = 0;
          let tooLarge = false;
          req.on("data", chunk => {
            byteLength += chunk.length;
            if (byteLength > MAX_DEV_API_BODY_BYTES) {
              tooLarge = true;
              return;
            }
            chunks.push(chunk);
          });
          req.on("end", () => {
            if (tooLarge) {
              sendJson(413, { error: "Request body is too large." });
              return;
            }
            try {
              callback(JSON.parse(Buffer.concat(chunks).toString("utf8")));
            } catch (err) {
              sendJson(400, { error: "Invalid JSON: " + err.message });
            }
          });
        };

        if (pathname === "/api/variant-metadata" && req.method === "GET") {
          try {
            sendJson(200, readMetadata());
          } catch (err) {
            sendJson(500, { error: "Could not read variant_metadata.json: " + err.message });
          }
          return;
        }

        if (pathname === "/api/variant-metadata" && req.method === "PUT") {
          readJsonBody((metadata) => {
            try {
              validateVariantMetadata(metadata);
              writeFileSync(metadataPath, JSON.stringify(metadata, null, 2) + "\n", "utf8");
              sendJson(200, { message: "variant_metadata.json saved. Reload the wiki to apply it." });
            } catch (err) {
              sendJson(400, { error: "Could not save metadata: " + err.message });
            }
          });
          return;
        }

        if (pathname === "/api/add-variant" && req.method === "POST") {
          readJsonBody((data) => {
            try {
              validateVariantId(data.id);
              const metadata = readMetadata();

              if (metadata.variants.some(v => v.id === data.id)) {
                res.statusCode = 400;
                res.end("Variant ID already exists");
                return;
              }

              metadata.variants.push({
                id: data.id,
                name: data.name,
                rules: { "9x9": data.rule },
                status: data.status,
                inputType: {
                  categories: [data.inputType],
                  instructions: []
                },
                tags: data.tags
              });

              validateVariantMetadata(metadata);
              writeFileSync(metadataPath, JSON.stringify(metadata, null, 2) + "\n", "utf8");
              sendJson(200, { message: "Variant added successfully!" });
            } catch (err) {
              sendJson(400, { error: "Could not add variant: " + err.message });
            }
          });
          return;
        }

        if (pathname === "/api/save-example" && req.method === "POST") {
          readJsonBody((data) => {
            try {
              const { variantId, example } = data;
              validateVariantId(variantId);
              if (typeof example !== "string" || !example) {
                sendJson(400, { error: "Variant ID and solving example are required." });
                return;
              }

              const metadata = readMetadata();
              let updated = false;

              for (const variant of metadata.variants) {
                if (variant.id === variantId) {
                  variant.example = data.example;
                  updated = true;
                  break;
                }
              }

              if (updated) {
                writeFileSync(metadataPath, JSON.stringify(metadata, null, 2) + "\n", "utf8");
                sendJson(200, { message: "Example saved successfully!" });
              } else {
                sendJson(404, { error: "Variant not found in metadata." });
              }
            } catch (err) {
              sendJson(400, { error: "Could not save example: " + err.message });
            }
          });
          return;
        }

        if (pathname === "/api/toggle-reviewed" && req.method === "POST") {
          readJsonBody((data) => {
            try {
              const { variantId, reviewed } = data;
              validateVariantId(variantId);
              if (typeof reviewed !== "boolean") {
                sendJson(400, { error: "Variant ID and reviewed boolean are required." });
                return;
              }

              const metadata = readMetadata();
              let updated = false;

              for (const variant of metadata.variants) {
                if (variant.id === variantId) {
                  variant.reviewed = reviewed;
                  updated = true;
                  break;
                }
              }

              if (updated) {
                writeFileSync(metadataPath, JSON.stringify(metadata, null, 2) + "\n", "utf8");
                sendJson(200, { message: "Reviewed status saved successfully!" });
              } else {
                sendJson(404, { error: "Variant not found in metadata." });
              }
            } catch (err) {
              sendJson(400, { error: "Could not save reviewed status: " + err.message });
            }
          });
          return;
        }
        next();
      });
    }
  };
}

function variantDetailPages() {
  const metadata = readMetadata();
  const ids = Array.from(new Set(metadata.variants
    .filter((variant) => variant.status !== "hidden" && variant.id !== "")
    .map((variant) => {
      validateVariantId(variant.id);
      return variant.id.replace(/([a-z])([A-Z])/g, "$1 $2").toLowerCase();
    })
  ));
  return {
    name: "variant-detail-pages",
    writeBundle(options) {
      const outputDirectory = options.dir || resolve(process.cwd(), "dist");
      const template = readFileSync(resolve(outputDirectory, "list.html"), "utf8");
      const pageDirectory = resolve(outputDirectory, "list");
      mkdirSync(pageDirectory, { recursive: true });
      ids.forEach((id) => {
        const source = template
          .replace("<head>", "<head><base href=\"../../\">")
          .replace('data-catalog-page="variants"', `data-catalog-page="detail" data-variant-id="${id}"`);
        const idDirectory = resolveContainedPath(pageDirectory, id);
        mkdirSync(idDirectory, { recursive: true });
        writeFileSync(resolve(idDirectory, "index.html"), source, "utf8");
      });
    }
  };
}

export default defineConfig({
  root: "docs",
  plugins: [variantDetailPages(), devApiPlugin(), svelte({ preprocess: vitePreprocess() })],
  build: {
    outDir: "../dist",
    emptyOutDir: true,
    rollupOptions: {
      input: {
        main: resolve(process.cwd(), "docs/index.html"),
        list: resolve(process.cwd(), "docs/list.html")
      }
    }
  }
});
