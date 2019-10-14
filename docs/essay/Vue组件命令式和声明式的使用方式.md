# Vue组件命令式和声明式的使用方式

在大部分的UI框架中，不同的组件会提供不同的使用方式

大部分都是正常的组件使用方法，如`<el-button></el-button>`，和项目中的组件没什么区别

一些是`命令式`调用的方式，如消息提示`this.$message({...})`

一个`声明式`调用，局部加载`v-loading`

### 命令式

相关的组件有`Message`,`MessageBox`,`Notification`

特点：

1. 主要用于消息提示，可同时存在多个，可自动消失

2. 用于信息确认弹框，逻辑简单

使用方法：`this.$message(options)`

#### 实现$message

```js
const message = this.$message({ msg: 'msg' })
setTimeout(() => {
  message.hide()
}, 3000)
```

分析：命令执行时，初始化组件，挂载根节点，根据传入参数渲染页面并返回实例，定时或手动执行实例的`hide`方法隐藏组件，最后销毁组件

先写一个`.vue`文件

`visible`变量控制显隐

`hide() { this.visible = false }`方法隐藏

组件挂载

使用`Vue.extend(require('./message.vue').default)`得到一个构造函数`MessageConstructor`

以类似插件的形式导出
```js
export defult {
  install: Vue => {
    Vue.prototype.$message = Message
  }
}
```
`Meaasge`里先实例化组件，由于没有`el`选项，处于未挂载状态，使用`$mount()`手动挂载，手动挂载时未提供`elementOrSelector`参数，所以此时还处于文档碎片的形式，需要手动插入到页面dom中

```js
const Message = function({msg} = {}) {
  const instance = new MessageConstructor({
    data: {
      msg // 提示信息
    }
  })
  instance.$mount()
  document.body.appendChild(innstance.$el)
  return instance // 返回实例 用于hide
}
```

如何隐藏后销毁组件

在组件里用`transition`包裹，隐藏时触发`after-leave`事件，手动销毁
```js
// 清理与其它实例的连接，解绑全部指令及事件监听器
this.$destory()
// 删除自身节点
this.$el.parentNode.removeChild(this.$el)
```

如何处理同时存在多个的情况

维护一个实例数组




