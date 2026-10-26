// Scnehaux UI — Figma plugin runtime (ADR-UIP-TKN-004 item 4; TDD tokens FG7-FG11).
// Applies PLAN, computed by scripts/figma/plan.mjs from the package's emitted tokens.
// It finds every asset by name and updates it in place, creates what is missing, and
// never deletes anything (item 4.6). Prepended by build.mjs: `const PLAN = {…};`.
/* global figma, PLAN */

async function ensureCollection(spec, existing, report) {
  let collection = existing.find((c) => c.name === spec.name);
  if (!collection) {
    collection = figma.variables.createVariableCollection(spec.name);
    report.collectionsCreated += 1;
  }
  // A new collection has one mode named "Mode 1": it becomes the first planned mode.
  const named = (name) => collection.modes.find((m) => m.name === name);
  if (!named(spec.modes[0]) && collection.modes.length === 1 && !spec.modes.includes(collection.modes[0].name)) {
    collection.renameMode(collection.modes[0].modeId, spec.modes[0]);
  }
  const modeIds = [];
  for (const name of spec.modes) {
    const mode = named(name);
    if (mode) {
      modeIds.push(mode.modeId);
      continue;
    }
    try {
      modeIds.push(collection.addMode(name));
    } catch (error) {
      // FG11: the plan limits modes (Starter allows one); skipped modes are reported, not faked.
      modeIds.push(null);
      report.modesSkipped.push(`${spec.name} · ${name}`);
    }
  }
  return { collection, modeIds };
}

async function applyVariables(plan, report) {
  const collections = await figma.variables.getLocalVariableCollectionsAsync();
  const all = await figma.variables.getLocalVariablesAsync();
  const byName = new Map();
  for (const spec of plan.collections) {
    const { collection, modeIds } = await ensureCollection(spec, collections, report);
    const existing = new Map(all.filter((v) => v.variableCollectionId === collection.id).map((v) => [v.name, v]));
    const planned = new Set(spec.variables.map((v) => v.name));
    for (const v of spec.variables) {
      let variable = existing.get(v.name);
      if (variable && variable.resolvedType !== v.type) {
        report.errors.push(`${v.name}: exists as ${variable.resolvedType}, planned ${v.type}; left unchanged`);
        continue;
      }
      if (!variable) {
        variable = figma.variables.createVariable(v.name, collection, v.type);
        report.variablesCreated += 1;
      } else {
        report.variablesUpdated += 1;
      }
      variable.scopes = v.scopes;
      variable.setVariableCodeSyntax("WEB", v.codeSyntax.WEB);
      variable.description = v.cssName;
      v.values.forEach((value, i) => {
        if (modeIds[i]) variable.setValueForMode(modeIds[i], value);
      });
      byName.set(v.name, variable);
    }
    for (const name of existing.keys()) if (!planned.has(name)) report.unplanned.push(`${spec.name} · ${name}`);
  }
  return byName;
}

async function applyTextStyles(plan, report) {
  const existing = await figma.getLocalTextStylesAsync();
  for (const spec of plan.textStyles) {
    const font = { family: spec.fontFamily, style: spec.fontStyle };
    try {
      await figma.loadFontAsync(font);
    } catch (error) {
      report.errors.push(`text style ${spec.name}: font ${font.family} ${font.style} is not available`);
      continue;
    }
    let style = existing.find((s) => s.name === spec.name);
    if (!style) {
      style = figma.createTextStyle();
      style.name = spec.name;
      report.textStylesCreated += 1;
    } else {
      report.textStylesUpdated += 1;
    }
    style.fontName = font;
    style.fontSize = spec.fontSize;
    style.lineHeight = spec.lineHeight;
    style.letterSpacing = spec.letterSpacing;
    style.description = spec.description;
  }
}

async function applyEffectStyles(plan, variables, report) {
  const existing = await figma.getLocalEffectStylesAsync();
  for (const spec of plan.effectStyles) {
    const effects = spec.effects.map((e) => {
      const base = { color: e.color, offset: e.offset, radius: e.radius, spread: e.spread, visible: true, blendMode: /** @type {BlendMode} */ ("NORMAL") };
      /** @type {Effect} */
      let effect = e.type === "DROP_SHADOW" ? { ...base, type: "DROP_SHADOW", showShadowBehindNode: false } : { ...base, type: "INNER_SHADOW" };
      const variable = variables.get(e.colorVariable);
      if (variable) effect = figma.variables.setBoundVariableForEffect(effect, "color", variable);
      else report.errors.push(`effect style ${spec.name}: color variable ${e.colorVariable} missing; value kept unbound`);
      return effect;
    });
    let style = existing.find((s) => s.name === spec.name);
    if (!style) {
      style = figma.createEffectStyle();
      style.name = spec.name;
      report.effectStylesCreated += 1;
    } else {
      report.effectStylesUpdated += 1;
    }
    style.effects = effects;
    style.description = spec.description;
  }
}

/**
 * FG12: the plan narrowed to one theme and mode, for a file whose Figma plan
 * holds one mode per collection (Starter): the color mode chosen, its theme's
 * dimension mode, and that theme's effect styles for the mode (or shared by
 * its modes). Text styles are shared by every theme.
 */
function narrow(plan, choice) {
  const pick = (spec, i) => ({ ...spec, modes: [spec.modes[i]], variables: spec.variables.map((v) => ({ ...v, values: [v.values[i]] })) });
  const [color, dimension] = plan.collections;
  return {
    ...plan,
    collections: [pick(color, choice.color), pick(dimension, choice.dimension)],
    effectStyles: plan.effectStyles.filter((s) => s.theme === choice.theme && (s.mode === null || s.mode === choice.mode)),
  };
}

async function run(plan) {
  const report = {
    source: plan.source,
    collectionsCreated: 0,
    variablesCreated: 0,
    variablesUpdated: 0,
    textStylesCreated: 0,
    textStylesUpdated: 0,
    effectStylesCreated: 0,
    effectStylesUpdated: 0,
    modesSkipped: [],
    unplanned: [],
    errors: [],
  };
  const variables = await applyVariables(plan, report);
  await applyTextStyles(plan, report);
  await applyEffectStyles(plan, variables, report);
  figma.ui.postMessage(report);
}

figma.showUI(__html__, { width: 420, height: 460, title: "Scnehaux UI", themeColors: true });
// The reader chooses every mode (a Figma plan with modes) or one theme and mode (Starter).
figma.ui.postMessage({ choices: PLAN.choices.map((c) => `${c.theme} ${c.mode}`) });
figma.ui.onmessage = (message) => {
  if (!message || message.apply === undefined) return;
  const plan = message.apply === "all" ? PLAN : narrow(PLAN, PLAN.choices[message.apply]);
  run(plan).catch((error) => figma.ui.postMessage({ fatal: String(error && error.message ? error.message : error) }));
};
