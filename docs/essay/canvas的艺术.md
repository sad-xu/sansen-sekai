# canvas的艺术

`https://codepen.io/sad-xu/pen/wVdvOO`

带有透明度的色彩叠加

原 r1 g1 b1 a1
叠 r2 g2 b2 a2


叠加后

透明度 `1 - (1 - a1) * (1 - a2)`
色值 `r1 * a1 * (1 - a2) + r2 * a2`


1. `r1 * a1`
2. `r1 * a1 * (1 - a2) + r2 * a2`


```
a = 1
b = 2
c = 3
d = 4
[a, b] = [b, a]
[c, d] = [d, c]
```

​偶然在网上看到了一个有趣的东西


【暂无gif,要看的话移步公众号】


这个东西有两个特点
1. 随机

    起始点位置、分支位置随机，起始方向、分支方向随机

2. 由极简到极繁

    图中基本单位就只是一条线，之后却衍生出了无数条线

再看上图

明明是随机的产物，却由于整洁的线条产生了一种规整之美

极多的线条杂乱交织，看起来却又像城市的规划图一样美观

短短几秒由一纸空白变成密密麻麻一片，岂不是象征着人类的城市化建设？

以上都是胡扯

分析

先来分析一下这是如何实现的

毫无疑问，是canvas，先是一张空白画布

1. 初始有几个随机位置的起点
2. 由起点产生一根方向随机的线
（随机指在固定的6个方向里随机）
3. 线在前进过程中会随机产生方向随机的分支
4. 分支的表现和主分支一样
5. 任何线条在互相挡住时停止延伸

实现

先做点准备工作

```js
// 画布上下文
const canvas = document.querySelector('#canvas')
const ctx = canvas.getContext('2d')
// 画布尺寸 不要写死 自适应用
let width, height
// 6个角度 弧度值便于计算  ±30 ±90 ±150
const numAngles = 6
let angles = Array.from({length: numAngles}).map((v, i) => {
  return Math.PI * 2 / numAngles * i - Math.PI / 2
})
// 配置项 控制诸如速度、密度等 先不写
const CONFIG = {}
```

canvas这类的代码一般分两步

第一步初始化，第二步循环画图

这里也一样，大致如下

```js
// 为了自适应
window.addEventListener('resize', init)
​
init() // 初始化
animate() // 画图

// 没啥可说的，基本操作
function init() {
  // 初始化全屏尺寸
  canvas.width = width = window.innerWidth
  canvas.height = height = window.innerHeight
  // 初始化背景
  ctx.beginPath()
  ctx.rect(0, 0, width, height)
  ctx.fillStyle = `rgb(238,238,238)`
  ctx.fill()
}
```

animate

先写个架子
```js
function animate() {
  // ... 具体操作
  // 随浏览器刷新频率更新动画
  window.requestAnimationFrame(animate)
}
```

可以把线看成一个类`Line`，每条直线就是一个实例`line`

属性有当前点的坐标，下次更新点的坐标，坐标变化值

方法应该有一个更新坐标的方法`update`，一个画线的方法`draw`

* 如何实现前方出现阻碍就停止延伸？

可以在`update`里判断前方是否有阻碍，返回不同的值

若无阻碍，执行`draw`

若有，不执行，而且此条线已经没有价值了

* 那如何判断前方是否有阻碍呢？

从属性里可以得到下次更新点的坐标

只需要检测那个位置对应的颜色代码

用`getImageData`检测一个像素的颜色代码是否和背景色相同即可

* 单个线条在延伸过程中还需要随机分裂出分支

即在`update`里还需要随机产生新实例

关于随机的程度，可以在`CONFIG`里定义

为了尽可能解耦类，`update`需要返回两个状态

一是上文的是否有阻碍，返回boolean

二是本次更新是否会产生分支，若有则返回当前坐标，无则不反回

```js
// 也可用class
function Line(x, y, vx, vy) {
  // 起点
  this.x = x
  this.y = y
  // 终点
  this.x1 = x
  this.y1 = y
  // 变化值
  this.vx = vx
  this.vy = vy
}
// 为了能通过this访问上下文，减少对外部的依赖
Line.prototype.ctx = ctx
​
Line.prototype.draw = function() {
  const ctx = this.ctx
  ctx.beginPath()
  ctx.lineWidth = 0.8
  ctx.strokeStyle = "#000"
  ctx.moveTo(this.x, this.y)
  ctx.lineTo(this.x1, this.y1)
  ctx.stroke()
}
// { flag: Boolean, branch: {x, y} }
Line.prototype.update = function() {
  let updateStatus = {}
  if (Math.random() < 0.1) { // CONFIG.chanceToSplit
    updateStatus.branch = {
      x: this.x,
      y: this.y
    }
  }
  this.x = this.x1
  this.x1 += this.vx // * Math.random()
  this.y = this.y1
  this.y1 += this.vy // * Math.random()
  // 如果实际画出来表现不好的话，颜色判定可以稍微宽松一点
  updateStatus.flag = this.ctx.getImageData(this.x1, this.y1, 1, 1).data[0] >= 238
  return updateStatus
}
```

这里自然需要一个全局变量`lines`来存放所有实例

还要一个添加实例进数组方法

在创造实例时的`vx``vy`的大小代表线延伸的速度，可以在`CONFIG`里定义
```js
let lines = []
​
function addLine(x, y) {
  let a = angles[Math.floor(Math.random() * angles.length)]
  let vx = Math.cos(a) * 2 // CONFIG.speed
  let vy = Math.sin(a) * 2 // CONFIG.speed
  lines.push(new Line(x, y, vx, vy))
}
```

完善`animate`方法
```js
// 每次更新动画，遍历现有所有线
// 有分支 - 加线
// 可更新 - draw
// 不可更新 - 删除线
for (let i = 0; i < lines.length; i++) {
  let line = lines[i]
  let updateStatus = line.update()
  if (updateStatus.branch) {
    let {x, y} = updateStatus.branch
    addLine(x, y)
  }
  if (updateStatus.flag) {
    line.draw()
  } else {
    lines.splice(i, 1)
    i--
    delete line
  }
}
```

最开始的随机的起始点怎么弄？

要么在最开始的`lines`里弄几个实例

要么在`animate`里加个判断，当`lines`长度小于某个值时，往里加线

至此，本文最开始的动图就实现了

以上有一些缺点

比如随机的方向虽然是6选1，但实际有效的只有4个，因为和当前方向相同或相反都没有意义

再比如判断阻挡的方法始终会空1个像素，因为在判断的时候，下一个点还没画，这就导致所有线条交叉的地方都会空1个像素
但我不想做了

其实还有一个渐隐的功能没说，因为这涉及到颜色和透明度的堆叠计算，实现起来有时候有点莫名的卡顿，不太完美，以后有机会再说

### 总结

本文算是一次比较失败的尝试，因为我仅仅是看懂了别人的成品

我想不出这样有创意的点子是其一

无法在其基础上做出更有意思的东西是其二

我曾尝试过把直线换成其他有意义的形状比如星星、波浪，但做不到

这个东西的特点在一开始就说了

不变的东西一直不变

变的东西随机着一直在变

我做不到有规律的变，顶多通过改变`vx``vy`做成下面这样


究其原因，还是对可视化这方面接触的太少，平时无论是工作还是学习都不会和它有太多交集

而且看过一些这方面的代码，发现他们和平时的代码有很大区别，变量多，计算极多，2D的如此，3D的就更别说了，逻辑及其复杂。而且似乎这类代码没有工程化这个概念，都是一个实现一个文件一坨代码，一眼看去很头大。

这种东西，还是以后有时间有机会再深入比较好，现在也就随便看看长长见识




友情链接：
1. [相对完善的代码及预览](https://codepen.io/sad-xu/pen/wVdvOO)



