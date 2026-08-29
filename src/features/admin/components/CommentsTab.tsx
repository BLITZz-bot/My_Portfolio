"use client";

import { MessageSquare, Check, Trash2 } from "lucide-react";
import { Comment } from "@/types/comment";

interface CommentsTabProps {
  comments: Comment[];
  onApprove: (id: string) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
}

export function CommentsTab({
  comments,
  onApprove,
  onDelete,
}: CommentsTabProps) {
  return (
    <div className="space-y-12">
      <div>
        <h2 className="text-4xl font-bold tracking-tighter mb-2 uppercase italic">
          Comment <span className="text-neutral-500">Moderation.</span>
        </h2>
        <p className="text-neutral-500">Approve or remove visitor testimonials before they go live.</p>
      </div>

      <div className="grid grid-cols-1 gap-6">
        {comments.length === 0 ? (
          <div className="p-20 text-center bg-neutral-900/50 border border-white/5 rounded-[32px]">
            <MessageSquare className="mx-auto text-neutral-800 mb-4" size={48} />
            <p className="text-neutral-500 font-bold uppercase tracking-widest text-xs">No comments yet</p>
          </div>
        ) : (
          comments.map((c) => (
            <div key={c.id} className="p-8 bg-neutral-900/50 border border-white/5 rounded-[32px] backdrop-blur-md relative overflow-hidden group">
              {!c.approved && (
                <div className="absolute top-0 right-0 bg-yellow-500/10 text-yellow-500 text-[10px] font-bold px-4 py-1.5 rounded-bl-xl uppercase tracking-widest border-b border-l border-yellow-500/20">
                  Pending
                </div>
              )}
              <div className="flex justify-between items-start mb-6">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-neutral-800 rounded-2xl flex items-center justify-center font-bold text-xl text-white border border-white/5">
                    {c.name.charAt(0)}
                  </div>
                  <div>
                    <h4 className="font-bold text-white">{c.name}</h4>
                    <p className="text-xs text-neutral-500 font-medium">
                      {c.role} {c.designation && `• ${c.designation}`}
                    </p>
                  </div>
                </div>
                <div className="flex gap-2">
                  {!c.approved && (
                    <button 
                      onClick={() => onApprove(c.id)}
                      className="p-3 bg-green-500 text-black rounded-xl hover:bg-green-400 transition-all cursor-pointer"
                      title="Approve Comment"
                    >
                      <Check size={18} />
                    </button>
                  )}
                  <button 
                    onClick={() => onDelete(c.id)}
                    className="p-3 bg-neutral-800 text-red-500 rounded-xl hover:bg-red-500 hover:text-white transition-all border border-white/5 cursor-pointer"
                    title="Delete Comment"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
              </div>
              <p className="text-neutral-300 leading-relaxed italic bg-neutral-950/50 p-6 rounded-2xl border border-white/5">
                &ldquo;{c.content}&rdquo;
              </p>
              <div className="mt-4 flex justify-between items-center px-2">
                <p className="text-[10px] text-neutral-600 font-bold uppercase tracking-widest">
                  {new Date(c.created_at).toLocaleDateString()}
                </p>
                <p className="text-[10px] text-neutral-600 font-bold uppercase tracking-widest">
                  {c.email}
                </p>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
