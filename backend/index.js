import express from "express";
import dotenv from "dotenv";
import mongoose from "mongoose";
import cors from "cors";
import { createProxyMiddleware } from 'http-proxy-middleware';
import cookieParser from "cookie-parser";
import ResRouter from "./routes/ResRoutes.js";
import UserRoutes from './routes/UserRoutes.js';
import DelRoutes from './routes/DelRoutes.js';
import menuRoutes from './routes/menuRoutes.js';
import paymentRouter from './routes/paymentRoutes.js';
import addressRoutes from './routes/AddressRoutes.js';
import orderRoutes from './routes/OrderRoutes.js';
import MapAddressRoutes from './routes/MapAddressRoutes.js'
import DroneRoutes from "./routes/DroneRoutes.js";
dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;
const allowedOrigins = [
    "https://cicd-ashen.vercel.app",
    "https://cicd-l3sva8o46-sog1ns-projects.vercel.app",
    process.env.FRONTEND_URL
].filter(Boolean);

const corsOptions = {
    origin: (origin, cb) => {
        if (!origin) return cb(null, true); // non-browser clients
        try {
            const host = new URL(origin).host;
            const ok =
                allowedOrigins.includes(origin) ||
                /\.vercel\.app$/i.test(host); // allow Vercel previews
            return ok ? cb(null, true) : cb(new Error("Not allowed by CORS"));
        } catch {
            return cb(new Error("Bad origin"));
        }
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"]
};

app.use(cors(corsOptions));
// ensure preflight is answered
app.options("*", cors(corsOptions));
app.use(express.json());
app.use(cors({
    origin: "https://cicd-ashen.vercel.app",
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH"],
    allowedHeaders: ["Content-Type", "Authorization"],
}));

app.use(cookieParser());

// Proxy setup
app.use('/api/nominatim', createProxyMiddleware({
    target: 'https://nominatim.openstreetmap.org',
    changeOrigin: true,
    pathRewrite: { '^/api/nominatim': '' },
    onProxyRes: (proxyRes) => {
        proxyRes.headers['Access-Control-Allow-Origin'] = '*';
        proxyRes.headers['Access-Control-Allow-Credentials'] = 'true';
        proxyRes.headers['Access-Control-Allow-Methods'] = 'GET, POST, PUT, DELETE, OPTIONS';
        proxyRes.headers['Access-Control-Allow-Headers'] = 'Content-Type, Authorization';
    }
}));

// Routes
app.use('/api/addresses', MapAddressRoutes);
app.use('/auth', ResRouter);
app.use('/auth', UserRoutes);
app.use('/auth', DelRoutes);
app.use('/api/menu', menuRoutes);
app.use('/api/payment', paymentRouter);
app.use('/api/addresses', addressRoutes);
app.use('/api/order', orderRoutes);
app.use("/api/drones", DroneRoutes);

mongoose.connect(process.env.MONGODB_URI)
    .then(() => {
        console.log("MongoDB connected");
        app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
    })
    .catch((error) => console.error("MongoDB connection error:", error));
