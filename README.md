# Traffic Analyzer 🌐

A web application that analyzes website traffic data using the SimilarWeb API.

## Features ✨

- 🔍 Real-time traffic analysis for any domain
- 📊 Detailed traffic metrics and statistics
- 🌍 Global ranking and country-wise traffic distribution
- 📈 Monthly traffic trends
- 🔐 Secure API integration with environment variables
- 🎨 Modern, responsive UI with Tailwind CSS
- 🌙 Dark/Light theme support

## Tech Stack 🛠️

### Frontend
- React 19
- TypeScript
- Tailwind CSS
- Radix UI Components
- tRPC Client
- React Query

### Backend
- Node.js
- Express.js
- tRPC
- Drizzle ORM
- MySQL

### Tools & Services
- Vite (Build tool)
- SimilarWeb API (Traffic data)

## Getting Started 🚀

### Prerequisites
- Node.js (v18+)
- npm or pnpm
- RapidAPI account with SimilarWeb API access

### Installation

1. Clone the repository:

    ```bash
    git clone https://github.com/umutkivanc/traffic-analyzer.git
    cd traffic-analyzer
    ```

2. Install dependencies:

    ```bash
    npm install
    # or
    pnpm install
    ```

3. Create `.env` file from template:

    ```bash
    cp .env.example .env
    ```

4. Add your API credentials to `.env`:

    ```env
    RAPIDAPI_KEY=your_api_key_here
    RAPIDAPI_HOST=similarweb-real-time-api.p.rapidapi.com
    ```

5. Start the development server:

    ```bash
    npm run dev
    # or
    pnpm dev
    ```

The application will be available at [http://localhost:3000](http://localhost:3000)

## Available Scripts 📜

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run check` - Type check with TypeScript
- `npm run format` - Format code with Prettier
- `npm run test` - Run tests with Vitest

## Environment Variables 🔐

```env
RAPIDAPI_KEY=your_rapidapi_key
RAPIDAPI_HOST=similarweb-real-time-api.p.rapidapi.com
```

Register to [RapidAPI](https://rapidapi.com/auth/sign-up?referral=11891629)

⚠ATTENTION⚠ Please use this API provider for it to work properly: [SimilarWeb RapidAPI](https://rapidapi.com/dataocean/api/similarweb-real-time-api/)


## Deployment 🌍

### Deploy on Render

1. Push your code to GitHub
2. Go to Render Dashboard ([https://dashboard.render.com](https://dashboard.render.com))
3. Create new Web Service
4. Connect your GitHub repository
5. Add Environment Variables:
    - `RAPIDAPI_KEY`
    - `RAPIDAPI_HOST`
6. Set build command: `npm run build`
7. Set start command: `npm run start`
8. Deploy!

## Project Structure 📁

```
traffic-analyzer/
├── client/              # Frontend (React)
│   └── src/
│       ├── pages/      # Page components
│       ├── components/ # Reusable components
│       └── App.tsx     # Main app component
├── server/             # Backend (Node.js)
│   ├── _core/         # Core functionality
│   ├── services/      # API services
│   └── routers.ts     # API routes
└── package.json
```

## API Endpoints 🔌

- `POST /api/trpc/traffic.analyze` - Analyze domain traffic
- `GET /api/trpc/traffic.history` - Get user's analysis history
- `GET /api/trpc/auth.me` - Get current user
- `POST /api/trpc/auth.logout` - Logout

## Contributing 🤝

Contributions are welcome! Feel free to submit issues and pull requests.

## License 📄

MIT License

## Support 💬

For issues and questions, please create an issue on GitHub.

---

Made with ❤️ by [umutkivanc](https://github.com/umutkivanc)
