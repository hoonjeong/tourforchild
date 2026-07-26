#!/usr/bin/env node
/* Validates every data/raw/<id>.json against the TourForChild schema.
   Usage: node validate.js            */
const fs = require("fs"), path = require("path");
const RAW = path.join(__dirname, "data", "raw");
const master = JSON.parse(fs.readFileSync(path.join(__dirname, "data", "_master.json"), "utf8"));
const LANGS = ["ko", "en", "ja", "zh"];
let problems = 0, ok = 0, missing = [];

function isLangObj(o) { return o && typeof o === "object" && LANGS.every(l => typeof o[l] === "string" && o[l].trim()); }

for (const row of master.cities) {
  const p = path.join(RAW, row.id + ".json");
  if (!fs.existsSync(p)) { missing.push(row.id); continue; }
  let d, errs = [];
  try { d = JSON.parse(fs.readFileSync(p, "utf8")); }
  catch (e) { console.log("❌ " + row.id + ".json — INVALID JSON: " + e.message); problems++; continue; }

  if (d.country !== row.country) errs.push("country mismatch (" + d.country + " vs " + row.country + ")");
  if (!Array.isArray(d.coords) || d.coords.length !== 2) errs.push("coords");
  ["name", "tagline", "kidQuestion"].forEach(k => { if (!isLangObj(d[k])) errs.push(k); });
  if (!d.story || !LANGS.every(l => Array.isArray(d.story[l]))) errs.push("story arrays");
  else {
    const slen = d.story.en.length;
    if (slen < 3) errs.push("story < 3 paragraphs");
    if (!LANGS.every(l => d.story[l].length === slen)) errs.push("story length mismatch " + LANGS.map(l => d.story[l].length).join("/"));
    if (!LANGS.every(l => d.story[l].every(p => typeof p === "string" && p.trim()))) errs.push("story empty paragraph");
  }
  if (!d.funFacts || !LANGS.every(l => Array.isArray(d.funFacts[l]))) errs.push("funFacts arrays");
  else {
    const len = d.funFacts.en.length;
    if (len < 5) errs.push("funFacts < 5");
    if (!LANGS.every(l => d.funFacts[l].length === len)) errs.push("funFacts length mismatch " + LANGS.map(l => d.funFacts[l].length).join("/"));
  }
  if (!Array.isArray(d.places) || d.places.length < 2) errs.push("places<2");
  else d.places.forEach((pl, i) => {
    if (!isLangObj(pl.name)) errs.push("place[" + i + "].name");
    if (!isLangObj(pl.blurb)) errs.push("place[" + i + "].blurb");
    if (!Array.isArray(pl.coords) || pl.coords.length !== 2) errs.push("place[" + i + "].coords");
  });

  if (errs.length) { console.log("⚠️  " + row.id + " — " + errs.join(", ")); problems++; }
  else ok++;
}

console.log("\n================ VALIDATION ================");
console.log("valid   : " + ok + " / " + master.cities.length);
console.log("problems: " + problems);
console.log("missing : " + missing.length + (missing.length ? " -> " + missing.join(", ") : ""));
process.exit(problems ? 1 : 0);
