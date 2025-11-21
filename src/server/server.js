import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import indexRouter from './routes/index.js';
import productsRouter from './routes/products.js';
import usersRouter from './routes/users.js';
import ordersRouter from './routes/orders.js';
import expressEjsLayouts from 'express-ejs-layouts';
import { payos } from '../utils/payosUtil.js'

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
import crypto from "crypto";
import { getOrderById } from '../utils/orderUtil.js';

app.post("/payos/webhook", async (req, res) => {
    try {
        const body = req.body;
        console.log(">>> PAYOS WEBHOOK:", JSON.stringify(body, null, 2));

        // ======== 1. Lấy data & signature từ webhook =========
        const data = body.data;
        const signature = body.signature;

        if (!data || !signature) {
            console.error("❌ Thiếu data hoặc signature");
            return res.status(400).send("invalid webhook");
        }

        // ======== 2. Hàm sắp xếp key =========
        function sortObjByKey(object) {
            return Object.keys(object)
                .sort()
                .reduce((obj, key) => {
                    obj[key] = object[key];
                    return obj;
                }, {});
        }

        // ======== 3. Hàm chuyển object → query string theo chuẩn PayOS =========
        function convertObjToQueryStr(object) {
            return Object.keys(object)
                .filter((key) => object[key] !== undefined)
                .map((key) => {
                    let value = object[key];

                    if (value && Array.isArray(value)) {
                        value = JSON.stringify(
                            value.map((val) => sortObjByKey(val))
                        );
                    }

                    if ([null, undefined, "null", "undefined"].includes(value)) {
                        value = "";
                    }

                    return `${key}=${value}`;
                })
                .join("&");
        }

        // ======== 4. Tạo chuỗi để hash =========
        const sortedData = sortObjByKey(data);
        const dataQueryStr = convertObjToQueryStr(sortedData);

        // console.log(">>> dataQueryStr:", dataQueryStr);

        // ======== 5. Tạo signature bằng HMAC SHA256 =========
        const calculatedSignature = crypto
            .createHmac("sha256", process.env.PAYOS_CHECKSUM_KEY)
            .update(dataQueryStr)
            .digest("hex");

        // console.log(">>> calculatedSignature:", calculatedSignature);

        // ======== 6. So sánh chữ ký =========
        if (calculatedSignature !== signature) {
            console.error("❌ Signature không hợp lệ");
            return res.status(400).send("invalid signature");
        }

        // ======== 7. Xử lý thanh toán =========
        const { orderCode, amount, description, code, desc, status } = data;


        // Ở PayOS, code = '00' và desc = 'Thành công' tức là PAID
        if (code === "00") {
            const order = getOrderById(orderCode);
            const products = await getProductByQuantity(order.variant_id, order.quantity);
            await exportProductsToTxt(order.user_id, products);

        }

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