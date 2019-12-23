/**
 * 给定一个由 '1'（陆地）和 '0'（水）组成的的二维网格，计算岛屿的数量。
 * 一个岛被水包围，并且它是通过水平方向或垂直方向上相邻的陆地连接而成的。
 * 你可以假设网格的四个边均被水包围。
 * 
 * DFS 递归
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
        dfs(grid, i, j)
      }
    })
  })
  return num
}

function dfs(grid, i, j) {
  let r = grid.length
  let c = grid[0].length
  if (i < 0 || j < 0 || i >= r || j >= c || grid[i][j] === '0') {
    return
  }
  grid[i][j] = '0'
  dfs(grid, i - 1, j)
  dfs(grid, i, j + 1)
  dfs(grid, i + 1, j)
  dfs(grid, i, j - 1)
}

console.log(numIslands([
  ['1', '1', '1', '1', '0'],
  ['1', '1', '0', '1', '0'],
  ['1', '1', '0', '0', '0'],
  ['0', '0', '1', '0', '1']
]))

// 3
