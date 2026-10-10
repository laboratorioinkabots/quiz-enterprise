# Styles structure

This folder was split from the original `src/index.css`.

## Import

In `src/main.jsx`, replace the old import:

```jsx
import './index.css'
```

with:

```jsx
import './styles/index.css'
```

Do not import the old `src/index.css` at the same time.

## Structure

- `base.css`: global reset/base rules.
- `auth/`: Login/Register styles.
- `platform/`: courses, exam, results and history.
- `admin/`: admin shell and feature-specific styles.
- `public/`: landing page styles.

The public header rules were consolidated to remove the duplicate header definitions that existed near the end of the original CSS.
