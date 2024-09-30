const yaml = require("js-yaml");
const fs = require("fs");
const { createCanvas, loadImage } = require("canvas");
const sharp = require("sharp");
const path = require("path");

const landscapeFilePath = "landscape.yml";
const logosDirectory = "logos";
const toolingFilePath = "external_data/tooling-data.yaml";
const toolingsLogoDirectory = "external_data/logos";

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

    const existingLogoPath = path.join(
      toolingsLogoDirectory,
      tool.landscape?.logo || "json-schema-tooling-default.svg",
    );
    const uniqueLogoName =
      `${tool.name}_${uniqueIdentifier}_${toolingTypeTitle}`
        .replace(/[^\w\s-]/g, "")
        .replace(/\s+/g, "_")
        .toLowerCase()
        .concat(".png");
    const generatedLogoPath = path.join(logosDirectory, uniqueLogoName);
    generateLogo(tool.name, generatedLogoPath, existingLogoPath);

    if (!toolsByToolingType[toolingTypeTitle]) {
      toolsByToolingType[toolingTypeTitle] = [];
    }
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

async function generateLogo(toolName, generatedLogoPath, existingLogoPath) {
  const width = 300;
  const height = 150;
  const canvas = createCanvas(width, height);
  const ctx = canvas.getContext("2d");

  ctx.fillStyle = "#FFFFFF";
  ctx.fillRect(0, 0, width, height);

  let logoBuffer;

  if (fs.existsSync(existingLogoPath)) {
    logoBuffer = await processLogo(existingLogoPath);
  } else {
    console.error(`Logo not found for tool: ${toolName}.`);
  }

  const logoImg = await loadImage(logoBuffer);
  const logoHeight = (2 / 3) * height;
  const logoWidth = (logoImg.width / logoImg.height) * logoHeight;

  ctx.drawImage(logoImg, (width - logoWidth) / 2, 0, logoWidth, logoHeight);

  ctx.font = "bold 20px Arial";
  ctx.fillStyle = "#000000";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText(toolName, width / 2, logoHeight + (height - logoHeight) / 2);

  const buffer = canvas.toBuffer("image/png");
  fs.writeFileSync(generatedLogoPath, buffer);
}

async function processLogo(logoPath) {
  const ext = path.extname(logoPath).toLowerCase();
  if (ext === ".svg") {
    return await sharp(logoPath).png().toBuffer();
  } else if ([".png", ".jpg", ".jpeg"].includes(ext)) {
    return fs.readFileSync(logoPath);
  } else {
    console.error(`Unsupported logo format: ${ext}`);
    return fs.readFileSync(defaultLogo);
  }
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
