/**
 * Build script for the Tidal Mini Player plugin.
 * Outputs dist/tidal-mini-player.mjs and dist/tidal-mini-player.json
 * for distribution via the TidaLuna plugin store.
 */
import { build, context } from "esbuild";
import { createHash } from "crypto";
import { readFile, writeFile, mkdir } from "fs/promises";

const watch = process.argv.includes("--watch");

const outDir = "./dist";
const outFile = `${outDir}/tidal-mini-player.mjs`;

/**
 * Named exports that TidaLuna exposes from each @luna/* module.
 * We list them explicitly so esbuild can generate correct import wrappers
 * when bundling our source code.  At runtime, TidaLuna resolves these
 * through luna.core.modules.
 */
const LUNA_MODULE_EXPORTS: Record<string, string[]> = {
"@luna/core": [
"Tracer",
"ReactiveStore",
"ftch",
"interceptors",
"buildActions",
"reduxStore",
"findModuleByProperty",
],
"@luna/lib": [
"PlayState",
"MediaItem",
"MediaItems",
"StyleTag",
"ContentBase",
"Album",
"Artist",
"Quality",
"ContextMenu",
"Playlist",
"Tidal",
"observePromise",
"getPlaybackInfo",
"parseDate",
"safeTimeout",
"redux",
"ipcRenderer",
"errSignal",
"unloads",
],
};

/**
 * Resolve @luna/* imports to runtime dynamic accessors.
 * Generates explicit named exports so esbuild can perform tree-shaking and
 * named import resolution without a static module to analyse.
 */
const dynamicLunaExternalsPlugin = {
name: "dynamic-luna-externals",
setup(b: import("esbuild").PluginBuild) {
b.onResolve({ filter: /^@luna\// }, (args) => ({
path: args.path,
namespace: "luna-runtime",
}));

b.onLoad({ filter: /.*/, namespace: "luna-runtime" }, (args) => {
const mod = args.path;
const knownExports = LUNA_MODULE_EXPORTS[mod] ?? [];

// Generate an ESM stub that pulls each named export from the
// luna.core.modules object at runtime.
const lines = [
`const _m = (typeof luna !== "undefined" && luna?.core?.modules?.["${mod}"]) ?? {};`,
...knownExports.map((exp) => `export const ${exp} = _m["${exp}"];`),
`export default _m;`,
];

return { contents: lines.join("\n"), loader: "js" as const };
});
},
};

// Write the compiled bundle and companion manifests for the Luna store
const writeDistPlugin = {
name: "write-dist",
setup(b: import("esbuild").PluginBuild) {
b.onEnd(async (result) => {
if (result.errors.length > 0) return;
await mkdir(outDir, { recursive: true });

const code = result.outputFiles?.[0]?.text ?? "";
const hash = createHash("sha256").update(code).digest("hex");

const pkg = JSON.parse(await readFile("./package.json", "utf-8"));
const distPkg = {
name: pkg.name,
version: pkg.version,
description: pkg.description,
author: pkg.author,
homepage: pkg.homepage,
repository: pkg.repository,
hash,
code,
};

// tidal-mini-player.mjs  – raw bundle (for manual installs)
await writeFile(outFile, code);
// tidal-mini-player.json – single-plugin manifest (Install from URL)
await writeFile(
outFile.replace(".mjs", ".json"),
JSON.stringify(distPkg, null, 2),
);
// store.json – array format expected by the TidaLuna "Install from URL" / release store pattern
await writeFile(
`${outDir}/store.json`,
JSON.stringify([distPkg], null, 2),
);
console.log(`Built ${outFile}`);
});
},
};

const buildOptions: import("esbuild").BuildOptions = {
entryPoints: ["./src/index.ts"],
outfile: outFile,
bundle: true,
write: false,
format: "esm",
platform: "browser",
target: "chrome126",
sourcemap: false,
minify: !watch,
treeShaking: true,
plugins: [dynamicLunaExternalsPlugin, writeDistPlugin],
};

if (watch) {
const ctx = await context(buildOptions);
await ctx.watch();
console.log("Watching for changes...");
} else {
await build(buildOptions);
}
