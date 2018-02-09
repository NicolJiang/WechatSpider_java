# WechatSpider
抓取微信公众号全部文章，采用AnyProxy+Java实现

# 启动环境
`Java JDK`, `NodeJs`, `npm`, `AnyProxy`, `Mysql`, `maven`, `linux` or `mac os`

# 准备工作
1. `Mysql` 创建表脚本在 `db.sql` 文件中
2. 修改项目中`application.properties`的数据库连接地址

# 启动
```
git clone https://gitee.com/poet/WechatSpider.git

// 进入项目的文件夹
cd WechatSpider

// 安装 AnyProxy
npm install -g anyproxy

// 启动 AnyProxy
anyproxy --intercept --silent true  --rule ~/WechatSpider/src/main/resources/spider.js

// 打包项目
mvn clean install -Dmaven.test.skip=true

// 启动
java -jar target/WechatSplider-1.0-SNAPSHOT.jar
```

# 手机代理设置
1. `host`设置服务器的地址
2. `port=8001`

# 参考资料

1. http://anyproxy.io/cn
2. https://github.com/lqqyt2423/wechat_spider
3. http://www.cnblogs.com/luojiangwen/p/7943696.html
4. https://gitee.com/zsyoung01/AnyProxy