# Plugin Doctor for DSH

> Static check of an installed DSH profile: dependencies vs `node_modules`, bundle patch existence,
> duplicate patch ids/names. Local-only.

## Use

```bash
node bin/dsh-plugin-doctor.mjs --home ~/.dsh --profile web
node bin/dsh-plugin-doctor.mjs --json
```

In DSH:

```text
Use plugin_doctor with profile=web.
```

## Checks

- dependencies declared in the profile `package.json`
- installed `node_modules/<name>/package.json`
- each `dsh.bundle.patch` target
- duplicate `cordis.patch.yml` ids/names

## Limits

- No install/boot/runtime/network
- No pnpm workspace edge-case resolution
- Missing bundle patch is a warning: client-only/host plugins may be legitimate
- Not a repair tool

## Tests

```bash
npm test
```

## Provenance

A small independent profile inspector. License: MIT.
