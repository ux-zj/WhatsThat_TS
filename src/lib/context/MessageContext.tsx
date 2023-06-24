import React, { createContext, useContext, useReducer } from 'react';
import { TSingleMessage } from '../types/TSchema';

interface IMessageContext {
  messageList: TSingleMessage[];
  dispatcher?: any;
}

const initialState: IMessageContext = {
  messageList: [],
};

const MessageContext = createContext<IMessageContext>(initialState);

const messageReducer = (state: IMessageContext, action: any) => {
  const { type, payload } = action;

  switch (type) {
    case 'SET_MESSAGES':
      return { ...state, messageList: payload };
    case 'DELETE_MESSAGE':
      return {
        ...state,
        messageList: state.messageList.filter((item: any) => item.id !== payload),
      };
    case 'SEND_MESSAGE':
      return { ...state, messageList: payload };
    case 'UPDATE_MESSAGE':
      return {
        ...state,
        messageList: state.messageList.map((message: any) => {
          message.id === payload.id ? payload : message;
        }),
      };
    default:
      throw new Error(`No case for type ${type} found in MessageReducer.`);
  }
};

const MessageProvider = ({ children }: any) => {
  const [state, dispatch] = useReducer(messageReducer, initialState);

  const setMessages = (payload: TSingleMessage[]) => {
    dispatch({ type: 'SET_MESSAGES', payload });
  };

  const deleteMessage = (payload: number) => {
    dispatch({ type: 'DELETE_MESSAGE', payload });
  };

  const sendMessage = (payload: TSingleMessage) => {
    dispatch({ type: 'SEND_MESSAGE', payload });
  };

  const updateMessage = (payload: TSingleMessage) => {
    dispatch({ type: 'UPDATE_MESSAGE', payload });
  };

  const print = () => {
    console.log('state', state);
  };

  return (
    <MessageContext.Provider
      value={{
        messageList: state.messageList,
        dispatcher: { print, deleteMessage, sendMessage, updateMessage, setMessages },
      }}
    >
      {children}
    </MessageContext.Provider>
  );
};

const useMessageContext = () => {
  // get the context
  const context = useContext(MessageContext);

  // if `undefined`, throw an error
  if (context === undefined) {
    throw new Error('useMessageContext was used outside of its Provider');
  }

  return context;
};

export { useMessageContext, MessageProvider };