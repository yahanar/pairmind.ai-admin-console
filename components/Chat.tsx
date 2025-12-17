
import React, { useState, useEffect, useRef } from 'react';
import { MOCK_CHAT_ROOMS } from '../constants';
import { ChatService } from '../services';
import { ChatMessage } from '../types';
import { Send, User, Bot, Paperclip, MoreVertical, Search, Loader2, File, X, Image as ImageIcon } from 'lucide-react';

const Chat: React.FC = () => {
  const [selectedRoom, setSelectedRoom] = useState(MOCK_CHAT_ROOMS[0].id);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isLoadingHistory, setIsLoadingHistory] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [attachment, setAttachment] = useState<File | null>(null);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Load history and subscribe to simulated socket
  useEffect(() => {
    let unsubscribe: () => void;

    const loadRoom = async () => {
      setIsLoadingHistory(true);
      setMessages([]); // Clear previous
      try {
        const history = await ChatService.getMessages(selectedRoom);
        setMessages(history);
      } catch (e) {
        console.error("Failed to load chat history", e);
      } finally {
        setIsLoadingHistory(false);
      }

      // Subscribe to real-time events
      unsubscribe = ChatService.subscribe(
        selectedRoom,
        (msg) => setMessages(prev => [...prev, msg]),
        (typing) => setIsTyping(typing)
      );
    };

    loadRoom();

    return () => {
      if (unsubscribe) unsubscribe();
    };
  }, [selectedRoom]);

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  const handleSendMessage = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if ((!inputValue.trim() && !attachment)) return;

    const textToSend = inputValue;
    const fileToSend = attachment;

    // Optimistic UI could be done here, but we'll wait for 'server' ack for realism
    setInputValue('');
    setAttachment(null);

    try {
      const newMsg = await ChatService.sendMessage(selectedRoom, textToSend, fileToSend || undefined);
      setMessages(prev => [...prev, newMsg]);
    } catch (err) {
      console.error("Failed to send message", err);
      // Ideally show error toast/state
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setAttachment(e.target.files[0]);
    }
  };

  return (
    <div className="h-[calc(100vh-8rem)] flex gap-6 animate-fade-in">
      {/* Sidebar: Room List */}
      <div className="w-80 flex flex-col bg-surface border border-white/5 rounded-2xl overflow-hidden hidden md:flex">
        <div className="p-4 border-b border-white/5">
           <h3 className="font-bold text-slate-100 mb-4">Inbox</h3>
           <div className="relative">
             <Search className="absolute left-3 top-2.5 w-4 h-4 text-slate-500" />
             <input 
               type="text" 
               placeholder="Search conversations..." 
               className="w-full bg-input border border-white/10 rounded-xl py-2 pl-10 pr-4 text-sm text-slate-100 focus:outline-none focus:border-primary/50 placeholder:text-slate-600"
             />
           </div>
        </div>
        <div className="flex-1 overflow-y-auto">
          {MOCK_CHAT_ROOMS.map(room => (
            <div 
              key={room.id}
              onClick={() => setSelectedRoom(room.id)}
              className={`p-4 cursor-pointer border-b border-white/5 transition-colors ${
                selectedRoom === room.id ? 'bg-surfaceHighlight/50 border-l-2 border-l-primary' : 'hover:bg-white/[0.02]'
              }`}
            >
               <div className="flex justify-between items-start mb-1">
                 <span className={`font-medium ${selectedRoom === room.id ? 'text-white' : 'text-slate-300'}`}>{room.user}</span>
                 <span className="text-xs text-slate-500">{room.time}</span>
               </div>
               <p className="text-sm text-slate-400 truncate">{room.lastMessage}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Chat Area */}
      <div className="flex-1 flex flex-col bg-surface border border-white/5 rounded-2xl overflow-hidden">
         {/* Chat Header */}
         <div className="p-4 border-b border-white/5 flex justify-between items-center bg-surfaceHighlight/20">
            <div className="flex items-center gap-3">
               <div className="w-10 h-10 rounded-full bg-secondary flex items-center justify-center text-white relative">
                  <User className="w-5 h-5" />
                  {/* Online indicator */}
                  <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-success border-2 border-surface rounded-full"></span>
               </div>
               <div>
                  <h3 className="font-bold text-slate-100">Visitor #9942</h3>
                  <p className="text-xs text-slate-400 flex items-center gap-1">
                    Online via Web Widget
                    {isTyping && <span className="text-primary italic ml-2 animate-pulse">Typing...</span>}
                  </p>
               </div>
            </div>
            <button className="p-2 text-slate-400 hover:text-white">
               <MoreVertical className="w-5 h-5" />
            </button>
         </div>

         {/* Messages */}
         <div className="flex-1 overflow-y-auto p-6 space-y-6">
            {isLoadingHistory ? (
              <div className="flex justify-center items-center h-full">
                <Loader2 className="w-8 h-8 text-primary animate-spin" />
              </div>
            ) : messages.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-slate-500 opacity-50">
                 <div className="w-16 h-16 bg-white/5 rounded-full flex items-center justify-center mb-4">
                    <User className="w-8 h-8" />
                 </div>
                 <p>Start of conversation</p>
              </div>
            ) : (
              messages.map((msg) => {
                const isAgent = msg.sender === 'system';
                const isBot = msg.sender === 'ai';
                const isUser = msg.sender === 'user';
                
                // Alignment: User (Visitor) Left, Agent/Bot Right (or Bot Left depending on UX, usually Bot acts as Agent so Right)
                // Let's assume standard support view: 
                // Left = Visitor (User)
                // Right = Agent (System) OR Bot (AI)
                
                const isRight = isAgent || isBot;

                return (
                  <div key={msg.id} className={`flex gap-4 ${isRight ? 'flex-row-reverse' : ''}`}>
                     <div className={`w-8 h-8 rounded-full flex-shrink-0 flex items-center justify-center mt-1 shadow-sm ${
                       isUser ? 'bg-secondary' : isBot ? 'bg-primary shadow-neon' : 'bg-accent'
                     }`}>
                       {isUser ? <User className="w-4 h-4 text-white" /> : 
                        isBot ? <Bot className="w-4 h-4 text-white" /> : 
                        <span className="text-xs font-bold text-white">OP</span>}
                     </div>
                     <div className={`max-w-lg space-y-1`}>
                        <div className={`p-3 rounded-2xl text-sm shadow-md ${
                          isRight 
                            ? 'bg-surfaceHighlight border border-white/5 rounded-tr-none text-slate-200' 
                            : 'bg-secondary rounded-tl-none text-white'
                        }`}>
                          {/* Attachment Display */}
                          {msg.attachment && (
                            <div className="mb-2">
                              {msg.attachment.type === 'image' ? (
                                <img src={msg.attachment.url} alt="attachment" className="rounded-lg max-w-full max-h-48 border border-white/10" />
                              ) : (
                                <div className="flex items-center gap-2 p-2 bg-black/20 rounded border border-white/10">
                                  <File className="w-4 h-4" />
                                  <span className="truncate max-w-[150px]">{msg.attachment.name}</span>
                                </div>
                              )}
                            </div>
                          )}
                          
                          <p>{msg.text}</p>
                        </div>
                        <span className={`text-[10px] opacity-50 block ${isRight ? 'text-left' : 'text-right'}`}>
                          {msg.timestamp}
                        </span>
                     </div>
                  </div>
                );
              })
            )}
            
            {/* Typing Indicator Bubble */}
            {isTyping && (
               <div className="flex gap-4 animate-fade-in">
                  <div className="w-8 h-8 rounded-full bg-secondary flex-shrink-0 flex items-center justify-center mt-1">
                    <User className="w-4 h-4 text-white" />
                  </div>
                  <div className="bg-secondary p-3 rounded-2xl rounded-tl-none text-white shadow-md w-16 flex items-center justify-center gap-1">
                     <span className="w-1.5 h-1.5 bg-white/60 rounded-full animate-bounce" style={{animationDelay: '0ms'}}></span>
                     <span className="w-1.5 h-1.5 bg-white/60 rounded-full animate-bounce" style={{animationDelay: '150ms'}}></span>
                     <span className="w-1.5 h-1.5 bg-white/60 rounded-full animate-bounce" style={{animationDelay: '300ms'}}></span>
                  </div>
               </div>
            )}
            <div ref={messagesEndRef} />
         </div>

         {/* Input Area */}
         <div className="p-4 bg-surfaceHighlight/20 border-t border-white/5">
            {attachment && (
              <div className="flex items-center gap-2 mb-2 p-2 bg-surfaceHighlight rounded-lg w-fit border border-white/10 animate-fade-in">
                 {attachment.type.startsWith('image/') ? <ImageIcon className="w-4 h-4 text-primary" /> : <File className="w-4 h-4 text-primary" />}
                 <span className="text-xs text-slate-300 max-w-[200px] truncate">{attachment.name}</span>
                 <button onClick={() => setAttachment(null)} className="text-slate-500 hover:text-white ml-2"><X className="w-3 h-3"/></button>
              </div>
            )}
            <form onSubmit={handleSendMessage} className="flex items-center gap-2 bg-input rounded-xl border border-white/10 px-4 py-2 focus-within:border-primary/50 transition-colors">
               <button 
                 type="button" 
                 onClick={() => fileInputRef.current?.click()}
                 className="text-slate-500 hover:text-slate-300 transition-colors"
               >
                  <Paperclip className="w-5 h-5" />
               </button>
               <input 
                 type="file" 
                 ref={fileInputRef} 
                 className="hidden" 
                 onChange={handleFileSelect}
               />
               <input 
                 type="text" 
                 value={inputValue}
                 onChange={(e) => setInputValue(e.target.value)}
                 className="flex-1 bg-transparent border-none focus:ring-0 text-slate-100 placeholder:text-slate-600 text-sm"
                 placeholder="Type your message..."
               />
               <button 
                 type="submit" 
                 disabled={!inputValue.trim() && !attachment}
                 className="p-2 bg-primary text-white rounded-lg hover:bg-primaryHover transition-colors shadow-neon disabled:opacity-50 disabled:cursor-not-allowed"
               >
                  <Send className="w-4 h-4" />
               </button>
            </form>
            <div className="text-center mt-2 flex justify-center items-center gap-2">
               <span className="text-[10px] text-slate-500">AI Pilot Mode Active • Press Esc to take over</span>
            </div>
         </div>
      </div>
    </div>
  );
};

export default Chat;
