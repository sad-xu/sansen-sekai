# Vue组件命令式和声明式的使用方式

在大部分的UI框架中，不同的组件会提供不同的使用方式

大部分都是正常的组件使用方法，如`<el-button></el-button>`，和项目中的组件没什么区别

有一些是`命令式`调用的方式，如消息提示`this.$message({...})`

还有一个`声明式`调用，如局部加载`v-loading`

## 命令式

相关的组件有`Message`,`MessageBox`,`Notification`

特点：

1. 主要用于消息提示，可同时存在多个，可自动消失

2. 用于信息确认弹框，逻辑简单

使用方法：`this.$message(options)`

```js
const message = this.$message({ msg: 'msg' })
setTimeout(() => {
  message.hide()
}, 3000)
```

分析：执行时，初始化组件，挂载根节点，根据传入参数渲染页面并返回实例，定时或手动执行实例的`hide`方法后隐藏组件，最后销毁组件

先写一个`.vue`文件

`visible`变量控制显隐

`hide() { this.visible = false }`方法隐藏

组件挂载

使用`Vue.extend(require('./message.vue').default)`得到一个构造函数`MessageConstructor`

以插件的形式导出

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
      msg
    }
  }).$mount()
  document.body.appendChild(innstance.$el)
  return instance // 返回实例 用于hide
}
```

如何在隐藏后销毁组件

在组件里用`transition`包裹，隐藏时触发`after-leave`事件，手动销毁

```js
// 清理与其它实例的连接，解绑全部指令及事件监听器
this.$destory()
// 删除自身节点
this.$el.parentNode.removeChild(this.$el)
```

## 声明式

以全局指令的形式，`v-loading="isLoading"`

`loading`只初始化一次，之后的切换通过`v-show`切换，绑定组件卸载时销毁节点

`true`时会在声明的当前组件上覆盖一层mask，并显示加载状态，`false`时即隐藏

还是先写一个`loading.vue`文件，主要是loading样式，再加一个`visible`变量控制显隐

在再外面`index.js`里

```js
const LoadingConstrructor = Vue.extend(require('./Loading.vue').default)

// 切换loading
function toggleLoading(el, loading) {
  if (binding.value) {
    // 子节点为`absolute`,需要相对父节点定位
    if (el.style.position !== 'absolute') {
      el.style.position = 'relative'
    }
    // 插入节点，设置标志位
    el.appendChild(el.loading)
    el.instance.visible = true
    el.domInserted = true
  } else {
    el.instance.visible = false
  }
}

// 以插件的形式安装，自定义指令
export default {
  install: Vue => {
    Vue.directive('loading', {
      // 初始化
      bind: (el, binding) => {
        const instance = new LoadingConstructor().$mount()
        // 组件实例
        el.instance = instance
        // 组件DOM
        el.loading = instance.$el
        toggleLoading(el, binding)
      },
      // 绑定值变化
      update: (el, binding) => {
        if (binding.oldValue !== binding.value) {
          toggleLoading(el, binding)
        }
      },
      // 卸载节点
      unbind: (el, binding) => {
        // 标记是否已插入到父节点
        if (el.domInserted) {
          el.loading &&
          el.loading.parentNode &&
          el.loading.parentNode.removeChild(el.loading)
        }
      }
    })
  }
}
```

以上只实现了局部loading，还可增加loading图标、文字选项，以及是否全屏loading选项，全屏loading还可提供命令式调用的形式

## 总结

上面两种实现本质上都是通过`extend`初始化组件，拿到实例手动挂载。

`$message`生命很短暂，一旦隐藏就销毁。通过在Vue的原型上添加方法实现在其他地方调用。

`v-loading`只有在绑定的组件销毁时才会销毁。通过自定义指令实现调用。
