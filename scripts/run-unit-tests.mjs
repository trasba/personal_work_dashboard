// Explicitly resolves test files instead of relying on shell glob expansion
// (cmd.exe doesn't expand `*`) or `node --test <dir>` directory-scanning,
// whose behavior differs across Node versions (e.g. Node 24 vs 18).
import { spawnSync } from "node:child_process";
import { readdirSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const testsDir = fileURLToPath(new URL("../tests/", import.meta.url));
const files = readdirSync(testsDir)
    .filter(f => f.endsWith(".test.mjs"))
    .map(f => path.join(testsDir, f));

if (files.length === 0) {
    console.error(`No *.test.mjs files found in ${testsDir}`);
    process.exit(1);
}

const result = spawnSync(process.execPath, ["--test", ...files], { stdio: "inherit" });
process.exit(result.status ?? 1);
