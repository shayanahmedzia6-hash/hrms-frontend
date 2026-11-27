# Working rules for the HRMS frontend

- Keep each feature under its own route and small reusable components in `src/components`.
- The ONLY brand/light/dark color definitions live in `src/styles/tokens.css`; do not hardcode new hex colors anywhere else.
- Keep the web app responsive and usable on mobile screens. There is no separate mobile app.
- Use the same routes and component structure for all roles. Role permissions determine access; never clone pages per role.
- Navigation visibility is only visual; never treat it as backend authorization.
- Never display fake financial or employee data as though it came from MongoDB.
- Prefer readable TypeScript and one responsibility per component. No giant catch-all file.
- Run `npm run lint` and `npm run build` before shipping.
