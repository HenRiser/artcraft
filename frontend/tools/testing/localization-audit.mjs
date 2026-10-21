// Offline catalog and protocol-boundary checks. No network or file writes.
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { execFileSync } from "node:child_process";
import ts from "typescript";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../../..");
const catalogPath = "frontend/libs/common/src/lib/i18n/";

function readCatalog(name) {
  const source = ts.createSourceFile(name, fs.readFileSync(path.join(root, catalogPath, name + ".ts"), "utf8"), ts.ScriptTarget.Latest, true);
  const values = {};
  function visit(node) {
    if (ts.isPropertyAssignment(node) && ts.isStringLiteral(node.name) && ts.isStringLiteral(node.initializer)) {
      assert(!(node.name.text in values), `Duplicate key: ${node.name.text}`);
      values[node.name.text] = node.initializer.text;
    }
    ts.forEachChild(node, visit);
  }
  visit(source);
  return values;
}

const en = readCatalog("en");
const zh = readCatalog("zh-CN");
assert.deepEqual(Object.keys(zh).sort(), Object.keys(en).sort());
for (const key of Object.keys(en)) {
  const parameters = (text) => [...text.matchAll(/\{(\w+)\}/g)].map((match) => match[1]).sort();
  assert(zh[key].trim(), `Empty translation: ${key}`);
  assert.deepEqual(parameters(zh[key]), parameters(en[key]), `Interpolation mismatch: ${key}`);
}

const files = execFileSync("git", ["ls-files", "--cached", "--others", "--exclude-standard", "--", "frontend"], { cwd: root, encoding: "utf8" })
  .trim().split("\n").filter((file) => /\.[jt]sx?$/.test(file) && !/\.(spec|test)\.|\/tools\/|\/i18n\/(en|zh-CN)\.ts$/.test(file));
let references = 0;
const violations = [];
for (const file of files) {
  const source = ts.createSourceFile(file, fs.readFileSync(path.join(root, file), "utf8"), ts.ScriptTarget.Latest, true, file.endsWith("x") ? ts.ScriptKind.TSX : ts.ScriptKind.TS);
  function visit(node) {
    if (ts.isCallExpression(node) && ["t", "uiText"].includes(node.expression.getText(source)) && node.arguments.length && ts.isStringLiteral(node.arguments[0])) {
      references++;
      assert(node.arguments[0].text in en, `${file}: unknown key ${node.arguments[0].text}`);
    }
    if (ts.isPropertyAssignment(node) && /^(id|key|type|kind|action|value|surface|preference|group|section)$/.test(node.name.getText(source)) && /\b(?:uiText|t)\(/.test(node.initializer.getText(source))) {
      violations.push(`${file}:${source.getLineAndCharacterOfPosition(node.getStart(source)).line + 1}`);
    }
    ts.forEachChild(node, visit);
  }
  visit(source);
}
assert.deepEqual(violations, [], "Translate display values, never protocol or grouping identifiers");

const originalContent = path.join(root, "frontend/libs/markdown-content/src/lib/content");
let translatedArticles = 0;
for (const kind of ["faq", "news", "tutorials"]) {
  for (const file of fs.readdirSync(path.join(originalContent, kind)).filter((name) => name.endsWith(".md"))) {
    assert(fs.existsSync(path.join(originalContent, "zh-CN", kind, file)), `Missing Chinese article: ${file}`);
    translatedArticles++;
  }
}
console.log(JSON.stringify({ keys: Object.keys(en).length, references, sourceFiles: files.length, translatedArticles, identifierViolations: violations.length }, null, 2));
