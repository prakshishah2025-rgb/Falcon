GridNest coordinates homes, batteries, appliances, P2P energy trades, and small hosted AI nodes. At noon, solar homes run inference jobs using energy that might otherwise be exported cheaply. At 6 PM, household demand rises and the platform throttles or migrates non-urgent AI jobs so appliances, EVs, and batteries stay protected. At 11 PM, low-priority jobs can run if the grid is cheap and low-stress.

The key pitch:

```text
We turn AI compute from a threat to the grid into a controllable resource
that absorbs excess renewable energy and backs off when households need power.
```

## Project Structure

```text
.
├── index.html
├── README.md
└── src
    ├── app.js
    ├── data.js
    ├── engine.js
    └── styles.css
```

## How the Matching Works

1. Each solar home gets a 24-hour generation forecast.
2. The app estimates each home's surplus after household demand and battery buffer.
3. Homes with surplus become sellers. Homes with unmet demand become buyers.
4. Buyers are matched with sellers when the seller's minimum price is below the buyer's maximum bid.
5. Seller ranking favors lower price, shorter distance, and higher available energy.

## How the Optimizer Works

The optimizer checks every possible start time before each appliance deadline. It scores each window using:

```text
score = average local solar surplus × 1.3 - average grid price
```

The highest scoring window becomes the recommended schedule.

## How the AI Scheduler Works

Businesses submit AI jobs with energy needs, duration, deadline, priority, and bid price. Hosted home nodes offer GPU capacity, but the scheduler only uses capacity after household protection rules are applied.

The scheduler scores each possible job window using:

```text
score = clean local energy + host availability + priority boost - grid price - peak stress - comfort penalty
```

During a heatwave or grid peak alert, flexible jobs are throttled or moved away from overloaded evening hours.

## Good Hackathon Talking Points

- It is safe to demo because all data is seeded and runs instantly.
- The model is explainable enough for judges to understand.
- The UI connects forecasting, trading, compute scheduling, battery decisions, fairness, and impact in one story.
- The heatwave alert creates a memorable before/after moment.
- The code is small enough for a beginner team to extend during a hackathon.

## Ideas to Extend

- Add login roles for households and the local grid operator.
- Connect weather data from an API.
- Store trades in a simple backend database.
- Add battery charge/discharge simulation across the full day.
- Add a fairness rule so small buyers get priority during limited surplus.
- Add a real queue for AI jobs and host payouts.
- Add map-based routing for nearby P2P energy trades.
