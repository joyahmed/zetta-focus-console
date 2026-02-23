# Implementation Plan - Privacy Policy Page (Orphaned Route)

The goal is to add a Privacy Policy page as an "orphaned route" (`/privacy-policy`). This page will be accessible via direct URL but will not be linked from the main application UI. This is primarily for use in the Android app/store listing.

## User Review Required

> [!NOTE]
> The Privacy Policy will be accessible at `/privacy-policy`.
> The main application logic (`useApp` hook, etc.) will NOT be initialized when visiting this route, ensuring a lightweight page load.

## Proposed Changes

### Components

#### [NEW] [PrivacyPolicy.tsx](file:///d:/04_TauriProjects/zetta-pomodoro-one/src/components/PrivacyPolicy.tsx)
- Create a standalone component that renders the content of `PRIVACY_POLICY.md`.
- Use basic styling consistent with the app (Tailwind typography/container).
- Ensure it's responsive for mobile viewing (Android app context).

### Routing & Entry Point

#### [MODIFY] [App.tsx](file:///d:/04_TauriProjects/zetta-pomodoro-one/src/App.tsx)
- **Refactor**: Rename the existing `App` component to `PomodoroApp` (or similar internal name).
- **New App Component**: Create a new `App` component that serves as a basic router.
  - Check `window.location.pathname`.
  - If path is `/privacy-policy`, render `<PrivacyPolicy />`.
  - Otherwise, render `<PomodoroApp />`.
- This avoids unnecessary hook initialization for the static page.

## Verification Plan

### Manual Verification
1.  **Main App**: Verify the root URL (`/`) still loads the main Pomodoro application correctly.
2.  **Privacy Policy**: Navigate manually to `/privacy-policy` in the browser URL bar.
3.  **Content Check**: Verify the Privacy Policy content is rendered and styled correctly.
4.  **No Errors**: Check console for any errors during navigation or rendering.
