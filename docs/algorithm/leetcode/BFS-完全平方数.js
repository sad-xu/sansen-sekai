/*
  BFS三要素：
    1. 队列，先入先出的容器
    2. 节点，队列里的元素
    3. 已访问的map，避免访问重复项
*/


/**
 * 给定正整数 n，找到若干个完全平方数（比如 1, 4, 9, 16, ...）使得它们的和等于 n。
 * 你需要让组成和的完全平方数的个数最少。
 */

/**
 * @param {number} n
 * @return {number}
 */
var numSquares = function(n) {
  let list = [[n, 0]]
  let visitedMap = { n: true }
  while(list.length) {
    let [node, depth] = list[0]
    list.shift()
    for (let i = 1; i <= Math.sqrt(node); i++) {
      let nextNode = node - i * i
      if (nextNode === 0) {
        return depth + 1
      } else {
        if (!visitedMap[nextNode]) { // 标记首次出现的数字，之后再出现肯定比第一次长，减少计算量
          visitedMap[nextNode] = true
          list.push([nextNode, depth + 1])
        }
      }
    }
  }
};


// console.log(numSquares(12))
// 3  --> 12 = 4 + 4 + 4

console.log(numSquares(7828))
