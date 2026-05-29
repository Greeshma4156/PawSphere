import{n as s,ab as i,E as e,a as c,L as x}from"./index-8KaHygn6.js";import{A as m}from"./activity-BPno7Qnd.js";/**
 * @license lucide-react v0.368.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const h=s("Home",[["path",{d:"m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z",key:"y5dka4"}],["polyline",{points:"9 22 9 12 15 12 15 22",key:"e2us08"}]]);/**
 * @license lucide-react v0.368.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const p=s("Map",[["path",{d:"M14.106 5.553a2 2 0 0 0 1.788 0l3.659-1.83A1 1 0 0 1 21 4.619v12.764a1 1 0 0 1-.553.894l-4.553 2.277a2 2 0 0 1-1.788 0l-4.212-2.106a2 2 0 0 0-1.788 0l-3.659 1.83A1 1 0 0 1 3 19.381V6.618a1 1 0 0 1 .553-.894l4.553-2.277a2 2 0 0 1 1.788 0z",key:"169xi5"}],["path",{d:"M15 5.764v15",key:"1pn4in"}],["path",{d:"M9 3.236v15",key:"1uimfh"}]]);/**
 * @license lucide-react v0.368.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const b=s("UserRound",[["circle",{cx:"12",cy:"8",r:"5",key:"1hypcn"}],["path",{d:"M20 21a8 8 0 0 0-16 0",key:"rfgkzh"}]]);function k(){const n=i(),a=r=>r==="/dashboard"?n.pathname.startsWith("/dashboard"):n.pathname===r,t=({to:r,label:d,icon:o,active:l})=>e.jsxs(x,{to:r,className:`flex flex-col items-center justify-center gap-1 text-[10px] font-extrabold transition-all rounded-2xl px-3 py-2 border ${l?"bg-lavender/15 border-lavender/30 text-lavender":"bg-white/0 border-transparent text-gray-500 dark:text-gray-400 hover:bg-lavender/10 hover:border-lavender/20"}`,children:[o,e.jsx("span",{className:"leading-none",children:d})]});return e.jsx("nav",{className:"fixed bottom-4 left-1/2 -translate-x-1/2 z-[2000] md:hidden",children:e.jsx("div",{className:"bg-white/80 dark:bg-dark/80 backdrop-blur-md border border-lavender/20 dark:border-white/10 rounded-[2rem] px-2.5 py-2 shadow-2xl",children:e.jsxs("div",{className:"flex gap-2 items-center",children:[e.jsx(t,{to:"/",label:"Home",icon:e.jsx(h,{className:`w-4 h-4 ${a("/")?"text-lavender":"text-gray-500 dark:text-gray-400"}`}),active:a("/")}),e.jsx(t,{to:"/map",label:"Rescue",icon:e.jsx(m,{className:`w-4 h-4 ${a("/map")?"text-lavender":"text-gray-500 dark:text-gray-400"}`}),active:a("/map")}),e.jsx(t,{to:"/map",label:"Map",icon:e.jsx(p,{className:`w-4 h-4 ${a("/map")?"text-lavender":"text-gray-500 dark:text-gray-400"}`}),active:a("/map")}),e.jsx(t,{to:"/donations",label:"Donate",icon:e.jsx(c,{className:`w-4 h-4 ${a("/donations")?"text-lavender":"text-gray-500 dark:text-gray-400"}`}),active:a("/donations")}),e.jsx(t,{to:"/dashboard/citizen",label:"Dashboard",icon:e.jsx(b,{className:`w-4 h-4 ${a("/dashboard")?"text-lavender":"text-gray-500 dark:text-gray-400"}`}),active:a("/dashboard/citizen")})]})})})}export{k as default};
