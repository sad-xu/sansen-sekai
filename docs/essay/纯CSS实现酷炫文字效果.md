# 纯CSS实现酷炫文字效果

## 写在前面

​比起js，css在国内一直不是太受开发者们关注

一个原因是浏览器兼容的限制，ie不死，新的属性就没法大量用起来，除非遇到圣人老板不需要你兼容ie

另一个原因是比起js需要强大的编程思考能力，css更需要的是创造性和审美能力，而这就有点靠天分了

国内的网站千篇一律，国外的网站万紫千红

公司要做个宣传网站

国内二话不说找外包

国外会请设计师专门设计

这就是差别


小公司可以说经费不足，情有可原

可是就算是国内的一些大网站

页面排版单调而乏味，毫无设计感可言

最恶心的当属z|f网站，呕呕呕

偶尔会让人眼前一亮的大概就只有一些小而精的个人网站了



设计方面也有区别

国内的设计更偏向UI，颜色布局排版，这也只是设计

国外的设计会写代码，css,js,canvas,webgl,甚至webVR

他们糅合最新的技术，把网页做成了一件艺术品

## 正文

这次展示一下纯css实现的两种文字特效

事先说一下，为了方便，以下css都是scss的写法

### 动态重影效果

* HTML

```html
<span class="shadow" x-text="沉默池塘">沉默池塘</span>
```

只需要一个标签，给他一个class待会儿写css

需要注意的是`x-text`，这是一个自定义属性，可以换成其他名字，不与已有属性冲突即可，属性值必须和标签里的值相同，css里要用


* CSS

```scss
.shadow {
  position: relative;
  font-size: 36px;
}
```
先给他个相对定位，之后有用

这里说一下原理

从gif里可以看到重影有红蓝两色，在加上文字本身，三位一体

文字本身就是那个span

红蓝可以用伪元素实现，这里用::before和::after实现

伪元素的内容要和文字一样，那content怎么取呢

这就需要配合attr()了

```scss
&::before, &::after {
  content: attr(x-text);
}
```
再给他们红蓝两色，现在看起来应该是这样

【暂无图片】


接下来要把他们叠一起

之前span的relative就用上了

给伪元素absolute定位，left: 0

发现伪元素的颜色覆盖了原始文字，给他们的z-index设-1

现在已经完全看不出伪元素了



接下来只剩最后一步: 加动画

从gif中可以看出，红蓝两个伪元素都有横纵两个方向的偏移且不会重合

这里我用的是2d转换实现

应该也可以用定位实现，那样应该会麻烦一点

偏移量是微小且是常量，先定义一下

$offset: 3px;

然后定义动画，2d转换就用transform的translate，动画随便分几段，反正必须有上下左右四个位置的变化

```scss
@keyframes shadow-animation {
  25% { transform: translate($offset1, -$offset1); }
  50% { transform: translate(-$offset1, -$offset1); }
  75% { transform: translate($offset1, -$offset1); }
  100% { transform: translate($offset1, $offset1); }
}
```
然后就是设置动画，为了不让两个伪元素产生重叠，尽量让这两个动画错开

可以给animation-direction，一个设alternate，一个设alternate-reverse

如果想再增加一点混乱的话也可以把动画时间设不同

```scss
animation: shadow-animation .3s infinite alternate;
...
animation: shadow-animation .5s infinite alternate-reverse;
```

以上，文字的动态重影效果就完成了


### 文字扰动效果

* HTML

```html
<span class="glith" x-text="沉默池塘">沉默池塘</span>
```
和上面一样，换个class名


* CSS

这种干扰效果可能乍一看不知道怎么实现的

这也是靠的伪元素

把伪元素弄成随机显示部分，给他点偏移，覆盖到主标签上


一开始和前面差不多
```scss
.glith {
  position: relative;
  font-size: 36px;
  &::before {
    content: attr(x-text);
    position: absolute;
    top: 2px;
    left: 2px;
  }
}
```
position绝对定位，稍微加一点偏移，然后就变成了下面这样...

文字换行了，再加个`word-break: keep-all;`

接下来就是最关键的一步：如何将伪元素的文字随机截断部分

这里有两个属性可以实现

1. clip: rect(top, right, bottom, left)

2. clip-path: polygon(...)

属性1只能截取方形，且参数不支持百分比

属性2可截取任意形状，支持百分比，功能比1强大很多，所以这里选2实现

先试试水，截取30%~70%部分
```scss
clip-path: polygon(0 30%, 100% 30%, 100% 70%, 0 70%);
```

可以，接下来只要让他动起来就行了

由于这种效果在视觉上对随机性要求比较高

所以动画需要分很多段

这个时候，scss的优势就体现出来了

我需要一个循环，在每个循环里随机两个值，分别赋给截取的上下限


```scss
@keyframes glith-animation {
  // 100个循环
  @for $i from 0 through 100 {
    // #{} 变量差值 即 0% ~ 100%
    // * 100% 是为了结果是% 
    #{$i * 1 / 100 * 100%} { // 这里代码高亮有点问题
      // 两个百分比随机值
      $num1: random() * 100%;
      $num2: random() * 100%;
      clip-path: polygon(0 $num1, 100% $num1, 100% $num2, 0 $num2);
    }
  }
}
```
接下来

```scss
animation: glith-animation 20s infinite;
```
关于动画分段和时间，看情况，建议分段多一点，时间不要太短，否则容易看出规律

做出来是这样



为什么重叠部分会有白色呢？

由于之前绝对定位的微小偏移，导致在交错位置两个文字都会出现

可以给伪元素一个和当前背景一样的背景色



这也暴露了一个问题，当背景色不是单色时，就不适合应用这个效果

换个不同的背景能更直观的看出原理


上面只用了一个伪元素

如果要再加两条扰动线，可以再加一个伪元素

如果要斜着或竖着的扰动线，修改polygon的参数就行了



反正做这种效果，唯一的限制只是想象力

最后再看一眼成品



有够土味的...


友情链接：

1. 代码放在codepen上

[https://codepen.io/sad-xu/pen/ydGeWp](https://codepen.io/sad-xu/pen/ydGeWp)

