import { readFile } from 'node:fs/promises'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { pluginDoctor, renderMarkdown } from '../src/doctor.mjs'
const PLUGIN_DIR = dirname(fileURLToPath(import.meta.url))
const SKILL_PATH = join(PLUGIN_DIR, '..', 'skills', 'plugin-doctor', 'SKILL.md')
const PROVIDER = 'dsh-plugin-doctor'
export const name = 'plugin-doctor'
export const inject = ['tools', 'skills']
function stripFrontmatter(text) { if (!text.startsWith('---\n')) return text; const end = text.indexOf('\n---\n', 4); return end === -1 ? text : text.slice(end + 5) }
const summary = { name: 'plugin-doctor', description: 'Check installed DSH profile dependencies, bundle patches, and duplicate patch ids/names. Local-only; no install/boot/network.', whenToUse: 'A profile has missing plugins, broken bundle patches, or duplicate patch rows.', invocation: { modelInvocable: true, userInvocable: true }, source: 'bundled', provider: PROVIDER, resourceBase: { kind: 'directory', path: join(PLUGIN_DIR, '..', 'skills', 'plugin-doctor') }, rank: 600, locator: 'plugin-doctor', metadata: { domain: 'maintenance', version: '0.1.0' } }
export function apply(ctx) {
  ctx.tools.register({ name: 'plugin_doctor', description: 'Statically inspect an installed DSH profile: declared dependencies vs node_modules, bundle patch existence, and duplicate patch ids/names. Does not install, boot, or use the network.', parameters: { type: 'object', additionalProperties: false, properties: { home: { type: 'string' }, profile: { type: 'string' } } }, output: { schema: { type: 'object', additionalProperties: false, properties: { markdown: { type: 'string' }, verdict: { type: 'string' }, plugins: { type: 'integer' }, issues: { type: 'integer' } }, required: ['markdown', 'verdict', 'plugins', 'issues'] }, render: (_a, v) => [{ type: 'text', text: v.markdown }] }, timeoutMs: 20_000, async execute(args = {}) { const r = await pluginDoctor({ home: args.home, profile: args.profile }); return { markdown: renderMarkdown(r), verdict: r.verdict, plugins: r.plugins.length, issues: r.issues.length } } })
  ctx.skills.registerProvider(() => ({ name: PROVIDER, async list() { return [summary] }, async get(c) { if (c?.name !== 'plugin-doctor') return undefined; return { ...summary, content: stripFrontmatter(await readFile(SKILL_PATH, 'utf8')) } } }))
}
