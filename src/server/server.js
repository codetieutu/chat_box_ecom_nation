import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import indexRouter from './routes/index.js';
import productsRouter from './routes/products.js';
import usersRouter from './routes/users.js';
import ordersRouter from './routes/orders.js';
import expressEjsLayouts from 'express-ejs-layouts';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

// Cấu hình EJS
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

app.use(expressEjsLayouts);
//set layout
app.set('layout', 'layout');

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));

global.pendingOrders = {};

// Routes
app.use('/', indexRouter);
app.use('/products', productsRouter);
app.use('/users', usersRouter);
app.use('/orders', ordersRouter);

//webhook nhận thông báo chuyển tiền
app.post("/payos/webhook", async (req, res) => {
    try {
        const body = req.body;
        console.log(">>> Webhook body:", body);

        // Tuỳ SDK PayOS, có thể có hàm verifyChecksum, ví dụ:
        const isValid = payos.verifyPaymentWebhookData(body);
        if (!isValid) {
            console.error("⚠️ Webhook checksum không hợp lệ");
            return res.status(400).send("invalid checksum");
        }

        // Lấy thông tin đơn hàng từ webhook
        const orderCode = body.data.orderCode;
        const amount = body.data.amount;
        const status = body.data.status; // ví dụ: "PAID", "PENDING", "CANCELLED"

        console.log(">>> Webhook order:", { orderCode, amount, status });

        // Chỉ xử lý khi thanh toán thành công
        if (status === "PAID" || status === "SUCCEEDED" || status === "SUCCESS") {
            // TODO: cập nhật DB của bạn
            // await updateOrderStatus(orderCode, "success");
            // Có thể lưu thêm: paid_at, transaction_id, v.v.
            console.log(`✅ Thanh toán thành công cho orderCode=${orderCode}`);
        } else {
            console.log(`ℹ️ Trạng thái khác: ${status} cho orderCode=${orderCode}`);
        }

        // Trả lời PayOS để họ biết bạn đã nhận webhook
        res.status(200).send("ok");
    } catch (err) {
        console.error("Webhook error:", err);
        res.status(500).send("server error");
    }
});

const PORT = 8080;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});

export default app;