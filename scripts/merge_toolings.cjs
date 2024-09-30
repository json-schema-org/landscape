const yaml = require("js-yaml");
const fs = require("fs");
const { createCanvas } = require("canvas");
const path = require("path");

const landscapeFilePath = "landscape.yml";
const toolingFilePath = "external_data/tooling-data.yaml";
const logosDirectory = "logos";

const landscapeData = loadYaml(landscapeFilePath);
const toolingData = loadYaml(toolingFilePath);

const landscapeTools = landscapeData.categories.filter(
  (category) => category.name === "Tools",
)[0];

landscapeTools.subcategories = [];

let toolsByToolingType = {};
toolingData.forEach((tool) => {
  const toolingTypes = tool.toolingTypes;
  toolingTypes.forEach((toolingType) => {
    const toolingTypeTitle = toTitleCase(toolingType);
    const uniqueIdentifier = extractUniqueIdentifier(
      tool.source || tool.homepage,
    );

    const uniqueLogoName = `${uniqueIdentifier}_${toolingTypeTitle.replace(/\s+/g, "_")}.png`;

    if (!toolsByToolingType[toolingTypeTitle]) {
      toolsByToolingType[toolingTypeTitle] = [];
    }

    const logoPath = path.join(logosDirectory, uniqueLogoName);
    generateLogo(tool.name, logoPath);

    toolsByToolingType[toolingTypeTitle].push({
      name: `${tool.name} (${uniqueIdentifier}) | ${toolingTypeTitle}`,
      homepage_url:
        tool.source || tool.homepage || "https://json-schema.org/tools",
      logo: uniqueLogoName,
      description: tool.description || `JSON Schema Tool: ${toolingTypeTitle}`,
    });
  });
});

Object.entries(toolsByToolingType).forEach(([subcategory, tools]) => {
  landscapeTools.subcategories.push({ name: subcategory, items: tools });
});

saveYaml(landscapeData, landscapeFilePath);

function generateLogo(text, filePath) {
  const width = 300;
  const height = 100;
  const canvas = createCanvas(width, height);
  const ctx = canvas.getContext("2d");

  ctx.fillStyle = "#FFFFFF";
  ctx.fillRect(0, 0, width, height);

  ctx.font = "bold 30px Arial";
  ctx.fillStyle = "#000000";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";

  ctx.fillText(text, width / 2, height / 2);

  const buffer = canvas.toBuffer("image/png");
  fs.writeFileSync(filePath, buffer);
}

function extractUniqueIdentifier(url) {
  if (!url) return "unknown";

  try {
    const domain = new URL(url).hostname;
    const parts = domain.split(".");

    // If it's a domain like github.com/user, we extract the username
    if (
      domain.includes("github.com") ||
      domain.includes("bitbucket.org") ||
      domain.includes("gitlab.com")
    ) {
      const username = url.split("/")[3];
      return username || domain; // If username not found, fallback to domain
    }

    // Otherwise, return the domain's second level (e.g., json-everything.net -> json-everything)
    return parts.length > 2 ? parts[parts.length - 2] : parts[0];
  } catch (e) {
    console.error("Failed to extract unique identifier from URL:", url, e);
    return "unknown";
  }
}

function loadYaml(filePath) {
  try {
    const fileContents = fs.readFileSync(filePath, "utf8");
    return yaml.load(fileContents);
  } catch (e) {
    console.error(`Failed to load YAML file: ${filePath}`, e);
    return null;
  }
}

function saveYaml(data, filePath) {
  try {
    let yamlStr = yaml.dump(data, {
      sortKeys: false,
      noRefs: true,
      indent: 2,
      lineWidth: -1, // Ensures that long lines are not broken
    });

    fs.writeFileSync(filePath, yamlStr, "utf8");
  } catch (e) {
    console.error(`Failed to save YAML file: ${filePath}`, e);
  }
}

function toTitleCase(str) {
  return str
    .split("-")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}
