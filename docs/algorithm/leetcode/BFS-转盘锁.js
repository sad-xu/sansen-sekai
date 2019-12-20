/**
 * 你有一个带有四个圆形拨轮的转盘锁。每个拨轮都有10个数字： '0', '1', '2', '3', '4', '5', '6', '7', '8', '9' 。
 * 每个拨轮可以自由旋转：例如把 '9' 变为  '0'，'0' 变为 '9' 。每次旋转都只能旋转一个拨轮的一位数字。
 * 锁的初始数字为 '0000' ，一个代表四个拨轮的数字的字符串。
 * 列表 deadends 包含了一组死亡数字，一旦拨轮的数字和列表里的任何一个元素相同，这个锁将会被永久锁定，无法再被旋转。
 * 字符串 target 代表可以解锁的数字，你需要给出最小的旋转次数，如果无论如何不能解锁，返回 -1。
 * 
 */

/**
 * 搜索范围：0000至9999这1000个节点
 * 起始节点：0000
 * 相邻关系：4个位置每次只有一个能+1或者-1（0-1则为9）
 * 目标节点：target
 * 额外条件：节点不会在deadends中
 * 
 * 如何标记已访问节点：维护一个哈希表
 */



/**
 * @param {string[]} deadends
 * @param {string} target
 * @return {number}
 */
var openLock = function(deadends, target) {
  let visitedMap = { '0000': true }
  let list = [['0000', 0]]
  while (list.length) {
    let [node, depth] = list[0]
    list.shift()
    if (node === target) { // 找到
      return depth
    } else if (!deadends.some(deadNode => deadNode === node)) { // 排除dead
      // 每个节点八种可能
      for (let i = 0; i < 4; i++) {
        [1, -1].forEach(v => {
          // 0 --> 9 || 1   9 --> 0 || 8                       必须加10，考虑-1的情况
          let nextNode = node.slice(0, i) + ((Number(node[i]) + v + 10) % 10) + node.slice(i + 1)
          if (!visitedMap[nextNode]) {
            visitedMap[nextNode] = true
            list.push([nextNode, depth + 1])          
          }
        })
      }
    }
  }
  return -1
};

console.log(openLock(
  ["0201","0101","0102","1212","2002"],
  "0202"
))
// 6

console.log(openLock(
  ["8888"],
  "0009"
))
