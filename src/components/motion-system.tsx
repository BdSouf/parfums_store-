"use client";
import {motion,useReducedMotion} from "motion/react";
import {ReactNode} from "react";
export function Reveal({children,className="",delay=0}:{children:ReactNode;className?:string;delay?:number}){const reduce=useReducedMotion();return <motion.div className={className} initial={reduce?false:{opacity:0,y:24}} whileInView={{opacity:1,y:0}} viewport={{once:true,amount:.16}} transition={{duration:reduce?0:.55,delay,ease:[.22,1,.36,1]}}>{children}</motion.div>}
export function Stagger({children,className=""}:{children:ReactNode;className?:string}){const reduce=useReducedMotion();return <motion.div className={className} initial="hidden" whileInView="show" viewport={{once:true,amount:.12}} variants={{hidden:{},show:{transition:{staggerChildren:reduce?0:.07}}}}>{children}</motion.div>}
export function StaggerItem({children,className=""}:{children:ReactNode;className?:string}){const reduce=useReducedMotion();return <motion.div className={className} variants={{hidden:{opacity:reduce?1:0,y:reduce?0:18},show:{opacity:1,y:0,transition:{duration:reduce?0:.45,ease:[.22,1,.36,1]}}}}>{children}</motion.div>}
