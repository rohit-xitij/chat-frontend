import { Send } from "lucide-react";
import React from "react";

const ChatHome = () => {
  return (
    <div className="flex flex-1 flex-col items-center justify-center bg-muted/30">
      <div className="flex h-20 w-20 items-center justify-center rounded-full bg-primary/10 mb-4">
        <Send className="h-10 w-10 text-primary" />
      </div>
      <h2 className="text-xl font-semibold text-foreground">ChatApp Web</h2>
      <p className="mt-2 text-sm text-muted-foreground">
        Select a chat from the sidebar to start messaging
      </p>
    </div>
  );
};

export default ChatHome;
