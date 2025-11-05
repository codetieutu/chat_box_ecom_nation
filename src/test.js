import axios from "axios";
import crypto from "crypto";
import dotenv from "dotenv";
import { NETWORK } from "./src/utils/env.js";
dotenv.config();

const API_KEY = process.env.BINANCE_API_KEY;
const API_SECRET = process.env.BINANCE_API_SECRET;
const BASE_URL = "https://api.binance.com";

// Tạo chữ ký HMAC SHA256 cho request
function signQuery(params) {
    const query = new URLSearchParams(params).toString();
    const signature = crypto.createHmac("sha256", API_SECRET)
        .update(query)
        .digest("hex");
    return `${query}&signature=${signature}`;
}

/**
 * Lấy danh sách giao dịch nạp tiền Binance Pay
 * @param {string} coin - Loại coin cần lọc (VD: 'USDT')
 * @param {number} time - Chỉ lấy giao dịch có thời gian lớn hơn timestamp này
 * @returns {Array<{id: string, amount: number, currency: string, transactionTime: string}>}
 */
const checkout = async (coin = "USDT", time = 0) => {
    try {
        const params = {
            timestamp: Date.now(),
            recvWindow: 5000,
            transactionType: 0, // 0 = RECEIVED (inbound payment)
            beginTime: time, // chỉ lấy sau thời điểm này
            rows: 100
        };

        const signed = signQuery(params);

        const res = await axios.get(`${BASE_URL}/sapi/v1/pay/transactions?${signed}`, {
            headers: { "X-MBX-APIKEY": API_KEY }
        });
        console.log(">>check res", res.data)
        const list = res.data?.data || [];

        // Lọc giao dịch hợp lệ
        const filtered = list
            .filter(tx => tx.currency === coin && tx.transactionTime > time)
            .map(tx => ({
                id: tx.transactionId,
                amount: parseFloat(tx.amount),
                currency: tx.currency,
                transactionTime: new Date(tx.transactionTime).toISOString(),
            }));

        return filtered;

    } catch (err) {
        console.error("❌ Binance checkout error:", err.response?.data || err.message);
        return [];
    }
};
const main = async () => {
    const time = new Date("2025-11-02T00:00:00Z").getTime(); // 24h gần nhất

    const deposits = await checkout("USDT", time);

    if (deposits.length) {
        console.log("Recent Deposits:", deposits);
    } else {
        console.log("No deposits found after the given time.");
    }
}
main();

// export { checkout };
