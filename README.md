# 🛒 E-Commerce Web App

A full-stack e-commerce platform built with the MERN stack.  
It supports role-based access control, image uploads, and dynamic product management for retailers and consumers.

## 🔐 User Roles

- **Retailer**
  - Upload products with images
  - View and purchase other products
  
- **Consumer**
  - Browse products
  - Add to cart and buy items

## 🚀 Key Features

- JWT-based User Authentication
- Role-Based Access Control (RBAC)
- Image Uploads using Multer
- Product Listings with Dynamic Rendering
- Cart Functionality with Purchase Flow

## 🛠️ Tech Stack

| Area      | Technology           |
|------------|----------------------|
| Frontend   | React.js             |
| Backend    | Node.js, Express.js  |
| Database   | MongoDB              |

## Package Manager Support

This project supports multiple package managers:
- npm (`package-lock.json`)
- yarn (`yarn.lock`)
- pnpm (`lock.yaml`)

## 💻 Getting Started

**1. Clone the repository** 
   ```Bash
   git clone "https://github.com/rutu-modha/e-commerce.git"
cd ./e-commerce
```

**2. Install dependencies**
- **using npm**
```Bash
npm install
cd frontend
npm install
cd ..
cd backend
npm install
```
*OR*
- **using yarn**
```Bash
yarn install
cd frontend
yarn install
cd ..
cd backend
yarn install
```
*OR*
- **using pnpm**
```Bash
pnpm install
cd frontend
pnpm install
cd ..
cd backend
pnpm install
```
**3. Setup a `.env` at root file with your own Mongo_URI and JWT_SECRET variables**

**4. Run both servers**
```Bash
cd ..
npm run start
```
*OR*
```Bash
cd ..
yarn run start
```
*OR*
```Bash
cd ..
pnpm run start
```
## ✅ Upcoming Features

- OAuth with Google
- Customer Support Page
- Static About and Contact Pages

## 📄 License

This project is licensed under the [MIT License](./LICENSE).

> If you liked this project, then please don't forget to give this repository a star. Your 1 star means a lot for me.

## 👨‍💻 Author

**Hrutav Modha**
(_modhahrutav@gmail.com_)

## 🤝 Contributions

Feel free to fork, submit PRs, or open an issue. Let's build something cool together!

---

## Docker Setup

The application is containerized using Docker Compose and consists of three services:

- **Frontend:** React application running on port `3000`
- **Backend:** Node.js and Express API running on port `5000`
- **Database:** MongoDB running on port `27017`

### Architecture

    Browser
       |
       v
    React Frontend
       |
       v
    Node.js Backend
       |
       v
    MongoDB

### Prerequisites

Install and start:

- Docker Desktop
- Docker Compose

No local installation of Node.js, npm, or MongoDB is required.

### Environment Variables

Create a local environment file from the provided example:

```bash
cp .env.example .env
```

The `.env` file contains local secrets and is ignored by Git.

Example:

```env
JWT_SECRET=change-this-secret
```

### Build and Start

From the project root, run:

```bash
docker compose up --build -d
```

This command:

1. Pulls the MongoDB image.
2. Builds the backend image.
3. Builds the frontend image.
4. Creates a shared Docker network.
5. Starts all services in the background.

### Access the Application

- Frontend: http://localhost:3000
- Backend products API: http://localhost:5000/products
- MongoDB: `localhost:27017`

An empty response from the products endpoint:

```json
[]
```

means that the backend and MongoDB are connected successfully, but the database does not contain products yet.

### Check Container Status

```bash
docker compose ps
```

Expected services:

```text
ecommerce-frontend
ecommerce-backend
ecommerce-mongo
```

MongoDB should appear as healthy.

### View Logs

View logs for all services:

```bash
docker compose logs -f
```

View logs for one service:

```bash
docker compose logs -f backend
docker compose logs -f frontend
docker compose logs -f mongo
```

### Stop the Application

```bash
docker compose down
```

### Stop and Remove Database Data

```bash
docker compose down -v
```

> Warning: The `-v` option removes the MongoDB volume and deletes the locally stored database data.

### Rebuild After Code Changes

```bash
docker compose up --build -d
```

### Troubleshooting

If Docker is not running, open Docker Desktop and wait until the Docker Engine starts.

If a container fails, inspect its logs:

```bash
docker compose logs --tail=100
```

If a port is already in use, stop the conflicting application or update the port mapping in `docker-compose.yml`.

### Cloud Deployment

For a future cloud deployment, the frontend and backend containers can be deployed to **Google Cloud Run**, images can be stored in **Google Artifact Registry**, and MongoDB can be hosted using MongoDB Atlas in a GCP region.
