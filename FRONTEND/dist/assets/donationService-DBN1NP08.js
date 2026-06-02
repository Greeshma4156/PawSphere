import{a as s}from"./axios-CjNxVIb1.js";const n="/donations",e=async()=>(await s.get(`${n}/campaigns`)).data,p=async a=>(await s.post(`${n}/donate`,a)).data;export{p as d,e as g};
