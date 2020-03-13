# codepen真实预览功能分析与拓展

## 说明

首页有作品列表，可以预览每一个作品的内容

方法一：手动截图或录屏gif，作为封面

  优点：可以手动选择最具代表性的画面

  缺点:
  
    1. 需要人工操作，费时费力

    2. 截图具有时效性，如果作品内容大改，还需要手动更新封面

    3. 容易出现封面党，文不对题等情况

方法二：自动截取一张内容快照，作为封面

  优点：不需要人工操作

  缺点：

    1. 若作品里有动画等动态内容，该取哪个时间点的快照？

其实方法二可以改进一下，提交作品时检测是否有动态内容

若没有，截取一张图片；若有，则录几秒钟的gif

但是录gif这个操作，在页面上好像无法实现，因为gif生成我只见到过一些 `windows` 软件和浏览器插件或是 `node包`，
在服务器上生成似乎也很困难，而且还蛮耗流量的

所以就有了方法三，也就是 `codepen.io` 使用的方案

提交作品时检测是否有动态内容

若没有，截取一张图片

若有，预览时通过 `iframe` 加载作品内容，动态内容展示数秒后暂停，就像下面这样

《gif图》

这种实现的优点是动态内容的预览是真实的，而且由于是 `iframe`，也足够安全和干净

缺点无法展现触发式的动态内容，比如 `hover` 效果等

下面，就以 `codepen.io` 为例，分析一下真实预览功能的实现原理，并稍微扩展一下

## 页面中 `动态内容`

首先列举一下页面中可能存在的 `动态内容`

* CSS animation

* CSS transition

* requestAnimationFrame (canvas)

* setTimeout setInterval

* audio

* video

* gif图片

## 注意点

仅需在预览页加限制

## 实现


### 2. 禁用原生模态框

模态框开启时，页面是无法响应的

```js
window.open = function(){ console.log("window.open is disabled."); };
window.print   = function(){ console.log("window.print is disabled."); };
window.alert   = function(){ console.log("window.alert is disabled."); };
window.confirm = function(){ console.log("window.confirm is disabled."); };
window.prompt  = function(){ console.log("window.prompt is disabled."); };
window.Notification = function() { console.log("HTML5 notifications are disabled."); };
```

### 3. 禁用音频与语音输出

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

### 4. 禁用媒体输入许可提示

禁用摄像头和麦克风

```js
navigator.getUserMedia = function() {}
navigator.mozGetUserMedia = function() {}
navigator.webkitGetUserMedia = function() {}
navigator.mediaDevices.getUserMedia = function() {}
```

### `requestAnimationFrame`数秒后暂停

```js
// 需要兼容 requestAnimationFrame mozRequestAnimationFrame, webkitRequestAnimationFrame
// 这里写了一个简化版

let __animationDuration = 4000
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
}, __animationDuration)
```

### CSS animation 数秒后暂停

在上面的计时器中，构造一个`style`标签，内容如下，并插入

```css
/* 暂停所有CSS animation */
*, *::before, *::after {
  animation-play-state: paused !important;
}
```

### setTimeout & setInterval 数秒后暂停

```js

```

### getAnimations

## 彩蛋

```css
@media (prefers-reduced-motion: reduce)
  .single-item::after {
    -webkit-transition: none;
    transition: none;
  }
```
