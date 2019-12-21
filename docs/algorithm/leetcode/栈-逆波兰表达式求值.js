/*
根据逆波兰表示法，求表达式的值。

有效的运算符包括 +, -, *, / 。每个运算对象可以是整数，也可以是另一个逆波兰表达式。

整数除法只保留整数部分。
给定逆波兰表达式总是有效的。换句话说，表达式总会得出有效数值且不存在除数为 0 的情况。

每遇到一个运算符，将前两个值进行计算
便利原数组，用栈存储数字
*/

/**
 * @param {string[]} tokens
 * @return {number}
 */
var evalRPN = function(tokens) {
  let stack = []
  const map = {
    '+': (b, a) => a + b,
    '-': (b, a) => a - b,
    '*': (b, a) => a * b,
    '/': (b, a) => Math.trunc(a / b)
  }
  tokens.forEach(token => {
    if (map[token]) {
      stack.push(map[token](stack.pop(), stack.pop()))
    } else {
      stack.push(Number(token))
    }
  })
  return stack[0]
};

console.log(evalRPN(["10", "6", "9", "3", "+", "-11", "*", "/", "*", "17", "+", "5", "+"]))
// 22
//   ((10 * (6 / ((9 + 3) * -11))) + 17) + 5
// = ((10 * (6 / (12 * -11))) + 17) + 5
// = ((10 * (6 / -132)) + 17) + 5
// = ((10 * 0) + 17) + 5
// = (0 + 17) + 5
// = 17 + 5
// = 22