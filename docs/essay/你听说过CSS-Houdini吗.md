# 你听说过CSS-Houdini吗

`ECMAScript` 出新特性了 --> `ES6、7、8、9、10...` --> 太好啦，大家快用起来啊，JS🐮🍻！

`CSS` 出新特性了 --> `flex`、`grid`、`mask`、`filter`... --> 哦，然并卵🙄

为什么大家对 `JS` 和 `CSS` 更新的看法相差如此之大呢

一个语言的更新迭代一般要经过下面这个流程

提出新特性 --> 编写规范文档 --> 各家浏览器实现 --> 等待浏览器采用并更新 --> 开发者正式使用新特性

正常来说，从提出到使用，其跨度一般以年为单位

## JS 的现状

但是，实际情况是，`js`通过`babel`和各种`polyfill`库，`babel`转换语法，`polyfill`处理新属性和方法，使得开发者能提前用上最新的特性，这样一来，上面的流程就成了

提出新特性 --> 编写规范文档 --> `babel、polyfill`实现 --> 开发者提前使用

其跨度短则几天，多则数月

## CSS 的现状

在`CSS`这边，各种兼容问题根式头疼，那为什么不写个`CSS-polyfill`呢？

`JS`之所以能做到这样，是因为它是一门动态语言，天生具有很强的可扩展性。比如，我不满意数组的`sort`方法，可以在`Array.prototype`上加个新方法，甚至直接替换掉。又比如，浏览器不支持`async/await`，可以用`promise`模拟；如果`promise`不支持，就用回调封装，总归是有办法的。

`JS`属于`GPL(General Purpose Language)`，即“通用编程语言”，可以编写任意计算机程序，也是图灵完备的

而`CSS`属于`DSL(Domain Specific Language)`，即“领域特定语言”，是为了解决某一类任务而专门设计的计算机语言，比如`HTML`、`SQL`、`Regex`，这种语言往往通过牺牲表达能力来换取在特定领域上的高效。一行正则要是翻译成代码，会有多少行`if/else`。而且这种语言都是声明式的写法，没有计算和执行的概念。它们可以看成一种更高级的封装，天生表达能力的限制导致你只能按照文档写，没法加功能，没法改功能，只能在有限的指令里排列组合。

现在的那些`CSS-Preprocessor`，如`SASS`、`LESS`，在`CSS`里加入了部分表达能力，有了变量、常量、嵌套、混入、函数等概念，但这只是对开发人员而言，它输出的还是`纯粹的CSS`，并不会添加或改变属性，也做不到兼容新特性，只不过是提高了编写`CSS`的效率，把项目变得更"工程化"了一点。

有一些库可以让浏览器使用尚不支持的新特性，一种方式是通过`js`强行模拟，比如`position: sticky`的兼容，在滚动的时候判断位置，切换定位定位方式。对开发人员而言至少实现了功能，不过一旦有了`js`的加入，性能可能会下降，代码复杂度则会上升，用户体验肯定比不过原生。

另一种兼容方式是通过其他`CSS`属性来模拟不兼容的属性，比如`flex`布局，可以用`table`或是各种定位做出类似的排版效果；裁剪属性用不了，可以用多个`DOM`拼出同样的形状。缺点是会提高代码的复杂度，可能会增加`DOM`的数量；实现效果一般般，有些属性还模拟不了。

还有一个问题，要是无法提前使用新特性，那就等等嘛，提前看看就当预习了，但是偏偏各大浏览器还不统一，你去`caniuse`上查查，总是有个别浏览器特叛逆，别人都实现了，就它不支持。那有什么办法呢，要么针对特定浏览器做特殊兼容处理，要么就放弃使用该特性，只有极少数神仙老板的做法是放弃该浏览器。

## CSS Houdini

先看一下网页的渲染过程

`CSS`是没有任何控制能力的，`JS`，你不能控制浏览器如何解析`HTML/CSS`，不能控制元素的布局和绘制，能控制的只有`DOM`和部分`CSSOM`，比如手动创建/删除`DOM`，给`DOM`修改样式，手动引入一条`css`链接。但是，上述操作的后果是，会再跑一次上面的渲染步骤。

那么有没有一种办法，可以让开发者能对以上流程加以干涉呢？

同学，你听说过`CSS Houdini`吗？

`Houdini`是`W3C`的一个工作组，成员是来自各大浏览器和大公司的工程师，他们计划通过一些`API`，让开发者具有拓展`CSS`的能力，并且能够介入浏览器的渲染过程。

现在一共有7大`API`，具体进度和各个浏览器完成度如下，下面我们来依次介绍下。

### Parser API

### Properties & Values API

### Typed OM

### Layout API

### Paint API

### AnimationWorklet

### Font Metrics API

本文部分内容翻译自 [https://www.smashingmagazine.com/2016/03/houdini-maybe-the-most-exciting-development-in-css-youve-never-heard-of/](https://www.smashingmagazine.com/2016/03/houdini-maybe-the-most-exciting-development-in-css-youve-never-heard-of/)

参考:
  
  [https://www.w3cplus.com/css/css-houdini.html](https://www.w3cplus.com/css/css-houdini.html)

  [https://imweb.io/topic/5c34666e611a25cc7bf1d881](https://imweb.io/topic/5c34666e611a25cc7bf1d881)

Houdini进度 [https://ishoudinireadyyet.com/](https://ishoudinireadyyet.com/)

示例 [https://css-houdini.rocks/](https://css-houdini.rocks/)

示例2 [https://github.com/GoogleChromeLabs/houdini-samples](https://github.com/GoogleChromeLabs/houdini-samples)


[https://developers.google.cn/web/fundamentals/performance/critical-rendering-path/render-tree-construction?hl=zh-cn](https://developers.google.cn/web/fundamentals/performance/critical-rendering-path/render-tree-construction?hl=zh-cn)