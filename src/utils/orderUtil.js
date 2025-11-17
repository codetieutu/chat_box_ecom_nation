// orderUtil.js
import { db } from "./database.js";

/**
 * Lấy tất cả đơn hàng
 * @returns {Promise<Array>}
 */
export async function getAllOrders() {
    const [rows] = await db.execute(
        `SELECT 
        id,
        user_id,
        product_id,
        variant_id,
        quantity,
        unit_price,
        total_amount,
        status,
        note,
        receiver_name,
        product_name,
        created_at,
        updated_at
     FROM orders
     ORDER BY created_at DESC`
    );
    return rows;
}

/**
 * Lấy 1 đơn hàng theo id
 * @param {number} id
 * @returns {Promise<Object|null>}
 */
export async function getOrderById(id) {
    const [rows] = await db.execute(
        `SELECT 
        id,
        user_id,
        product_id,
        variant_id,
        quantity,
        unit_price,
        total_amount,
        status,
        note,
        receiver_name,
        product_name,
        created_at,
        updated_at
     FROM orders
     WHERE id = ?`,
        [id]
    );
    return rows.length ? rows[0] : null;
}

/**
 * Lấy tất cả đơn hàng của 1 user
 * @param {string} userId
 * @returns {Promise<Array>}
 */
export async function getOrdersByUserId(userId) {
    const [rows] = await db.execute(
        `SELECT 
        id,
        user_id,
        product_id,
        variant_id,
        quantity,
        unit_price,
        total_amount,
        status,
        note,
        receiver_name,
        product_name,
        created_at,
        updated_at
     FROM orders
     WHERE user_id = ?
     ORDER BY created_at DESC`,
        [userId]
    );
    return rows;
}

/**
 * Tạo đơn hàng mới
 * @param {{
 *  user_id?: string|null,
 *  product_id: number,
 *  variant_id?: number|null,
 *  quantity?: number,
 *  unit_price: number,
 *  note?: string|null,
 *  receiver_name?: string|null,
 *  product_name?: string|null
 * }} order
 * @returns {Promise<number>} id của đơn hàng vừa tạo
 */
export async function createOrder(order) {
    const {
        user_id = null,
        product_id,
        variant_id = null,
        quantity = 1,
        unit_price,
        note = null,
        receiver_name = null,
        product_name = null,
    } = order;

    const total_amount = quantity * unit_price;

    const [result] = await db.execute(
        `INSERT INTO orders (
        user_id,
        product_id,
        variant_id,
        quantity,
        unit_price,
        total_amount,
        status,
        note,
        receiver_name,
        product_name
     ) VALUES (?, ?, ?, ?, ?, ?, 'pending', ?, ?, ?)`,
        [
            user_id,
            product_id,
            variant_id,
            quantity,
            unit_price,
            total_amount,
            note,
            receiver_name,
            product_name,
        ]
    );

    return result.insertId;
}

/**
 * Cập nhật đơn hàng (update từng trường)
 *
 * data có thể chứa bất kỳ field nào trong số:
 * user_id, product_id, variant_id, quantity, unit_price,
 * total_amount, status, note, receiver_name, product_name
 *
 * Nếu quantity hoặc unit_price thay đổi mà bạn KHÔNG truyền total_amount,
 * hàm sẽ tự tính lại total_amount = quantity * unit_price.
 *
 * @param {number} id
 * @param {Object} data
 * @returns {Promise<boolean>} true nếu update thành công
 */
export async function updateOrder(id, data) {
    // Nếu có thay đổi quantity hoặc unit_price → tự tính lại total_amount nếu chưa truyền
    if (
        ("quantity" in data || "unit_price" in data) &&
        !("total_amount" in data)
    ) {
        const existing = await getOrderById(id);
        if (!existing) {
            throw new Error("Order not found");
        }

        const quantity = data.quantity ?? existing.quantity;
        const unit_price = data.unit_price ?? existing.unit_price;

        data.total_amount = quantity * unit_price;
    }

    const allowedFields = [
        "user_id",
        "product_id",
        "variant_id",
        "quantity",
        "unit_price",
        "total_amount",
        "status",
        "note",
        "receiver_name",
        "product_name",
        "seller_note"
    ];

    const fields = [];
    const values = [];

    for (const key of Object.keys(data)) {
        if (allowedFields.includes(key)) {
            fields.push(`${key} = ?`);
            values.push(data[key]);
        }
    }

    if (fields.length === 0) {
        throw new Error("No valid fields to update");
    }

    values.push(id);

    const sql = `UPDATE orders SET ${fields.join(", ")} WHERE id = ?`;

    const [result] = await db.execute(sql, values);
    return result.affectedRows > 0;
}

/**
 * Cập nhật trạng thái đơn hàng
 * @param {number} id
 * @param {'pending'|'success'|'failed'} status
 * @returns {Promise<boolean>}
 */
export async function updateOrderStatus(id, status) {
    const [result] = await db.execute(
        "UPDATE orders SET status = ? WHERE id = ?",
        [status, id]
    );
    return result.affectedRows > 0;
}

/**
 * Xoá đơn hàng
 * @param {number} id
 * @returns {Promise<boolean>}
 */
export async function deleteOrder(id) {
    const [result] = await db.execute("DELETE FROM orders WHERE id = ?", [id]);
    return result.affectedRows > 0;
}
