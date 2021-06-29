const express = require('express')
const path = require('path')
const app = express()
const PORT = 9999

/**  eTag 开关 */
app.set('etag', false); // weak etag-时间戳


const date = (new Date()).toUTCString()
const date2 = new Date(new Date().getTime() + 1000).toUTCString()

const etagCode1 = Math.random().toString(16).slice(2,9)
const etagCode2 = Math.random().toString(16).slice(2,9)

let count = 1
app.get('/name', (req, res) => {
    count ++ 
    console.log(new Date().toISOString());
    /**
     * cache-control: 控制缓存机制
     * Cache-Control和Expires
     * Expires： 设置的是一个绝对时间，不安全。已被淘汰
     *  no-store：不缓存响应的资源，每次都要重新去服务器获取资源
     *  no-cache：（注意：字面意思看来是，容易误解为不缓存，但并不是这样的）是为了防止浏览器是使用了过期的缓存，确保资源的新鲜度
     *              所以无论缓存资源是否过期，浏览器都必须去服务器验证当前缓存是否有效。
     *  private：只是在用户端进行资源缓存，缓存代理服务器不能对资源进行缓存。
     *  public： 在请求的任意一端都能对资源进行缓存，（特定用户端，缓存代理服务器）
     *  
     *  max-age：缓存最大有效时间，特定用户端
     *  s-max-age：共享缓存最大有效时间
     *  
     *  must-revalidate：必须向服务器校验缓存的新鲜度
     *  proxy-revalidate：
     *  
     * 
     */

     res.set('Cache-Control', 'max-age=109990')
    //  console.log("no-cache验证");
    /** 
     * 每次请求改变 etag  配合 If-None-Match
     * 强etag： 相关的实体发生变化，无论这个改变多么的细微，都会改变etag的值。
     * 弱etag： 只针对请求所对应的资源是否改变，才会触发etag改变，w/xxxx
     * 
    */
    // res.set('etag', count > 5 ?  etagCode1 : etagCode2);

    /** 
     * Last-Modified：服务端设置日期  
     * If-Modified-Since： 客户端将上次服务端返回的 Last-Modified通过If-Modified-Since传递给服务器， 如果
     * 服务端 Last-Modified 日期值大于 If-Modified-Since 便是服务器在这个日期之后已经更新过资源了，服务器重新返回最新的资源给客户端，状态为200
     * 如果时间相等表示在这日期之后资源未出更改，那么浏览器就重定向到浏览器缓存中获取资源，状态为304
     *  
     * 
     * */
    // res.set('Last-Modified', count > 5 ?  date2 : date);



  
    res.json({
        "name": "Jack Sssam "
    })
})
/**  */

/** 针对静态资源文件对的处理 */
const options = {
      etag: false,
      lastModified: false,
      setHeaders: (res, req)=> {
        res.set('Cache-Control', 'no-store')
      }
}
app.use('/public', express.static(path.join(__dirname, 'public'), options))

app.listen(PORT, () => {
    console.log('服务运行在端口', PORT);
})


