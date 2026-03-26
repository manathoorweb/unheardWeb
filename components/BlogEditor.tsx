'use client'

import React, { useState, useEffect, useCallback } from 'react'
import { Plus, Trash2, Image as ImageIcon, AlignLeft, AlignRight, Layout, Save, Eye, Send, RotateCcw, HelpCircle } from 'lucide-react'
import Button from './ui/Button'
import Image from 'next/image'

type BlockType = 'text' | 'text_image_left' | 'text_image_right' | 'multi_image'

interface ContentBlock {
  id: string
  type: BlockType
  value: string
  images: string[]
}

interface BlogEditorProps {
  onSave: (blog: { title: string; content: ContentBlock[]; published: boolean }) => void
  initialData?: { title: string; content: ContentBlock[]; published: boolean }
}

export default function BlogEditor({ onSave, initialData }: BlogEditorProps) {
  const [title, setTitle] = useState(initialData?.title || '')
  const [blocks, setBlocks] = useState<ContentBlock[]>(initialData?.content || [{ id: '1', type: 'text', value: '', images: [] }])
  const [published, setPublished] = useState(initialData?.published || false)
  const [showGuidance, setShowGuidance] = useState(false)
  const [lastSaved, setLastSaved] = useState<string | null>(null)

  // LOCAL STORAGE DRAFT PRESERVATION
  useEffect(() => {
    const draft = localStorage.getItem('blog_draft')
    if (draft && !initialData) {
      if (confirm('A previous unsaved draft was found. Would you like to restore it?')) {
        const parsed = JSON.parse(draft)
        setTitle(parsed.title)
        setBlocks(parsed.blocks)
      } else {
        localStorage.removeItem('blog_draft')
      }
    }
  }, [initialData])

  useEffect(() => {
    const timer = setTimeout(() => {
      localStorage.setItem('blog_draft', JSON.stringify({ title, blocks }))
      setLastSaved(new Date().toLocaleTimeString())
    }, 5000)
    return () => clearTimeout(timer)
  }, [title, blocks])

  const addBlock = (type: BlockType) => {
    const newBlock: ContentBlock = {
      id: Math.random().toString(36).substr(2, 9),
      type,
      value: '',
      images: type === 'multi_image' ? ['', '', ''] : (type.includes('image') ? [''] : [])
    }
    setBlocks([...blocks, newBlock])
  }

  const updateBlock = (id: string, updates: Partial<ContentBlock>) => {
    setBlocks(blocks.map(b => b.id === id ? { ...b, ...updates } : b))
  }

  const removeBlock = (id: string) => {
    if (blocks.length > 1) {
      setBlocks(blocks.filter(b => b.id !== id))
    }
  }

  const moveBlock = (id: string, direction: 'up' | 'down') => {
    const index = blocks.findIndex(b => b.id === id)
    if ((direction === 'up' && index === 0) || (direction === 'down' && index === blocks.length - 1)) return
    
    const newBlocks = [...blocks]
    const swapIndex = direction === 'up' ? index - 1 : index + 1
    ;[newBlocks[index], newBlocks[swapIndex]] = [newBlocks[swapIndex], newBlocks[index]]
    setBlocks(newBlocks)
  }

  return (
    <div className="flex flex-col gap-8 max-w-4xl mx-auto pb-20">
      
      {/* Editor Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 sticky top-0 z-20 bg-[#FEFEFC]/80 backdrop-blur-md py-4 border-b border-gray-100 mb-4">
        <div className="flex flex-col">
          <h2 className="text-[24px] font-georgia font-bold text-black flex items-center gap-3">
             {initialData ? 'Edit Blog Post' : 'Create New Post'}
             <button onClick={() => setShowGuidance(!showGuidance)} className="text-gray-400 hover:text-[#0F9393] transition-colors">
               <HelpCircle size={20} />
             </button>
          </h2>
          {lastSaved && <span className="text-[12px] text-gray-400 font-bold uppercase tracking-widest">Draft auto-saved at {lastSaved}</span>}
        </div>

        <div className="flex items-center gap-4 w-full md:w-auto">
           <div className="flex items-center gap-2 bg-gray-100 p-1.5 rounded-full px-4">
              <span className="text-[12px] font-bold text-gray-500 uppercase tracking-widest">Published</span>
              <label className="relative inline-flex items-center cursor-pointer scale-75">
                <input type="checkbox" checked={published} onChange={(e) => setPublished(e.target.checked)} className="sr-only peer" />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#0F9393]"></div>
              </label>
           </div>
           <Button variant="black" className="gap-2 h-[48px]" onClick={() => onSave({ title, content: blocks, published })}>
             <Save size={18} /> Save Post
           </Button>
        </div>
      </div>

      {showGuidance && (
        <div className="bg-[#0F9393]/5 border border-[#0F9393]/20 p-6 rounded-[24px] flex flex-col gap-3 text-[#0F9393] mb-4">
          <p className="font-bold flex items-center gap-2 underline underline-offset-4"><Layout size={18}/> Editor Guidance</p>
          <ul className="text-[14px] list-disc pl-5 font-medium flex flex-col gap-1">
            <li><strong>Titles:</strong> Keep them catchy and relevant to the content.</li>
            <li><strong>Modular Blocks:</strong> Use different block types to keep the reader engaged.</li>
            <li><strong>Images:</strong> Provide direct URLs to images. Multi-image supports up to 3 side-by-side.</li>
            <li><strong>Drafts:</strong> We save your progress every 5 seconds. You can restore it if you accidentally close the tab.</li>
          </ul>
        </div>
      )}

      {/* Main Inputs */}
      <div className="flex flex-col gap-6 bg-white p-8 rounded-[32px] shadow-sm border border-gray-100">
        <input 
          type="text" 
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Enter an engaging title..."
          className="text-[32px] md:text-[48px] font-georgia font-bold text-black border-none outline-none placeholder:text-gray-200 w-full"
        />
        
        <div className="w-full h-[1px] bg-gray-100"></div>

        {/* Blocks List */}
        <div className="flex flex-col gap-10">
          {blocks.map((block, index) => (
            <div key={block.id} className="group/block relative flex flex-col gap-4">
               {/* Block Controls */}
               <div className="absolute -left-12 top-0 flex flex-col gap-2 opacity-0 group-hover/block:opacity-100 transition-opacity">
                  <button onClick={() => moveBlock(block.id, 'up')} className="p-2 hover:bg-gray-100 rounded-lg text-gray-400"><Layout size={16} className="rotate-180"/></button>
                  <button onClick={() => removeBlock(block.id)} className="p-2 hover:bg-red-50 rounded-lg text-red-300 hover:text-red-500"><Trash2 size={16}/></button>
                  <button onClick={() => moveBlock(block.id, 'down')} className="p-2 hover:bg-gray-100 rounded-lg text-gray-400"><Layout size={16}/></button>
               </div>

               {/* Block Content Renderers */}
               {block.type === 'text' && (
                 <textarea 
                   value={block.value}
                   onChange={(e) => updateBlock(block.id, { value: e.target.value })}
                   placeholder="Start writing the paragraph..."
                   className="w-full min-h-[120px] text-[18px] font-nunito leading-relaxed border-none outline-none resize-none placeholder:text-gray-300"
                 />
               )}

               {(block.type === 'text_image_left' || block.type === 'text_image_right') && (
                 <div className={`flex flex-col md:flex-row gap-6 ${block.type === 'text_image_right' ? 'md:flex-row-reverse' : ''}`}>
                   <div className="flex-1">
                      <textarea 
                        value={block.value}
                        onChange={(e) => updateBlock(block.id, { value: e.target.value })}
                        placeholder="Add some text next to the image..."
                        className="w-full min-h-[150px] text-[18px] font-nunito leading-relaxed border-none outline-none resize-none placeholder:text-gray-300"
                      />
                   </div>
                   <div className="w-full md:w-[35%] flex flex-col gap-2">
                      <div className="aspect-[4/3] bg-gray-50 rounded-[20px] border border-dashed border-gray-200 flex items-center justify-center overflow-hidden relative group/img">
                        {block.images[0] ? (
                          <img src={block.images[0]} alt="" className="w-full h-full object-cover" />
                        ) : (
                          <ImageIcon size={32} className="text-gray-200" />
                        )}
                        <input 
                          type="text" 
                          value={block.images[0]}
                          onChange={(e) => updateBlock(block.id, { images: [e.target.value] })}
                          placeholder="Paste Image URL"
                          className="absolute bottom-2 left-2 right-2 p-2 bg-white/90 backdrop-blur-sm rounded-lg text-[10px] font-bold border border-gray-200 opacity-0 group-hover/img:opacity-100 transition-opacity"
                        />
                      </div>
                   </div>
                 </div>
               )}

               {block.type === 'multi_image' && (
                 <div className="flex flex-col gap-4">
                    <p className="text-[12px] font-bold text-gray-400 uppercase tracking-widest">Multi-Image Gallery (Max 3)</p>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      {block.images.map((img, i) => (
                        <div key={i} className="aspect-square bg-gray-50 rounded-[20px] border border-dashed border-gray-200 flex items-center justify-center overflow-hidden relative group/img">
                          {img ? (
                            <img src={img} alt="" className="w-full h-full object-cover" />
                          ) : (
                            <ImageIcon size={24} className="text-gray-200" />
                          )}
                          <input 
                            type="text" 
                            value={img}
                            onChange={(e) => {
                              const newImgs = [...block.images]
                              newImgs[i] = e.target.value
                              updateBlock(block.id, { images: newImgs })
                            }}
                            placeholder="Image URL"
                            className="absolute bottom-2 left-2 right-2 p-2 bg-white/90 backdrop-blur-sm rounded-lg text-[10px] font-bold border border-gray-200 opacity-0 group-hover/img:opacity-100 transition-opacity"
                          />
                        </div>
                      ))}
                    </div>
                 </div>
               )}
            </div>
          ))}
        </div>

        {/* Add Block Toolbar */}
        <div className="flex flex-wrap items-center gap-3 mt-10 p-4 bg-gray-50 rounded-[24px]">
           <span className="text-[12px] font-bold text-gray-400 uppercase tracking-widest mr-2 ml-2">Add Section:</span>
           <button onClick={() => addBlock('text')} className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-full text-[13px] font-bold hover:border-[#0F9393] hover:text-[#0F9393] transition-all"><AlignLeft size={16}/> Text Only</button>
           <button onClick={() => addBlock('text_image_left')} className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-full text-[13px] font-bold hover:border-[#0F9393] hover:text-[#0F9393] transition-all"><ImageIcon size={16}/> Image Left</button>
           <button onClick={() => addBlock('text_image_right')} className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-full text-[13px] font-bold hover:border-[#0F9393] hover:text-[#0F9393] transition-all"><ImageIcon size={16}/> Image Right</button>
           <button onClick={() => addBlock('multi_image')} className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-full text-[13px] font-bold hover:border-[#0F9393] hover:text-[#0F9393] transition-all"><Layout size={16}/> 3 Columns</button>
        </div>
      </div>
    </div>
  )
}
