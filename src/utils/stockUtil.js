import { db } from "./database.js";
// import { updateProductQuantity } from "./productUtil.js";

// Thêm item mới vào stock
const addStock = async (productId, info) => {
    const [result] = await db.query(
        "INSERT INTO stocks (product_id, info) VALUES (?, ?)",
        [productId, info]
    );

    // Tăng số lượng trong bảng products
    await db.query("UPDATE product_variants SET quantity = quantity + 1 WHERE id = ?", [productId]);

    return { id: result.insertId, productId, info };
};

// Lấy toàn bộ stock của 1 sản phẩm
const getStocksByProduct = async (productId) => {
    const [rows] = await db.query("SELECT * FROM stocks WHERE product_id = ?", [productId]);
    return rows;
};

// Đánh dấu stock là đã bán
const markStockAsSold = async (stockId) => {
    await db.query("UPDATE stocks SET is_sold = 1 WHERE id = ?", [stockId]);
};

// Xoá stock
const deleteStock = async (stockId) => {
    await db.query("DELETE FROM stocks WHERE id = ?", [stockId]);
};

const getProductByQuantity = async (variantId, quantity, orderId) => {
    try {

        const [rows] = await db.query(
            "SELECT id, info FROM stocks WHERE product_id = ? AND is_sold = false LIMIT ?",
            [variantId, quantity]
        );
        const selectedCount = rows.length;
        if (selectedCount === 0) {
            return [];
        }

        const stockIds = rows.map(r => r.id);

        await db.query(
            "UPDATE product_variants SET quantity = GREATEST(quantity - ?, 0) WHERE id = ?",
            [selectedCount, variantId]
        );

        const placeholders = stockIds.map(() => "?").join(",");
        await db.query(
            `UPDATE stocks SET is_sold = true, order_id = '${orderId}' WHERE id IN (${placeholders})`,
            stockIds
        );

        return rows;
    } catch (error) {
        console.error("⚠️ getProductByQuantity error:", error);
        throw error;
    }
};

const getStockByOrder = async (orderId) => {
    try {
        const [rows] = await db.query("SELECT * FROM stocks WHERE order_id = ?", [orderId]);
        return rows;
    } catch (error) {
        console.log(">>check err", error)
    }
}

const getOrderByStock = async (info) => {
    try {
        const [rows] = await db.query(
            "SELECT * FROM stocks WHERE info LIKE ?",
            [`%${info}%`]
        );
        if (rows.length === 0) {
            return null;
        }
        else {
            return rows[0].order_id;
        }
    } catch (error) {
        console.log(">>check err", error)
    }
}


export {
    addStock,
    getStocksByProduct,
    markStockAsSold,
    deleteStock,
    getProductByQuantity,
    getOrderByStock,
    getStockByOrder


}