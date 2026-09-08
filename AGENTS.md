<!-- LOVABLE:BEGIN -->
> [!IMPORTANT]
> This project is connected to [Lovable](https://lovable.dev). Avoid rewriting
> published git history — force pushing, or rebasing/amending/squashing commits
> that are already pushed — as it rewrites history on Lovable's side and the
> user will likely lose their project history.
>
> Commits you push to the connected branch sync back to Lovable and show up in
> the editor, so keep the branch in a working state.
<!-- LOVABLE:END -->

The `portfolio-vercel` branch contains the standalone Next.js portfolio. Use Node.js 22.15+ and run `npm test`, `npm run typecheck`, and `npm run build` before release. Keep secrets in deployment environment variables. Do not add development fixture routes to the production source.
