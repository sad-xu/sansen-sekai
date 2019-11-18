# SVG图标在项目中的使用

项目中的图标一般用svg，单个svg图标无法动态切换颜色，所以会先在`iconfont.cn`上建个图标集合，再导出使用。

阿里图标库的导出有三种类型，`unicode`，`font-class`，`symbol`

不过这三种方式都有一个共同的缺点：所有图标都混在一起，如果后期要增删图标，就得重新导出文件并整个替换

有一个图标的解决方案，在一个个svg图标，通过`svg-sprite-loader`插件把它们转成`svg-sprite`，再通过组件使用

### 图标组件

传入图标名`iconName`，图标名对应实际svg文件名

`aria-hidden`将元素对辅助设备隐藏，有些设备会识别并朗读dom元素，设为`true`可避免混淆，加不加随意

```html
<svg class="svg-icon" aria-hidden="true">
  <use :xlink:href="iconName"></use>
</svg>
```

这里需要注意把`xlink:href`写成`href`也是可以的

`SVG element: a: xlink:href` iOS >= 3.2  Android >= 3

`SVG element: a: href` iOS >= 9  Android >= 5

但是后者的兼容性不好，在低版本设备不会显示图标，注意别踩坑


在内部组合成id，对应生成的实际id
```js
computed: {
  iconName() {
    return `#icon-${this.iconClass}`
  }
}
```

最后再给些基础样式`svg-icon`

### vue.config.js配置

```js
chainWebpack: config {
  config.module
    .rule('svg')
    .exclude.add(resolve('src/icons'))
    .end()
  config.module
    .rule('icons')
    .test(/\.svg$/)
    .include.add(resolve('src/icons'))
    .end()
    .use('svg-sprite-loader')
    .loader('svg-sprite-loader')
    .options({
      symbolId: 'icon-[name]'
    })
    .end()
}
```

### svg-sprite 生成

图标统一放在一个文件夹中，在外部`index.js`里实现把所有svg文件都require下来

```js
// 包含了`svg`文件夹下所有.svg文件的上下文
const req = require.context('./svg', false, /\.svg$/)
const requireAll = requireContext => requireContext.keys().map(requireContext)
// 生成[Module] 模块数组
requireAll(req)
// 在main.js里引入
```

`let req = require.context(目标目录, 是否搜索子目录, 正则表达式)`

返回一个函数，自带三个属性

* req.resolve()

  返回已解析请求的模块id  

* req.keys()

  返回所有匹配到的文件名数组

* req.id

  模块id

```js
// 函数本体
req = webpackContext(req) {
  var id = webpackContextResolve(req)
  // 即 id = req.resolve(req)
  return __webpack_require__(id)
}
```


