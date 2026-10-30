import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import fs from "node:fs";
import path from "node:path";
import { createRequire } from "node:module";
import { fileURLToPath } from "node:url";
import test from "node:test";

const require = createRequire(import.meta.url);
const ts = require("typescript");
const postcss = require("postcss");
const localFontLoader = require("next/dist/compiled/@next/font/dist/local/loader").default;
const fontCssPlugin = require("next/dist/build/webpack/loaders/next-font-loader/postcss-next-font").default;
const webRoot = fileURLToPath(new URL("../", import.meta.url));
const fontsRoot = path.join(webRoot, "fonts");
const manifest = JSON.parse(fs.readFileSync(path.join(fontsRoot, "manifest.json"), "utf8"));

function sourceFiles(directory) {
  return fs.readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    const filename = path.join(directory, entry.name);
    if (entry.isDirectory()) return sourceFiles(filename);
    return /\.[cm]?[jt]sx?$/.test(entry.name) ? [filename] : [];
  });
}

const files = ["app", "components"].flatMap((name) => sourceFiles(path.join(webRoot, name)));

function literalValue(node) {
  if (ts.isStringLiteral(node)) return node.text;
  if (ts.isArrayLiteralExpression(node)) return node.elements.map(literalValue);
  if (ts.isObjectLiteralExpression(node)) {
    return Object.fromEntries(node.properties.map((property) => {
      assert.ok(ts.isPropertyAssignment(property), "Font options must remain literal declarations");
      return [property.name.text, literalValue(property.initializer)];
    }));
  }
  if (node.kind === ts.SyntaxKind.TrueKeyword) return true;
  if (node.kind === ts.SyntaxKind.FalseKeyword) return false;
  assert.fail(`Unsupported font option: ${node.getText()}`);
}

function configuredFonts(filename) {
  const source = ts.createSourceFile(filename, fs.readFileSync(filename, "utf8"), ts.ScriptTarget.Latest, true);
  const fonts = [];
  function visit(node) {
    if (ts.isVariableDeclaration(node) && node.initializer && ts.isCallExpression(node.initializer)
      && node.initializer.expression.getText(source) === "localFont") {
      fonts.push({ name: node.name.getText(source), options: literalValue(node.initializer.arguments[0]) });
    }
    ts.forEachChild(node, visit);
  }
  visit(source);
  return fonts;
}

test("website font imports never require the Google Fonts network loader", () => {
  for (const filename of files) {
    const source = ts.createSourceFile(filename, fs.readFileSync(filename, "utf8"), ts.ScriptTarget.Latest, true);
    for (const statement of source.statements) {
      if (ts.isImportDeclaration(statement)) {
        assert.notEqual(statement.moduleSpecifier.text, "next/font/google", path.relative(webRoot, filename));
      }
    }
  }
});

test("vendored full-coverage fonts and original licenses match the pinned manifest", () => {
  assert.match(manifest.sourceRevision, /^[a-f\d]{40}$/);
  assert.equal(manifest.conversion.subsetting, false);
  const digest = (buffer) => createHash("sha256").update(buffer).digest("hex");
  for (const family of manifest.families) {
    const license = fs.readFileSync(path.join(fontsRoot, family.license.file));
    assert.equal(digest(license), family.license.sha256, family.name);
    assert.match(license.toString(), /SIL OPEN FONT LICENSE Version 1\.1/);
    for (const font of family.files) {
      const buffer = fs.readFileSync(path.join(fontsRoot, font.file));
      assert.equal(buffer.toString("ascii", 0, 4), "wOF2", font.file);
      assert.equal(buffer.readUInt32BE(8), buffer.length, font.file);
      assert.equal(buffer.length, font.bytes, font.file);
      assert.equal(digest(buffer), font.sha256, font.file);
      assert.ok(font.glyphCount > 100 && font.mappedCharacters > 100, font.file);
      assert.ok(font.source.startsWith(`https://raw.githubusercontent.com/google/fonts/${manifest.sourceRevision}/ofl/`));
    }
  }
});

test("local font options and the installed loader retain named families, styles, weights, and variables", async () => {
  const verifiedFamilies = new Set();
  const verifiedVariables = new Set();
  for (const filename of files) {
    for (const { name, options } of configuredFonts(filename)) {
      const expectedFamily = options.declarations?.find(({ prop }) => prop === "font-family")?.value;
      if (!expectedFamily) continue; // The already-local archived Anton page is unchanged.
      assert.equal(options.fallback?.[0], expectedFamily, `${filename}: the real face must be the first fallback`);
      assert.equal(options.adjustFontFallback, false, `${filename}: a synthetic face must not shadow the real fallback`);
      verifiedFamilies.add(expectedFamily);
      const loaded = await localFontLoader({
        functionName: "",
        variableName: name,
        data: [options],
        emitFontFile: (_buffer, extension) => `/font-test/${name}.${extension}`,
        resolve: async (relative) => {
          const resolved = path.resolve(path.dirname(filename), relative);
          assert.ok(resolved.startsWith(`${fontsRoot}${path.sep}`), resolved);
          return resolved;
        },
        loaderContext: { fs },
      });
      const exports = [];
      const result = await postcss([fontCssPlugin({ ...loaded, exports })]).process(loaded.css, { from: undefined });
      const actualFaces = [];
      result.root.walkAtRules("font-face", (rule) => {
        const values = Object.fromEntries(rule.nodes.map(({ prop, value }) => [prop, value]));
        if (!values.src.startsWith("local(")) actualFaces.push(values);
      });
      assert.equal(actualFaces.length, options.src.length, filename);
      actualFaces.forEach((face, index) => {
        assert.equal(face["font-family"], `'${expectedFamily}'`, filename);
        assert.equal(face["font-weight"], options.src[index].weight, filename);
        assert.equal(face["font-style"], options.src[index].style, filename);
        assert.equal(face["font-display"], "swap", filename);
      });
      assert.ok(exports.find(({ name }) => name === "style").value.fontFamily.includes(`'${expectedFamily}'`));
      if (options.variable) {
        verifiedVariables.add(options.variable);
        let found = false;
        result.root.walkDecls(options.variable, (declaration) => {
          assert.ok(declaration.value.includes(`'${expectedFamily}'`));
          found = true;
        });
        assert.ok(found, options.variable);
      }
    }
  }
  assert.deepEqual([...verifiedFamilies].sort(), manifest.families.map(({ name }) => name).sort());
  assert.deepEqual([...verifiedVariables].sort(), ["--bmc-body", "--bmc-display", "--ppc-body", "--ppc-display", "--studio-body", "--studio-display"]);
});

const exportRoot = process.env.FONT_EXPORT_DIR
  ? path.resolve(process.env.FONT_EXPORT_DIR)
  : path.join(webRoot, "out");

test("actual exported font classes and variables resolve to the intended local font faces", {
  skip: !process.env.FONT_EXPORT_DIR && !fs.existsSync(exportRoot),
}, () => {
  assert.ok(fs.existsSync(exportRoot), `Missing export directory: ${exportRoot}`);
  function cssFiles(directory) {
    return fs.readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
      const filename = path.join(directory, entry.name);
      if (entry.isDirectory()) return cssFiles(filename);
      return entry.name.endsWith(".css") ? [filename] : [];
    });
  }
  const exportedCss = cssFiles(path.join(exportRoot, "_next"));
  assert.ok(exportedCss.length > 0, "Build the default production export before this check");
  const roots = exportedCss.map((filename) => postcss.parse(fs.readFileSync(filename, "utf8"), { from: filename }));
  const families = new Map();
  const normalizeFamily = (value) => value.trim().replace(/^(['"])(.*)\1$/, "$2");
  const familyList = (value) => postcss.list.comma(value).map(normalizeFamily);
  for (const root of roots) {
    root.walkAtRules("font-face", (rule) => {
      const face = Object.fromEntries(rule.nodes.map(({ prop, value }) => [prop, value]));
      const family = normalizeFamily(face["font-family"]);
      const faces = families.get(family) ?? [];
      faces.push(face);
      families.set(family, faces);
    });
  }

  const expectedNames = new Map();
  const expectedVariables = new Map();
  for (const filename of files) {
    for (const { name, options } of configuredFonts(filename)) {
      const family = options.declarations?.find(({ prop }) => prop === "font-family")?.value;
      if (!family) continue;
      const names = expectedNames.get(name) ?? new Set();
      names.add(family);
      expectedNames.set(name, names);
      if (options.variable) expectedVariables.set(options.variable, family);
    }
  }

  function firstAvailableFace(value, context) {
    const names = familyList(value);
    const first = names.find((name) => families.has(name));
    assert.ok(first, `${context}: no emitted font face matches ${value}`);
    assert.ok(families.get(first).every(({ src }) => !/^local\(/.test(src)),
      `${context}: ${first} shadows the actual webfont with a system fallback`);
    return first;
  }

  const checkedFamilies = new Set();
  const checkedVariables = new Set();
  for (const root of roots) {
    root.walkRules((rule) => {
      for (const declaration of rule.nodes.filter((node) => node.type === "decl")) {
        const expectedVariableFamily = expectedVariables.get(declaration.prop);
        if (expectedVariableFamily) {
          assert.equal(firstAvailableFace(declaration.value, declaration.prop), expectedVariableFamily);
          checkedVariables.add(declaration.prop);
        }
        if (declaration.prop !== "font-family" || !rule.selector.includes("className")) continue;
        const names = familyList(declaration.value);
        const allowedFamilies = expectedNames.get(names[0]);
        // Turbopack uses the JS declaration name; Webpack uses the actual family.
        const expectedFamily = manifest.families.find(({ name }) => name === names[0])?.name;
        if (!allowedFamilies && !expectedFamily) continue;
        const first = firstAvailableFace(declaration.value, rule.selector);
        assert.ok(expectedFamily === first || allowedFamilies?.has(first),
          `${rule.selector}: ${declaration.value} resolves to the wrong family`);
        checkedFamilies.add(first);
      }
    });
  }
  assert.deepEqual([...checkedFamilies].sort(), manifest.families.map(({ name }) => name).sort());
  assert.deepEqual([...checkedVariables].sort(), [...expectedVariables.keys()].sort());
});
