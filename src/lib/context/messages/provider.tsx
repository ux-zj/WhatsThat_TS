import React, { useReducer, useMemo } from 'react';
import MessageContext, { initialState } from './context';
import MessageReducer from './reducer';
import { TSingleMessage } from '../../types/TSchema';

/**
 * @description MessageProvider is a component that wraps the chat only and provides the message context.
 * @param children - children is the component that is wrapped by the provider.
 * @param chat_id - chat_id is used to identify the chat for which the messages are being fetched/loaded.
 */
function MessageProvider({ children, chat_id }: any) {
  const [state, dispatch] = useReducer(MessageReducer, initialState);

  const setMessages = (payload: Partial<TSingleMessage>[]) => {
    dispatch({ type: 'SET_MESSAGES', payload });
  };

  const deleteMessage = (payload: number) => {
    dispatch({ type: 'DELETE_MESSAGE', payload });
  };

  const sendMessage = (payload: Partial<TSingleMessage>) => {
    dispatch({ type: 'SEND_MESSAGE', payload });
  };

  const updateMessage = (payload: Partial<TSingleMessage>) => {
    dispatch({ type: 'UPDATE_MESSAGE', payload });
  };

  const print = () => {
    console.log('state', state);
  };

  const value = useMemo(
    () => ({
      messageList: state.messageList,
      chat_details: state.chat_details,
      chat_id,
      dispatcher: { print, deleteMessage, sendMessage, updateMessage, setMessages },
    }),
    [state.messageList, chat_id]
  );

  return <MessageContext.Provider value={value}>{children}</MessageContext.Provider>;
}

export default MessageProvider;
