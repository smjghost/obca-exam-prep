const text = "3个Zone，每Zone 5台OB Server";
const re = /^(?:\[.*?\]\s*)?\d+(?:[、\.]|\s+)\s*/;
console.log(text.replace(re, "").trim());
console.log("1. Hello".replace(re, "").trim());
console.log("2、 World".replace(re, "").trim());
console.log("3 test".replace(re, "").trim());
