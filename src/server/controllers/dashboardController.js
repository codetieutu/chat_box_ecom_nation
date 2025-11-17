// Mock data
const dashboardStats = {
    totalUsers: 1245,
    totalProducts: 89,
    totalOrders: 342,
    lowStock: 12,
    revenue: 45678000
};

const mockProducts = [
    { id: 1, name: 'Capcut Pro 6 tháng', price: 299000, quantity: 100, status: 'available' },
    { id: 2, name: 'Capcut Pro 3 tháng', price: 199000, quantity: 150, status: 'available' },
    { id: 3, name: 'Capcut Pro 1 tháng', price: 99000, quantity: 200, status: 'available' },
    { id: 4, name: 'Adobe Premiere 1 năm', price: 1999000, quantity: 5, status: 'low-stock' }
];

const mockUsers = [
    { id: 1, name: 'Nguyễn Văn A', email: 'a@email.com', role: 'user', status: 'active' },
    { id: 2, name: 'Trần Thị B', email: 'b@email.com', role: 'admin', status: 'active' },
    { id: 3, name: 'Lê Văn C', email: 'c@email.com', role: 'user', status: 'inactive' }
];

const mockOrders = [
    { id: 1, customer: 'Nguyễn Văn A', product: 'Capcut Pro 6 tháng', amount: 299000, status: 'completed', date: '2024-01-15' },
    { id: 2, customer: 'Trần Thị B', product: 'Adobe Premiere 1 năm', amount: 1999000, status: 'pending', date: '2024-01-16' },
    { id: 3, customer: 'Lê Văn C', product: 'Capcut Pro 3 tháng', amount: 199000, status: 'processing', date: '2024-01-16' }
];

export const getDashboard = (req, res) => {
    res.render('dashboard/index', {
        title: 'Dashboard',
        currentPage: 'dashboard',
        stats: dashboardStats,
        recentOrders: mockOrders.slice(0, 5),
        lowStockProducts: mockProducts.filter(p => p.status === 'low-stock'),
        layout: 'dashboard/layout'
    });
};

export const getProductsManagement = (req, res) => {
    res.render('dashboard/products', {
        title: 'Quản lý Sản phẩm',
        currentPage: 'products',
        products: mockProducts
    });
};

export const getUsersManagement = (req, res) => {
    res.render('dashboard/users', {
        title: 'Quản lý Người dùng',
        currentPage: 'users',
        users: mockUsers
    });
};

export const getStockManagement = (req, res) => {
    res.render('dashboard/stock', {
        title: 'Quản lý Kho hàng',
        currentPage: 'stock',
        products: mockProducts
    });
};

export const getOrdersManagement = (req, res) => {
    res.render('dashboard/orders', {
        title: 'Quản lý Đơn hàng',
        currentPage: 'orders',
        orders: mockOrders
    });
};