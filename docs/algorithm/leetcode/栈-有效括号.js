/*
给定一个只包括 '('，')'，'{'，'}'，'['，']' 的字符串，判断字符串是否有效。

有效字符串需满足：

左括号必须用相同类型的右括号闭合。
左括号必须以正确的顺序闭合。
注意空字符串可被认为是有效字符串。
*/

/**
 * @param {string} s
 * @return {boolean}
 */
var isValid = function(s) {
  const map = {
    '(': ')',
    '{': '}',
    '[': ']'
  }
  let strList = s.split('')
  let arr = []
  for (let i = 0; i < strList.length; i++) {
    let rightStr = map[strList[i]]
    if (rightStr) {
      // 若有对应值，说明时左括号，把对应的右括号入栈
      arr.push(rightStr)
    } else {
      // 若无对应值，说明是右括号，从栈中推出一个比较
      if (strList[i] !== arr.pop()) {
        return false
      }
    }
  }
  return !arr.length
};

console.log(isValid("()")) // true
console.log(isValid("([]){}")) // true
console.log(isValid("([)]")) // false
