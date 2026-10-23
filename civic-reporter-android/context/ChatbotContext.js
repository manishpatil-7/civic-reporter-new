import React, { createContext, useContext, useState, useEffect } from 'react';
import { Keyboard, Platform } from 'react-native';

const ChatbotContext = createContext({
  isVisible: true,
  setIsVisible: () => {},
  bottomOffset: 0,
  setBottomOffset: () => {},
});

export const ChatbotProvider = ({ children }) => {
  const [userVisible, setUserVisible] = useState(true);
  const [bottomOffset, setBottomOffset] = useState(0);
  const [isKeyboardVisible, setIsKeyboardVisible] = useState(false);

  useEffect(() => {
    const showSub = Keyboard.addListener(
      Platform.OS === 'ios' ? 'keyboardWillShow' : 'keyboardDidShow',
      () => setIsKeyboardVisible(true)
    );
    const hideSub = Keyboard.addListener(
      Platform.OS === 'ios' ? 'keyboardWillHide' : 'keyboardDidHide',
      () => setIsKeyboardVisible(false)
    );
    return () => {
      showSub.remove();
      hideSub.remove();
    };
  }, []);

  return (
    <ChatbotContext.Provider
      value={{
        isVisible: userVisible && !isKeyboardVisible,
        setIsVisible: setUserVisible,
        bottomOffset,
        setBottomOffset,
      }}
    >
      {children}
    </ChatbotContext.Provider>
  );
};

export const useChatbot = () => useContext(ChatbotContext);
export default ChatbotContext;
