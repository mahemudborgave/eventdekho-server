import express from "express";
const router = express.Router();

router.get('/one', (req, res) => {
    console.log('from sample file');
    res.send("from sample file");
});

export default router;