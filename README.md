# project-team

repository for a tutor matching system.

## Roles

The platform has three separate account types, each with its own dashboard:

- **Student** — signs up normally, searches for and books tutors, manages lessons from `/dashboard/student`.
- **Tutor** — a student becomes a tutor via "Become a Tutor"; gets a separate dashboard at `/dashboard/tutor` for bookings, earnings, students and profile.
- **Admin** — oversees both students and tutors: verify/unverify tutors, hide listings, suspend or delete any account, and view/cancel every booking, from `/dashboard/admin`.

All three log in through the same `/login` form — the server returns the account's role and each dashboard is gated to its own role (visiting the wrong dashboard redirects you to the right one).

## Database setup

Run the SQL files in `tutor-finder-backend/migrations/` against your database, in order, before starting the backend:

```bash
mysql -u root -p tutor_finder < tutor-finder-backend/migrations/001_account_and_tutor_profiles.sql
mysql -u root -p tutor_finder < tutor-finder-backend/migrations/002_admin_controls.sql
mysql -u root -p tutor_finder < tutor-finder-backend/migrations/003_bookings.sql
```

They're additive and safe to re-run. `003_bookings.sql` adds the `bookings` table that backs booking, earnings and admin booking-oversight data — nothing in those dashboards will load without it.

Admin accounts are never created through the public signup form. Bootstrap the first one from the backend:

```bash
cd tutor-finder-backend
node scripts/createAdmin.js admin@example.com "StrongPassword123" "0977000000"
```

Run it again with an existing account's email to promote that account to admin instead.
