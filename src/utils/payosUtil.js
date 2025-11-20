// src/utils/payosUtil.js
import dotenv from "dotenv";
import { PayOS } from "@payos/node";

dotenv.config();

const clientId = process.env.PAYOS_CLIENT_ID?.trim();
const apiKey = process.env.PAYOS_API_KEY?.trim();
const checksumKey = process.env.PAYOS_CHECKSUM_KEY?.trim();

console.log("PAYOS ENV (util):", {
    clientId: clientId?.slice(0, 6),
    apiKey: !!apiKey,
    checksumKey: !!checksumKey,
});

export const payos = new PayOS({
    clientId,
    apiKey,
    checksumKey,
});
