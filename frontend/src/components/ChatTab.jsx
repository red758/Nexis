import {useState, useEffect, useContext, useRef} from 'react';
import axios from'axios';
import {io} from 'socket.io-client';
import {AuthContext} from '../context/AuthContext';

export default function ChatTab({socket}){
  const {currentUser} = useContext(AuthContext);
  const orgId=currentUser?.organization?._id || currentUser?.organization;

  const [messages, setMessages]=useState([]);
  const [newMessage, setNewMessage]=useState('');
  const [isLoading, setIsLoading]=useState(true);

  //pointer at ghost div to auto scroll to the bottom of chat
  const messagesEndRef=useRef(null);

  const scrollToBottom=()=>{
    messagesEndRef.current?.scrollIntoView({behavior:'smooth'});
  };

  useEffect(()=>{
    if(!orgId) return;

    //asking for history
    const fetchMessages=async ()=>{
      try{
        const response=await axios.get(`http://localhost:5000/api/chat/${orgId}`);
        setMessages(response.data);
        setIsLoading(false);
      }catch(error){
        console.error("Failed to fetch chat history: ",error);
      }
    };
    fetchMessages();

    //telling which room we are in
    socket.emit('join_workspace',orgId);

    //listening for incoming shouts
    socket.on('receive_message',(message)=>{
      setMessages((prev)=>[...prev, message]);
    });

    return()=>{
      socket.off('receive_message');
    };
  }, [orgId]);

  useEffect(()=>{
    scrollToBottom();
  }, [messages]);

  const handleSendMessage=async (e)=>{
    e.preventDefault();

    if(!newMessage.trim()) return;

    try{
      await axios.post('http://localhost:5000/api/chat',{
        text:newMessage,
        senderId: currentUser._id,
        organizationId: orgId
      });

      setNewMessage('');
    }catch(error){
      console.error("Failed to send message: ",error);
    }
  };

  if(isLoading){
    return(
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-16 flex justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-slate-900"></div>
      </div>
    );
  }

  return(
    <div className="bg-white rounded-xl border border-slate-200 shadow-sm flex flex-col h-[700] overflow-hidden">
      
      {/*Header*/}
      <div className="bg-slate-50 border-b border-slate-200 p-4 px-6 flex justify-between items-center">
        <div>
          <h3 className="font-bold text-slate-900 flex items-center gap-2">
            <span className="text-xl">Team Chat</span>
          </h3>
          <p className="text-xs text-slate-500 mt-1">
            Real-time communication for {currentUser.organization.name}
          </p>
        </div>
      </div>

      {/*Message Area*/}
      <div className="flex-1 p-6 overflow-y-auto bg-slate-50/50 space-y-4">
        {
          messages.length===0?(
            <div className="h-full flex flex-col items-center justify-center text-slate-400">
              <span className="text-4xl mb-3">💬</span>
              <p className="text-sm">No messages yet. Say hello to your team!</p>
            </div>
          ):(
            messages.map((msg, index)=>{
              const isMe=msg.sender._id===currentUser._id;

              return(
                <div key={index} className={`flex flex-col ${isMe ? 'items-end' : 'items-start'}`}>
                  {/*Only show names above messages*/}
                  {!isMe && (
                      <div className="flex items-center gap-2 mb-1 ml-1">
                        <span className="text-xs font-bold text-slate-700">
                          {msg.sender.name}
                        </span>
                        <span className="text-[10px] uppercase font-bold text-slate-400 bg-slate-100 px-1.5 py-0.5 rounded-sm border border-slate-200">
                          {msg.sender.role}
                        </span>
                      </div>
                    )}

                  {/*Message Bubble*/}
                  <div 
                    className={`max-w-[70%] px-4 py-2.5 rounded-2xl text-sm shadow-sm 
                    ${isMe ? 'bg-blue-600 text-white rounded-br-none' : 'bg-white border border-slate-200 text-slate-800 rounded-bl-none'}
                  `}>
                    {msg.text}
                  </div>
                </div>
              );
            })
          )
        }

        {/*The invisible div for auto scroll at bottom*/}
        <div ref={messagesEndRef}/>
      </div>

        {/*Input Area*/}
        <div className="p-4 bg-white border-t border-slate-200">
          <form onSubmit={handleSendMessage} className="flex gap-3">
            <input
              type="text"
              value={newMessage}
              onChange={(e)=>setNewMessage(e.target.value)}
              placeholder="Type your message..."
              className="flex-1 px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all text-sm"
            />
            <button type="submit" disabled={!newMessage.trim()} className="px-6 py-2.5 bg-slate-900 text-white  font-medium text-sm rounded-lg hover:bg-slate-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed">
              Send
            </button>
          </form>
        </div>
    </div>
  );
}