#!/usr/bin/env node

const DEFAULT_BASE_URL =
    process.env.QUIZ_BASE_URL ||
    "https://devapigw.vidalhealthtpa.com/srm-quiz-task";
const DEFAULT_REG_NO = process.env.REG_NO || "2024CS101";
const POLL_COUNT = 10;
const DELAY_MS = 5000;

const USAGE = `Quiz Validator Client

Usage:
  pnpm quiz:poll -- --regNo 2024CS101 [--submit] [--baseUrl https://...]

Options:
  --regNo <id>     Registration number (default: 2024CS101)
  --baseUrl <url>  API base URL
  --submit         Submit leaderboard once after polling
  -h, --help       Show help
`;

function printUsage() {
    console.log(USAGE);
}

function parseArgs(args) {
    const options = {
        regNo: DEFAULT_REG_NO,
        baseUrl: DEFAULT_BASE_URL,
        submit: false,
        help: false,
    };

    for (let i = 0; i < args.length; i += 1) {
        const arg = args[i];

        if (arg === "-h" || arg === "--help") {
            options.help = true;
            continue;
        }

        if (arg === "--submit") {
            options.submit = true;
            continue;
        }

        if (arg === "--regNo") {
            options.regNo = args[i + 1];
            i += 1;
            continue;
        }

        if (arg.startsWith("--regNo=")) {
            options.regNo = arg.split("=")[1];
            continue;
        }

        if (arg === "--baseUrl") {
            options.baseUrl = args[i + 1];
            i += 1;
            continue;
        }

        if (arg.startsWith("--baseUrl=")) {
            options.baseUrl = arg.split("=")[1];
            continue;
        }

        throw new Error(`Unknown argument: ${arg}`);
    }

    return options;
}

function sleep(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
}

function buildUrl(baseUrl, path, params) {
    const normalizedBase = baseUrl.endsWith("/") ? baseUrl : `${baseUrl}/`;
    const url = new URL(path.replace(/^\//, ""), normalizedBase);

    if (params) {
        for (const [key, value] of Object.entries(params)) {
            url.searchParams.set(key, String(value));
        }
    }

    return url.toString();
}

async function fetchJson(url, options = {}) {
    const response = await fetch(url, options);
    const text = await response.text();
    let data = null;

    if (text) {
        try {
            data = JSON.parse(text);
        } catch (error) {
            throw new Error(`Invalid JSON response from ${url}: ${text}`);
        }
    }

    if (!response.ok) {
        const message = data && data.message ? data.message : text;
        throw new Error(
            `Request failed (${response.status} ${response.statusText}) for ${url}: ${message}`
        );
    }

    return data;
}

function buildLeaderboard(totals) {
    return Array.from(totals.entries())
        .map(([participant, totalScore]) => ({ participant, totalScore }))
        .sort((a, b) => {
            if (b.totalScore !== a.totalScore) {
                return b.totalScore - a.totalScore;
            }
            return a.participant.localeCompare(b.participant);
        });
}

async function main() {
    const options = parseArgs(process.argv.slice(2));

    if (options.help) {
        printUsage();
        return;
    }

    if (!options.regNo) {
        throw new Error("Missing regNo. Use --regNo or REG_NO env var.");
    }

    console.log(`Reg No: ${options.regNo}`);
    console.log(`Base URL: ${options.baseUrl}`);
    console.log(
        `Polling ${POLL_COUNT} times with ${DELAY_MS}ms delay between requests.`
    );

    const seen = new Set();
    const totals = new Map();
    let duplicateCount = 0;

    for (let poll = 0; poll < POLL_COUNT; poll += 1) {
        const url = buildUrl(options.baseUrl, "quiz/messages", {
            regNo: options.regNo,
            poll,
        });

        const payload = await fetchJson(url);

        if (!payload || !Array.isArray(payload.events)) {
            throw new Error(
                `Invalid response for poll ${poll}: missing events array.`
            );
        }

        let accepted = 0;

        for (const event of payload.events) {
            const roundId = String(event.roundId || "");
            const participant = String(event.participant || "");
            const score = Number(event.score);

            if (!roundId || !participant || !Number.isFinite(score)) {
                continue;
            }

            const key = `${roundId}::${participant}`;

            if (seen.has(key)) {
                duplicateCount += 1;
                continue;
            }

            seen.add(key);
            const prevScore = totals.get(participant) || 0;
            totals.set(participant, prevScore + score);
            accepted += 1;
        }

        console.log(
            `Poll ${poll}: ${payload.events.length} events, ${accepted} new, ${duplicateCount} duplicates total.`
        );

        if (poll < POLL_COUNT - 1) {
            await sleep(DELAY_MS);
        }
    }

    const leaderboard = buildLeaderboard(totals);

    if (leaderboard.length === 0) {
        throw new Error("No scores collected; leaderboard is empty.");
    }

    const totalScore = leaderboard.reduce(
        (sum, entry) => sum + entry.totalScore,
        0
    );

    console.log("Leaderboard:");
    console.table(leaderboard);
    console.log(`Total score: ${totalScore}`);

    if (!options.submit) {
        console.log("Dry run: submission skipped. Use --submit to POST results.");
        return;
    }

    const submitUrl = buildUrl(options.baseUrl, "quiz/submit");
    const submitPayload = {
        regNo: options.regNo,
        leaderboard,
    };

    const submitResponse = await fetchJson(submitUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(submitPayload),
    });

    console.log("Submit response:");
    console.log(JSON.stringify(submitResponse, null, 2));
}

main().catch((error) => {
    console.error(error.message);
    process.exitCode = 1;
});
