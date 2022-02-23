import express from 'express';
const router = express.Router();

router.get('/', (req, res) => {
    console.log('Funfouse');
    res.render('index.ejs');
});

module.exports = router