/**
 * 循环队列
 * 固定长度的数组和首尾两个指针
 * 优点是可重用存储空间
 * 注意点：
 *  对循环的处理，用取余操作 
 *  1. 插入时，操作尾指针
 *  2. 删除时，操作头指针
 *  3. 判断是否已满，即比较头尾指针相对位置
 */


/**
 * Initialize your data structure here. Set the size of the queue to be k.
 * @param {number} k
 * 初始化设置长度
 * i 头指针
 * j 尾指针
 * len 长度
 */
function MyCircularQueue(k) {
  this.arr = []
  this.i = -1
  this.j = -1
  this.len = k
};

/**
 * Insert an element into the circular queue. Return true if the operation is successful. 
 * @param {number} value
 * @return {boolean}
 * 插入，从尾部插入
 * 若已满，插入失败
 * 若为空，头指针指向0
 * 尾指针后移1位，对其指向的位置赋值
 */
MyCircularQueue.prototype.enQueue = function(value) {
  if (this.isFull()) return false
  if (this.isEmpty()) {
    this.i = 0
  }
  this.j = (this.j + 1) % this.len
  this.arr[this.j] = value
  return true
};

/**
 * Delete an element from the circular queue. Return true if the operation is successful.
 * @return {boolean}
 * 删除 头部删除
 * 若为空，删除失败
 * 若只有一个元素，即头尾指针相同，均设置-1，返回
 * 若有多个元素，头指针后移1为，不必删值
 */
MyCircularQueue.prototype.deQueue = function() {
  if (this.isEmpty()) return false
  if (this.i === this.j) {
    this.i = -1
    this.j = -1
    return true
  }
  this.i = (this.i + 1) % this.len
  return true
};

/**
 * Get the front item from the queue.
 * @return {number}
 * 获取头部元素
 * 若为空，返回-1
 */
MyCircularQueue.prototype.Front = function() {
  if (this.isEmpty()) {
    return -1
  }
  return this.arr[this.i]
};

/**
 * Get the last item from the queue.
 * @return {number}
 * 获取尾部元素
 * 若为空，返回-1
 */
MyCircularQueue.prototype.Rear = function() {
  if (this.isEmpty()) {
    return -1
  }
  return this.arr[this.j]
};

/**
 * Checks whether the circular queue is empty or not.
 * @return {boolean}
 * 判断是否为空
 * 即头指针是否为-1
 */
MyCircularQueue.prototype.isEmpty = function() {
  return this.i === -1 
};

/**
 * Checks whether the circular queue is full or not.
 * @return {boolean}
 * 判断是否已满
 * 即尾指针是否在头指针前一位
 */
MyCircularQueue.prototype.isFull = function() {
  return (this.j + 1) % this.len === this.i
};




var circularQueue = new MycircularQueue(3); // 设置长度为 3

circularQueue.enQueue(1);  // 返回 true

circularQueue.enQueue(2);  // 返回 true

circularQueue.enQueue(3);  // 返回 true

circularQueue.enQueue(4);  // 返回 false，队列已满

circularQueue.Rear();  // 返回 3

circularQueue.isFull();  // 返回 true

circularQueue.deQueue();  // 返回 true

circularQueue.enQueue(4);  // 返回 true

circularQueue.Rear();  // 返回 4
