---
name: plugin-doctor
description: Static check of an installed DSH profile: missing dependencies, missing bundle patches, duplicate patch ids/names. Use plugin_doctor before reinstalling or editing a profile.
whenToUse: "Plugins are missing, a bundle patch is broken, or a profile has duplicate patch entries."
---

# Plugin doctor

```text
Use plugin_doctor with profile=web.
```

Checks:

- declared `package.json` dependencies exist in `node_modules`
- each installed package's `dsh.bundle.patch` exists
- duplicate `id`/`name` rows in `cordis.patch.yml`

## Limits

- Static only; no install, boot, runtime, or network.
- A missing `dsh.bundle.patch` may be legitimate for a client-only/host plugin (warning, not block).
- It does not resolve pnpm workspace edge cases or validate patch semantics.
