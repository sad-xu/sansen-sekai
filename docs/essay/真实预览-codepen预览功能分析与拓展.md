# 真实预览 - codepen预览功能分析与拓展

`codepen.io` 这个网站在我的文章里出现频率还是蛮高的，里面有许多充满创意与艺术感的作品，让人流连忘返，一直是我每天的必备摸鱼项目

在首页，会展示一些精选项目的预览，一些是静止的图片，而一些是动态的画面，经过几秒后停止，如下图

在控制台可以发现，静止的确实是图片，而动态的是 `iframe`，即这种预览与点进去的详情本质上是一样的，这里就叫它“真实预览”

## 分析

要实现预览功能，有几种方法

方法一：手动截图或录屏gif，作为封面

  优点：可以手动选择最具代表性的画面

  缺点:
  
    1. 需要人工操作，费时费力

    2. 截图具有时效性，如果作品内容大改，需要手动更新封面

    3. 容易出现封面党，文不对题等情况

方法二：自动截取一张内容快照，作为封面

  优点：不需要人工操作

  缺点：

    1. 若作品里有动画等动态内容，该取哪个时间点的快照？

其实方法二可以改进一下，提交作品时检测是否有动态内容

若没有，截取一张图片；若有，则录几秒钟的gif

但是录gif这个操作，在页面上好像无法实现，因为gif生成我只见到过一些 `windows` 软件和浏览器插件或是 `node包`，
在服务器上生成似乎也很困难，而且还蛮耗流量的

所以就有了方法三，也就是 `codepen` 使用的方案

提交作品时检测是否有动态内容

若没有，截取图片做封面

若有，预览时通过 `iframe` 加载作品内容，动态内容展示数秒后停止，就像下面这样

这种实现的优点是动态内容的预览是真实的，而且由于是 `iframe`，也足够安全和干净

缺点无法展现触发式的动态内容，比如 `hover` 效果等

## 页面中 `动态内容`

列举一下页面中可能存在的 `动态内容`

* CSS animation

* CSS transition

* requestAnimationFrame (canvas)

* setTimeout setInterval

* audio video

* gif图片

## 实现

在控制台中可以看到，每个 `iframe` 里都被插入了一些代码

### 1. 禁用原生模态框

由于模态框开启时，页面是无法响应的，所以需要排除掉

其实只要在 `iframe` 标签的 `sandbox` 属性里不写 `allow-modals`，模态框就无法开启

这里相当于上了双重保险
 
```js
window.open = function(){ console.log("window.open is disabled.") }
window.print = function(){ console.log("window.print is disabled.") }
window.alert = function(){ console.log("window.alert is disabled.") }
window.confirm = function(){ console.log("window.confirm is disabled.") }
window.prompt = function(){ console.log("window.prompt is disabled.") }
window.Notification = function() { console.log("HTML5 notifications are disabled.") }
```

### 2. 禁用音频与语音输出

一页会展示多个作品，如果每个都播放音频，混在一起就没法听，所以需要禁止播放音频

```js
if (typeof (AudioContext) !== 'undefined' || typeof (webkitAudioContext) !== 'undefined') {
  AudioContext = function() { return false }
  webkitAudioContext = function() { return false }
}
if (typeof (mozAudioContext) !== 'undefined') {
  mozAudioContext = function() { return false }
}

// 禁止播放语音，但允许操作声音数据`SpeechSynthesisVoice `和从麦克风中识别文字 `SpeechRecognition`
if ('speechSynthesis' in window) {
  window.speechSynthesis = {}
}
if ('speak' in speechSynthesis) {
  speechSynthesis.speak = function() { return false }
}
```

### 3. 禁用媒体输入许可提示

禁用摄像头和麦克风

```js
navigator.getUserMedia = function() {}
navigator.mozGetUserMedia = function() {}
navigator.webkitGetUserMedia = function() {}
navigator.mediaDevices.getUserMedia = function() {}
```

### 4. setTimeout & setInterval 数秒后停止

重写定时器，在网站上是4秒后停止

在内部维护一个标志 `timedOut`，代表是否停止

当停止时，不仅之后的定时无效，前面正在定时的都需要取消，所以需要在内部维护一个队列，存储定时的id

"because some of our timeouts may time out afterwards
we want to make sure they know the secret sauce to still use
setTimeout after the time has expired, thats why we have a third param"

增加了第三个参数，只要其有值，就不会受到停止影响，可以看成一条后路

`setInterval` 大同小异，就不写了

```js
window.setTimeout = (function(oldSetTimeout) {
  let registered = []
  function f(a, b, push) {
    if (this.timedOut && typeof push === 'undefined') return 0
    if (push) return oldSetTimeout(a, b)
    return registered[registered.length] = oldSetTimeout(a, b)
  }
  f.timedOut = false
  f.clearAll = function() {
    let r
    while (r = registered.pop()) {
      clearTimeout(r)
    }
    this.timedOut = true
  }
  return f  
}(window.setTimeout))
```

这里如果要更完美的话，可以把定时器到期的id从队列里剔除

若干秒后手动清除所有计时器

```js
// 4秒停止是在这里定义的
let __animationDuration = 4000
setTimeout(() => {
  setTimeout.clearAll()
  setInterval.clearAll()
}, __animationDuration, 'push')
```

### 5. `requestAnimationFrame` 数秒后停止

`canvas` 经常会用到 `requestAnimationFrame`

和定时器类似，除了不需要加第三个参数

```js
// 需要兼容 requestAnimationFrame mozRequestAnimationFrame, webkitRequestAnimationFrame
// 这里只是一个简化版
let __animationsTimedOut = false
let __animationRequests = []
let __requestAnimationFrame = window.requestAnimationFrame

window.requestAnimationFrame = function(cb, el) {
  let timerID
  if (__animationsTimedOut) return 0
  timerID = __requestAnimationFrame(cb, el)
  __animationRequests.push(timerID)
  return timerID
}

// 计时结束后，1. 清空已注册事件，2. 使后面注册的事件无效
setTimeout(() => {
  __animationRequests.forEach(id => {
    window.cancelAnimation(id)
  })
  __animationsTimedOut = true
}, __animationDuration, 'push')
```

### 6. CSS animation

要停止动画，可以设置 `animation-play-state`

在上面的计时器中，构造一个`style`标签，内容如下，并插入

```css
/* 暂停所有CSS animation */
*, *::before, *::after {
  animation-play-state: paused !important;
}
```

这还只是第一层，因为优先级可能会被覆盖

在前几期的“一个简单的CSS动画和一个想法”这篇文章中说过，`CSS animation` 会触发事件

在 `body` 上绑定动画播放和重播事件，需要考虑兼容，但这里不考虑

定时结束后给每个触发的DOM加上暂停，没有比这优先级更高的了

```js
if (e.type == 'webkitAnimationStart' || e.type == 'webkitAnimationIteration') {
  targetEl = e.target
  setTimeout(function() {
    targetEl.style.webkitAnimationPlayState = 'paused'
  }, __animationDuration, 'push')
} 
```

### 7. 暂停所有 auduo / video

找到页面中的所有 `audio & video` 元素

注释里的原话是这样说的："Wait until the elements have been created to pause them"

延时100毫秒再暂停，可能是`audio video`元素比较特殊？没怎么接触过不懂

```js
function pauseElementTypes(type) {
  for (let i = 0, els = document.getElementsByTagName(type); i < els.length; i++) {
    els[i].pause()
  }
}

setTimeout(() => {
  pauseElementTypes('audio')
  pauseElementTypes('video')
}, 100)
```

### 8. onload

除了停止功能外，还需要考虑其他方面

在 `body` 标签上加上 `onload` 事件
当 `iframe` 页面加载完成后，会声明 `_l` 的全局变量

```html
<body onload="_l='t';"></body>
```

若2秒后还没有加载完成，则停止加载

排除视频等大资源占网速的情况

```js
setTimeout(() => {
  if (typeof _l === 'undefined') {
    if (window.stop !== undefined) window.stop()
    else if (document.execCommand !== undefined) document.execCommand('Stop', false)
  }
}, 2000, 'push')
```

以上就是从 `codepen` 网站的代码里解读出来的东西，可以看到他们考虑的非常全面，无论什么东西都会在4秒后被停止

但是，依然有无法被停止的东西

## 停止的漏洞

还记得上文列举的 `动态内容` 吗，是不是有什么被忽略了？

我把上面的代码搬到了自己的一个项目里，并写了几个例子

定时事件设为了1.5秒

图一出自“一个简单的CSS动画和一个想法”篇，纯 `CSS animation`

图二出自“canvas的艺术”篇，由 `canvas` 实现，用到了 `requestAnimationFrame`

图三有 `transition` 参与外加一个 `gif` 图

图四是一个 `video` 视频

可以看到图一图二在1.5秒后都停止了，图四只显示了第一帧的图片，这些都是正常表现

而图三的 `sad frog gif` 并没有停止哭泣，头上的两个方块也没有停止运动，这是为什么呢？

### gif

前端没法控制 `gif` 的播放与停止，所以就别想了

### transition

我觉得过渡很特殊，它是两种状态变化的过程，它无法被停止

它还有 `delay` 属性，和定时器结合几乎无解

其实硬要实现也不是不可以，需要知道起点、终点、运动方式和运动时间，根据运动方式和时间可以计算出当前时刻的位置，强行把终点改为计算出的值，当然我只是随便口嗨罢了，真正实现起来怎么样，没试过不知道

### 定时器

还记得重写后的定时器的第三个参数吗，是的，如果我们在自己作品里的定时器里加上第三个参数，那么这个定时器就不会受到停止的限制了

所以前端没有秘密，任何一个网站都是一个宝库

## 规避漏洞

上面两个漏洞我在 `codepen` 上也测试过，一样无法停止，不信你们也可以试试

但我又发现，我的一些无法停止的测试例子由 `iframe` 变成了截图，截的时机还挺好的，原先我以为他们会根据作品里是否有动态内容来区分截图和 `iframe`

但似乎并不是，可能有某种检测算法？反正只要是不会动就没有无法停止的问题，某种意义上是从根源上避免了问题，整挺好。

## 后记

写例子的时候，原本是想把 `iframe` 替换成组件的形式实现的，可是上面修改了不少全局变量，会对主站有影响，也没有什么隔离组件全局变量的方案，就没做下去

但如果你的作品是纯 `CSS` 的话，就可以换成组件，因为只需要停掉 `animation`，实现也简单不少

## 彩蛋

细节：针对开启“减弱动态效果”的设备，鼠标 `hover` 的过渡效果会消失

这等细节都做到了，大写的佩服。

我很好奇这种应该是产品提还是UI提还是前端自己悄摸摸的实现？

```css
@media (prefers-reduced-motion: reduce) {
  .single-item::after {
    -webkit-transition: none;
    transition: none;
  }
}
```

疑问：看到预览的缩放是这样写的，放大一倍 + 缩小一倍，效果很好，但原理是什么？

```css
  width: 200%;
  height: 200%;
  transform-origin: left top;
  transform: scale(0.5);
```
