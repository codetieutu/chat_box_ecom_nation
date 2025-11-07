import axios from "axios";
import 'dotenv/config';

const API_KEY = process.env.ETHERSCAN_API_KEY;
const ADDRESS_WALLET = process.env.ADDRESS_WALLET;
const TX_HASH = "0xdd37bc11ac4c97145c788648823d3326d1b74569363abd086dce84b0037242e7";
const BASE = "https://api.etherscan.io/v2/api";
const CHAIN_ID = 56; // BNB Chain

async function getTokenTransferAmount(txHash) {
    console.log(">>check address", ADDRESS_WALLET);
    // 1️⃣ Lấy toàn bộ token transfers của ví nhận
    const params = {
        apikey: API_KEY,
        chainid: CHAIN_ID,
        module: "account",
        action: "tokentx",
        page: 1,
        offset: 100,
        sort: "desc",
        address: ADDRESS_WALLET
        // địa chỉ ví nhận (từ ảnh bạn gửi)
    };

    const res = await axios.get(BASE, { params });
    console.log(">>check res", res.data);
    const result = res.data.result;

    if (!Array.isArray(result)) {
        console.error("Không lấy được dữ liệu giao dịch.");
        return;
    }

    // 2️⃣ Tìm đúng giao dịch theo hash
    const tx = result.find(t => t.hash.toLowerCase() === txHash.toLowerCase());

    if (!tx) {
        console.log("🚫 Không tìm thấy giao dịch.");
        return;
    }

    // 3️⃣ Tính số lượng thực tế
    const amount = Number(tx.value) / 10 ** Number(tx.tokenDecimal);

    console.log(`
🔹 Token: ${tx.tokenName} (${tx.tokenSymbol})
🔹 From: ${tx.from}
🔹 To: ${tx.to}
🔹 Số lượng: ${amount}
🔹 Thời gian: ${new Date(tx.timeStamp * 1000).toLocaleString()}
🔹 TxHash: ${tx.hash}
  `);
}

getTokenTransferAmount(TX_HASH);
