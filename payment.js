import axios from "axios";
import crypto from "crypto";
import dotenv from "dotenv";
dotenv.config();

const API_KEY = process.env.BINANCE_API_KEY;
const API_SECRET = process.env.BINANCE_API_SECRET;
const BASE_URL = "https://api.binance.com";

function signQuery(params) {
    const query = new URLSearchParams(params).toString();
    const signature = crypto.createHmac("sha256", API_SECRET)
        .update(query)
        .digest("hex");
    return `${query}&signature=${signature}`;
}

const checkout = async (amount, content, currency = "USDT") => {
    const dateStart = new Date("2024-12-10T00:00:00Z").getTime(); // UTC
    const dateEnd = new Date("2024-12-30T23:59:59Z").getTime();

    const params = {
        timestamp: Date.now(),
        recvWindow: 5000,
        transactionType: 0, // 0 = BUY, 1 = SELL
        beginTime: dateStart,
        endTime: dateEnd,
        rows: 50 // giới hạn số bản ghi trả về
    };
    const signed = signQuery(params);

    const res = await axios.get(`${BASE_URL}/sapi/v1/pay/transactions?${signed}`, {
        headers: { "X-MBX-APIKEY": API_KEY }
    });

    const list = res.data?.data || [];
    for (const item of list) {
        if (item.amount === amount && item.note === content && item.currency === currency) {
            return true;
        }
    }
    return false;
}

export {
    checkout,
}


// getFiatOrders('-12000', '')
//     .then(check => {
//         console.log(">>check", check);
//     })
//     .catch(console.error);

