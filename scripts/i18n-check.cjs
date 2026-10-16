// i18n 覆盖层的两类静默失效检查（把它变成可重复运行的脚本，而不是一次性的人工核对）
//
// 1) anchor drift：中文侧改了 stat/headline/specs 的 label，英文侧 key 没跟着改
//    → applyEn 找不到 key 就静默回退中文，页面中英混排，tsc 完全不报错。
//    这是覆盖层架构最危险的失效模式：改了中文文案却没有任何提示。
// 2) narrative 长度不一致 → applyEn 整段丢弃英文叙事。
//
// 用法：node scripts/i18n-check.cjs
const fs = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '..');
const SUBDIRS = ['src/subjects/en'];

const SUBJECTS = ['iphone18', 'rubin', 'starship', 'mavic4', 'f35', 'porsche911', 'ps5', 'a7v', 'roadster'];

function read(p) {
  return fs.readFileSync(path.join(ROOT, p), 'utf8');
}

/** 括号配对取数组内容（不能用正则：中文侧 narrative 用反引号模板字符串） */
function arrBlock(src, key) {
  const i = src.indexOf(key);
  if (i < 0) return null;
  const start = src.indexOf('[', i);
  let d = 0, instr = null, x = start;
  while (x < src.length) {
    const c = src[x];
    if (instr) {
      if (c === '\\') { x += 2; continue; }
      if (c === instr) instr = null;
    } else {
      if (c === '"' || c === "'") instr = c;
      else if (c === '`') instr = '`';
      else if (c === '[') d++;
      else if (c === ']') { d--; if (d === 0) return src.slice(start + 1, x); }
    }
    x++;
  }
  return null;
}

/**
 * 直接求值出数组，拿运行时长度。
 * 之前用"数顶层逗号"的方式是错的：字符串字面量内部的逗号会被数进去，
 * 于是 narrative 里出现 ", " 就多算一个，误报 5 个主体不一致。
 * 嵌套结构唯一可靠的验证方式就是求值（不是模式匹配）。
 */
function countElements(src, key) {
  const block = arrBlock(src, key);
  if (block === null) return 0;
  try {
    // 元素可能含模板字符串插值；这里只求长度，把插值替换成空串即可
    const safe = block.replace(/\$\{[^}]*\}/g, "''");
    return new Function(`return [${safe}]`)().length;
  } catch {
    return -1; // 求值失败：说明语法有问题，调用方会报出来
  }
}

/** 中文主体里出现过的所有 label（anchor key 的全集） */
function cnAnchorKeys(src) {
  const keys = new Set();
  for (const m of src.matchAll(/\{\s*label:\s*'([^']+)'/g)) keys.add(m[1]);
  return keys;
}

/** 英文覆盖层里作为 key 出现的中文字符串 */
function enAnchorKeys(src) {
  const keys = new Set();
  // '中文key': 或 "中文key":
  for (const m of src.matchAll(/^\s{2,10}['"]([^'"]*)['"]\s*:/gm)) {
    if (/[\u4e00-\u9fff]/.test(m[1])) keys.add(m[1]);
  }
  return keys;
}

let problems = 0;

console.log('subject        anchor-drift  narrative');
for (const id of SUBJECTS) {
  const cnPath = `src/subjects/${id}.ts`;
  const enPath = `src/subjects/en/${id}.ts`;
  if (!fs.existsSync(path.join(ROOT, cnPath)) || !fs.existsSync(path.join(ROOT, enPath))) {
    console.log(`  (skip ${id} — missing file)`);
    continue;
  }
  const cn = read(cnPath);
  const en = read(enPath);

  const cnKeys = cnAnchorKeys(cn);
  const enKeys = enAnchorKeys(en);
  const drifted = [...enKeys].filter((k) => !cnKeys.has(k));

  const cnN = countElements(cn, 'narrative:');
  const enN = countElements(en, 'narrative:');
  const narrOk = cnN === enN;

  if (drifted.length) problems += drifted.length;
  if (!narrOk) problems++;

  const driftTag = drifted.length ? `${drifted.length}` : '0';
  console.log(
    `${drifted.length || narrOk ? 'OK ' : 'BAD'} ${id.padEnd(12)} ${driftTag.padStart(6)}      ${cnN}/${enN}${narrOk ? '' : '  MISMATCH'}`
  );
  for (const k of drifted) console.log(`      anchor not found in Chinese: ${k}`);
  if (!narrOk) console.log(`      narrative count differs — English narrative will be dropped by applyEn`);
}

console.log();
if (problems === 0) {
  console.log('PASS: no anchor drift, narrative lengths match across all subjects');
} else {
  console.log(`FAIL: ${problems} problem(s) — English overlay will silently fall back to Chinese`);
}
process.exit(problems ? 1 : 0);