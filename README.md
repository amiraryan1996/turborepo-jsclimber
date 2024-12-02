# Turborepo-jsclimber

### Clear node_modules, .turbo, and .next recursively

```sh
pnpm -r exec rm -rf node_modules .next .turbo && pnpm exec rm -rf node_modules .next .turbo
```

### Install dependencies

```sh
pnpm install
```

### Build Applications

```sh
turbo run build
```

### Add ui components

Use the pre-made script:

```sh
pnpm ui add <component-name>
```

> This works just like the `shadcn/ui` CLI.

## Live Domains

You can see Jsclimber's turborepo at:

- [Blog](https://jsclimber.ir/)
- [Admin Panel](http://admin.jsclimber.ir/)
- [Document](http://docs.jsclimber.ir/)

## Useful Links

Learn more about the power of Turborepo:

- [Tasks](https://turbo.build/repo/docs/core-concepts/monorepos/running-tasks)
- [Filtering](https://turbo.build/repo/docs/core-concepts/monorepos/filtering)
- [Configuration Options](https://turbo.build/repo/docs/reference/configuration)
- [Pnpm Workspace](https://pnpm.io/workspaces)
- [Pnpm Remove](https://pnpm.io/cli/remove#options)
- [shadcn/ui](https://ui.shadcn.com/docs)
