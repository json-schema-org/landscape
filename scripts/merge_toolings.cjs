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
  const width = 500;
  const height = 500;
  const canvas = createCanvas(width, height);
  const ctx = canvas.getContext("2d");

  ctx.fillStyle = "#FFFFFF";
  ctx.fillRect(0, 0, width, height);

  if (!fs.existsSync(existingLogoPath)) {
    console.error(`Logo not found for tool: ${toolName}.`);
    return;
  }

  const logoBuffer = await processLogo(existingLogoPath);
  const logoImg = await loadImage(logoBuffer);

  const maxLogoHeight = (3 / 5) * height;
  const maxLogoWidth = width * 0.9;

  let logoWidth = logoImg.width;
  let logoHeight = logoImg.height;

  if (logoWidth > maxLogoWidth || logoHeight > maxLogoHeight) {
    const scaleRatio = Math.min(
      maxLogoWidth / logoWidth,
      maxLogoHeight / logoHeight,
    );
    logoWidth *= scaleRatio;
    logoHeight *= scaleRatio;
  }

  ctx.drawImage(
    logoImg,
    (width - logoWidth) / 2,
    (maxLogoHeight - logoHeight) / 2,
    logoWidth,
    logoHeight,
  );

  ctx.font = "bold 54px Arial";
  ctx.fillStyle = "#000000";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";

  const maxTextWidth = width * 0.95;
  const words = toolName.split(" ");
  let lines = [];
  let currentLine = "";

  words.forEach((word) => {
    const testLine = currentLine + (currentLine ? " " : "") + word;
    if (ctx.measureText(testLine).width > maxTextWidth) {
      lines.push(currentLine);
      currentLine = word;
    } else {
      currentLine = testLine;
    }
  });
  if (currentLine) lines.push(currentLine);

  lines = lines.flatMap((line) => {
    if (ctx.measureText(line).width > maxTextWidth) {
      const chars = line.split("");
      let newLines = [];
      let subLine = "";
      chars.forEach((char) => {
        const testSubLine = subLine + char;
        if (ctx.measureText(testSubLine).width > maxTextWidth) {
          newLines.push(subLine);
          subLine = char;
        } else {
          subLine = testSubLine;
        }
      });
      if (subLine) newLines.push(subLine);
      return newLines;
    } else {
      return [line];
    }
  });

  const totalTextHeight = lines.length * 65;
  const textStartY =
    maxLogoHeight + ((2 / 5) * height) / 2 - totalTextHeight / 2;

  lines.forEach((line, index) => {
    ctx.fillText(line, width / 2, textStartY + index * 65);
  });

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
