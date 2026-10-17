const { GoogleGenAI } = require("@google/genai");
const { z } = require("zod");
const { zodToJsonSchema } = require("zod-to-json-schema");
const puppeteer = require("puppeteer");
const fs = require("fs");
const path = require("path");

function findExecutableInDir(dir) {
    if (!dir || !fs.existsSync(dir)) return null;
    try {
        const entries = fs.readdirSync(dir, { withFileTypes: true });
        for (const entry of entries) {
            const fullPath = path.join(dir, entry.name);
            if (entry.isDirectory()) {
                const found = findExecutableInDir(fullPath);
                if (found) return found;
            } else if (
                entry.name === "chrome" ||
                entry.name === "chrome.exe" ||
                entry.name === "chromium" ||
                entry.name === "msedge.exe"
            ) {
                return fullPath;
            }
        }
    } catch {}
    return null;
}

function findBrowserExecutablePath() {
    // 1. Explicit path from environment (if set)
    if (process.env.PUPPETEER_EXECUTABLE_PATH && fs.existsSync(process.env.PUPPETEER_EXECUTABLE_PATH)) {
        return process.env.PUPPETEER_EXECUTABLE_PATH;
    }

    // 2. Windows system installations (Chrome, Edge)
    if (process.platform === "win32") {
        const winCandidates = [
            "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe",
            "C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe",
            process.env.LOCALAPPDATA ? path.join(process.env.LOCALAPPDATA, "Google\\Chrome\\Application\\chrome.exe") : null,
            "C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe",
            "C:\\Program Files\\Microsoft\\Edge\\Application\\msedge.exe",
            process.env.LOCALAPPDATA ? path.join(process.env.LOCALAPPDATA, "Microsoft\\Edge\\Application\\msedge.exe") : null,
        ].filter(Boolean);

        for (const p of winCandidates) {
            if (fs.existsSync(p)) return p;
        }
    }

    // 3. Linux system browser locations (Debian / Ubuntu / Docker)
    const linuxCandidates = [
        "/usr/bin/google-chrome-stable",
        "/usr/bin/google-chrome",
        "/usr/bin/chromium-browser",
        "/usr/bin/chromium",
    ];
    for (const p of linuxCandidates) {
        if (fs.existsSync(p)) return p;
    }

    // 4. Puppeteer's resolved executable path (if installed via CLI)
    try {
        const defaultPath = puppeteer.executablePath();
        if (defaultPath && fs.existsSync(defaultPath)) return defaultPath;
    } catch {}

    // 5. Persistent cache directories (Render / Cloud container deployments)
    const cacheDirectories = [
        process.env.PUPPETEER_CACHE_DIR,
        "/opt/render/.cache/puppeteer",
        "/opt/render/project/src/Backend/.cache/puppeteer",
        "/opt/render/project/src/.cache/puppeteer",
        path.join(__dirname, "../../.cache/puppeteer"),
        path.join(process.cwd(), ".cache/puppeteer"),
    ].filter(Boolean);

    for (const dir of cacheDirectories) {
        const found = findExecutableInDir(dir);
        if (found) return found;
    }

    return undefined;
}


function getAIClient() {
    const apiKey = process.env.GOOGLE_GENAI_API_KEY || process.env.GEMINI_API_KEY;
    if (!apiKey) {
        throw new Error("GOOGLE_GENAI_API_KEY is missing. Please set your Gemini API key in the .env file.");
    }
    return new GoogleGenAI({ apiKey });
}

const CANDIDATE_MODELS = [
    process.env.GEMINI_MODEL,
    "gemini-2.5-flash",
    "gemini-3.5-flash-lite",
    "gemini-3.6-flash",
    "gemini-3.7-flash",
    "gemini-flash-latest",
].filter(Boolean);

async function callGeminiWithFallback(generateFn) {
    let lastError = null;
    const modelsToTry = Array.from(new Set(CANDIDATE_MODELS));

    for (const model of modelsToTry) {
        for (let attempt = 1; attempt <= 2; attempt++) {
            try {
                return await generateFn(model);
            } catch (err) {
                lastError = err;
                const errStr = (err.message || "") + " " + (err.status || "");
                const isOverloaded =
                    err.status === 503 ||
                    err.code === 503 ||
                    errStr.includes("503") ||
                    errStr.includes("high demand") ||
                    errStr.includes("UNAVAILABLE");

                if (isOverloaded && attempt === 1) {
                    console.warn(`[AI Engine] ${model} reported high demand (503). Retrying in 1.5s...`);
                    await new Promise((res) => setTimeout(res, 1500));
                } else {
                    break;
                }
            }
        }
    }

    throw lastError || new Error("All AI models are currently at capacity. Please try again shortly.");
}

const interviewReportSchema = z.object({
    matchScore: z
        .number()
        .describe(
            "A score between 0 and 100 indicating how well the candidate's profile matches the job describe",
        ),
    technicalQuestions: z
        .array(
            z.object({
                question: z
                    .string()
                    .describe(
                        "The technical question can be asked in the interview",
                    ),
                intention: z
                    .string()
                    .describe(
                        "The intention of interviewer behind asking this question",
                    ),
                answer: z
                    .string()
                    .describe(
                        "How to answer this question, what points to cover, what approach to take etc.",
                    ),
            }),
        )
        .describe(
            "Technical questions that can be asked in the interview along with their intention and how to answer them",
        ),
    behavioralQuestions: z
        .array(
            z.object({
                question: z
                    .string()
                    .describe(
                        "The behavioral question can be asked in the interview",
                    ),
                intention: z
                    .string()
                    .describe(
                        "The intention of interviewer behind asking this question",
                    ),
                answer: z
                    .string()
                    .describe(
                        "How to answer this question, what points to cover, what approach to take etc.",
                    ),
            }),
        )
        .describe(
            "Behavioral questions that can be asked in the interview along with their intention and how to answer them",
        ),
    skillGaps: z
        .array(
            z.object({
                skill: z
                    .string()
                    .describe("The skill which the candidate is lacking"),
                severity: z
                    .enum(["low", "medium", "high"])
                    .describe(
                        "The severity of this skill gap, i.e. how important is this skill for the job and how much it can impact the candidate's chances",
                    ),
            }),
        )
        .describe(
            "List of skill gaps in the candidate's profile along with their severity",
        ),
    preparationPlan: z
        .array(
            z.object({
                day: z
                    .number()
                    .describe(
                        "The day number in the preparation plan, starting from 1",
                    ),
                focus: z
                    .string()
                    .describe(
                        "The main focus of this day in the preparation plan, e.g. data structures, system design, mock interviews etc.",
                    ),
                tasks: z
                    .array(z.string())
                    .describe(
                        "List of tasks to be done on this day to follow the preparation plan, e.g. read a specific book or article, solve a set of problems, watch a video etc.",
                    ),
            }),
        )
        .describe(
            "A day-wise preparation plan for the candidate to follow in order to prepare for the interview effectively",
        ),
    title: z
        .string()
        .describe(
            "The title of the job for which the interview report is generated",
        ),
});

async function generateInterviewReport({
    resume,
    selfDescription,
    jobDescription,
}) {
    const ai = getAIClient();
    const prompt = `Generate an interview report for a candidate with the following details:
                        Resume: ${resume || "Not provided"}
                        Self Description: ${selfDescription || "Not provided"}
                        Job Description: ${jobDescription}
`;

    return await callGeminiWithFallback(async (model) => {
        const response = await ai.models.generateContent({
            model,
            contents: prompt,
            config: {
                responseMimeType: "application/json",
                responseSchema: zodToJsonSchema(interviewReportSchema),
            },
        });
        return JSON.parse(response.text);
    });
}

async function generatePdfFromHtml(htmlContent) {
    const execPath = findBrowserExecutablePath();
    const launchOptions = {
        headless: true,
        args: [
            "--no-sandbox",
            "--disable-setuid-sandbox",
            "--disable-dev-shm-usage",
            "--disable-accelerated-2d-canvas",
            "--no-first-run",
            "--no-zygote",
            "--single-process",
            "--disable-gpu",
        ],
    };

    if (execPath) {
        launchOptions.executablePath = execPath;
    }

    let browser;
    try {
        browser = await puppeteer.launch(launchOptions);
    } catch (launchErr) {
        console.warn("Puppeteer failed to launch with specified executablePath:", execPath, launchErr.message);
        // Fallback: retry with default options if an explicit executablePath was tried
        if (launchOptions.executablePath) {
            delete launchOptions.executablePath;
            try {
                browser = await puppeteer.launch(launchOptions);
            } catch (fallbackErr) {
                throw new Error("Could not launch Chrome browser to generate PDF. " + (fallbackErr.message || launchErr.message));
            }
        } else {
            throw launchErr;
        }
    }

    try {
        const page = await browser.newPage();
        await page.setContent(htmlContent, {
            waitUntil: ["domcontentloaded", "load"],
            timeout: 30000,
        });

        const pdfBuffer = await page.pdf({
            format: "A4",
            printBackground: true,
            margin: {
                top: "15mm",
                bottom: "15mm",
                left: "15mm",
                right: "15mm",
            },
        });

        return pdfBuffer;
    } finally {
        await browser.close();
    }
}

async function generateResumePdf({ resume, selfDescription, jobDescription }) {
    const ai = getAIClient();
    const resumePdfSchema = z.object({
        html: z
            .string()
            .describe(
                "The HTML content of the resume which can be converted to PDF using any library like puppeteer",
            ),
    });

    const prompt = `Generate resume for a candidate with the following details:
                        Resume: ${resume || "Not provided"}
                        Self Description: ${selfDescription || "Not provided"}
                        Job Description: ${jobDescription}

                        the response should be a JSON object with a single field "html" which contains the HTML content of the resume which can be converted to PDF using any library like puppeteer.
                        The resume should be tailored for the given job description and should highlight the candidate's strengths and relevant experience. The HTML content should be well-formatted and structured, making it easy to read and visually appealing.
                        The content of resume should be not sound like it's generated by AI and should be as close as possible to a real human-written resume.
                        you can highlight the content using some colors or different font styles but the overall design should be simple and professional.
                        The content should be ATS friendly, i.e. it should be easily parsable by ATS systems without losing important information.
                        The resume should not be so lengthy, it should ideally be 1-2 pages long when converted to PDF. Focus on quality rather than quantity and make sure to include all the relevant information that can increase the candidate's chances of getting an interview call for the given job description.
                    `;

    const jsonContent = await callGeminiWithFallback(async (model) => {
        const response = await ai.models.generateContent({
            model,
            contents: prompt,
            config: {
                responseMimeType: "application/json",
                responseSchema: zodToJsonSchema(resumePdfSchema),
            },
        });
        return JSON.parse(response.text);
    });

    const pdfBuffer = await generatePdfFromHtml(jsonContent.html);

    return pdfBuffer;
}

module.exports = { generateInterviewReport, generateResumePdf };
