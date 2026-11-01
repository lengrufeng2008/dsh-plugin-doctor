#!/usr/bin/env node
import { pluginDoctor, renderMarkdown } from '../src/doctor.mjs'
const args = process.argv.slice(2)
if (args.includes('--help') || args.includes('-h')) { console.log('dsh-plugin-doctor [--home DIR] [--profile NAME] [--json]\\n\\nCheck installed profile dependencies, bundle patches, and duplicate patch ids/names.'); process.exit(0) }
const value = (n) => { const i = args.indexOf(n); return i === -1 ? undefined : args[i + 1] }
try {
  const r = await pluginDoctor({ home: value('--home'), profile: value('--profile') })
  if (args.includes('--json')) console.log(JSON.stringify(r, null, 2))
  else console.log(renderMarkdown(r))
  process.exitCode = r.verdict === 'BLOCK' ? 1 : 0
} catch (error) { console.error(`dsh-plugin-doctor: ${error.message}`); process.exitCode = 2 }
