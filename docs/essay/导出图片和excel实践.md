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
      // `hideLoading`的位置我这里放的比较早，因为loading至少有1秒，早点也没关系
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
      saveAs(blob, `${name}.png`)
    })
  })
}
```

`html2canvas`的配置不多，这里只把log去掉了，毕竟只是实现类似截图的功能。其他的诸如背景、宽高、剔除指定DOM等看情况使用，也可作为参数传入

如果要实现导出pdf，可能需要配合`jsPDF`使用，没试过，不想试

## 导出Excel

这个功能在年初的时候实现过，当时使用的是`xlsx`，功能非常多，但是社区版不支持修改单元格样式

一个民间库`xlsx-style`基于`xlsx`拓展了修改样式的功能，但都好多年不维护了，部分样式像行高也不支持修改

`xlsx-style`用起来很麻烦，因为是基于很多年前的`xlsx`，许多方便的api不支持，这里就不写用法了

### xlsx

下面写一下`xlsx`的用法示例

```js
// excel.js
import { saveAs } from 'file-saver'
import XLSX from 'xlsx'

export function exportJSONToExcel({
  data,
  filename = 'example',
  option = {}
}) {
  let wb = {
    SheetNames: [],
    Sheets: {},
    // Props: { // 属性
    //   Subject: '*',
    //   Author: 'XHC'
    // }
  }
  // 数组 --> 工作表数据格式
  let ws = XLSX.utils.aoa_to_sheet(data)
  // 合并单元格
  if (option.merges) ws['!merges'] = option.merges
  const sheetName = 'sheet-1'
  wb.SheetNames.push(sheetName)
  ws.Sheets[sheetName] = ws
  const wbout = XLSX.write(wb, {
    bookType: 'xlsx',
    type: 'array'
  })
  saveAs(new Blob([wbout]), {
    type: 'application/octet-stream'
  }, `${filename}.xlsx`)
}
```

以上函数将二维数组转化成excel里的表，只生成一个`sheet`，且无任何样式设置，实际上社区版的`xlsx`有设置单元格宽度等功能

在`protobi/js-xlsx/issues/90`里`xlsx-style`的开发者说明了不维护的原因以及替代方案，再加上评论里还有人推荐另一个库，现有两个选择

1. `msexcel-builder`

  `xlsx-style`开发者维护的只能生成xlsx文件的轻量级库

2. `exceljs`
  
  功能和`xlsx`类似，支持样式设置

两者对比，前者十几个star，一年多没更新，开发者好像又弃坑了...后者4.7k个star，维护的很频繁，当然选第二个

### exceljs

`exceljs`用起来有一点别扭，直接用的话设置样式很烦，最好手动封装一下，目前的导出需要的功能有加粗、边框、合并、水平垂直居中

考虑把数据和样式分开，传入参数字段有

```js
function exportJSONToExcel({
  name = Date.now(),
  // 纯数据的二维数组，值为简单类型
  data,
  // 合并选项 三维数组，左上角起点+右下角终点
  // [[[x1,y1], [x2, y2]],...]
  merge = [],
  // 加粗选项 二维数组 单元格位置
  // [[x,y],...]
  bold = []
}) {}
```

先生成一个无样式的表

```js
// exportJSONToExcel
let workbook = new Excel.Workbook()
// 可添加一些额外信息 如作者、公司等
workbook.creator = 'XHC' 
// 新建sheet
let sheet = workbook.addWorksheet('sheet-1')
// 添加纯数据
sheet.addRows(data)
// 导出
workbook.xlsx.writeBuffer()
  .then(buffer => {
    saveAs(new Blob([buffer]), `${name}.xlsx`)
  })
```

so easy，纯数据的导出不论`xlsx`还是`exceljs`都很简单，接下来是给单元格附样式

样式的操作在数据添加完成后，导出前，先做个加粗

```js
// exportJSONToExcel
bold = bold.map(item => item.join('|'))
// 遍历单元格
data.forEach((rowData, r) => {
  let row = sheet.getRow(r + 1)
  rowData.forEach((cellData, c) => {
    let cell = row.getCell(c + 1)
    let rc = `${r}|${c}`
    // 加粗
    if (bold.length) {
      let i = bold.findIndex(boldItem => boldItem === rc)
      if (i >= 0) {
        cell.font = {
          bold: true
        }
        bold.splice(i, 1)
      }
    }
  })
})
```

辨别加粗单元格是通过把位置转化成字符串再比对的方法实现的，感觉还好

然后是合并，合并是通过`worksheet.mergeCells('A4:B5')`实现的，所以需要一个数组下标转excel坐标`ABC`的方法

```js
function numToABC(num, str = '') {
  let a = num % 26
  let b = Math.floor(num / 26) - 1
  str = String.fromCharCode(num + 65) + str
  if (b === -1) return str
  return numToABC(b, str)
}
```

通过递归实现，需要注意的是数组是从0开始的，而excel是从1开始的

```js
// exportJSONToExcel
// [[[x1,y1], [x2, y2]],...]
let mergeContent = []
merge.forEach(arr => {
  mergeContent.push(arr[0])
  sheet.mergeCells(`${numToABC(arr[0][1])}${arr[0][0] + 1}:${numToABC(arr[1][1])}${arr[1][0] + 1}`)
})

// 单元格遍历内部 和bold平级
if (mergeContent) {
  let i = mergeContent.findIndex(mergeItem => mergeItem === rc)
  if (i >= 0) {
    cell.alignment = {
      vertial: 'middle',
      horizontal: 'center'
    }
  }
}
```

数组的xy与excel的xy是反的，需要注意一下

还有，如果只是合并的话，里面的内容是不会水平垂直居中的，最好把内容放在左上角单元格里，在便利单元格时，附上居中，完美

还有一个加边框的功能，先留着吧，大致思路是传参和merge类似，描述区域的数组，再加边框的颜色和形状字段，在遍历单元格的时候分辨四个边分别附上边框样式，OVER！

本来计划周三写完的，谁能想到中途改成了`exceljs`实现，再加上其他杂七杂八的事情，拖到了周末。

导出作为一个相对隐蔽的辅助功能，使用的人可能百分之一都不到，就算用，也没多少人在乎里面的样式是什么，有数据就行了。

但我还是尽量做了，毕竟`html2canvas`、`xlsx`、`xlsx-style`、`excel`，维护这些库的开发者们至少上百人，跨度有好几年














