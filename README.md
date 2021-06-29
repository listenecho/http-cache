# 「Http系列」强缓存协商缓存是个什么妖魔鬼怪



### 前言

***这道题面试基本都要考！！！***

缓存的对于用户的意义，更快的获取到服务器数据，减少页面的加载时间，有良好的产品使用体验。

缓存的对于老板的意义，减少了冗余数据传输，节省了网络费用，减少了服务器压力，节省了带宽，能够同时为更多的用户带来优质的服务，赚到了💰。

缓存的对于程序员的意义，提高的技术水平，增加了面试吹牛逼的功力，为更有钱的老板服务。



**so 缓存是有价值的，加油打工人**

### 

<img src="https://leanr.oss-cn-beijing.aliyuncs.com/img//image-20210627222211639.png" alt="image-20210627222211639" style="zoom:70%;" />



### 强缓存

提到强缓存那一定跟`Expires`与`Cache-Control`这两兄弟属性脱不了干系。

命中强缓存不会再向服务器发送请求，浏览器会直接从`disk cache`或者`memory cache`中直接获取资源。

* disk cache：硬盘缓存，在硬盘，但不是永久存储，在一定的条件下会被移除，如资源过期。
* memory cache：内存缓存，储存在内存中，响应快，一旦浏览器关闭，资源随即被释放。一般直接参与页面渲染的元素会被放在memory cache中

至于浏览器将资源存储在哪里？网上众说纷纭。唯一可以肯定的是，大文件一定是在disk cache中。

我在测试的过程中也发现了一些问题。对于高频率读写的资源，防止开销极大的IO操作，资源缓存在memory-cache中比较合理。

1. 浏览器发起请求，服务端返回带有图片的html，设置 `max-age=10000`,可以看到html为disk cache，js与jpg都是memory cache。使用前进与后退测试（测试的时候不要点击，刷新或者F5）。

   ![image-20210629230526350](https://leanr.oss-cn-beijing.aliyuncs.com/img//image-20210629230526350.png)

   当我新开一个浏览器窗口输入我的地址得到如下结果，js与png都变成了disk cache，并且点击刷新又演变成了memory cache，点击前进后退，则变成disk cache，令人费解。

   ![image-20210629221801761](https://leanr.oss-cn-beijing.aliyuncs.com/img//image-20210629221801761.png)

2. 浏览器默认请求头 `cache-control: max-age=0`，会影响测试结果，最好使用chrome插件更改请求头，我测试的时候设置为`cache-control:public`。

3. 服务端`cache-control`值发生改变的时候一定要对浏览器强刷新`清空缓存并硬性强制加载`。



> In Memory Cache:  Chrome currently uses a shared memory cache across all processes.  Maximum size is currently 32MB, partitioned across the active processes.

https://developer.chrome.com/docs/extensions/reference/webRequest/#caching

##### Expires

`Expires` 这个是哥哥，早在HTTP/1.0中的就诞生，它的值是一个绝对时间。

~~~
Expires: Fri, 05 June 2021, 05:00:00 GMT
~~~

服务器将一个特定的时间返回给浏览器，告诉浏览器在指定时间以前，访问资源就用本地缓存副本就行，如果过了指定时间，则服务器会重新返回新的资源。

但是这样有个隐患

>  HTTP设计者认为很多服务器的时钟，不同步或者完全不正确，这样导致返回给客户端的时间是错误的，缓存策略达不到预期。

就这样`Expires` 由于它天生的不完善，慢慢的被淘汰，退出历史舞台。



##### Cache-Control

`Cache-Control`是弟弟，在HTTP/1.1中出现，青出于蓝而胜于蓝，弥补了哥哥的缺陷。

~~~
Cache-Control: max-age=1000
~~~

`max-age`表示从服务器拿到资源的时间开始，资源能够保持新鲜的剩余秒数，通过当前计算日期与返回资源的日期之间的差值，来决定是否再次向服务器发起请求获取最新的资源。



`Cache-control`的强大之处不仅仅只是`max-age`一种使用方式，还有其他控制缓存的配置，繁多的首部配置也是学习HTTP的一大障碍啊！

下面我就拿常用的`Cache-control`几个值展开介绍。为了便于记忆我把相关的值放在一起



***位置***

<img src="https://leanr.oss-cn-beijing.aliyuncs.com/img//image-20210627224748725.png" alt="image-20210627224748725" style="zoom:50%;" />

* `public`：表示在任意端（用户端/代理缓存服务器或其他网关）都可以缓存资源。

  ~~~js
  Cache-Control: public 
  ~~~

* `private`：资源只能缓存在特定的用户端

  ~~~js
  Cache-Control: private
  ~~~



***时间***

* `max-age`

  ```js
  Cache-Control: max-age=3600
  ```

* `s-max-age` ：***s*** 理解为`share`,共享的意思。

  ```javascript
  Cache-Control: s-max-age=3600
  ```

  `max-age=0` 表示无论响应头response如何设置，在重新获取资源之前，先检验`ETag/Last-Modified`(协商缓存)



***校验***

* `must-revalidate`：在事先没有跟原始服务器进行再验证的情况下，不能提供这个对象的陈旧副本，如果验证缓存失败504错误🙅

* `proxy-revalidate`：缓存服务器需要对缓存的有效性再验证。

* `no-cache`

  ***字面意思看来很容易产生误解，其实并不是不设置缓存的意思。***

  ```
  Cache-Control: no-cache
  ```

  在使用缓存副本之间，无论资源是否过期，都要向服务器验证副本的新鲜度，防止本地缓存副本过期。

  

  ⚠️如果在**客户端/请求头**中的 `Cache-Control：no-cache`，则忽视**服务端/响应头**`Cache-Control`配置，重新请求资源，返回200状态码。

  以PC端淘宝首页为例子，在不打开 Chrome浏览器的 Disable cache，请求头为`Cache-Control：max-age=0`，响应头`Cache-Control：max-age=0, s-maxage=116`，重复强刷新浏览器，www.taobao.com 这个静态文件的Status code 始终为 304，但是一旦将Disable cache选项打开，每次获取的资源状态码都是200。（感兴趣的同学可以自行去验证，就不放图占用篇幅）

  

  ![image-20210627185309776](https://leanr.oss-cn-beijing.aliyuncs.com/img//image-20210627185309776.png)

  

***存储***

* `no-store`：不缓存资源副本，千万别跟 `no-cache`混淆





### 协商缓存

协商缓存是指客户端与服务器之间协商

如果有以下情况出现则触发协商缓存

* 没有设置Expires/Expires时间已过期。
* 没有设置Cache-Control/max-age没有剩余时间已过期。
* Cache- Control值为no-cache

出现上述三种情况，浏览器就会与服务器之间协商。



强缓存是两个兄弟👬，`Expires`与`Cache-Control`控制，协商缓存是两个组合！！



**Last-Modified/If-Modified-Since**与**ETag/If-None-Match** 

看到这个字母还是有点多，从简单点出发，一言以蔽之。

协商缓存两种方式判断资源是否新鲜

* 判断缓存副本与服务器上的资源最后修改日期是否一致
* 判断缓存副本与服务器上的资源实体标签Etag是否一致





#### Last-Modified/If-Modified-Since



#### **ETag/If-None-Match** 





