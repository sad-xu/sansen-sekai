# 用js让CPU跑出一个阿姆斯特朗回旋加速喷气式阿姆斯特朗炮

阿姆斯特朗回旋加速喷气式阿姆斯特朗炮的原型是阿姆斯特朗炮，阿姆斯特朗炮是由19世纪英国著名火炮专家Sir William Armstrong所建立的阿姆斯特朗公司所开发的一系列大中口径火炮。

在《银魂》动画第38话中，阿姆斯特朗回旋加速喷气式阿姆斯特朗炮首次出现，作者在阿姆斯特朗炮的基础上在进行了艺术创作，变成了下面这个样子


再将其抽象化，用线条描述，是由三个圆和一个矩形组成

## CPU曲线

这次我们要通过js让CPU跑出这个形状出来，由于电脑在正常使用中，有很多任务在运行，不可避免的会产生干扰，导致任务管理器里的CPU曲线很难看，所以我们通过浏览器自带的监控器来看CPU曲线

打开Chrome浏览器，打开控制台，`more tools --> Performance monitor`，这里只会监控当前页面的各种指标，隔离了外面的影响。

CPU的曲线的x轴为时间，y轴为CPU使用率。一个x只对应一个y，所以理想中的曲线应该是这样的

## 控制CPU

那么问题来了，如何控制CPU的使用率

相信大家都遇到过页面卡死的情况，在那个时候如果看一下CPU，那使用率肯定是100%左右，发生这种情况的原因一般都是出现了死循环,最简单的死循环就是`while(true) {}`

而我们什么都不做，即没有语句执行时，CPU的使用率则为0

好了，现在已经找到了两个极端，至少已经能画出`y=0`和`y=100`两条线

在计算机中，所有的一切都是离散值，CPU使用率图，本质上收集的是各个时刻的值，再用线连起来罢了

假设一台电脑的CPU频率是2.4GHz，即每秒`2.4 * 10 ^ 9`个时钟周期，每个时钟周期至少能执行两条以上的代码，则每秒至少可以执行960000000条代码

那是不是可以理解为如果真的有这么多代码，则一秒后会执行完，那这一秒的使用率则为100%

如果只有一半的代码，在0.5秒的时候就执行完了，那这一秒的使用率则为50%

所以我们可以通过控制一个很小的时间段内执行代码和不执行代码的时间占比来操控当前时间段里的统计结果

执行代码可以通过死循环，但不执行代码如何实现，js里可没有`sleep`这种东西

可是有异步哇！

```js
while (true) {
  let now = Date.now()
  while (new Date() - now < 100) {}
  await new Promise((resolve) => {
    setTimeout(resolve, 100)
  })
}
```

上面的代码先包了一层死循环，在每轮循环里，先执行100ms的死循环，接下来是一个异步函数，计时100ms后执行后面的代码，即进入下一轮循环

放到浏览器里跑一下

是波浪形，而不是预想中的直线，因为跑100ms歇100ms，一个周期其实是200ms，如果浏览器的统计精度是120ms，那么第一轮的占比是100/120=83%，第二轮则是40/120=33%。调成50ms试试

完美


## 画零部件

控制CPU使用率已经可以通过调整死循环时间和异步时间的比例来实现，下面就是怎样设置这个比例了

我们可以生成两个数组`busyArr`、`idleArr`，分别存放循环和异步时间列表

在分析一下阿姆斯特朗回旋加速喷气式阿姆斯特朗炮的图，好像还可以再简化一下

实际需要的就只有这三个半圆的数据，其中下面两个可以看成同一个

写一个生成半圆数据的函数，传入的参数需要考虑圆的半径，圆心的高度，以及生成数组的长度

这里考虑把CPU的0%~100%映射为`[0,1]`

圆的方程为`(x-a)^2 + (y-b)^2 = r^2`

由图可知，`a`为`r`，`b`为`h`，`x`的范围是`[0, count]`

则`y=√(2*r*x - x^2) + h`

```js
// 定义一个周期为100ms
const PIECE = 100

function getCircleArr({
  h = 0.15,
  r = 0.2,
  count = 25
} = {}) {
  let busyArr = []
  let idleArr = []
  let dx = 2 * r / count
  for (let i = 0; i <= count; i++) {
    let x = dx * i
    let v = Math.sqrt(2 * r * x - x * x) + h
    busyArr.push(PIECE * v)
    idleArr.push(PIECE * (1 - v))
  }
  return {
    busyArr,
    idleArr
  }
}
```

先试一下，这里在页面里加了个按钮来触发

```js
async function start() {
  let { busyArr, idleArr } = getCircleArr()
  let count = busyArr.length
  let i = 0
  while (true) {
    // 画完后就退出死循环
    if (i > count) return
    let n = Date.now()
    while (Date.now() - n < busyArr[i]) {}
    await new Promise((resolve) => {
      setTimeout(resolve, idleArr[i])
    })
    i++
  }
}

document.getElementById('startButton').addEventListener('click', async() => {
  console.log('start')
  await start()
  console.log('end')
})
```

Emmmmm，马马虎虎吧，看起来有点坑坑洼洼的，原因可能有两个，一是代码里有一些其他操作比如获取时间、声明异步、定时等，或多或少有点影响，二是各个浏览器为了让自己比其他浏览器快，不知道加了多少黑科技，图上的曲线凹下去的比较多，说明CPU的消耗比我们想象中的要少。这两点都没法避免。

## 组装

下面来画另外的半圆，再拼接起来

关于圆的尺寸，多试试就好

而数组的长度，这和周期`PIECE`都会影响图的宽度，也是自己多调调

```js
function assembleCannon() {
  let bottom = getCircleArr()
  let top = getCircleArr({ h: 0.7, r: 0.25, count: 25 })
  return {
    busyArr: [...bottom.busyArr, ...top.busyArr, ...bottom.busyArr.reverse()],
    idleArr: [...bottom.idleArr, ...top.idleArr, ...bottom.idleArr.reverse()]
  }
}
```

赶紧跑一下看看

为什么这么丑啊

在连接处如果有点凹可能会更好一点，把`getCircleArr`生成的数组的边界稍微复制些值

```js
// getCircleArr
...
for (let i = 0; i < 3; i++) {
  busyArr.push(busyArr[busyArr.length - 1])
  busyArr.unshift(busyArr[0])
  idleArr.push(idleArr[idleArr.length - 1])
  idleArr.unshift(idleArr[0])
}
...
```

看看

这就是阿姆斯特朗回旋加速喷气式阿姆斯特朗炮吗，复原度还真高呢。

## 总结

代码不多，也不难，关键点就是用异步来实现`sleep`

幸好Chrome带了监控，如果用系统自带的，那结果简直惨不忍睹

下面是完整代码

```js
// 每片 busy + idle 时间
const PIECE = 100

// 圆 [0, 1]
// 圆心 (r, h) 半径 r
// (x - r)^2 + (y - h)^2 = r^2
function getCircleArr({
  h = 0.15,
  r = 0.2,
  count = 25
} = {}) {
  let busyArr = []
  let idleArr = []
  let dx = 2 * r / count
  for (let i = 0; i <= count; i++) {
    let x = dx * i
    let v = Math.sqrt(2 * r * x - x * x) + h
    busyArr.push(PIECE * v)
    idleArr.push(PIECE * (1 - v))
  }
  for (let i = 0; i < 3; i++) {
    busyArr.push(busyArr[busyArr.length - 1])
    busyArr.unshift(busyArr[0])
    idleArr.push(idleArr[idleArr.length - 1])
    idleArr.unshift(idleArr[0])
  }
  return {
    busyArr,
    idleArr
  }
}

// 组装
function assembleCannon() {
  let bottom = getCircleArr()
  let top = getCircleArr({ h: 0.7, r: 0.25, count: 25 })
  return {
    busyArr: [...bottom.busyArr, ...top.busyArr, ...bottom.busyArr.reverse()],
    idleArr: [...bottom.idleArr, ...top.idleArr, ...bottom.idleArr.reverse()]
  }
}

async function start() {
  // let { busyArr, idleArr } = initSinData()
  let { busyArr, idleArr } = assembleCannon()
  // let { busyArr, idleArr } = getCircleArr()
  console.log(busyArr, idleArr)
  let count = busyArr.length
  let i = 0
  while (true) {
    if (i > count) return
    let n = Date.now()
    while (Date.now() - n < busyArr[i]) {}
    await new Promise((resolve) => {
      setTimeout(resolve, idleArr[i])
    })
    i++
  }
}

document.getElementById('startButton').addEventListener('click', async() => {
  console.log('start')
  await start()
  console.log('end')
})
```






