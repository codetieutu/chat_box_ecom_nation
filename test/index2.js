import axios from 'axios';
import crypto from 'crypto';
import env from "dotenv"
env.config();

class BinancePolygonTracker {
    constructor(apiKey, secretKey) {
        this.apiKey = apiKey;
        this.secretKey = secretKey;
        this.baseURL = 'https://api.binance.com';
    }

    // Tạo signature cho Binance API
    createSignature(queryString) {
        return crypto.createHmac('sha256', this.secretKey)
            .update(queryString)
            .digest('hex');
    }

    // 1. Lấy lịch sử DEPOSIT (tiền vào Binance qua Polygon) - QUAN TRỌNG
    async getPolygonDepositHistory(asset = 'USDT', limit = 100) {
        try {
            const timestamp = Date.now();
            const queryString = `coin=${asset}&limit=${limit}&timestamp=${timestamp}`;
            const signature = this.createSignature(queryString);

            console.log('🔍 Đang truy vấn deposit history...');

            const response = await axios.get(`${this.baseURL}/sapi/v1/capital/deposit/hisrec`, {
                params: {
                    coin: asset,
                    limit: limit,
                    timestamp: timestamp,
                    signature: signature
                },
                headers: {
                    'X-MBX-APIKEY': this.apiKey
                }
            });

            // Debug: xem toàn bộ response
            console.log('📊 Tổng số giao dịch deposit:', response.data.length);

            // Lọc chỉ giao dịch Polygon với nhiều tên gọi có thể
            const polygonDeposits = response.data.filter(deposit => {
                if (!deposit.network) return false;

                const networkUpper = deposit.network.toUpperCase();
                return (
                    networkUpper.includes('POLYGON') ||
                    networkUpper.includes('MATIC') ||
                    networkUpper === 'POL' ||
                    networkUpper === 'POLYGON MAINNET'
                );
            });

            console.log('\n💰 LỊCH SỬ NẠP TIỀN POLYGON VÀO BINANCE');
            console.log(`Tìm thấy ${polygonDeposits.length} giao dịch Polygon\n`);

            if (polygonDeposits.length === 0) {
                console.log('❌ Không tìm thấy giao dịch Polygon nào trong deposit history');
                console.log('📋 Danh sách các mạng lưới có trong lịch sử:');
                const networks = [...new Set(response.data.map(tx => tx.network).filter(Boolean))];
                networks.forEach(network => console.log(`   - ${network}`));
                return [];
            }

            // Hiển thị chi tiết các giao dịch Polygon
            polygonDeposits.forEach((deposit, index) => {
                console.log(`\n📥 GIAO DỊCH ${index + 1}`);
                console.log(`   Mã giao dịch: ${deposit.txId}`);
                console.log(`   Số lượng: ${deposit.amount} ${deposit.coin}`);
                console.log(`   Mạng: ${deposit.network}`);
                console.log(`   Trạng thái: ${this.getDepositStatusText(deposit.status)}`);
                console.log(`   Thời gian: ${new Date(deposit.insertTime).toLocaleString('vi-VN')}`);
                console.log(`   Địa chỉ nhận: ${deposit.address}`);
                console.log(`   Địa chỉ gửi: ${deposit.fromAddr || 'N/A'}`);
                console.log('   ──────────────────────────');
            });

            return polygonDeposits;

        } catch (error) {
            console.error('❌ Lỗi lấy lịch sử deposit:', error.response?.data || error.message);
            return [];
        }
    }

    // 2. Tìm kiếm giao dịch cụ thể theo transaction hash
    async findTransactionByHash(transactionHash, asset = 'USDT') {
        try {
            console.log(`🔎 Đang tìm kiếm giao dịch: ${transactionHash}`);

            const deposits = await this.getPolygonDepositHistory(asset, 500); // Tăng limit để tìm kỹ hơn

            const foundTx = deposits.find(deposit =>
                deposit.txId && deposit.txId.toLowerCase() === transactionHash.toLowerCase()
            );

            if (foundTx) {
                console.log('\n🎯 ĐÃ TÌM THẤY GIAO DỊCH!');
                console.log('='.repeat(50));
                this.printTransactionDetails(foundTx);
                return foundTx;
            } else {
                console.log(`\n❌ Không tìm thấy giao dịch với hash: ${transactionHash}`);
                console.log('💡 Gợi ý:');
                console.log('   - Kiểm tra lại transaction hash');
                console.log('   - Giao dịch có thể chưa được xác nhận đủ block');
                console.log('   - Có thể là giao dịch internal của Binance');
                return null;
            }

        } catch (error) {
            console.error('❌ Lỗi tìm kiếm giao dịch:', error.message);
            return null;
        }
    }

    // 3. Tìm giao dịch theo số lượng và thời gian (phù hợp với giao dịch của bạn)
    async findTransactionByAmountAndTime(amount = '0.019', targetDate = '2025-11-03') {
        try {
            console.log(`🔎 Tìm kiếm giao dịch ~${amount} USDT vào ngày ${targetDate}`);

            const deposits = await this.getPolygonDepositHistory('USDT', 500);

            const foundTxs = deposits.filter(deposit => {
                const depositAmount = parseFloat(deposit.amount).toFixed(3);
                const targetAmount = parseFloat(amount).toFixed(3);
                const depositDate = new Date(deposit.insertTime).toISOString().split('T')[0];

                return depositAmount === targetAmount && depositDate === targetDate;
            });

            if (foundTxs.length > 0) {
                console.log(`\n🎯 Tìm thấy ${foundTxs.length} giao dịch phù hợp:`);
                foundTxs.forEach((tx, index) => {
                    console.log(`\n📋 Giao dịch ${index + 1}:`);
                    this.printTransactionDetails(tx);
                });
                return foundTxs;
            } else {
                console.log(`\n❌ Không tìm thấy giao dịch phù hợp`);
                return [];
            }

        } catch (error) {
            console.error('❌ Lỗi tìm kiếm:', error.message);
            return [];
        }
    }

    // Helper function để in chi tiết giao dịch
    printTransactionDetails(deposit) {
        console.log(`   Mã giao dịch: ${deposit.txId}`);
        console.log(`   Số lượng: ${deposit.amount} ${deposit.coin}`);
        console.log(`   Mạng: ${deposit.network}`);
        console.log(`   Trạng thái: ${this.getDepositStatusText(deposit.status)}`);
        console.log(`   Thời gian: ${new Date(deposit.insertTime).toLocaleString('vi-VN')}`);
        console.log(`   Địa chỉ nhận: ${deposit.address}`);
        console.log(`   Địa chỉ gửi: ${deposit.fromAddr || 'N/A'}`);
        console.log(`   Block: ${deposit.blockNumber || 'N/A'}`);
        console.log(`   Xác nhận: ${deposit.confirmTimes || 'N/A'}`);
    }

    // Helper functions
    getDepositStatusText(status) {
        const statusMap = {
            0: '🟡 Đang chờ',
            1: '✅ Thành công',
            6: '🟢 Đã credit',
            7: '🟢 Thành công'
        };
        return statusMap[status] || `Trạng thái ${status}`;
    }
}

// Sử dụng
async function main() {
    // 🔴 QUAN TRỌNG: THAY THẾ BẰNG API KEY MỚI CỦA BẠN!
    const apiKey = process.env.BINANCE_API_KEY;
    const secretKey = process.env.BINANCE_API_SECRET;

    const tracker = new BinancePolygonTracker(apiKey, secretKey);

    try {
        console.log('🚀 BẮT ĐẦU TRUY VẤN GIAO DỊCH POLYGON...\n');

        // CÁCH 1: Tìm theo thông tin từ hình ảnh của bạn
        await tracker.findTransactionByAmountAndTime('0.019', '2025-11-03');

        console.log('\n' + '='.repeat(60) + '\n');

        // CÁCH 2: Nếu bạn có transaction hash cụ thể
        // await tracker.findTransactionByHash('0xa19d...def52a');

        console.log('\n' + '='.repeat(60) + '\n');

        // CÁCH 3: Xem toàn bộ lịch sử deposit Polygon
        // await tracker.getPolygonDepositHistory('USDT', 50);

    } catch (error) {
        console.error('💥 Lỗi chính:', error.message);
    }
}

// Chạy chương trình
main();