# vue-cli3移动端项目配置不完全指南

## 移动端适配 - vw方案

移动端适配有`rem`和`vw`两种方案，这里选择更优秀的`vw`

  * postcss-px-to-viewport
    
    将`px`自动转换成`vw`等视窗单位

    ```js
    // postcss.config.js 相关配置
    {
      'postcss-px-to-viewport': {
        viewportWidth: 750, // 视窗的宽度，一般750
        unitPrecision: 3, // px转换为vw无法整除时的最大小数位数
        viewportUnit: 'vw', // 指定需要转换成的视窗单位，一般是vw
        selectorBlackList: ['.ignore'], // 指定不转换为视窗单位的类名
        minPixelValue: 1 // <=1px不转换为vw
      }  
    }
    ```

    这个插件已经实现了适配功能，接下来要做的是兼容处理

  * viewport-units-buggyfill

    ```js
    // main.js
    let hacks = require('viewport-units-buggyfill/viewport-units-buggyfill.hacks')
    require('viewport-units-buggyfill').init({
      hacks
    })
    ```
    使用时，只要用到了`vw`的地方，都需要加上`content: 'viewport-units-buggyfill;...'`，非常麻烦，所以需要下面的插件辅助

  * postcss-viewport-units

    自动给CSS属性添加`content`的属性

    如果自己写了`content`属性，就会和插件产生冲突，需要单独做处理

    ```js
    // postcss.config.js 
    { // 若已有content属性，不自动添加内容
      'postcss-viewport-units': {
        filterRule: rule => rule.nodes.findIndex(i => i.prop === 'content') === -1
      }
    }
    ```

## 路径别名

cli2的路径别名配置在`webpack.base.conf.js`的`resolve.alias`中

cli3也差不多

```js
// vue.config.js
{ // 也可写在configureWebpack里
  chainWebpack: config => {
    config.resolve.alias
      .set('@', resolve('src'))
      .set('views', resolve('src/views'))
  }
}
```

## 打包时去除console

`uglifyjs-webpack-plugin`

```js
// vue.config.js
{
  configureWebpack: config => {
    ...
    new UglifyJsPlugin({
      uglifyOptions: {
        warnings: false,
        compress: {
          drop_console: true,
          drop_debugger: false,
          pure_funcs: ['console.log']
        }
      },
      sourceMap: false,
      parallel: true
    })
    ...
  }
}
```

## 开启gzip

`compression-webpack-plugin`

```js
// vue.config.js
{
  configureWebpack: config => {
    ...
    new CompressionWebpackPlugin({
      filename: "[path].gz[query]",
      algorithm: "gzip",
      test: /\.(js|css|json|html|ico|svg)(\?.*)?$/i,
      threshold: 10240,
      minRatio: 0.8
    })
    ...
  }
}
```

## 打包分析

`webpack-bundle-analyzer`

```js
// vue.config.js
const BundleAnalyzerPlugin = require('webpack-bundle-analyzer').BundleAnalyzerPlugin
{
  configureWebpack: config => {
    ...
    new BundleAnalyzerPlugin()
    ...
  }
}
```

## scss全局变量

```js
// vue.config.js
{
  css: {
    loaderOptions: {
      scss: {
        data: '@import "~@/path/to/variables.scss"'
      }
    }
  }
}
```

## 图片压缩

`image-webpack-loader`

内网装不了，艹

```js
// vue.config.js
{
  chainWebpack: config => {
    config.module
      .rule("images")
      .use("image-webpack-loader")
      .loader("image-webpack-loader")
  }
}
```

## 图片base64编码

自带`url-loader`

可能需要改写配置

```js
// vue.config.js
{
  chainWebpack: config => {
    config.module
      .rule('images')
      .use('url-loader')
      .tap(options => Object.assign(options, { limit: 10000 }))
      // 修改最小编码限制 10k以下
  }
}
```

## 生产环境同时加载了所有文件

在默认配置下，生产环境首次加载会同时请求所有js和css文件，是因为cli3使用了`preload`和`prefetch`

`Preload`：当前页面可能需要的资源，会和当前资源一起下载

`Prefetch`：在未来可能会用到的资源，当前资源加载完成后会下载

打包的`index.html`里，像`xxx.app.xxx.js`、`xxx.venders.xxx.js`资源标签都加了`rel=preload`
而其他按需加载的资源都加了`rel=prefetch`

测试后发现`prefetch`并不会拖慢首屏加载，不过可能会增加一点服务器压力，换来的是后续的资源请求直接从缓存里取，增加了一点流畅度

要不要用看情况，下面是禁用的写法

```js
// vue.config.js
{
  ...
  chainWebpack: config => {
    config.plugins
      .delete('preload')
      .delete('prefetch')
  }
  ...
}
```


## 其他问题

### 无痕模式storage无效

部分移动端浏览器在无痕模式下`localStorage`异常

  * localStorage对象依然存在
  * `setItem`报错
  * `getItem`和`removeItem`忽略

所以需要先判断是否是无痕模式，再调整数据存储方式

```js
// 初始化时执行
const SUPPORT_STORAGE = (() => {
  try {
    localStorage.setItem('test-key', 'test-value')
    localStorage.removeItem('test-key')
    return true
  } catch (err) {
    return false
  }
})()

// 正常情况用localStorage
// 其他情况用cookie代替
```

### 无请求体的`post`自动转为`get`

在某些浏览器下，当`post`请求没有请求体时，会自动转成`get`请求，导致404

可在请求发送前加拦截

```js
request.interceptors.request.use(config => {
  if (config.method === 'post' && config.data === undefined) {
    config.data = '{"x":1}'
  }
  return config
}, error => Promise.reject(error))
```

### 真机调试

移动端真机调试要么直连要么通过`weinre`这类工具，可要是在内网环境且设备欠缺时，这些方法都没用

`vConsole`相当于在真机上加了一个简化版的控制台，可以看到报错信息、请求等信息，似乎微信小程序的真机调试模式也是用的这个

```html
<!-- 仅限开发环境 -->
<script type="text/javascript" src="<%= BASE_URL %>vconsole.min.js"></script>
<script type="text/javascript">
  new Vconsole()
</script>
```

