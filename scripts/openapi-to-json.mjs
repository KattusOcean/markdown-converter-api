import fs from "node:fs";
import yaml from "js-yaml";

const doc = yaml.load(fs.readFileSync("openapi/openapi.yaml", "utf8"));

fs.writeFileSync("openapi/openapi.json", `${JSON.stringify(doc, null, 2)}\n`);
