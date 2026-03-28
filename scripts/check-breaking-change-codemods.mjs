#!/usr/bin/env node

import { readFileSync, readdirSync, statSync } from "node:fs";
import { join } from "node:path";

const changesetDirectory = ".changeset";
const codemodDirectory = "codemods";
const ignoredChangesetFiles = new Set(["README.md", "config.json"]);

function listChangesetFiles() {
    return readdirSync(changesetDirectory)
        .filter((name) => !ignoredChangesetFiles.has(name))
        .filter((name) => name.endsWith(".md"));
}

function isMajorChangeset(path) {
    const content = readFileSync(path, "utf8");
    const frontmatterMatch = content.match(/^---\n([\s\S]*?)\n---/);

    if (!frontmatterMatch) {
        return false;
    }

    return frontmatterMatch[1]
        .split("\n")
        .some((line) => /:\s*major\s*$/.test(line.trim()));
}

function codemodExists(slug) {
    const directory = join(codemodDirectory, slug);

    try {
        if (!statSync(directory).isDirectory()) {
            return false;
        }
    } catch {
        return false;
    }

    const files = new Set(readdirSync(directory));
    return files.has("README.md") && files.has("index.mjs");
}

function main() {
    const majorChangesets = listChangesetFiles()
        .filter((name) => isMajorChangeset(join(changesetDirectory, name)))
        .map((name) => name.replace(/\.md$/, ""));

    if (majorChangesets.length === 0) {
        console.log("No major changesets found.");
        return;
    }

    const missingCodemods = majorChangesets.filter(
        (slug) => !codemodExists(slug)
    );

    if (missingCodemods.length > 0) {
        console.error("Breaking-change codemod check failed.");
        console.error(
            "Each major changeset must include codemods/<changeset-slug>/README.md and codemods/<changeset-slug>/index.mjs."
        );

        for (const slug of missingCodemods) {
            console.error(`- Missing codemod for .changeset/${slug}.md`);
        }

        process.exit(1);
    }

    console.log(
        `Validated codemod coverage for ${majorChangesets.length} major changeset(s).`
    );
}

try {
    main();
} catch (error) {
    console.error(error.message);
    process.exit(1);
}
