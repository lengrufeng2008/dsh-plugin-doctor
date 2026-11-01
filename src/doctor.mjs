import { readFile, readdir, stat } from 'node:fs/promises'
import { join, resolve } from 'node:path'

async function readJson(path) { try { return JSON.parse(await readFile(path, 'utf8')) } catch { return undefined } }
function depPath(profile, name) { return join(profile, 'node_modules', ...name.split('/')) }
export async function pluginDoctor({ home = process.env.DSH_HOME || `${process.env.HOME}/.dsh`, profile = 'web' } = {}) {
  const base = resolve(home)
  const dir = join(base, 'profiles', profile)
  const issues = []
  const warnings = []
  const plugins = []
  const pkg = await readJson(join(dir, 'package.json'))
  if (!pkg) return { home: base, profile, issues: [`profile package.json not found: ${dir}`], warnings, plugins, verdict: 'BLOCK' }
  const deps = Object.keys(pkg.dependencies || {})
  for (const name of deps) {
    const pluginDir = depPath(dir, name)
    const pluginPkg = await readJson(join(pluginDir, 'package.json'))
    if (!pluginPkg) { issues.push(`dependency not installed: ${name}`); continue }
    const record = { name, version: pluginPkg.version || '', bundle: Boolean(pluginPkg.dsh?.bundle?.patch) }
    if (record.bundle) {
      const patch = join(pluginDir, pluginPkg.dsh.bundle.patch)
      if (!(await stat(patch).catch(() => null))) issues.push(`${name}: bundle patch missing: ${pluginPkg.dsh.bundle.patch}`)
    } else warnings.push(`${name}: no dsh.bundle.patch (may be a client-only/host plugin)`)
    plugins.push(record)
  }
  const patchPath = join(dir, 'cordis.patch.yml')
  const patchText = await readFile(patchPath, 'utf8').catch(() => '')
  if (!patchText) warnings.push('cordis.patch.yml not found/empty')
  const ids = [...patchText.matchAll(/^\s*-?\s*id:\s*['"]?([^'"\s#]+)/gm)].map((m) => m[1])
  const names = [...patchText.matchAll(/^\s*name:\s*['"]?([^'"\s#]+)/gm)].map((m) => m[1])
  const dup = (arr) => arr.filter((x, i) => arr.indexOf(x) !== i)
  for (const id of new Set(dup(ids))) issues.push(`duplicate patch id: ${id}`)
  for (const name of new Set(dup(names))) issues.push(`duplicate patch name: ${name}`)
  return { home: base, profile, plugins, patchIds: ids.length, issues, warnings, verdict: issues.length ? 'BLOCK' : warnings.length ? 'WARN' : 'PASS' }
}
export function renderMarkdown(r) {
  const lines = [`# Plugin doctor: ${r.verdict}`, '', `- profile: ${r.profile}`, `- plugins: ${r.plugins.length}`, '']
  for (const p of r.plugins) lines.push(`- ${p.name}@${p.version} ${p.bundle ? 'bundle' : 'no-bundle'}`)
  for (const i of r.issues) lines.push(`- BLOCK ${i}`)
  for (const w of r.warnings) lines.push(`- WARN ${w}`)
  if (!r.issues.length && !r.warnings.length) lines.push('No issues under these checks.')
  lines.push('', 'Static local checks only; no install, boot, network, or runtime test.')
  return lines.join('\n')
}
