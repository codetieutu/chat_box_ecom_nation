import express from 'express';
const router = express.Router();

router.get('/', (req, res) => {
    res.render('index', {
        title: 'Dashboard',
        active: 'dashboard',
        pageCss: 'index.css'
    });
});

export default router;