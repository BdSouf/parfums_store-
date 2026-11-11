"use client";
import {usePathname} from "next/navigation";
import {Header,Footer} from "@/components/layout";
import {motion,useReducedMotion} from "motion/react";
export function AppShell({children}:{children:React.ReactNode}){const path=usePathname();const admin=path.startsWith("/admin");const reduce=useReducedMotion();return <>{!admin&&<Header/>}<motion.main key={path} initial={reduce?false:{opacity:0}} animate={{opacity:1}} transition={{duration:reduce?0:.28}}>{children}</motion.main>{!admin&&<Footer/>}</>}
