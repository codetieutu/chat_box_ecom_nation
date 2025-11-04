import { db } from "./database.js";

// Thêm sản phẩm mới
const addProduct = async (p) => {
    const { name,
        price,
        quantity = 0,
        description = "",
        type = "available"
    } = p;
    const [result] = await db.query(
        "INSERT INTO products (name, quantity, price, description, type) VALUES (?, ?, ?, ?,?)",
        [name, quantity, price, description, type]
    );
    return { id: result.insertId, name, quantity };
};

// Lấy danh sách sản phẩm
const getProductAll = async () => {
    const [rows] = await db.query("SELECT * FROM products");
    return rows;
};

// lấy danh sách sản phẩm theo trang
const getProductByPage = async (page = 0, limmit = 10) => {
    try {
        const [rows] = await db.query("SELECT * FROM products ORDER BY id ASC LIMIT ? OFFSET ?", [limmit, page * limmit]);
        const [[{ total }]] = await db.query("SELECT COUNT(*) AS total FROM products");
        const totalPages = Math.ceil(total / limmit);
        return {
            products: rows,
            page: page + 1,
            total: totalPages
        };
    } catch (error) {
        console.error(error);
        return []
    }
}

// Lấy sản phẩm theo ID
const getProductById = async (id) => {
    const [rows] = await db.query("SELECT * FROM products WHERE id = ?", [id]);
    return rows[0] || null;
};

// Cập nhật số lượng sản phẩm
const updateProductQuantity = async (id, delta) => {
    await db.query("UPDATE products SET quantity = quantity + ? WHERE id = ?", [delta, id]);
};

const updateProduct = async (id, fields = {}) => {
    try {
        // Tạo mảng key-value động
        const keys = Object.keys(fields);
        const values = Object.values(fields);

        if (keys.length === 0) throw new Error("No fields to update");

        const setClause = keys.map((key) => `${key} = ?`).join(", ");
        const sql = `UPDATE products SET ${setClause} WHERE id = ?`;

        await db.query(sql, [...values, id]);
    } catch (error) {
        console.error("❌ Error updating product:", error);
        throw error;
    }
};

// Xoá sản phẩm
const deleteProduct = async (id) => {
    await db.query("DELETE FROM products WHERE id = ?", [id]);
};


export {
    addProduct,
    getProductAll,
    getProductById,
    getProductByPage,
    updateProductQuantity,
    deleteProduct,
    updateProduct
}
