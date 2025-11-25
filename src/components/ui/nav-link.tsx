// src/components/ui/nav-link.tsx

"use client";
import Link from "next/link";
import React from "react";
import { usePathname } from "next/navigation";

interface NavLinkProps {
    href: string;
    children: React.ReactNode;
    'data-test'?: string;
}

export default function NavLink({ href, children, 'data-test': dataTest }: NavLinkProps) {
    const pathname = usePathname();
    const isActive = pathname === href || (href !== '/' && pathname?.startsWith(href));

    return (
        <li className="list-none relative group" data-test={dataTest}>
            <Link
                href={href}
                className={`text-sm md:text-base block py-3 md:py-5 pl-4 md:pl-0 font-medium transition-colors ${
                    isActive 
                        ? "text-[#337695]" 
                        : "text-gray-500 hover:text-gray-700"
                }`}
            >
                {children}
            </Link>
            <span 
                className={`absolute left-0 md:left-0 right-0 bottom-0 h-0.5 md:h-0.5 transition-colors ${
                    isActive 
                        ? "bg-[#337695]" 
                        : "bg-transparent group-hover:bg-gray-300"
                }`}
            />
        </li>
    );
}

