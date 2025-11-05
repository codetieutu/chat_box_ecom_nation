import { db } from "./database.js";
import { updateProductQuantity } from "./productUtil.js";

// Thêm item mới vào stock
const addStock = async (productId, info) => {
    const [result] = await db.query(
        "INSERT INTO stocks (product_id, info) VALUES (?, ?)",
        [productId, info]
    );

    // Tăng số lượng trong bảng products
    await db.query("UPDATE products SET quantity = quantity + 1 WHERE id = ?", [productId]);

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

export const getProductByQuantity = async (productId, quantity) => {
    try {
        // 1️⃣ Get unsold stock items for this product
        const [rows] = await db.query(
            "SELECT * FROM stocks WHERE product_id = ? AND is_sold = false LIMIT ?",
            [productId, quantity]
        );

        // 2️⃣ Mark these stock items as sold (optional — depends on your flow)
        const stockIds = rows.map((r) => r.id);
        if (stockIds.length > 0) {
            await db.query(
                `UPDATE stocks SET is_sold = true WHERE id IN (${stockIds.map(() => "?").join(",")})`,
                stockIds
            );
        }

        // 3️⃣ Update the product quantity in main table
        await updateProductQuantity(productId, -quantity);

        return rows; // return selected stock items if needed
    } catch (error) {
        console.error("⚠️ getProductByQuantity error:", error);
        throw error;
    }
};


export {
    addStock,
    getStocksByProduct,
    markStockAsSold,
    deleteStock,

}