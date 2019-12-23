/*
  给定无向连通图中一个节点的引用，返回该图的深拷贝（克隆）。图中的每个节点都包含它的值 val（Int） 和其邻居的列表（list[Node]）。

  节点数介于 1 到 100 之间。
  无向图是一个简单图，这意味着图中没有重复的边，也没有自环。
  由于图是无向的，如果节点 p 是节点 q 的邻居，那么节点 q 也必须是节点 p 的邻居。
  必须将给定节点的拷贝作为对克隆图的引用返回。

  1 —— 2
  |    |
  3 —— 4

  遍历整个图，记录已访问节点
 */

 /**
 * // Definition for a Node.
 * function Node(val,neighbors) {
 *    this.val = val;
 *    this.neighbors = neighbors;
 * };
 */
/**
 * @param {Node} node
 * @return {Node}
 */

// ????????????????????
var cloneGraph = function(node) {
  if (!node) {
      return node
  }
  const map = new Map()
  function deep(node) {
      if (!map.get(node)) {
          map.set(node, new Node(node.val, []))
          map.get(node).neighbors = node.neighbors.map(v => deep(v))
      }
      return map.get(node)
  }
  return deep(node)
};

console.log(cloneGraph())