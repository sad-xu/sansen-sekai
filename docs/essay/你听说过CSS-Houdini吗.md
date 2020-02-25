# 你听说过CSS-Houdini吗


`ECMAScript` 出新特性了 --> `ES6、7、8、9、10...` --> 太好啦，大家快用起来啊，JS🐮🍻！

`CSS` 出新特性了 --> `flex`、`grid`、`mask`、`filter`... --> 哦，然并卵🙄

为什么大家对 `JS` 和 `CSS` 更新的看法相差如此之大呢

一个语言的更新迭代一般要经过下面这个流程

提出新特性 --> 编写规范 --> 各家浏览器实现 --> 等待浏览器采用并更新 --> 使用新特性

正常来说，从提出到使用，其跨度一般以年为单位

## JS 的流程

但是，`js`有`babel`和各种`polyfill`库，`babel`转换语法，`polyfill`处理新属性和方法，经过它们的处理，开发者能用上最新的特性，浏览器上跑的是最稳定版本的代码，这样一来，上面的流程就成了

提出新特性 --> 编写规范 --> `babel、polyfill`实现 --> 使用新特性

其跨度短则几天，多则数月

## CSS 的流程

那为什么不写个`CSS-polyfill`呢？

`JS`之所以能做到，是因为它是一门动态语言，有很强的可扩展性，比如，我不满意数组的`sort`方法，可以在`Array.prototype`上加个新方法，甚至直接替换掉。又比如，浏览器不支持`async/await`，可以用`promise`模拟；如果`promise`不支持，就用回调模拟，这总归是支持的吧。

但是，`CSS`却几乎不可能做到这一步，现在的一些`CSS-preprocessor`，如`SASS`、`LESS`，只不过是提高了编写`CSS`的效率，把项目变得更"工程化"了一点，它输出的还是`纯CSS`，并不会添加或改变`CSS`属性，也做不到兼容新特性。

要想使用浏览器不支持的新性，除非通过`js`手动模拟出来，比如`position: sticky`的兼容，不过一旦有了`js`的加入，性能可能会下降，代码复杂度则会上升，用户体验肯定比不过原生。

另一种兼容方式是通过其他`CSS`属性来模拟不兼容的属性，比如`flex`布局，可以用`table`或是各种定位做出同样的排版效果；裁剪属性用不了，可以用多个`DOM`拼出同样的形状。这种的缺点还是会提高代码的复杂度，增加`DOM`的数量；实现效果一般般，有些属性还模拟不了。

本文部分内容翻译自 [https://www.smashingmagazine.com/2016/03/houdini-maybe-the-most-exciting-development-in-css-youve-never-heard-of/](https://www.smashingmagazine.com/2016/03/houdini-maybe-the-most-exciting-development-in-css-youve-never-heard-of/)

参考:
  
  [https://www.w3cplus.com/css/css-houdini.html](https://www.w3cplus.com/css/css-houdini.html)

  [https://imweb.io/topic/5c34666e611a25cc7bf1d881](https://imweb.io/topic/5c34666e611a25cc7bf1d881)

Houdini进度 [https://ishoudinireadyyet.com/](https://ishoudinireadyyet.com/)

示例 [https://css-houdini.rocks/](https://css-houdini.rocks/)

示例2 [https://github.com/GoogleChromeLabs/houdini-samples](https://github.com/GoogleChromeLabs/houdini-samples)
