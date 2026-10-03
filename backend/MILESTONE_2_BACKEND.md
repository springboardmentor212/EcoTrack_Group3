# EcoTrack — Milestone 2 Backend

Milestone 2 implements:

1. Carbon tracking APIs
2. Server-side carbon calculation engine
3. Goal management and filtering
4. Sustainability dashboard analytics
5. Search and filter support

## Carbon API

All endpoints require:

`Authorization: Bearer <JWT>`

### List carbon records

`GET /api/carbon-records`

Optional query parameters:

- `category`
- `search`
- `startDate=YYYY-MM-DD`
- `endDate=YYYY-MM-DD`
- `minEmission`
- `maxEmission`
- `sortBy=date|emission|amount|createdAt`
- `order=asc|desc`
- `page`
- `limit`

Example:

`GET /api/carbon-records?category=Transportation&startDate=2026-10-01&endDate=2026-10-31`

### Carbon categories and factors

`GET /api/carbon-records/categories`

Returns the categories and the factors used by the backend calculation engine.

### Create a carbon record

`POST /api/carbon-records`

Body:

```json
{
  "category": "Transportation",
  "amount": 10,
  "date": "2026-10-03"
}
```

The backend calculates:

`emission = amount × category emission factor`

The client-supplied `emission` value is intentionally not trusted.

### Update a carbon record

`PUT /api/carbon-records/:id`

Changing category or amount automatically recalculates the emission.

### Delete a carbon record

`DELETE /api/carbon-records/:id`

## Goal API

### List goals

`GET /api/goals`

Optional:

- `status=active|completed|overdue`
- `search`
- `deadlineBefore`
- `deadlineAfter`
- `sortBy=deadline|progress|createdAt`
- `order=asc|desc`

Existing create/update/delete goal endpoints remain compatible.

## Sustainability Dashboard

`GET /api/dashboard/stats`

Optional:

- `period=all`
- `period=week`
- `period=month`
- `period=year`

The response includes:

- total carbon
- carbon category breakdown
- emissions trend
- activity totals
- goal totals
- completed/overdue goals
- challenge statistics
- sustainability summary
- user streak/level/points

## Integration notes

The integration developer should mount/use the existing routes already registered in `server.js`:

- `/api/carbon-records`
- `/api/goals`
- `/api/dashboard`

No new authentication mechanism is required.

The existing Milestone 1 APIs remain in place.
