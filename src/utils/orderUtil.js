import { db } from "./database.js";

/**
 * ➕ Thêm đơn hàng mới
 */
export const addOrder = async (order = {}) => {
    const {
        userId,
        productId,
        productName,
        quantity,
        note,
        totalPrice
    } = order
    try {
        const sql = `
      INSERT INTO orders (user_id, product_id, product_name, quantity, note, total_price)
      VALUES (?, ?, ?, ?, ?, ?)
    `;
        const [result] = await db.query(sql, [userId, productId, productName, quantity, note, totalPrice]);

        // Trả về đơn hàng vừa thêm
        const [rows] = await db.query("SELECT * FROM orders WHERE id = ?", [result.insertId]);
        return rows[0];
    } catch (error) {
        console.error("❌ Error adding order:", error);
        throw error;
    }
};

/**
 * 📄 Lấy danh sách đơn hàng theo trang (mặc định 10 đơn/trang)
 */
export const getOrdersByPage = async (page = 0, limit = 10) => {
    try {
        const offset = page * limit;

        const [rows] = await db.query(
            "SELECT * FROM orders WHERE is_completed = false ORDER BY created_at DESC LIMIT ? OFFSET ?",
            [limit, offset]
        );

        const [[{ total }]] = await db.query("SELECT COUNT(*) AS total FROM orders");

        return { orders: rows, total };
    } catch (error) {
        console.error("❌ Error getting orders by page:", error);
        throw error;
    }
};

/**
 * 🔍 Lấy đơn hàng theo ID
 */
export const getOrderById = async (orderId) => {
    try {
        const [rows] = await db.query("SELECT * FROM orders WHERE id = ?", [orderId]);
        return rows[0] || null;
    } catch (error) {
        console.error("❌ Error getting order by ID:", error);
        throw error;
    }
};

/**
 * ✅ Đánh dấu hoàn thành đơn hàng
 */
export const completeOrder = async (orderId) => {
    try {
        const sql = "UPDATE orders SET is_completed = true WHERE id = ?";
        await db.query(sql, [orderId]);

        const [rows] = await db.query("SELECT * FROM orders WHERE id = ?", [orderId]);
        return rows[0] || null;
    } catch (error) {
        console.error("❌ Error completing order:", error);
        throw error;
    }
};
