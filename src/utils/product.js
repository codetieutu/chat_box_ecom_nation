import fs from "fs/promises";
import path from "path";
import { fileURLToPath } from "url";
// import products from "../bot/commands/actions/products";
// import { get } from "http";

// Lấy đường dẫn tuyệt đối đến file hiện tại
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// => Đường dẫn chính xác đến file JSON
const jsonPath = path.join(__dirname, "../resource/products.json");

const getProducts = async () => {
    const data = await fs.readFile(jsonPath, "utf8");
    return JSON.parse(data);
};

const getProductById = async (id) => {
    try {
        const fstream = await fs.readFile(jsonPath, "utf-8");
        const data = JSON.parse(fstream);

        const product = data.find(p => p.id == id);
        return product || null; // Nếu không tìm thấy trả về null
    } catch (err) {
        console.error("Error reading product file:", err);
        return null;
    }
};

export {
    getProducts,
    getProductById

};
