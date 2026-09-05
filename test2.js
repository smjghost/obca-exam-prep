const text1 = "3个Zone，2个同城，1个异地";
const text2 = "5个Zone，每个Zone有10台OB Server";
const re = /^(?:\[.*?\]\s*)?\d+(?:[、\.]|\s+)\s*/;
console.log(text1.replace(re, ""));
console.log(text2.replace(re, ""));
