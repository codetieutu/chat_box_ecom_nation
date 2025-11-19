import express from 'express';
import { getTotalProduct } from '../../utils/productUtil.js';
import { getTotalUser } from '../../utils/userUtil.js';
import { getMonthRevenue, getRecentOrder, getTotalOrderPending } from '../../utils/orderUtil.js';
import { notifyAllUsers } from '../../bot/sendMess.js'
const router = express.Router();

router.get('/', async (req, res) => {
    const { success, error } = req.query;
    try {
        const totalProduct = await getTotalProduct();
        const totalUsers = await getTotalUser();
        const totalOrderPending = await getTotalOrderPending();
        const now = new Date();
        const month = now.getMonth() + 1;
        const year = now.getFullYear();
        const monthRevenue = await getMonthRevenue(month, year);
        const recentOrders = await getRecentOrder();
        const dashboardData = {
            title: 'Dashboard',
            active: 'dashboard',
            pageCss: 'index.css',
            statistics: {
                totalProducts: totalProduct,
                totalUsers: totalUsers,
                pendingOrders: totalOrderPending,
                totalRevenue: monthRevenue
            },
            recentOrders: recentOrders,
            successMessage: success, // Truyền trực tiếp query parameter
            errorMessage: error
        };

        res.render('index', dashboardData);

    } catch (error) {
        console.error(error);
        throw error;
    }

});
// Route xử lý gửi notification
router.post('/notifications/send', async (req, res) => {
    try {
        const { message } = req.body;

        // Validate dữ liệu
        if (!message) {
            return res.redirect('/?error=Notification message is required!');
        }

        notifyAllUsers(message);

        res.redirect('/?success=Notification sent successfully!');

    } catch (error) {
        console.error('Notification error:', error);
        res.redirect('/');
    }
});
export default router;