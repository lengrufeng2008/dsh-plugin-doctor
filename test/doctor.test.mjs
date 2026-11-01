import test from 'node:test'
import assert from 'node:assert/strict'
import { spawnSync } from 'node:child_process'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { pluginDoctor } from '../src/doctor.mjs'
import { apply } from '../plugin/index.js'
const ROOT = dirname(dirname(fileURLToPath(import.meta.url)))
test('finds duplicate ids and missing bundle patch warning', async () => {
  const r = await pluginDoctor({ home: join(ROOT, 'test/fixtures/home'), profile: 'web' })
  assert.equal(r.verdict, 'BLOCK')
  assert.ok(r.issues.some((i) => i.includes('duplicate patch id')))
  assert.ok(r.warnings.some((w) => w.includes('no dsh.bundle.patch')))
})
test('CLI exits 1 on BLOCK and plugin registers', async () => {
  const c = spawnSync(process.execPath, [join(ROOT, 'bin/dsh-plugin-doctor.mjs'), '--home', join(ROOT, 'test/fixtures/home'), '--json'], { encoding: 'utf8' })
  assert.equal(c.status, 1)
  assert.match(c.stdout, /BLOCK/)
  const tools = []; let factory
  apply({ tools: { register: (t) => tools.push(t) }, skills: { registerProvider: (fn) => { factory = fn } } })
  assert.equal(tools[0].name, 'plugin_doctor')
  const result = await tools[0].execute({ home: join(ROOT, 'test/fixtures/home'), profile: 'web' })
  assert.equal(result.verdict, 'BLOCK')
  assert.equal((await factory().list())[0].name, 'plugin-doctor')
})
