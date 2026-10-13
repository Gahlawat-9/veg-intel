# 🥬 VEG-INTEL — Smart Vegetable Market Intelligence Platform

**Turning agricultural market data into actionable insights to reduce post-harvest losses and improve farmer decision-making.**

VEG-INTEL is a vegetable market intelligence platform designed to bridge the gap between farmers, market demand, and agricultural decision-making. It combines market arrival data, demand indicators, seasonal patterns, and weather-related insights to help farmers make more informed decisions about harvesting, selling, and distributing vegetables.

The platform includes a farmer-facing mobile application and an administrative dashboard backed by a Node.js and Express API with MongoDB.

## 🚀 Problem Statement

Vegetable farmers often face unpredictable prices, fluctuating market demand, and limited access to reliable market intelligence. These challenges can lead to overproduction, poor selling decisions, and significant post-harvest wastage.

VEG-INTEL aims to address these challenges by bringing relevant agricultural data into one platform and building a foundation for data-driven harvest and market planning.

## 💡 Key Features

- **Market Intelligence:** Organize vegetable market data, including crop arrivals and demand indicators.
- **Crop Data Management:** Retrieve and manage crop-related information through REST APIs.
- **Demand Configuration:** Provide an administrative interface for configuring and reviewing crop demand data.
- **Harvest Planning:** Support data-informed harvesting decisions using market and seasonal indicators.
- **Weather-Aware Insights:** Designed to incorporate weather conditions and their potential impact on vegetable production and market supply.
- **Alerts & Feedback:** Dedicated dashboard modules for reviewing alerts and user feedback.
- **City-Level Insights:** A city map interface designed to support regional market intelligence.
- **Scalable Architecture:** Separate the mobile application, administration dashboard, and backend API for easier maintenance and future development.

## 🏗️ System Architecture

```text
                  VEG-INTEL
                      |
          +-----------+-----------+
          |                       |
     Farmer App             Admin Dashboard
       (Expo)                (React + Vite)
          |                       |
          +-----------+-----------+
                      |
                REST API Layer
              (Node.js + Express)
                      |
                   MongoDB
               (Mongoose ODM)
                      |
        Crop Data & Demand Information
                      |
       Future Intelligence Integrations
      (APMC Data, Weather, Seasonality)
```

## 🛠️ Tech Stack

| Layer | Technologies |
|---|---|
| Farmer mobile app | React Native, Expo |
| Admin dashboard | React, Vite |
| Backend | Node.js, Express.js |
| Database | MongoDB, Mongoose |
| API communication | REST APIs |
| Configuration | Environment variables with dotenv |
| Cross-origin requests | CORS |
| Future analytics | Python, data analysis and machine learning |

## 📂 Project Structure

```text
VEG-INTEL/
├── farmer-app/             # Expo-based farmer mobile app
├── admin-dashboard/        # Vite-based administration interface
├── server/                 # Backend API (example folder name)
│   ├── models/             # MongoDB models
│   ├── routes/             # API routes
│   ├── controllers/        # Request handlers
│   ├── server.js           # Express entry point
│   └── .env                # Environment variables
├── .gitignore
└── README.md
```

*Note: Adjust the backend folder and file names above to match the actual repository structure.*

## ⚙️ Getting Started

### Prerequisites

Install the following before running the project:

- Node.js and npm
- MongoDB Atlas account or a local MongoDB instance
- Expo Go for testing the mobile application
- Git

### 1. Clone the Repository

```bash
git clone <YOUR_GITHUB_REPOSITORY_URL>
cd veg-intel
```

### 2. Set Up the Backend

Navigate to the backend directory:

```bash
cd server
npm install
```

Create a `.env` file in the backend directory:

```env
PORT=5000
MONGODB_URI=your_mongodb_connection_string
```

Replace the placeholder with your MongoDB connection string. Configure database access and network permissions as required.

Start the backend using the script defined in `package.json`, for example:

```bash
npm run dev
```

If your project uses a different script, replace the command accordingly.

### 3. Start the Admin Dashboard

Open a new terminal and navigate to the admin dashboard:

```bash
cd admin-dashboard
npm install
npm run dev
```

Open the local URL displayed by Vite in your terminal.

### 4. Start the Farmer App

Open another terminal:

```bash
cd farmer-app
npm install
npx expo start
```

Follow Expo's instructions to run the application on a compatible device or emulator. For physical-device testing, configure the API base URL to use an address reachable from that device.

## 🔌 API Overview

The backend exposes REST endpoints for crop and demand information.

| Endpoint | Method | Purpose |
|---|---|---|
| `/api/crops` | GET | Retrieve crop information |
| `/api/demand` | GET | Retrieve demand information |

Additional routes may be available depending on the backend implementation.

For local development, the backend runs on port `5000` unless configured otherwise.

## 🔮 Future Roadmap

- [ ] Integrate real agricultural market arrival and price data from APMCs.
- [ ] Incorporate weather forecasts and seasonal production patterns.
- [ ] Develop crop price and demand forecasting models.
- [ ] Add regional supply-demand comparisons.
- [ ] Generate harvest timing and market selection recommendations.
- [ ] Introduce historical trend analysis and interactive visualizations.
- [ ] Evaluate model performance using real-world agricultural data.
- [ ] Expand support for additional crops and regions.

## 🌱 Expected Impact

VEG-INTEL is being developed to support:

- Better-informed harvesting and selling decisions.
- Improved visibility into market demand and crop arrivals.
- More efficient regional vegetable distribution.
- Reduced avoidable post-harvest losses.
- A data-driven approach to agricultural planning.

Actual impact and forecasting accuracy will need to be validated using reliable real-world data.

## 🤝 Contributing

Contributions, suggestions, and feedback are welcome.

1. Fork the repository.
2. Create a feature branch.
3. Commit your changes.
4. Push the branch to your fork.
5. Open a pull request describing your contribution.

**VEG-INTEL — Smarter market intelligence for a more efficient vegetable supply chain.**
