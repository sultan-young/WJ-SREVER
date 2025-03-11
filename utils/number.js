export function incrementStringNumber(inputString) {
    // 将字符串转换为数字并加一
    let incrementedNumber = parseInt(inputString, 10) + 1;
    
    // 将结果转换回字符串，并确保它与原始字符串长度相同
    let result = incrementedNumber.toString().padStart(inputString.length, '0');
    
    return result;
}