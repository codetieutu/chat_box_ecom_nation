import axios from "axios";
import crypto from "crypto";
import dotenv from "dotenv";
import { BINANCE_API_KEY, BINANCE_API_SECRET } from "./env.js";

dotenv.config();

const BASE_URL = "https://api.binance.com";

/**
 * 🔐 Tạo chữ ký Binance API
 */
function createSignature(secret, queryString) {
    return crypto.createHmac("sha256", secret).update(queryString).digest("hex");
}

/**
 * 📥 Lấy lịch sử nạp tiền (deposit) qua mạng Polygon, chỉ từ thời điểm startTime
 */
const checkout = async (txid = "", startTime = 0, asset = "USDT", limit = 100) => {
    try {
        const timestamp = Date.now();
        const params = new URLSearchParams({
            coin: asset,
            limit,
            timestamp,
            startTime,
        }).toString();

        const signature = createSignature(BINANCE_API_SECRET, params);

        const response = await axios.get(
            `${BASE_URL}/sapi/v1/capital/deposit/hisrec?${params}&signature=${signature}`,
            {
                headers: { "X-MBX-APIKEY": BINANCE_API_KEY },
            }
        );
        const data = response.data || [];

        //lọc các giao dịch theo txid
        const transactionByTxid = data.filter((deposit) => {
            return (deposit.txId.includes(txid));
        })

        if (transactionByTxid.length > 0) {
            return transactionByTxid[0].amount || 0.0;
        }
        return 0.0;
    } catch (error) {
        console.error("❌ Error fetching deposit history:", error.response?.data || error.message);
        return 0.0;
    }
}

export {
    checkout,
}
