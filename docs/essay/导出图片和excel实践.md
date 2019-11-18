# 导出图片和Excel实践

在中后台网站中，导出图片和Excel是比较常用的功能，虽然好像也没什么人用...

下面分别就图片和Excel讲解一下具体实现步骤

## 准备

导出图片需要用到`html2canvas`，导出Excel需要用到`xlsx`，由于两者都属于需要把文件存储到本地的操作，最好用`file-saver`

其实图片的导出可以后端来做，涉及到服务端渲染，不过有局限性，如果涉及到用户的操作痕迹等，就只能前端做了

记得以前Excel的导出都是由后端来做的，前端做的话可以减少一点服务器压力

## Loading

导出功能作为一个比较独立的功能，最好放到`utils`文件夹里，如下

```shell
├─router
└─utils
    └─export
        ├─excel.js
        ├─img.js
        └─index.js
```

有些依赖很大，一开始也用不到，按需加载比较合适。而按需加载的时间比较久，就需要在加载时显示loading

这里就会遇到一个问题

我的loading是这样写的，绑在了Vue实例上

```js
// main.js
import { Loading } from 'element-ui'
// 1. 声明式，组件局部加载 v-loading
// 2. 命令式，$showLoading $hideLoading 最短显隐间隔1s
const { directive: loadingDirective, service: loadingService } = Loading
Vue.use(loadingDirective)
(function() {
  let t = 0
  const LIMIT_TIME = 1000
  Vue.prototype.$showLoading = (option = {
    text: '加载中...',
    background: 'rgba(242,242,242,0.5)',
    lock: true
  }) => {
    t = new Date().getTime()
    loadingService(option)
  }

  Vue.prototype.$hideLoading = () => {
    let _t = new Date().getTime() - t
    if (_t < LIMIT_TIME) {
      setTimeout(() => {
        loadingService().close()
      }, LIMIT_TIME)
    } else loadingService().close()
  }
}())
```

而`utils`和`Vue实例`没有半毛钱关系，也就调不到loading

解决方法有三种

1. 把loading绑到window上，任何地方都能使用

2. 在`main.js`里把Vue实例`export`出去，在需要的地方引入，调它上面的方法

3. 把loading方法移到外面去，当作一个通用函数

显然第三种最合理

```js
// utils/index.js
export function showLoading() {...}
export function hideLoading() {...}
```

```js
// main.js
import { showLoading, hideLoading } from '@/utils'
Vue.prototype.$showLoading = showLoading
Vue.prototype.$hideLoading = hideLoading
```

这个问题的主要原因是没有考虑到在非页面代码里调`loading`的情况，其次在`main.js`里写的那个IIFE与其他代码格格不入，从代码的合理性上来说也是需要优化的。

## 导出图片

思路是先通过`html2canvas`把实际DOM转成canvas，再通过`file-saver`把canvas存成图片

对外只要暴露一个函数`exportImg`，参数只需要一个需要转化的DOM对象，和一个可选的图片名

这种方法导出的图片和截图类似，不过它可以无视屏幕限制，即可以生成超过屏幕大小的图片

```js
// export/index.js
import { showLoading, hideLoading } from '@/utils'

export function exportImg(option) {
  showLoading()
  setTimeout(() => {
    import('./img.js').then(exportFn => {
      hideLoading()
      exportFn.exportHTMLToImg(option)
    })
  }, 100)
}
```

上面之所以延时100ms，是因为里面的代码会阻塞loading的出现，在前文《Vue组件命令式和声明式的使用方式》中，可以知道`showLoading`也相当于一个组件，它可不是改个css显示隐藏就实现的，在它的源码里，有这样一行代码：

```js
...
parent.appendChild(instance.$el);
Vue.nextTick(() => {
  instance.visible = true;
});
...
```

即loading实际的显示被包在了`nextTick`里，`nextTick`的实现则是promise或是setTimeout=0，如果当前同步任务过多，显示就会延后，看起来很糟糕，所以这里延时100毫秒其实是体验上的优化

```js
// export/img.js
import html2canvas from 'html2canvas'
import { saveAs } from 'file-saver'

export function exportHTMLToImg({
  el,
  name = 'example'
}) {
  html2canvas(el, {
    logging: false
  }).then(canvas => {
    canvas.toBlob(blob => {
      saveAs(bolb, `${name}.png`)
    })
  })
}
```

`html2canvas`的配置不多，这里只把log去掉了，毕竟只是实现类似截图的功能。其他的诸如背景、宽高、剔除指定DOM等看情况使用，也可作为参数传入

## 导出Excel

通过`xlsx`处理数据，再通过`file-saver`保存，`xlsx`很复杂，为了简化操作，
