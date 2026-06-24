# AI Guidelines

Use this file as the first context document for future AI work. It is intentionally short so models do not need the whole repository pasted into chat.

## Product Snapshot

- Exodia Operations is a private operations portal for authenticated users.
- Stack: Vite, React, Tailwind CSS v4, React Router, Supabase Auth.
- Primary routes:
  - `/login`: email/password sign-in with a short welcome splash.
  - `/`: protected dashboard shell with Dashboard and Players tabs.
- Current state: early authenticated shell. Dashboard metrics and Players are placeholders.

## Source Map

- `src/App.jsx`: route tree and auth provider wrapper.
- `src/lib/AuthContext.jsx`: Supabase session loading and auth actions.
- `src/lib/supabase.js`: Supabase client from `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY`.
- `src/components/ProtectedRoute.jsx`: loading state and login redirect.
- `src/components/WelcomeSplash.jsx`: post-login splash.
- `src/pages/Login.jsx`: login UI and submit behavior.
- `src/pages/Dashboard.jsx`: protected operations dashboard UI.
- `src/index.css`: Tailwind import and global smoothing only.

## Commands

Run these before handing work back:

```powershell
npm run lint
npm run build
```

Use this after verified changes when the user wants the work pushed:

```powershell
npm run ai:push -- --message "Describe the change" --paths AI_GUIDELINES.md,scripts/ai-push.mjs,package.json
```

Use `-All` only when you have reviewed `git status --short` and every changed file belongs in the commit:

```powershell
npm run ai:push -- --message "Describe the change" --all
```

## Implementation Rules

- Keep this as an internal operations tool, not a marketing site.
- Prefer compact, information-dense UI over large hero sections or decorative layouts.
- Preserve the brand palette unless the user asks for a redesign:
  - near-black `#1B1A1C`
  - orange `#FF5900`
  - gray `#CACDD7`
  - text gray `#3E4048`
- Use Tailwind classes inline, matching the current style.
- Keep cards modest and functional. Avoid nested cards.
- Keep auth-related behavior in `src/lib` and route protection in `ProtectedRoute`.
- Do not add new dependencies unless they remove meaningful complexity.
- Do not hard-code Supabase secrets. Use Vite env vars only.
- If changing auth, test signed-out redirect, loading state, failed login, and successful login path.

## Known Gaps

- No graceful UI when Supabase env vars are missing or invalid.
- No user roles or authorization beyond "signed in".
- Dashboard metrics are static placeholders.
- Players tab is placeholder content.
- README is still the default Vite template and should be replaced with project-specific docs.
- No automated tests yet; lint and build are the only verification checks.

## Token-Saving Protocol

When asking another AI model to work on this repo, paste only:

1. The user request.
2. This file.
3. The specific files likely affected by the task.
4. Any relevant error output.

Avoid pasting `package-lock.json`, generated folders, screenshots, or full source trees unless the task directly needs them.
