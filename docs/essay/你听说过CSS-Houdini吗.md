# 你听说过CSS-Houdini吗

`ECMAScript` 出新特性了 --> `ES6、7、8、9、10...` --> 太好啦，大家快用起来啊，JS🐮🍻！

`CSS` 出新特性了 --> `flex`、`grid`、`mask`、`filter`... --> 哦，然并卵🙄

为什么大家对 `JS` 和 `CSS` 更新的看法相差如此之大呢？

一个语言的更新迭代一般要经过下面这个流程

提出新特性 --> 编写规范文档 --> 各家浏览器实现 --> 等待浏览器采用并更新 --> 开发者正式使用新特性

正常来说，从提出到使用，其跨度一般以年为单位

## JS 的现状

但是，实际情况是，`js` 通过 `babel` 和各种 `polyfill` 库，`babel` 转换语法，`polyfill` 处理新属性和方法，使得开发者能提前用上最新的特性，这样一来，上面的流程就成了

提出新特性 --> 编写规范文档 --> `babel、polyfill` 实现 --> 开发者提前使用

其跨度短则几天，多则数月

## CSS 的现状

在 `CSS` 这边，各种兼容问题很是头疼，那为什么不写个 `CSS-polyfill` 呢？

`JS` 之所以能做到这样，是因为它是一门动态语言，天生具有很强的可扩展性。比如，我不满意数组的 `sort` 方法，可以在 `Array.prototype` 上加个新方法，甚至直接替换掉。又比如，浏览器不支持 `async/await`，可以用 `promise` 模拟；如果 `promise` 不支持，就用回调封装，总归是有办法的。

`JS` 属于 `GPL(General Purpose Language)`，即“通用编程语言”，可以编写任意计算机程序，也是图灵完备的。

`CSS` 属于 `DSL(Domain Specific Language)`，即“领域特定语言”，是为了解决某一类任务而专门设计的计算机语言，如 `HTML`、`SQL`、`Regex`，这种语言往往通过牺牲部分表达能力来换取在特定领域上的高效。一行正则要是翻译成代码，会有多少行 `if/else`。而且这种语言都是声明式的写法，没有计算和执行的概念。它们可以看成一种更高级的封装，天生表达能力的限制导致你只能按照文档写，没法加功能，没法改功能，只能在有限的指令里排列组合。

现在的那些 `CSS-Preprocessor`，如 `SASS`、`LESS`，在 `CSS` 里加入了部分表达能力，有了变量、常量、嵌套、混入、函数等概念。但这只是对开发人员而言，最终输出的还是 `纯粹的CSS`，并不会添加或改变属性，也做不到兼容新特性，只不过是提高了编写的效率，把项目变得更"工程化"了一点。

有一些库可以让浏览器使用尚不支持的新特性，一种方式是通过 `js` 强行模拟，比如 `position: sticky` 的兼容，在滚动的时候判断位置，切换定位定位方式。对开发人员而言至少功能上实现了。不过一旦有了 `js` 的加入，性能八成会下降，代码复杂度则会上升，用户体验肯定比不过原生。

另一种兼容方式是通过其他 `CSS` 属性来模拟不兼容的属性，比如 `flex` 布局，可以用 `table` 或是各种定位做出类似的排版效果；裁剪属性用不了，可以用多个 `DOM` 拼出同样的形状。缺点是会提高代码的复杂度，可能会增加 `DOM` 的数量；实现效果一般般，有些属性模拟不了。

还有一个问题，要是无法提前使用新特性，那就等等嘛，提前看看就当预习了。​但是偏偏各大浏览器还不统一，你去 `caniuse` 上查查，总是有个别浏览器特叛逆，别人都实现了，就它不支持。那有什么办法呢，要么针对特定浏览器做特殊兼容处理，要么就放弃使用该特性，只有极少数神仙老板的做法是放弃该浏览器。

## CSS Houdini

先看一下网页的渲染过程

`CSS` 是没有任何控制能力的，`JS`，你不能控制浏览器如何解析 `HTML/CSS`，不能控制元素的布局和绘制，能控制的只有 `DOM` 和部分 `CSSOM`，比如手动创建/删除 `DOM`，给 `DOM` 修改样式，手动引入一条 `css` 链接。但是，上述操作的后果是，会再跑一次上面的渲染步骤。

那么有没有一种办法，可以让开发者能对以上流程加以干涉呢？

同学，你听说过 `CSS Houdini` 吗？

`Houdini` 是 `W3C`的一个工作组，成员是来自各大浏览器和大公司的工程师，他们计划通过一些 `API`，让开发者具有拓展 `CSS` 的能力，并且能够介入浏览器的渲染过程。

其进度和各个浏览器完成度如下，公布的有9个 `API`，下面我们来依次介绍下。

### Parser API

这个还只是非官方的实现草案，旨在更直接的公开 `CSS` 解析器，用于将任意类 `CSS` 语言解析为更温和的表示形式？

目前 `CSS` 解析器遇到无法解析的，就会判定无效，相当于没写。有了这个 `API`，我们就可以拓展解析器，比如可以自定义一个 `:diy-before` 的伪元素；可以自定义媒体查询；甚至可以把 `CSS-Preprocessor` 里的 `extend`、`@mixin`、`@for`等语法实现进去，这种实现更底层也更高效。

没有例子，因为没有实现。

### Properties & Values API

自定义属性，应该是完成度最高的一个。

在 `Chrome` 里打开一个空白页，`F12 -> sources`，可以看到在 `local-ntp.css` 里声明了一堆自定义属性，再在下面通过 `var()` 来使用。有一点和`CSS-Preprocessor` 里的变量类似，不过由于它是属性，所以有继承行为，若多次声明，则用标准级联规则确定最终值。区分大小写。

#### 换肤

```css
body {
  --primary-theme-color: tomato;
  transition: --primary-theme-color 1s ease-in-out;
}
body.night-theme {
  --primary-theme-color: darkred;
}
```

上面的写法就是实现了完美的换肤+过渡功能

#### I18n

除了换肤，还能实现国际化功能

```html
<html lang="zh">
  ...
  <p class="tip"></p>
  ...
</html>
```

```css
:root,
:root:lang(en) { --I18n-text: "Give me some money, plz"; }
:root:lang(zh) { --I18n-text: "大爷赏点钱吧"; }

.tip:after {
  content: var(--I18n-text);
}
```

这里的 `root` 在 网页里其实就是 `html` 标签

根据 `lang` 对应的语言，切换样式甚至内容。唯一的问题可能是 `content` 里的内容无法选中。

#### 十亿笑声攻击

在草案里看到一个有趣的例子`billion laughs attack 十亿笑声攻击`

```css
.foo {
  --prop1: lol;
  --prop2: var(--prop1) var(--prop1);
  --prop3: var(--prop2) var(--prop2);
  --prop4: var(--prop3) var(--prop3);
  /* etc */
}
```

`prop2 = 2 * lol`
`prop3 = 4 * lol`
`prop4 = 8 * lol`
`propn = 2 ^ n * lol`

以此类推，`n = 30`时，那就一共有`Math.pow(2, 30) = 1073741824 个 lol`

要避免这种问题，就需要对其做长度限制，目前尚未确定，不过肯定会大于一千字节。

#### 注册的自定义属性

以上说的都是未注册的自定义属性，像一个简单变量，可以随意声明和使用，默认继承。而注册的自定义属性更像一个对象，需要声明。

之所以要注册，是因为在进行到 `paint API` 和 `layout API` 时，需要把自定义属性加入其中，所以注册是一个拓展功能，能让自定义属性参与到后面的绘画和布局行为中。所以要是发现自定义属性不生效，可以试着注册一下。

```txt
{
  属性名,
  语法, // 指值的类型 长度/百分比/颜色......
  是否可继承,
  初始值(可选)
}
```

有两种方式注册，结果都一样

在`CSS`中用`@property`注册

```css
@property --radius {
  syntax: "<length>";
  inherits: false;
  initial-value: 0px;
}
```

在`JS`中用`CSS.registerProperty`注册

```js
CSS.registerProperty({
  name: "--my-color",
  syntax: "<color>",
  initialValue: "black",
  inherits: false
})
```

### Typed OM 1 / 2

将 `CSS` 的值从 `String` 转换为 `Object`，并提供一些属性和方法，使其可以像 `DOM` 那样操作。

之前，我们获取 `CSS` 属性，一般是通过 `.style` 或是 `window.getComputedStyle`，返回的属性值都是字符串，要是某个属性是由多个个组合而成，比如`animation: "none 0s ease 0s 1 normal none running"`，我们需要先解析字符串，分割替换，再生成一段新的字符串才能完成手动修改。浏览器接收到新的值，还需要解析等等。

```js
// 获取指定属性，返回{ 数值, 单位 }
let widthObj = document.querySelector('#xxx').attributeStyleMap.get('width')
// -> CSSUnitValue {value: 400, unit: "px"}

// 设置指定属性, 可以是字符串，也可以是对象
widthObj.value += 100
document.querySelector('#xxx').attributeStyleMap.set('width', widthObj)
```

这种方式省去了解析字符串的过程，据说会显著提高性能。

也能拿到自定义属性，但无论注没注册拿到的都是这种 `CSSUnparsedValue {0: " 33px", length: 1}`，为啥还是字符串？值的前面怎么还有个空格？这要怎么`set`？👴一问三不知。

不光是长度，还有 `CSSTransformValue`、`CSSImageValue` 等，大同小异，文档太长了，没细看。

### Layout API

通过 `registerLayout` 方法，注册自己的布局算法代码，实现自己布局的能力，即拓展 `display`。

这样用 `display: layout('diy-name');`

具体示例后面讲

TODO

### Paint API

和 `Layout API` 类似，提供 `registerPaint`，像 `canvas` 画图一样，绘制自定义图形

在需要用到图像的地方，写 `paint(diy-name)`

这可以说是最有趣的功能了，通过它，相当于把 `canvas` 搬到了 `CSS` 里，能实现非常有趣的功能，不过这里写不下了，下期再说

TODO

### Animation Worklet

用于扩展 `Web 动画`。看起来似乎和 `Paint API` 有重合，但其实不是的。

`Paint API` 注重绘制，而 `Animation Worklet` 侧重于行为与动画的结合。

虽然 `transition` 和 `aimation` 可以实现很多动画，但是它们仅仅是动画而已，无法与鼠标、手势、滚动等行为结合，如果非要结合，就只能通过 `JS`。比如视差滚动，需要绑定滚动事件；平滑滚动的速度，无法控制；基于手势的拖动、缩放、上拉刷新，全是用 `js` 模拟的。这些 `js` 跑在主线程上，在加上事件的频繁触发特性，大大降低了页面的流畅性。

`Animation Worklet` 能将其中的动画与主线程隔离，不需要在主线程耗费大量资源处理事件，这是它的原理图

目前浏览器仅是部分支持，要想用，还得手动开启 `chrome://flags/#enable-experimental-web-platform-features`

而且它的写法有点奇怪，不太感冒

### Font Metrics API

这个和字体有关，相同尺寸下不同字体的文字，它们的宽高是不太一样的，不过我们平时都不怎么在意，因为这并没有引起什么问题，至少我是没有遇到过。

这个`API`主要提供了测量的功能，能告诉我们文字的尺寸、基线位置，特定字体使用的字形数量，以后可能会有文字方向、字符属性等信息。

但感觉没啥用，或许在一些特定布局，需要计算基线距离的时候会有点用吧。

### Box Tree Api

在 `layout` 阶段，会确定文档内容的位置和尺寸，在此过程中，每个 `DOM` 元素和伪元素会产生若干个片段，每个片段会生成一个片段树。

```html
<style>
p { width: 60px; }
p:first-line { color: green; }
p:first-letter { color: red; }
</style>

<p>foo <i>bar baz</i></p>
```

以上代码会生成6个片段，通过该`API`可以获取到这六个片段的信息，但是拿到后该怎么配合什么`API`实现什么功能，不知道。

我看他们还没开始实现，确实没什么意思。

### Worklets

`Worklets` 和 `web worker`类似，是与主线程无关的一个线程，上面说的 `parse`、`Layout`、`Paint` 等 `API` 都需要通过它来注册运行。

它有几个特点：

1. 不跑在某个特定的线程，受渲染引擎控制，可以跑在任何一个线程上。（说明牛B，优化好）

2. 能够并行的在全局创建重复实例 。（说明性能好）

3. 并非基于事件触发机制，而是在全局注册类，由浏览器调用。（说明只提供方法，出了问题都是浏览器的锅）

4. 拥有简化过后的全局 `API`。（说明我们的 `API` 设计简洁优秀）

5. 生命周期与页面无关，其由浏览器决定。（出了问题都是浏览器的锅）

6. 该操作开销较大，最好共享使用。（你用的人也给我注意点，别乱用）

用的时候将注册代码写到单独一个 `js` 文件里，这样写

```js
// 注册 paint
paintWorklet.addModule('paintExample.js')
// 注册 layout
layoutWorklet.addModule('layoutExample.js')
```

注册多个时，不同浏览器执行的顺序可能不一样，这就要求我们的代码具有 `幂等性`，即相同输入的情况下，方法的结果应相同。

因此 `Worklets` 做了以下工作：

1. 没有全局对象引用，`this` 即 `DedicatedWorkerGlobalScope`

2. 以模块的方式加载代码，内部使用严格模式，且没有共享状态

3. 要求浏览器必须至少拥有两个 `WorkletGlobalScopes`, 将类中的方法随机分配给特定的全局域。（没懂）

4. 浏览器可以随时创建和销毁 `WorkletGlobalScopes`

总之就是要求开发者注册的代码各个模块相互独立，不能有副作用。

## 总结

本文说了 `CSS` 的一些痛点，介绍了 `Houdini` 的原理，再依次介绍了 `Houdini` 目前公布的所有 `API`

这是各个 `api` 作用的环节

这是目前 `W3C` 和各个浏览器的实现进度，有个别 `api` 不在里面，我也不知道原因。

其中我看到一些网站已经使用的，只有 `Properties & Values API`，而且只用了 `非注册属性` 这部分

最有意思的是 `Paint API` 和 `Layout API`，一个是绘制一个是布局，也很有用，需要借助 `Worklets`

`AnimationWorklet` 也还行吧，看官方的代码感觉写的很烦，交互方面没怎么研究过，需要借助 `Worklets`

`Parser API` 和 `Font Metrics API` 都还没开始做，等于没有

`Typed OM`、`Font Metrics API`、`Box Tree Api` 都属于信息获取，打辅助的

`Houdini` 工作组的成员大部分是浏览器的开发者，并不是 `Web` 开发者，这就导致他们不确定真正的痛点在哪里，有些规范感觉有点莫名其妙，还有就是进度太慢了，16年提出的，4年了，实现了还不到一半，还真就千年等一回呗？

设想一下，要是上面这些 `API` 全部实现，说不定真的会出现 `CSS-polyfill`，实现真正的大一统。浏览器支不支持都无所谓了，反正自己能实现，那前端岂不是翻身做主人了？甚至开发者开发一个特性，然后广受欢迎，浏览器采纳特性，反向推动浏览器的更新。可能性很小罢了。

`Houdini` 本是为了解决浏览器兼容而诞生的，但它自己却也被浏览器兼容所限制，让人忍俊不禁。

有的人就要说了，虽然它功能强大，但要能广泛使用还不是得等到猴年马月？是的，指不定这个东西还会半路夭折，那又有什么关系。

面向未来编程一直是我所向往的，你只学眼前最成熟稳定的技术，今天这些技术最稳定，明天可能就过时了，后天就会被淘汰了。

事物的发展是螺旋上升的，时间是驱使其上升的能量。

眼光不向未来看，整天吃老本，什么 `ASP`、`JSP`、`jquery`、`bootstrap`...

3D打印都出来的，宁还搁这儿活字印刷呢？

本期文字偏多，介绍为主，下期将会给出一些能用的 `API` 的例子，看看实际用起来到底怎么样。


本文部分内容翻译自 [https://www.smashingmagazine.com/2016/03/houdini-maybe-the-most-exciting-development-in-css-youve-never-heard-of/](https://www.smashingmagazine.com/2016/03/houdini-maybe-the-most-exciting-development-in-css-youve-never-heard-of/)

参考:
  
  [https://www.w3cplus.com/css/css-houdini.html](https://www.w3cplus.com/css/css-houdini.html)

  [https://imweb.io/topic/5c34666e611a25cc7bf1d881](https://imweb.io/topic/5c34666e611a25cc7bf1d881)

Houdini进度 [https://ishoudinireadyyet.com/](https://ishoudinireadyyet.com/)

  [https://drafts.css-houdini.org/](https://drafts.css-houdini.org/)

示例 [https://css-houdini.rocks/](https://css-houdini.rocks/)

示例2 [https://github.com/GoogleChromeLabs/houdini-samples](https://github.com/GoogleChromeLabs/houdini-samples)

[https://developers.google.cn/web/fundamentals/performance/critical-rendering-path/render-tree-construction?hl=zh-cn](https://developers.google.cn/web/fundamentals/performance/critical-rendering-path/render-tree-construction?hl=zh-cn)
