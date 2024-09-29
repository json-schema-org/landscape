const yaml = require("js-yaml");
const fs = require("fs");

const landscapeFilePath = "landscape.yml";
const toolingFilePath = "external_data/tooling-data.yaml";

const landscapeData = loadYaml(landscapeFilePath);
const toolingData = loadYaml(toolingFilePath);

const landscapeTools = landscapeData.categories.filter(
  (category) => category.name === "Tools",
)[0];

landscapeTools.subcategories = [];

let toolsByToolingType = {};
let counter = 0;
toolingData.forEach((tool) => {
  const toolingTypes = tool.toolingTypes;
  toolingTypes.forEach((toolingType) => {
    const toolingTypeTitle = toTitleCase(toolingType);
    if (!toolsByToolingType[toolingTypeTitle]) {
      toolsByToolingType[toolingTypeTitle] = [];
    }
    toolsByToolingType[toolingTypeTitle].push({
      name: `${tool.name}${counter} | ${toolingTypeTitle}`,
      homepage_url: "https://json-schema.org/tools",
      logo: "tooling.svg",
      description: tool.description || `JSON Schema Tool: ${toolingTypeTitle}`,
    });
    counter++;
  });
});

Object.entries(toolsByToolingType).forEach(([subcategory, tools]) => {
  landscapeTools.subcategories.push({ name: subcategory, items: tools });
});

saveYaml(landscapeData, landscapeFilePath);

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
