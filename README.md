# 🐉 Wings of Fire: Dominion of Scales

A turn-based strategy/civilization game inspired by the *Wings of Fire* book series. Built with React + Vite.

## Features

- **10 Playable Tribes** — MudWings, SandWings, SkyWings, SeaWings, RainWings, NightWings, IceWings, SilkWings, HiveWings, LeafWings
- **Dragon Growth System** — Hatch eggs and grow dragons through 5 stages (Egg → Hatchling → Juvenile → Adult → Elder)
- **Queen & Heir** — Each tribe has a powerful Queen dragon with succession mechanics
- **Tribal Abilities** — Frost Breath, Venom Barb, Fire, Silk Trap, and more unique to each tribe
- **Diplomacy** — Form alliances, send gifts, call allies to war
- **Math Riddles** — Solve age-appropriate math problems (ages 9-10) to power up dragons, fly, and super-charge abilities
- **Hex-based Map** — Click-to-move with BFS pathfinding showing reachable hexes
- **City Conquest** — Conquer enemy cities, eliminate tribes, last one standing wins
- **Save/Load** — Persistent game saves via localStorage
- **AI Opponents** — Automated turn processing with building, recruiting, and dragon management

## Getting Started

### Prerequisites
- [Node.js](https://nodejs.org/) 18+ installed
- [Git](https://git-scm.com/) installed

### Local Development

```bash
# Clone the repo
git clone https://github.com/YOUR_USERNAME/wings-of-fire-dominion.git
cd wings-of-fire-dominion

# Install dependencies
npm install

# Start dev server
npm run dev
```

Open http://localhost:5173 in your browser.

### Build for Production

```bash
npm run build
```

Output goes to `dist/` folder.

## Deploy to Vercel

### Option 1: Import from GitHub (Recommended)

1. Push this repo to GitHub
2. Go to [vercel.com](https://vercel.com) and sign in
3. Click **"Add New Project"**
4. Import your GitHub repository
5. Vercel auto-detects Vite — just click **"Deploy"**
6. Done! Your game is live.

### Option 2: Vercel CLI

```bash
npm i -g vercel
vercel
```

## How to Push to GitHub

```bash
# Initialize git (if not already)
cd wings-of-fire-dominion
git init
git add .
git commit -m "Initial commit: Wings of Fire strategy game"

# Create repo on GitHub, then:
git remote add origin https://github.com/YOUR_USERNAME/wings-of-fire-dominion.git
git branch -M main
git push -u origin main
```

## Project Structure

```
wings-of-fire-dominion/
├── index.html          # Entry HTML
├── package.json        # Dependencies & scripts
├── vite.config.js      # Vite configuration
├── .gitignore
├── README.md
└── src/
    ├── main.jsx        # React mount point
    └── App.jsx         # Complete game (single-file)
```

## License

MIT
