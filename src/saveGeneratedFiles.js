// storybook use only

const fs = require("fs");
const path = require("path");

function extractCodeBlock(text, fileName) {
  const escaped = fileName.replace(".", "\\.");
  const regex = new RegExp(
    `${escaped}\\s*\\n\`\`\`(?:javascript|js)?\\n([\\s\\S]*?)\\n\`\`\``,
    "i",
  );

  const match = text.match(regex);
  return match ? match[1].trim() : null;
}

function saveGeneratedFiles(text) {
  const outDir = path.join(process.cwd(), "generated-tests");

  if (!fs.existsSync(outDir)) {
    fs.mkdirSync(outDir, { recursive: true });
  }

  const pageObjectContent = extractCodeBlock(text, "RegistrationFormPage.js");
  const specFileContent = extractCodeBlock(text, "registrationForm.spec.js");

  if (!pageObjectContent && !specFileContent) {
    console.log("No parsable files found in LLM output.");
    console.log("\nRaw output was:\n");
    console.log(text);
    return;
  }

  if (pageObjectContent) {
    const pagePath = path.join(outDir, "RegistrationFormPage.js");
    fs.writeFileSync(pagePath, pageObjectContent, "utf8");
    console.log(`Saved: ${pagePath}`);
  } else {
    console.log("Could not parse RegistrationFormPage.js from model output.");
  }

  if (specFileContent) {
    const specPath = path.join(outDir, "registrationForm.spec.js");
    fs.writeFileSync(specPath, specFileContent, "utf8");
    console.log(`Saved: ${specPath}`);
  } else {
    console.log("Could not parse registrationForm.spec.js from model output.");
  }
}

module.exports = { saveGeneratedFiles };
