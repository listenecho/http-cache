const express = require('express')
const app = express()
const {ORIGIN_PROT } = require('../const/const')

// app.set('etag', false); // weak etag-时间戳

app.get('/name', (req, res) => {
    console.log("目标被请求");
    res.set('cache-control', 'pravite, max-age=89')
    res.json({
        "name": 'jack'
    })
})


app.listen(ORIGIN_PROT, () => { console.log("目标源服务器运行在"+ ORIGIN_PROT) })


