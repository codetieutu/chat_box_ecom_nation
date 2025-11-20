// server.js
import express from "express";
import dotenv from "dotenv";
import { PayOS } from "@payos/node";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;
const BASE_URL = process.env.BASE_URL || `http://localhost:${PORT}`;

// Middleware đọc JSON & form
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Khởi tạo PayOS client
const payos = new PayOS({
    clientId: process.env.PAYOS_CLIENT_ID,
    apiKey: process.env.PAYOS_API_KEY,
    checksumKey: process.env.PAYOS_CHECKSUM_KEY,
});

// ======= TRANG TEST ĐƠN GIẢN =======
app.get("/", (req, res) => {
    res.send(`
    <h1>Test payOS - Tạo QR VietQR</h1>
    <form method="POST" action="/create-payment">
      <label>Số tiền (VND):</label>
      <input type="number" name="amount" value="50000" required />
      <br/><br/>
      
      <label>Mô tả đơn hàng:</label>
      <input type="text" name="description" value="Thanh toan test" required />
      <br/><br/>

      <button type="submit">Tạo link thanh toán</button>
    </form>
  `);
});

// ======= API TẠO LINK THANH TOÁN (TẠO QR) =======
app.post("/create-payment", async (req, res) => {
    try {
        const amount = Number(req.body.amount);
        const description = req.body.description || "Thanh toán đơn hàng";

        if (!amount || amount <= 0) {
            return res.status(400).send("Amount không hợp lệ");
        }

        // orderCode nên là số duy nhất – dùng timestamp cho nhanh
        const orderCode = Date.now(); // ví dụ: 1732080000000

        const paymentData = {
            orderCode,
            amount,
            description,

        };

        // Gọi API payOS để tạo link thanh toán
        const paymentLink = await payos.paymentRequests.create(paymentData);

        console.log("Tạo link thanh toán thành công:", paymentLink);

        // Cách 1: redirect user sang trang thanh toán luôn
        // return res.redirect(paymentLink.checkoutUrl);

        // Cách 2: hiển thị link + QR cho bạn test
        res.send(`
      <h2>Tạo link thanh toán thành công</h2>
      <p>orderCode: ${orderCode}</p>
      <p>Mô tả: ${description}</p>
      <p>Số tiền: ${amount} VND</p>
      <p><a href="${paymentLink.checkoutUrl}" target="_blank">MỞ TRANG THANH TOÁN</a></p>
      <p>Hoặc quét QR trong trang thanh toán.</p>
      <br/>
      <a href="/">← Quay lại trang tạo đơn</a>
    `);
    } catch (err) {
        console.error("Lỗi tạo payment link:", err);
        res.status(500).send("Lỗi tạo link thanh toán");
    }
});

// ======= HANDLER RETURN URL (SAU KHI KHÁCH HÀNG THANH TOÁN XONG) =======
app.get("/return", (req, res) => {
    // payOS sẽ redirect về đây kèm query param (status, orderCode,...)
    console.log("Return URL data:", req.query);
    res.send(`
    <h1>Trang return</h1>
    <p>Đây là nơi hiển thị kết quả cho khách hàng sau khi thanh toán.</p>
    <pre>${JSON.stringify(req.query, null, 2)}</pre>
    <a href="/">← Về trang tạo đơn</a>
  `);
});

app.get("/cancel", (req, res) => {
    console.log("Cancel URL data:", req.query);
    res.send(`
    <h1>Khách đã hủy thanh toán</h1>
    <pre>${JSON.stringify(req.query, null, 2)}</pre>
    <a href="/">← Về trang tạo đơn</a>
  `);
});

// ======= WEBHOOK – NHẬN & XÁC THỰC GIAO DỊCH =======
// Nhớ cấu hình URL này trong phần Webhook trên my.payos.vn
app.post("/webhook", async (req, res) => {
    try {
        // Xác minh dữ liệu webhook bằng SDK
        const webhookData = await payos.webhooks.verify(req.body);

        console.log("✅ Webhook hợp lệ, dữ liệu:", webhookData);

        // Tùy phiên bản, bạn sẽ có thông tin như:
        // const { orderCode, amount, description, status } = webhookData;

        // TODO: Ở đây bạn xử lý:
        // - Tìm đơn hàng theo orderCode
        // - Kiểm tra amount
        // - Cập nhật trạng thái "PAID" trong database

        // Trả về 200 để payOS biết bạn đã nhận webhook
        res.json({ message: "OK" });
    } catch (err) {
        console.error("❌ Webhook không hợp lệ:", err);
        res.status(400).json({ message: "Invalid webhook" });
    }
});

// ======= START SERVER =======
app.listen(PORT, () => {
    console.log(`Server đang chạy tại ${BASE_URL}`);
    console.log("Mở trình duyệt vào", BASE_URL, "để test tạo QR");
});
