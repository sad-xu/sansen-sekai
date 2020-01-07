# 一个简单的CSS动画和一个想法

首先给大家安利一个网站`https://yui540.graphics`，整个演出全部由CSS实现，非常的厉害，作者是一位日本的CSS大佬`yui540`

本文的css动画部分源自他的一篇文章`https://yuki540.hatenablog.jp/entry/2018/05/03/ニートに学ぶCSS_Animation演出講座_4時間目`

## CSS部分 - 实现

做出来的效果如下

【gif】

首先来分析下结构，
a: 一个静态背景，内部有一个虚线边框
b: 中间一个圆，先放大后缩小至消失
c: 相同位置出现一个由八个三角形围成的圆，向外扩散后消失
d: 左下角出现一个由八个小圆围成的园，整体边旋转边向外扩散后消失
e: 右上角出现一个由八个正方形围成的圆，正方形边旋转同样向外扩散后消失
结束

### dom结构

有一个静a和四个动b-e，其中b和其他不一样，它只是一个圆
所以可以把a和b合并

```html
<div class="stage">
  <!-- a3 -->
  <div class="effect effect-type-1">
    <div></div>
    <div></div>
    <div></div>
    <div></div>
    <div></div>
    <div></div>
    <div></div>
    <div></div>
  </div>
  <!-- a4 -->
  <div class="effect effect-type-2">
    <div></div>
    <div></div>
    <div></div>
    <div></div>
    <div></div>
    <div></div>
    <div></div>
    <div></div>
  </div>
  <!-- a5 -->
  <div class="effect effect-type-3">
    <div></div>
    <div></div>
    <div></div>
    <div></div>
    <div></div>
    <div></div>
    <div></div>
    <div></div>
  </div>
</div>
```

## a + b

背景全屏
一个边框 + 一个圆，分别用两个伪元素实现

```scss
.stage {
    position: fixed;
    width: 100%;
    height: 100%;
    background-color: #D3C7C0;
    // 边框
    &:before {
      content: '';
      position: absolute;
      top: 20px;
      left: 20px;
      width: calc(100% - 40px);
      height: calc(100% - 40px);
      border: dashed 5px #635256;
      border-radius: 30px;
      opacity: 0.3;
    }
    // b圆
    &:after {
      content: '';
      position: absolute;
      width: 400px;
      height: 400px;
      top: calc(50% - 200px);
      left: calc(50% - 200px);
      border-radius: 50%;
      background-color: #635256;
    }
  }
```

本文几乎所有的变化都会用`animation`实现
圆先扩大后缩小，用到了`scale`

从第0秒开始，持续0.6s，结束后依然维持最后的状态，即缩小至0

```scss
.stage:after {
  animation: hidden-ball 0.6s ease 0s forwards;
}

@keyframes hidden-ball {
  0%   { transform: scale(1); }
  50%  { transform: scale(1.4); }
  100% { transform: scale(0); }
}
```

### c d e

c、d、e这三个属于同一类，先写他们统一的样式

作者在这里还是把实际形状放在了伪元素里
里面的八个`div`设为和外层一样大，只要旋转就能变成圆形分布

```scss
.effect {
  position: absolute;
  width: 400px;
  height: 400px;
  border-radius: 50%;
  overflow: hidden;
  div {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    &:after {
      content: '';
      position: absolute;
      opacity: 0;
    }
  }
  div:nth-child(1) { transform: rotate(0deg); }
  div:nth-child(2) { transform: rotate(45deg); }
  div:nth-child(3) { transform: rotate(90deg); }
  div:nth-child(4) { transform: rotate(135deg); }
  div:nth-child(5) { transform: rotate(180deg); }
  div:nth-child(6) { transform: rotate(225deg); }
  div:nth-child(7) { transform: rotate(270deg); }
  div:nth-child(8) { transform: rotate(315deg); }
}
```

上面这种旋转的写法，写起来很多，在`SCSS`里可以简写

```scss
@for $i from 1 through 8 {
  div:nth-child(#{$i}) { transform: rotate(45deg * $i); }
}
```

对c来说，整体居中，由三角组成，通过边框实现
向外扩散可以看成向上移动，用`translateY`，再在外层加上`overflow:hidden;`移动到边界外就消失

```scss
.effect-type-1 {
  top: calc(50% - 200px);
  left: calc(50% - 200px);
  div:after {
    top: 5px;
    left: calc(50% - 20px);
    border-top: solid 70px #635256;
    border-left: solid 20px transparent;
    border-right: solid 20px transparent;
    transform: translateY(130px);
  }
}
```

同理，d把三角换成了圆球，e换成了正方形，接下来则是动画的异同

`translateY`是都要有的，其次这些都不是一开始就出现的，所以在定义的时候就给透明，动画启动的时候再显示，`opacity`也是要有的

c是整体旋转,d是局部旋转，需要`rotete`

```scss
.effect-type-1 div:after {
  animation:
    fade-in 0.3s ease 0.5s forwards,
    show-type-1 0.6s ease 0.5s forwards;
}
.effect-type-2 {
  animation: rotate360 4s ease 0.6s forwards;
  div:after {
    animation:
      fade-in 0.3s ease 1.1s forwards,
      show-type-2 0.6s ease 1.1s forwards;
  }
}
.effect-type-3 div:after {
  animation:
    fade-in 0.3s ease 1.7s forwards,
    show-type-3 0.6s ease 1.7s forwards;
}

@keyframes show-type-1 {
  from { transform: translateY(130px); }
  to { transform: translateY(-75px); }
}
@keyframes show-type-2 {
  from { transform: translateY(170px); }
  to { transform: translateY(-40px); }
}
@keyframes show-type-3 {
  from { transform: translateY(150px) rotate(0deg); }
  to { transform: translateY(-40px) rotate(270deg); }
}

@keyframes fade-in {
  from { opacity: 0; }
  to { opacity: 1; }
}
@keyframes rotate360 {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}
```

这样大概就完成了

动画有两个时间，`duration`和`delay`，为了保持整体动画的流畅，每个值都要算一下，就很烦

而且短短2s左右的动画，就要编写180行的代码，而且演出越长，代码还会越复杂，成本属实有些高

但是好看啊，`yui540`的`臆病な魔女`整个流程大概两分钟，一个开场加5个章节，演出紧凑还没有卡顿，视觉体验非常棒

看了一下源码，平均每个章节大概有800+行css代码，还不包括抽离出去的公共样式

## js部分 - 一个想法

在实现过一遍后，感觉css动画的编写和调试都有不友好，很原始，虽然现在有一些库可以简化，但都是通过js来实现的，代码混在就不纯粹了

怎样简化这个流程，我不知道，但凭感觉写了点东西

最开始是这样想的

1. 遍历动画所在的dom树，用`window.getComputedStyle(element, pseudoElt).getPropertyValue('animation')`拿到所有`animation`属性的值
2. 根据`duration`和`delay`计算每个动画的具体时间，用定时器模拟同步动画，将动画名列表显示在页面上，表示当前正在执行的动画

关于定时器模拟，通过`setTimeout`和`promise`结合实现

```js
function setPromise(fn, time, cb) {
  return new Promise((resolve, reject) => {
    fn()
    setTimeout(() => {
      resolve()
    }, time)
  }).then(cb)
}

// list 所有动画列表
list.forEach(item => {
  setTimeout(() => {
    // 当前正在执行的动画列表
    let activatedList = this.activatedList
    let o = {
      name: item.name.split('-data-v-')[0]
    }
    this.setPromise(
      // 立即执行
      () => {
        activatedList.push(o)
      },
      // 定时时间
      item.duration * 1000,
      // 定时结束后执行
      () => {
        activatedList.splice(activatedList.findIndex(it => it === o), 1)
      }
    )
  }, item.delay * 1000)
})

```

然而实现完后，突然想到有监听animation开始和结束的事件。。。

在最外层绑两个事件，开始加进去，结束移出去，同名的合并

```js
/*
  traget 事件目标
  type 事件类型
  bubbles 是否冒泡
  cancelable 是否取消事件
  animationName 动画属性
  elapsedTime 动画总时长 iteration-count * duration
*/
function animationStart(e) {
  // 由于是在vue的项目里写的，最好去除scope后缀
  let name = e.animationName.split('-data-v-')[0]
  let index = this.animationList.findIndex(item => item.name === name)
  if (index === -1) {
    this.animationList.push({
      name,
      count: 1
    })
  } else {
    this.animationList[index].count++
  }
}

function animationEnd(e) {
  let name = e.animationName.split('-data-v-')[0]
  let index = this.animationList.findIndex(item => item.name === name)
  if (--this.animationList[index].count === 0) {
    this.animationList.splice(index, 1)
  }
}
```

把列表显示到页面上，最后是这样


能看到正在执行的动画名和数量，还可以加上剩余时间，用个进度条什么的，不过好像也没啥用处


