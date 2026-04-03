'use client';

import React from 'react';
import Image from 'next/image';

interface Blog {
  title: string;
  author: string;
  date: string;
  readTime: string;
  image: string;
  keywords: string[];
}

export const BlogCard = ({ blog }: { blog: Blog }) => {
  return (
    <div className="group relative bg-[#1A1A1A]/60 backdrop-blur-2xl border border-white/10 rounded-[32px] p-5 flex flex-col gap-5 shadow-[0_20px_40px_rgba(0,0,0,0.3)] hover:shadow-[0_30px_60px_rgba(0,0,0,0.5)] transition-all duration-500 hover:-translate-y-2 max-w-[420px] mx-auto w-full">
      
      {/* Image Container with Arrow */}
      <div className="relative aspect-[16/10] rounded-[24px] overflow-hidden">
        <Image 
          src={blog.image} 
          alt={blog.title} 
          fill 
          sizes="(max-width: 768px) 100vw, (max-width: 1280px) 50vw, 33vw"
          className="object-cover transition-transform duration-700 group-hover:scale-110" 
        />
        <div className="absolute bottom-4 right-4 w-12 h-12 bg-[#0F9393] rounded-full flex items-center justify-center text-white shadow-xl translate-y-2 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-300">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M7 17L17 7M17 7H7M17 7V17"/></svg>
        </div>
      </div>

      {/* Content */}
      <div className="flex flex-col gap-4 px-1">
        <h3 className="font-nunito font-bold text-[22px] md:text-[24px] text-white leading-tight tracking-tight">
          {blog.title}
        </h3>
        
        <div className="flex flex-wrap gap-2">
          {blog.keywords.map((kw: string, i: number) => (
            <span key={i} className="bg-white text-black text-[10px] px-4 py-1.5 rounded-full font-bold uppercase tracking-widest">
              {kw}
            </span>
          ))}
        </div>

        <div className="w-full h-[1px] bg-white/10 my-1"></div>

        <div className="flex justify-between items-end">
          <div className="flex flex-col">
            <span className="text-[13px] font-bold text-white/90 font-nunito">{blog.author}</span>
            <span className="text-[12px] font-bold text-white/50 font-nunito">{blog.readTime}</span>
          </div>
          <span className="text-[12px] font-bold text-white/50 font-nunito">{blog.date}</span>
        </div>
      </div>
    </div>
  );
};
