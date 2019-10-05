# Highcharts矩形树图的自定义布局方法

矩形树图(treemap)，画布根据子节点数被分为多个矩形，节点权重对应矩形面积，能直观的体现同级之间的差异

衡量一个布局算法的评价指标有平均长宽比、连续性、可读性和稳定性。

平均长宽比是指所有子节点的长宽比的平均值，矩形越接近正方形，越有利于鼠标操作和人眼识别

连续性是指数据集中相邻的子节点在树图中是否也相邻的情况，即数据与视图的一致性

可读性用来衡量用户在查找某一目标的难易程度，可以用视线方向改变的次数来计算

稳定性是指当子节点的权重发生变化时整个树图的变化程度

先模拟一些数据

```js
let chartData = Array.from({length: 26}).map((item, index) => {
  return {
    name: String.fromCharCode(index + 65),
    value: 10 + Math.round(index)
  }
})

```

关于矩形的排列布局，有常见的这几种，且这几种在Highcharts里均有提供

1. Slice-and-dice

是1991年提出的算法，从左到右，从上到下填充，只考虑节点顺序和权重面积

这样很容易产生细长的矩形，像这样，平均长宽比不太好

2. Squarified

为了解决细长矩形的问题，Squarified算法优先考虑长宽比，原理如下图

无论多少数据效果都很好

但其缺点是由于布局优先，原始数据与图中的顺序极可能不对应，即连续性不太好

3. Strip

Strip算法在保证良好长宽比的情况下，提高了连续性和稳定性，和Squarified有点相似，不同的是顺序，具体实现自己搜去

4. Stripes

Highcharts里还有一种布局方式，不过这种未免也太烂了吧...


以上，是对`series<treemap>.layoutAlgorithm`四种配置`sliceAndDice`、`stripes`、`squarified`、`strip`的介绍

可这四种布局其实都很单一，都是由大到小或是由小到大的方向

唯一和方向有关的配置`layoutStartingDirection`也只是改变水平还是竖直



假设我有一组数据

```js
let chartData = Array.from({length: 26}).map((item, index) => {
  return {
    name: String.fromCharCode(index + 65),
    value: (10 + Math.round(index)) * (index % 2 ? -1 : 1) 
  }
})
```

有正有负，我要左上为最大值，右下为最小值，斜着渐变，像这样画呢

直接用以上任何一个配置都无法实现，甚至只会显示出一半的值，因为传入值不支持负数

其实只要让排序支持负数应该就可以了

Highcharts提供的配置无法实现，但文档有提供实现自定义算法的方法

先在原型链上添加方法，再在配置里使用刚加的函数名

```js
Highcharts.seriesTypes.treemap.prototype.myCustomAlgorithm = function(parent, children) {
  let　childrenAreas = []
  children.forEach(child => { // 在文档基础上稍作了点修改
    // Do some calculations

    // These return values are required for each child
    childrenAreas.push({
        x: someXValue,
        y: someYValue,
        width: someWidth,
        height: someHeight
    })
  })
  return childrenAreas
}

// series: [{
//    layoutAlgorithm: "myCustomAlgorithm",
//    ...
// }]
```

先看看这个函数，打印传入值

```js
// 
parent = {
  x: 0, // 原点x
  y: 0, // 原点y
  width: 240.66265060240966,
  height: 100,  // 宽高，子节点的宽高都应以此为相对值
  direction: 0,
  val: 286 // 所有子节点值之合
}
```

发现子节点长度只有一半，因为值为负的被剔除了，所以值应该要传绝对值

而且子节点的顺序和原始顺序不一样，它内部排过序了

看看能不能再data里通过其他字段传递真实值

一番测试，自定义的字段名不出现在`children`里，唯一无关紧要的字段只有`name`，就从`name`入手

把原始数据做点修改

```js
let chartData = Array.from({length: 26}).map((item, index) => {
  let val = (10 + Math.round(index)) * (index % 2 ? -1 : 1)
  return {
    name: val,
    value: Math.abs(val),
    truthName: String.fromCharCode(index + 65)
  }
})
```

这样，`children`就全了，其中`val`字段是绝对值，`name`字段是真实值

接下来的问题就简化成了: 怎样写新的布局算法函数

其中函数的两个参数都拿到了

函数输出文档里给出了示例，为`[{x,y,width,height}]`,就是所有子节点的布局位置数据

输入输出都明确了，接下来问题就抽象成了一道算法题

可是，这题也太难了

上面的几种算法都是教授级的大佬写出来的，网上一搜布局算法，出来的都是论文

你要我写一个和他们差不多的东西出来？

黑人问号???


那怎么办呢...

先看看Highcharts自带的算法怎么写的

```js
// Highcharts.seriesTypes.treemap.prototype.squarified.toString() -->
'function(a,d){return this.algorithmLowAspectRatio(!0,a,d)}'

// 在看这个algorithmLowAspectRatio函数
// Highcharts.seriesTypes.treemap.prototype.algorithmLowAspectRatio.toString() -->
`function(a,d,b){var e=[],c=this,f,h={x:d.x,y:d.y,parent:d},k=0,l=b.length-1,r=new this.algorithmGroup(d.height,
d.width,d.direction,h);b.forEach(function(b){f=b.val/d.val*d.height*d.width;r.addElement(f);r.lP.nR>r.lP.lR&&c.algorithmCalcPoints(a,!1,r,e,h);k===l&&c.algorithmCalcPoints(a,!0,r,e,h);k+=1});return e}`
```

???

既然自带函数只调用了`algorithmLowAspectRatio`，那我先在自定义函数里实现它试试

人工反混淆 + 可读性优化

```js
// function algorithmLowAspectRatio(type, parent, children) {
  let type = true
  let list = []
  let k = 0
  let l = children.length - 1
  let obj = {
    x: parent.x,
    y: parent.y,
    parent
  }
  let group = new this.algorithmGroup(parent.height, parent.width, parent.direction, obj)
  children.forEach(child => {
    group.addElement(child.val / parent.val * parent.height * parent.width)
    if (group.lP.nR > group.lP.lR) this.algorithmCalcPoints(type, false, group, list, obj)
    if (k === l) this.algorithmCalcPoints(type, true, group, list, obj)
    k++
  })
  return list
// }
```

果不其然，一模一样！

那我就不需要从0开始写算法了，只要在其基础上稍作修改就可以了

还记得上文说的要做什么吗

只要把`children`按照真实值的顺序排列就可以了,在里面加一行

```js
children.sort((a, b) => b.name - a.name)
```

现在最主要的功能实现了，但还有一个副作用，就是显示的name不是想要的

这个可以通过`dataLabels.formatter`里面的`this.point.truthName`拿到并显示，基本操作


这个故事告诉我们一下几点

1. 人类的欲望是无止境的，配置提供无论提供多少个可选值，都无法满足所有人的需求，只有足够灵活的设计才是万能的，这一点上Highcharts做的真的非常优秀

2. 从零造轮子与改造已有轮子

3. 解决问题需要灵感



相关代码：[https://codepen.io/sad-xu/pen/RXxwwv](https://codepen.io/sad-xu/pen/RXxwwv)


