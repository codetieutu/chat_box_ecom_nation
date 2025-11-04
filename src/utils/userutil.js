import fs from "fs/promises";
import path from "path";
import { fileURLToPath } from "url";
// import products from "../bot/commands/actions/products";
// import { get } from "http";

// Lấy đường dẫn tuyệt đối đến file hiện tại
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// => Đường dẫn chính xác đến file JSON
const jsonPath = path.join(__dirname, "../resource/users.json");

const getUserAll = async () => {

}

const getUserById = async (id) => {
    try {
        const data = await fs.readFile(jsonPath, "utf8");
        const users = JSON.parse(data);
        const user = users.find(user => user.id === id);
        return user;
    } catch (error) {
        return {};
    }

}

const addUser = async (user) => {
    try {
        // Đọc dữ liệu từ file
        const data = await fs.readFile(jsonPath, "utf8");
        const users = JSON.parse(data);

        // Tìm user đã có chưa
        const existingUser = users.find((u) => u.id === user.id);

        if (existingUser) {
            // Nếu đã tồn tại thì trả về user đó
            return existingUser;
        }

        // Nếu chưa có thì thêm mới và ghi lại file
        users.push(user);
        await fs.writeFile(jsonPath, JSON.stringify(users, null, 2), "utf8");

        return user;

    } catch (error) {
        // Nếu file chưa tồn tại hoặc lỗi parse, tạo file mới
        if (error.code === "ENOENT") {
            await fs.writeFile(jsonPath, JSON.stringify([user], null, 2), "utf8");
            return user;
        }

        console.error("❌ Lỗi trong addUser:", error);
        throw error;
    }
}

export {
    getUserAll,
    getUserById,
    addUser
}