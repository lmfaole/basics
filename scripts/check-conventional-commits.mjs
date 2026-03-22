#!/usr/bin/env node

import { execFileSync } from "node:child_process";

const conventionalCommitPattern =
    /^(build|chore|ci|docs|feat|fix|perf|refactor|revert|style|test)(\([^)]+\))?!?: .+/;
const ignoredPatterns = [/^Merge /, /^Revert "/];

function parseArgs(argv) {
    const options = {
        from: "",
        to: "",
        messages: [],
    };

    for (let index = 0; index < argv.length; index += 1) {
        const arg = argv[index];
        const next = argv[index + 1];

        if (arg === "--from" && next) {
            options.from = next;
            index += 1;
            continue;
        }

        if (arg === "--to" && next) {
            options.to = next;
            index += 1;
            continue;
        }

        if (arg === "--message" && next) {
            options.messages.push(next);
            index += 1;
            continue;
        }

        throw new Error(`Unknown or incomplete argument: ${arg}`);
    }

    return options;
}

function isZeroSha(value) {
    return Boolean(value) && /^0+$/.test(value);
}

function isConventionalCommit(message) {
    return (
        conventionalCommitPattern.test(message) ||
        ignoredPatterns.some((pattern) => pattern.test(message))
    );
}

function getCommitMessages(from, to) {
    if (!to) {
        return [];
    }

    const revisionRange = isZeroSha(from) ? [to] : [`${from}..${to}`];
    const output = execFileSync(
        "git",
        ["log", "--reverse", "--format=%H%x1f%s", ...revisionRange],
        { encoding: "utf8" }
    ).trim();

    if (!output) {
        return [];
    }

    return output
        .split("\n")
        .map((line) => line.split("\x1f"))
        .map(([hash, message]) => ({
            label: hash.slice(0, 7),
            message,
        }));
}

function main() {
    const { from, to, messages } = parseArgs(process.argv.slice(2));
    const candidates = [
        ...messages.map((message, index) => ({
            label: `message ${index + 1}`,
            message,
        })),
        ...getCommitMessages(from, to),
    ];

    if (candidates.length === 0) {
        throw new Error("Provide at least one --message or a --from/--to commit range.");
    }

    const failures = candidates.filter(
        ({ message }) => !isConventionalCommit(message)
    );

    if (failures.length > 0) {
        console.error("Conventional commit check failed.");
        console.error(
            "Expected: type(scope?): description with one of build, chore, ci, docs, feat, fix, perf, refactor, revert, style, or test."
        );

        for (const { label, message } of failures) {
            console.error(`- ${label}: ${message}`);
        }

        process.exit(1);
    }

    console.log(`Validated ${candidates.length} commit message(s).`);
}

try {
    main();
} catch (error) {
    console.error(error.message);
    process.exit(1);
}
