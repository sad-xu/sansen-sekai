/*
设计一个支持 push，pop，top 操作，并能在常数时间内检索到最小元素的栈。

push(x) -- 将元素 x 推入栈中。
pop() -- 删除栈顶的元素。
top() -- 获取栈顶元素。
getMin() -- 检索栈中的最小元素。

用两个栈，一个存放真实值；一个存放小值越靠近栈顶值越小
*/

/**
 * initialize your data structure here.
 */
var MinStack = function() {
  this.minStack = []
  this.stack = []
};

/** 
* @param {number} x
* @return {void}
*/
MinStack.prototype.push = function(x) {
  // push时和最小栈栈顶元素比较，小于等于的就push，则栈顶元素始终为当前栈的最小值
  if (!this.minStack.length || this.minStack[this.minStack.length - 1] >= x) {
    this.minStack.push(x)
  } 
  this.stack.push(x)
};

/**
* @return {void}
*/
MinStack.prototype.pop = function() {
  // 若移出元素等于最小栈栈顶元素，则同时移出
  let val = this.stack.pop()
  if (this.minStack[this.minStack.length - 1] === val) {
    this.minStack.pop()
  }
};

/**
* @return {number}
*/
MinStack.prototype.top = function() {
  return this.stack.length && this.stack[this.stack.length - 1]
};

/**
* @return {number}
*/
MinStack.prototype.getMin = function() {
  return this.minStack[this.minStack.length - 1]
};

