#!/usr/bin/env node

import { readFileSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";

function transform(source) {
    // Replace this no-op with the actual migration for the breaking change.
    return source;
}

function main() {
    const inputPaths = process.argv.slice(2);

    if (inputPaths.length === 0) {
        console.error("Usage: node codemods/<changeset-slug>/index.mjs <file ...>");
        process.exit(1);
    }

    let changedFiles = 0;

    for (const inputPath of inputPaths) {
        const absolutePath = resolve(inputPath);
        const previousSource = readFileSync(absolutePath, "utf8");
        const nextSource = transform(previousSource);

        if (nextSource === previousSource) {
            continue;
        }

        writeFileSync(absolutePath, nextSource);
        changedFiles += 1;
    }

    console.log(`Updated ${changedFiles} file(s).`);
}

try {
    main();
} catch (error) {
    console.error(error.message);
    process.exit(1);
}
