"use client";
import {createContext,useContext,useEffect,useState,ReactNode} from "react";
export type CartLine={variantId:string;quantity:number};
export type DemoOrder={reference:string;name:string;phone:string;city:string;address:string;delivery:string;total:number;status:string;createdAt:string;items:CartLine[]};
type Store={cart:CartLine[];add:(id:string,q?:number)=>void;setQty:(id:string,q:number)=>void;remove:(id:string)=>void;clear:()=>void;orders:DemoOrder[];addOrder:(o:DemoOrder)=>void;setStatus:(ref:string,s:string)=>void;ready:boolean};
const C=createContext<Store|null>(null);
export function StoreProvider({children}:{children:ReactNode}){const[cart,setCart]=useState<CartLine[]>([]);const[orders,setOrders]=useState<DemoOrder[]>([]);const[ready,setReady]=useState(false);
// Hydration depuis le stockage navigateur : cette synchronisation initiale est intentionnelle.
// eslint-disable-next-line react-hooks/set-state-in-effect
useEffect(()=>{try{setCart(JSON.parse(localStorage.getItem("la7ya-cart")||"[]"));setOrders(JSON.parse(localStorage.getItem("la7ya-orders")||"[]"))}catch{}setReady(true)},[]);
useEffect(()=>{if(ready)localStorage.setItem("la7ya-cart",JSON.stringify(cart))},[cart,ready]);useEffect(()=>{if(ready)localStorage.setItem("la7ya-orders",JSON.stringify(orders))},[orders,ready]);
const add=(id:string,q=1)=>setCart(c=>{const x=c.find(l=>l.variantId===id);return x?c.map(l=>l.variantId===id?{...l,quantity:l.quantity+q}:l):[...c,{variantId:id,quantity:q}]});
const value={cart,add,setQty:(id:string,q:number)=>setCart(c=>c.map(l=>l.variantId===id?{...l,quantity:Math.max(1,q)}:l)),remove:(id:string)=>setCart(c=>c.filter(l=>l.variantId!==id)),clear:()=>setCart([]),orders,addOrder:(o:DemoOrder)=>setOrders(x=>[o,...x]),setStatus:(r:string,s:string)=>setOrders(x=>x.map(o=>o.reference===r?{...o,status:s}:o)),ready};return <C.Provider value={value}>{children}</C.Provider>}
export const useStore=()=>{const c=useContext(C);if(!c)throw Error("StoreProvider missing");return c};
