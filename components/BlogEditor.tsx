'use client'

import React, { useState, useEffect } from 'react'
import { Trash2, Image as ImageIcon, Layout, Save, HelpCircle, AlignLeft, Upload, ArrowLeft, Plus, Bold, Italic, Underline, List } from 'lucide-react'
import Button from './ui/Button'
import Image from 'next/image'
import { createClient } from '@/utils/supabase/client'

type BlockType = 'text' | 'text_image_left' | 'text_image_right' | 'multi_image'

interface ContentBlock {
  id: string
  type: BlockType
  heading?: string
  value: string
  images: string[]
}

interface BlogEditorProps {
  onSave: (blog: { title: string; content: ContentBlock[]; published: boolean }) => void
  onBack: () => void
  initialData?: Partial<{ title: string; content: ContentBlock[]; published: boolean }>
}

export default function BlogEditor({ onSave, onBack, initialData }: BlogEditorProps) {
  const [title, setTitle] = useState(initialData?.title || '')
  const [blocks, setBlocks] = useState<ContentBlock[]>(initialData?.content || [{ id: '1', type: 'text', value: '', images: [] }])
  const [published, setPublished] = useState(initialData?.published || false)
  const [subtitle, setSubtitle] = useState('')
  const [coverUrl, setCoverUrl] = useState('')
  const [showGuidance, setShowGuidance] = useState(false)
  const [lastSaved, setLastSaved] = useState<string | null>(null)
  const [isUploading, setIsUploading] = useState(false)
  const supabase = createClient()

  const handleImageUpload = async (file: File, blockId: string, imageIndex: number = 0) => {
    if (!file) return;
    setIsUploading(true);
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${Math.random().toString(36).substring(7)}.${fileExt}`;
      const filePath = `blog/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('blog-content')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('blog-content')
        .getPublicUrl(filePath);

      const block = blocks.find(b => b.id === blockId);
      if (block) {
        const newImages = [...block.images];
        newImages[imageIndex] = publicUrl;
        updateBlock(blockId, { images: newImages });
      }
    } catch (error: any) {
      alert('Upload failed: ' + error.message);
    } finally {
      setIsUploading(false);
    }
  };

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
    <div className="flex flex-col gap-8 max-w-5xl mx-auto pb-20 text-black font-sans">
      
      {/* Compact Top Bar */}
      <div className="sticky top-0 z-30 bg-white/90 backdrop-blur-md py-4 border-b border-gray-100 flex items-center justify-between gap-4 -mx-4 md:-mx-8 px-4 md:px-8 mb-8">
        <div className="flex items-center gap-6">
          <button onClick={onBack} className="flex items-center gap-2 text-gray-400 font-bold text-[12px] uppercase tracking-widest hover:text-black transition-colors">
             <ArrowLeft size={16} /> Back
          </button>
          <div className="h-4 w-[1px] bg-gray-200 hidden md:block" />
          {lastSaved && <span className="hidden md:block text-[11px] text-gray-400 font-bold uppercase tracking-widest">Saved {lastSaved}</span>}
        </div>

        <div className="flex items-center gap-4">
           <div className="flex items-center gap-2 bg-gray-50 p-1.5 rounded-lg px-4 border border-gray-100">
              <span className="text-[11px] font-bold text-gray-500 uppercase tracking-widest">Published</span>
              <input type="checkbox" checked={published} onChange={(e) => setPublished(e.target.checked)} className="accent-[#0F9393]" />
           </div>
           <Button variant="black" className="gap-2 h-[44px] rounded-lg text-[14px] px-6" onClick={() => onSave({ title, content: blocks, published })}>
             <Save size={16} /> Save Changes
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
      <div className="flex flex-col gap-8 bg-white p-8 rounded-2xl border border-gray-200 shadow-sm">
        <div className="flex flex-col gap-2">
          <label className="text-[11px] font-bold text-gray-400 uppercase tracking-widest">Story Title</label>
          <input 
            type="text" 
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Empowering Rural Schools"
            className="text-[20px] font-bold text-gray-900 border border-gray-200 rounded-lg px-5 py-3 outline-none focus:border-[#0F9393] transition-all w-full"
          />
        </div>

        <div className="flex flex-col gap-2">
          <label className="text-[11px] font-bold text-gray-400 uppercase tracking-widest">Subtitle / Brief</label>
          <input 
            type="text" 
            value={subtitle}
            onChange={(e) => setSubtitle(e.target.value)}
            placeholder="Bringing Digital Literacy to Every Classroom and Unleashing Potential"
            className="text-[15px] font-medium text-gray-600 border border-gray-200 rounded-lg px-5 py-3 outline-none focus:border-[#0F9393] transition-all w-full"
          />
        </div>

        <div className="flex flex-col gap-2">
          <label className="text-[11px] font-bold text-gray-400 uppercase tracking-widest">Cover Image (URL or Upload)</label>
          <div className="flex gap-3">
            <input 
              type="text" 
              value={coverUrl}
              onChange={(e) => setCoverUrl(e.target.value)}
              placeholder="https://drive.google.com/..."
              className="flex-1 text-[14px] font-medium text-gray-500 border border-gray-200 rounded-lg px-5 py-3 outline-none focus:border-[#0F9393] transition-all"
            />
            <button 
              onClick={() => document.getElementById('cover-upload-input')?.click()}
              className="bg-[#111111] text-white px-6 rounded-lg font-bold text-[13px] flex items-center gap-2 hover:bg-gray-800 transition-all"
              disabled={isUploading}
            >
              <Upload size={14} /> {isUploading ? 'Uploading...' : 'Upload'}
            </button>
            <input 
              id="cover-upload-input"
              type="file" 
              className="hidden" 
              accept="image/*"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) {
                  const fileExt = file.name.split('.').pop();
                  const fileName = `cover-${Math.random().toString(36).substring(7)}.${fileExt}`;
                  const filePath = `blog/${fileName}`;
                  
                  setIsUploading(true);
                  supabase.storage.from('blog-content').upload(filePath, file).then(({ error }) => {
                    if (error) alert(error.message);
                    else {
                      const { data: { publicUrl } } = supabase.storage.from('blog-content').getPublicUrl(filePath);
                      setCoverUrl(publicUrl);
                    }
                    setIsUploading(false);
                  });
                }
              }}
            />
          </div>
        </div>

        <div className="flex items-center gap-3 pt-4">
          <h3 className="text-[18px] font-bold text-gray-900">Content Blocks</h3>
          <div className="flex-1 h-[1px] bg-gray-100"></div>
        </div>

        {/* Blocks List */}
        <div className="flex flex-col gap-10">
          {blocks.map((block) => (
            <div key={block.id} className="group/block relative flex flex-col gap-4">
               {/* Block Controls */}
               <div className="absolute -left-12 top-0 flex flex-col gap-2 opacity-0 group-hover/block:opacity-100 transition-opacity">
                  <button onClick={() => moveBlock(block.id, 'up')} className="p-2 hover:bg-gray-100 rounded-lg text-gray-400"><Layout size={16} className="rotate-180"/></button>
                  <button onClick={() => moveBlock(block.id, 'down')} className="p-2 hover:bg-gray-100 rounded-lg text-gray-400"><Layout size={16}/></button>
               </div>

               {/* Block Content Renderers */}
               <div className="flex flex-col gap-4">
                  {/* Common Heading Input for all block types except multi_image */}
                  {block.type !== 'multi_image' && (
                    <div className="flex flex-col gap-1 mb-2">
                      <label className="text-[10px] font-black text-gray-300 uppercase tracking-[0.2em] ml-1">Section Heading (Optional)</label>
                      <input 
                        type="text"
                        value={block.heading || ''}
                        onChange={(e) => updateBlock(block.id, { heading: e.target.value })}
                        placeholder="e.g. The Science of Silence..."
                        className="text-[24px] md:text-[28px] font-bold font-georgia text-[#086B6B] border-none outline-none placeholder:text-gray-100 bg-transparent w-full tracking-tight"
                      />
                    </div>
                  )}

                  {block.type === 'text' && (
                    <div className="bg-white border border-gray-200 rounded-xl p-8 flex flex-col gap-6 shadow-sm">
                      <div className="flex justify-between items-center">
                        <span className="text-[#3B82F6] text-[10px] font-bold px-3 py-1 bg-blue-50 rounded-md uppercase tracking-widest">Text Only</span>
                        <button onClick={() => removeBlock(block.id)} className="text-red-400 text-[11px] font-bold hover:text-red-600 transition-colors">Trash</button>
                      </div>

                      <input 
                        type="text"
                        value={block.heading || ''}
                        onChange={(e) => updateBlock(block.id, { heading: e.target.value })}
                        placeholder="Section Title (Optional)"
                        className="text-[18px] font-bold text-gray-900 border border-gray-100 rounded-lg px-4 py-3 outline-none focus:border-[#0F9393] transition-all w-full"
                      />

                      <div className="border border-gray-100 rounded-lg overflow-hidden">
                        <div className="flex items-center gap-5 px-5 py-3 bg-gray-50/50 border-b border-gray-100">
                          <button onClick={() => {/* bold */}} className="text-gray-400 hover:text-black transition-colors"><Bold size={16} /></button>
                          <button onClick={() => {/* italic */}} className="text-gray-400 hover:text-black transition-colors"><Italic size={16} /></button>
                          <button onClick={() => {/* underline */}} className="text-gray-400 hover:text-black transition-colors"><Underline size={16} /></button>
                          <div className="w-[1px] h-4 bg-gray-200" />
                          <button onClick={() => {/* link */}} className="text-gray-400 hover:text-black transition-colors"><Plus size={16} /></button>
                          <button onClick={() => {/* list */}} className="text-gray-400 hover:text-black transition-colors"><List size={16} /></button>
                        </div>
                        <textarea 
                          id={`textarea-${block.id}`}
                          value={block.value}
                          onChange={(e) => updateBlock(block.id, { value: e.target.value })}
                          placeholder="Write your story content here..."
                          className="w-full min-h-[140px] p-6 text-[16px] text-gray-700 leading-relaxed outline-none resize-none bg-white"
                        />
                      </div>
                    </div>
                  )}

                  {(block.type === 'text_image_left' || block.type === 'text_image_right') && (
                    <div className="bg-white border border-gray-200 rounded-xl p-8 flex flex-col gap-6 shadow-sm">
                      <div className="flex justify-between items-center">
                        <span className="text-[#A855F7] text-[10px] font-bold px-3 py-1 bg-purple-50 rounded-md uppercase tracking-widest">{block.type === 'text_image_left' ? 'Image Left' : 'Image Right'}</span>
                        <button onClick={() => removeBlock(block.id)} className="text-red-400 text-[11px] font-bold hover:text-red-600 transition-colors">Trash</button>
                      </div>

                      <div className="flex gap-4">
                        <input 
                          type="text" 
                          value={block.images[0] || ''}
                          onChange={(e) => updateBlock(block.id, { images: [e.target.value] })}
                          placeholder="Image URL"
                          className="flex-1 text-[13px] border border-gray-100 rounded-lg px-4 py-2.5 outline-none focus:border-[#0F9393]"
                        />
                        <button 
                          onClick={() => document.getElementById(`upload-${block.id}-0`)?.click()}
                          className="bg-black text-white px-5 rounded-lg font-bold text-[12px] flex items-center gap-2"
                        >
                          <Upload size={14} /> Upload
                        </button>
                        <input id={`upload-${block.id}-0`} type="file" className="hidden" onChange={(e) => e.target.files?.[0] && handleImageUpload(e.target.files[0], block.id, 0)} />
                      </div>

                      <input 
                        type="text"
                        value={block.heading || ''}
                        onChange={(e) => updateBlock(block.id, { heading: e.target.value })}
                        placeholder="Section Title"
                        className="text-[18px] font-bold text-gray-900 border border-gray-100 rounded-lg px-4 py-3 outline-none focus:border-[#0F9393]"
                      />

                      <div className="border border-gray-100 rounded-lg overflow-hidden">
                        <div className="flex items-center gap-5 px-5 py-3 bg-gray-50/50 border-b border-gray-100">
                          <button onClick={() => {/* bold */}} className="text-gray-400 hover:text-black transition-colors"><Bold size={16} /></button>
                          <button onClick={() => {/* italic */}} className="text-gray-400 hover:text-black transition-colors"><Italic size={16} /></button>
                          <button onClick={() => {/* underline */}} className="text-gray-400 hover:text-black transition-colors"><Underline size={16} /></button>
                        </div>
                        <textarea 
                          id={`textarea-${block.id}`}
                          value={block.value}
                          onChange={(e) => updateBlock(block.id, { value: e.target.value })}
                          placeholder="Write your content here..."
                          className="w-full min-h-[140px] p-6 text-[16px] text-gray-700 leading-relaxed outline-none resize-none bg-white"
                        />
                      </div>
                    </div>
                  )}

                  {block.type === 'multi_image' && (
                    <div className="bg-white border border-gray-200 rounded-xl p-8 flex flex-col gap-6 shadow-sm">
                      <div className="flex justify-between items-center">
                        <span className="text-[#16A34A] text-[10px] font-bold px-3 py-1 bg-green-50 rounded-md uppercase tracking-widest">3 Column Gallery</span>
                        <button onClick={() => removeBlock(block.id)} className="text-red-400 text-[11px] font-bold hover:text-red-600 transition-colors">Trash</button>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        {block.images.map((img, i) => (
                          <div key={i} className="flex flex-col gap-2">
                            <div className="aspect-square bg-gray-50 rounded-xl border border-gray-100 flex items-center justify-center overflow-hidden relative group/img">
                              {img ? (
                                <Image src={img} alt="" width={300} height={300} className="w-full h-full object-cover" unoptimized />
                              ) : (
                                <ImageIcon size={20} className="text-gray-200" />
                              )}
                              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover/img:opacity-100 transition-opacity flex items-center justify-center">
                                <button onClick={() => document.getElementById(`upload-${block.id}-${i}`)?.click()} className="p-2 bg-white rounded-lg"><Upload size={14} /></button>
                                <input id={`upload-${block.id}-${i}`} type="file" className="hidden" onChange={(e) => e.target.files?.[0] && handleImageUpload(e.target.files[0], block.id, i)} />
                              </div>
                            </div>
                            <input 
                              type="text" 
                              value={img}
                              onChange={(e) => {
                                const newImgs = [...block.images]
                                newImgs[i] = e.target.value
                                updateBlock(block.id, { images: newImgs })
                              }}
                              placeholder="Image URL"
                              className="w-full p-2.5 text-[11px] border border-gray-100 rounded-lg outline-none focus:border-[#0F9393]"
                            />
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
               </div>
            </div>
          ))}
        </div>

        {/* Add Block Toolbar */}
        <div className="flex flex-wrap items-center gap-3 mt-10 p-4 bg-gray-50 rounded-[24px]">
           <span className="text-[12px] font-bold text-gray-400 uppercase tracking-widest mr-2 ml-2">Add Section:</span>
           <button onClick={() => addBlock('text')} className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-full text-[13px] font-bold text-black hover:border-[#0F9393] hover:text-[#0F9393] transition-all"><AlignLeft size={16}/> Text Only</button>
           <button onClick={() => addBlock('text_image_left')} className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-full text-[13px] font-bold text-black hover:border-[#0F9393] hover:text-[#0F9393] transition-all"><ImageIcon size={16}/> Image Left</button>
           <button onClick={() => addBlock('text_image_right')} className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-full text-[13px] font-bold text-black hover:border-[#0F9393] hover:text-[#0F9393] transition-all"><ImageIcon size={16}/> Image Right</button>
           <button onClick={() => addBlock('multi_image')} className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-full text-[13px] font-bold text-black hover:border-[#0F9393] hover:text-[#0F9393] transition-all"><Layout size={16}/> 3 Columns</button>
        </div>
      </div>
    </div>
  )
}
