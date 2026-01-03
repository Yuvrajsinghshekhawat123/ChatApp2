import { useState } from "react";
import { Members } from "../../../../../../02-Components/04-Chats/01-All/01-members";
import { useSelector } from "react-redux";

  


 


export function All(){
    
    const chats = useSelector(state => state.chat.chats);
    console.log(chats);
  
    
    return (<>
         <div className="w-full space-y-2">
      {chats.map((member) => (
        <Members key={member.id} data={member}   />
      ))}
    </div>
    </>)
}








/*
👉 Don’t load everything everywhere
    Big apps (WhatsApp, Telegram, Slack) do NOT load full data at once.
    They load only what is needed for that screen.


🧠 Core idea (simple)
Chat list tells you what type of chat it is
When user clicks a chat
If type === "group" → fetch group details
Else → fetch 1-to-1 chat messages




*/