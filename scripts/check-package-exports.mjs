#!/usr/bin/env node

import { execFileSync } from "node:child_process";
import { mkdtempSync, readdirSync, readFileSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join, relative, sep } from "node:path";
import { fileURLToPath } from "node:url";

const rootDirectory = process.cwd();
const packageJsonPath = join(rootDirectory, "package.json");
const packageJson = JSON.parse(readFileSync(packageJsonPath, "utf8"));
const packageName = packageJson.name;

function toPosixPath(path) {
    return path.split(sep).join("/");
}

function listFilesRecursively(directory) {
    return readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
        const absolutePath = join(directory, entry.name);

        if (entry.isDirectory()) {
            return listFilesRecursively(absolutePath);
        }

        return [toPosixPath(relative(rootDirectory, absolutePath))];
    });
}

function listDirectories(directory) {
    return readdirSync(directory, { withFileTypes: true })
        .filter((entry) => entry.isDirectory())
        .map((entry) => entry.name)
        .sort();
}

function getPackedFiles() {
    const cacheDirectory = mkdtempSync(join(tmpdir(), "basics-npm-pack-"));

    try {
        const output = execFileSync(
            "npm",
            ["pack", "--dry-run", "--json", "--cache", cacheDirectory],
            {
                cwd: rootDirectory,
                encoding: "utf8",
            },
        );
        const [result] = JSON.parse(output);

        return new Set(result.files.map((file) => file.path));
    } finally {
        rmSync(cacheDirectory, { force: true, recursive: true });
    }
}

function resolveExport(specifier) {
    try {
        const resolvedPath = fileURLToPath(import.meta.resolve(specifier));
        return toPosixPath(relative(rootDirectory, resolvedPath));
    } catch (error) {
        return { error };
    }
}

const componentDirectoryName = "basic-components";
const componentDirectories = listDirectories(join(rootDirectory, componentDirectoryName));
const stylingFiles = listFilesRecursively(join(rootDirectory, "basic-styling"))
    .filter((path) => path.endsWith(".css") || path.endsWith(".json"))
    .sort();
const componentRuntimeFiles = componentDirectories.flatMap((directory) => [
    `${componentDirectoryName}/${directory}/index.js`,
    `${componentDirectoryName}/${directory}/index.d.ts`,
    `${componentDirectoryName}/${directory}/register.js`,
    `${componentDirectoryName}/${directory}/register.d.ts`,
]);

const expectedPackedFiles = new Set([
    "LICENSE",
    "README.md",
    "package.json",
    "index.js",
    "index.d.ts",
    ...stylingFiles,
    ...componentRuntimeFiles,
]);

const expectedSpecifiers = [
    packageName,
    `${packageName}/basic-styling`,
    `${packageName}/basic-styling/global.css`,
    `${packageName}/basic-styling/components.css`,
    ...stylingFiles
        .filter((path) => path !== "basic-styling/index.css" && path !== "basic-styling/global.css" && path !== "basic-styling/components.css")
        .map((path) => `${packageName}/${path}`),
    ...componentDirectories.flatMap((directory) => [
        `${packageName}/basic-components/${directory}`,
        `${packageName}/basic-components/${directory}/register`,
        `${packageName}/components/${directory}`,
        `${packageName}/components/${directory}/register`,
    ]),
];

function main() {
    const packedFiles = getPackedFiles();
    const failures = [];

    for (const filePath of [...expectedPackedFiles].sort()) {
        if (!packedFiles.has(filePath)) {
            failures.push(`Packed tarball is missing ${filePath}.`);
        }
    }

    for (const specifier of expectedSpecifiers) {
        const resolution = resolveExport(specifier);

        if (typeof resolution !== "string") {
            failures.push(`Could not resolve export ${specifier}: ${resolution.error.message}`);
            continue;
        }

        if (!packedFiles.has(resolution)) {
            failures.push(`Export ${specifier} resolves to ${resolution}, but that file is not in the packed tarball.`);
        }
    }

    if (failures.length > 0) {
        console.error("Package export check failed.");

        for (const failure of failures) {
            console.error(`- ${failure}`);
        }

        process.exit(1);
    }

    console.log(
        `Validated ${expectedSpecifiers.length} export subpath(s) and ${expectedPackedFiles.size} packed file(s).`,
    );
}

try {
    main();
} catch (error) {
    console.error(error.message);
    process.exit(1);
}
