/**
 * 给定一个由 '1'（陆地）和 '0'（水）组成的的二维网格，计算岛屿的数量。
 * 一个岛被水包围，并且它是通过水平方向或垂直方向上相邻的陆地连接而成的。
 * 你可以假设网格的四个边均被水包围。
 * 
 * 需要构造一个辅助队列
 */


/**
 * @param {character[][]} grid
 * @return {number}
 */
var numIslands = function(grid) {
  let num = 0
  grid.forEach((row, i) => {
    row.forEach((cell, j) => {
      if (cell === '1') {
        num++
        grid[i][j] = '0' // 标记已访问
        let list = []
        list.push([i, j])
        while(list.length) {
          // 取第一个，并移出
          let [m, n] = list[0]
          list.shift()
          // 上右下左
          if (m > 0 && grid[m - 1][n] === '1') {
            grid[m - 1][n] = '0' // 标记已访问
            list.push([m - 1, n])
          }
          if (n < row.length - 1 && grid[m][n + 1] === '1') {
            grid[m][n + 1] = '0'
            list.push([m, n + 1])
          }
          if (m < grid.length - 1 && grid[m + 1][n] === '1') {
            grid[m + 1][n] = '0'
            list.push([m + 1, n])
          }
          if (n > 0 && grid[m][n - 1] === '1') {
            grid[m][n - 1] = '0'
            list.push([m, n - 1])
          }
        }
      }
    })
  })
  return num
};


console.log(numIslands([
  ['1', '1', '1', '1', '0'],
  ['1', '1', '0', '1', '0'],
  ['1', '1', '0', '0', '0'],
  ['0', '0', '1', '0', '1']
]))

// 3
