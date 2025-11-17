// productUtil.js
import { db } from "./database.js";

/**
 * Lấy tất cả sản phẩm
 * @returns {Promise<Array>}
 */
export async function getAllProducts() {
    const [rows] = await db.execute(
        "SELECT id, name, description, type FROM products ORDER BY id DESC"
    );
    return rows;
}

export async function getProductByPage(page = 0, limmit = 10) {
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


/**
 * Lấy chi tiết 1 sản phẩm theo id
 * @param {number} id
 * @returns {Promise<Object|null>}
 */
export async function getProductById(id) {
    const [rows] = await db.execute(
        "SELECT id, name, description, type FROM products WHERE id = ?",
        [id]
    );

    if (rows.length === 0) return null;
    return rows[0];
}

/**
 * Tạo sản phẩm mới
 * @param {{ name: string, description?: string, type?: 'available'|'preorder' }} product
 * @returns {Promise<number>} id sản phẩm vừa tạo
 */
export async function createProduct(product) {
    const { name, description = null, type = "available" } = product;

    const [result] = await db.execute(
        "INSERT INTO products (name, description, type) VALUES (?, ?, ?)",
        [name, description, type]
    );

    // result.insertId là id auto_increment
    return result.insertId;
}

/**
 * Cập nhật sản phẩm
 * @param {number} id
 * @param {{ name?: string, description?: string, type?: 'available'|'preorder' }} product
 * @returns {Promise<boolean>} true nếu cập nhật thành công
 */
export async function updateProduct(id, data) {
    // Lọc các cặp key-value hợp lệ
    const fields = [];
    const values = [];

    // danh sách các trường được phép cập nhật
    const allowedFields = ["name", "description", "type"];

    for (const key of Object.keys(data)) {
        if (allowedFields.includes(key)) {
            fields.push(`${key} = ?`);
            values.push(data[key]);
        }
    }

    // nếu không có trường hợp lệ nào thì bỏ qua
    if (fields.length === 0) {
        throw new Error("No valid fields to update");
    }

    // thêm id vào cuối values cho WHERE
    values.push(id);

    const sql = `UPDATE products SET ${fields.join(", ")} WHERE id = ?`;

    const [result] = await db.execute(sql, values);
    return result.affectedRows > 0;
}


/**
 * Xoá sản phẩm
 * @param {number} id
 * @returns {Promise<boolean>} true nếu xoá thành công
 */
export async function deleteProduct(id) {
    const [result] = await db.execute("DELETE FROM products WHERE id = ?", [id]);
    return result.affectedRows > 0;
}
