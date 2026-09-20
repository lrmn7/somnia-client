import { execSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";

const REPO = process.env.GITHUB_REPOSITORY || "lrmn7/somnia-client";
const TOKEN = process.env.GITHUB_TOKEN;
const WIKI_DIR = path.resolve("wiki");

console.log(`Starting wiki sync for repository: ${REPO}...`);

// Ensure token or public clone
const cloneUrl = TOKEN
  ? `https://x-access-token:${TOKEN}@github.com/${REPO}.wiki.git`
  : `https://github.com/${REPO}.wiki.git`;

// Clean previous wiki dir if present
if (fs.existsSync(WIKI_DIR)) {
  fs.rmSync(WIKI_DIR, { recursive: true, force: true });
}

console.log("Cloning wiki repository...");
try {
  execSync(`git clone "${cloneUrl}" "${WIKI_DIR}"`, { stdio: "inherit" });
} catch (err) {
  console.error("\n=======================================================");
  console.error("❌ ERROR: Wiki repository not found on GitHub!");
  console.error(`Please open: https://github.com/${REPO}/wiki`);
  console.error("and click 'Create the first page' (save with title 'Home').");
  console.error("GitHub will only initialize the wiki repository after the first page is created.");
  console.error("=======================================================\n");
  process.exit(1);
}

// Copy documentation files with Wiki-friendly filenames
const docMappings = [
  { src: "docs/getting-started.md", dest: "Getting-Started.md" },
  { src: "docs/architecture.md", dest: "Architecture.md" },
  { src: "docs/configuration.md", dest: "Configuration.md" },
  { src: "docs/network.md", dest: "Network.md" },
  { src: "docs/security.md", dest: "Security.md" },
  { src: "docs/compatibility.md", dest: "Compatibility.md" },
  { src: "docs/limitations.md", dest: "Limitations.md" },
  { src: "docs/feature-support.md", dest: "Feature-Support.md" },
];

for (const { src, dest } of docMappings) {
  if (fs.existsSync(src)) {
    fs.copyFileSync(src, path.join(WIKI_DIR, dest));
    console.log(`Copied ${src} -> wiki/${dest}`);
  }
}

// Convert README.md to Home.md with Wiki-compatible page links
let readme = fs.readFileSync("README.md", "utf-8");
readme = readme.replace(/\.\/docs\/getting-started\.md/g, "Getting-Started");
readme = readme.replace(/\.\/docs\/architecture\.md/g, "Architecture");
readme = readme.replace(/\.\/docs\/configuration\.md/g, "Configuration");
readme = readme.replace(/\.\/docs\/network\.md/g, "Network");
readme = readme.replace(/\.\/docs\/security\.md/g, "Security");
readme = readme.replace(/\.\/docs\/compatibility\.md/g, "Compatibility");
readme = readme.replace(/\.\/docs\/limitations\.md/g, "Limitations");
readme = readme.replace(/\.\/docs\/feature-support\.md/g, "Feature-Support");
readme = readme.replace(/\.\/LICENSE/g, `https://github.com/${REPO}/blob/main/LICENSE`);
readme = readme.replace(/\.\/\.env\.example/g, `https://github.com/${REPO}/blob/main/.env.example`);

fs.writeFileSync(path.join(WIKI_DIR, "Home.md"), readme, "utf-8");
console.log("Generated wiki/Home.md from README.md");

// Generate _Sidebar.md
const sidebarContent = `### [somnia-client](Home)

**Getting Started**
* [Welcome / Home](Home)
* [Quick Start](Getting-Started)
* [Client Configuration](Configuration)

**Core & Network**
* [Network & Chains](Network)
* [Architecture & Patterns](Architecture)
* [Feature Support Matrix](Feature-Support)

**Reliability & Security**
* [Security Best Practices](Security)
* [Limitations & Boundaries](Limitations)
* [Compatibility Matrix](Compatibility)

---
**Links**
* [GitHub Repository](https://github.com/${REPO})
* [Issue Tracker](https://github.com/${REPO}/issues)
* [npm Package](https://www.npmjs.com/package/somnia-client)
`;

fs.writeFileSync(path.join(WIKI_DIR, "_Sidebar.md"), sidebarContent, "utf-8");
console.log("Generated wiki/_Sidebar.md");

// Generate _Footer.md
const footerContent = `---
*somnia-client — Discord-first client and abstraction layer for Somnia blockchain development.*  
[GitHub Repository](https://github.com/${REPO}) · [MIT License](https://github.com/${REPO}/blob/main/LICENSE)
`;

fs.writeFileSync(path.join(WIKI_DIR, "_Footer.md"), footerContent, "utf-8");
console.log("Generated wiki/_Footer.md");

// Commit and Push
console.log("Committing and pushing to wiki...");
execSync("git config user.name 'github-actions[bot]'", { cwd: WIKI_DIR });
execSync("git config user.email 'github-actions[bot]@users.noreply.github.com'", { cwd: WIKI_DIR });
execSync("git add .", { cwd: WIKI_DIR });

const status = execSync("git status --porcelain", { cwd: WIKI_DIR }).toString().trim();
if (!status) {
  console.log("No documentation changes. Wiki is already up-to-date.");
} else {
  execSync("git commit -m 'docs: auto-sync documentation from repository'", { cwd: WIKI_DIR });
  execSync("git push origin HEAD", { cwd: WIKI_DIR, stdio: "inherit" });
  console.log("✅ Successfully updated GitHub Wiki!");
}
