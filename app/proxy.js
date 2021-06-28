const express = require('express')
const router = express.Router();
const proxy = require('../proxy/index')
const app = express()
const { HOST, ORIGIN_PROT, PROXY_PROT } = require('../const/const')


const proxyRouter = router.all(/^\//, proxy({
    host: HOST,
    port: ORIGIN_PROT
}));

app.use('/', proxyRouter)

app.listen(PROXY_PROT, () => console.log("代理服务器运行在"+ PROXY_PROT))


