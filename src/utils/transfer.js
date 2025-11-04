import crypto from "crypto"

const geneContent = (amount, timestamp = Date.now(), prefix = "PAY") => {
    // Chuẩn hoá timestamp: lấy số ms cuối cùng hoặc epoch
    const ts = typeof timestamp === "number" ? timestamp : Date.parse(timestamp);

    // Tạo hash ngắn từ timestamp và amount để giảm trùng lặp
    const hash = crypto.createHash("sha1").update(`${amount}-${ts}`).digest("hex").slice(0, 6).toUpperCase();

    // Memo cuối cùng
    return `${prefix}_${hash}`;
}

const contentTransfer = (amount, content, uid = "959301825", name = "Crazy Guy", currency = "USDT") => {
    return (
        `💸 <b>Transfer info</b>\n\n` +
        `<b>UID:</b> ${uid}\n` +
        `<b>Name:</b> ${name}\n` +
        `<b>Currency:</b> ${currency}\n` +
        `<b>Amount:</b> ${amount}\n` +
        `<b>transfer content:</b> ${content}\n` +
        `🔔 Please transfer EXACT amount and EXACT transfer content so we can match your payment.`
    );
}

export {
    geneContent,
    contentTransfer
}