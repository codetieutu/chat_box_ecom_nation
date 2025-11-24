import express from 'express';
import { getAllOrders, getMonthRevenue, getOrderById, updateOrder } from '../../utils/orderUtil.js';
import { notifyUser } from '../../bot/sendMess.js'
import { getOrderByStock, getStockByOrder } from '../../utils/stockUtil.js';
const router = express.Router();

// Order list
router.get('/', async (req, res) => {
    const orders = await getAllOrders();
    const now = new Date();
    const month = now.getMonth() + 1;
    const year = now.getFullYear();
    const monthRenevue = await getMonthRevenue(month, year);
    orders.monthRenevue = monthRenevue;
    res.render('orders/list', {
        searchQuery: '',
        title: 'Order Management',
        active: 'orders',
        orders: orders,
        pageCss: 'orders.css'
    });
});

// Deliver order
router.post('/deliver/:id', async (req, res) => {
    const seller_note = req.body.delivery_note
    const orderId = parseInt(req.params.id);
    try {
        await updateOrder(orderId, { seller_note: seller_note, status: "success" });
        const message = `
✅ *Your Order Has Been Completed!*
────────────────────
💬 *Message from Seller:*
${seller_note}
`;
        const order = await getOrderById(orderId);
        await notifyUser(order.user_id, message);
    } catch (error) {
        console.log(error);
        throw error;
    }
    res.redirect('/orders');
});

// Cancel order
router.get('/search', async (req, res) => {
    try {
        const searchQuery = req.query.q || '';

        // Tìm kiếm orders dựa trên query
        const orderId = await getOrderByStock(searchQuery)
        const orders = await getOrderById(orderId);

        const now = new Date();
        const month = now.getMonth() + 1;
        const year = now.getFullYear();
        const monthRenevue = await getMonthRevenue(month, year);
        orders.monthRenevue = monthRenevue;
        res.render('orders/list', {
            searchQuery: '',
            title: 'Order Management',
            active: 'orders',
            orders: orders,
            pageCss: 'orders.css'
        });
    } catch (error) {
        console.error('Search error:', error);
        res.status(500).render('error', { message: 'Search failed' });
    }
});

router.get('/:orderId/stock', async (req, res) => {
    try {
        console.log("activate")
        const orderId = req.params.orderId;

        // Lấy thông tin order
        const stocks = await getStockByOrder(orderId);
        const quantity = stocks.length;


        res.json({
            success: true,
            quantity,
            stocks,
        });

    } catch (error) {
        console.error('Stock API error:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error'
        });
    }
});

export default router;