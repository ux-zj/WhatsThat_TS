import React, { useEffect, useContext, useState } from 'react';
import { Button, TextInput, IconButton } from '@react-native-material/core';
import { Alert, View, StyleSheet, SafeAreaView, FlatList } from 'react-native';
import { useRef } from 'react';

import { AntDesign } from '@expo/vector-icons';
import Icon from '@expo/vector-icons/MaterialCommunityIcons';
import { useRoute } from '@react-navigation/native';

import IsLoadingIndicator from '../utils/isLoadingIndicator.component';
import MessageBubbleComponent from './message.item.component';
import MessageServices from '../../services/message.services';
import { UserContext } from '../../context/user.context';
import { SingleMessage } from '../../types/api.schema.types';

//DONE: Flat list provided a method to scroll to the bottom on the list, can use this to trigger when message is sent?
//FIXME: When messages are sent successfully, need to clear the TextInput, current method does not work. -> UseRef might help here.
//TODO: Use Refresh controls and limit the fetch API to use the pagination and max messages returned, refresh controll can be used to return the next set of previous messages.
//TODO: Add a icon to the bar which will open a model component to add or remove a user from the messages? What happens when a user is removed though?
//TODO: instead of delete on hold, it should open a context modal with edit and delete

const ChatWindowComponent = () => {
  const current_user = useContext(UserContext).user;
  const route = useRoute();
  const chat_id = route.params.chat_id;

  const flatListRef = useRef<FlatList<SingleMessage>>(null);

  const [isLoading, setIsLoading] = useState(true);
  const [messageList, setMessageList] = useState<SingleMessage[]>([]);
  const [userInput, setUserInput] = useState('');
  const [isSuccess, setIsSuccess] = useState(false);

  useEffect(() => {
    setIsLoading(true);

    async function handleFetchMessages() {
      try {
        const response = await MessageServices.getMessage(chat_id);

        if (!response) {
          throw new Error('Unable to fetch messages...');
        }

        // console.log(response.messages);

        setMessageList(sortByDateTime(response).reverse());
        setIsSuccess(true);
        triggerScrollToEnd();
      } catch (err) {
        console.log(err);
      }
    }

    handleFetchMessages().finally(() => {
      setIsLoading(false);
    });
  }, []);

  function sortByDateTime(messageList: SingleMessage[]) {
    return messageList.sort(function (a, b) {
      return new Date(b.timestamp).valueOf() - new Date(a.timestamp).valueOf();
    });
  }

  function getLastMessageId() {
    const m = messageList?.sort((a, b) => a.message_id - b.message_id);
    const last = m?.findLast((message) => message.message_id != null);

    if (last != null) {
      const x = last.message_id + 1;
      console.log('New Message ID...', x);
      return x;
    } else {
      return 0;
    }
  }
  /// id: number, message: string
  function addMessage() {
    if (userInput.trim() !== '') {
      let id = getLastMessageId();

      //TODO: Need to change the author

      if (id === 0) id = id + 1;

      const new_message: SingleMessage = {
        message_id: id,
        timestamp: Date.now(),
        message: userInput,
        author: current_user,
      };

      // TODO: This works to send a message but its basic
      MessageServices.sendMessage(chat_id, userInput).then((result) => {
        if (result && result.ok) {
          setMessageList([...messageList, new_message]);
          setUserInput('');
          triggerScrollToEnd();
        } else {
          alert('Unable to send message');
        }
      });
    }
  }

  function triggerDelete(id: number) {
    Alert.alert('Deleting', id.toString());
    const newList = messageList?.filter((message) => message.message_id !== id);
    MessageServices.deleteMessage(chat_id, id).then((result) => {
      result && result.ok ? setMessageList(newList) : alert('Unable to delete message');
    });
  }

  function triggerScrollToEnd(): void {
    setTimeout(() => flatListRef.current?.scrollToEnd(), 300);
  }

  if (isLoading) {
    return <IsLoadingIndicator />;
  } else {
    if (isSuccess && messageList) {
      return (
        <>
          <View style={styles.containerMain}>
            <SafeAreaView style={styles.container}>
              <FlatList
                ref={flatListRef}
                data={messageList}
                keyExtractor={(item) => item.message_id.toString()}
                // onContentSizeChange={() => {
                //     flatListRef.current?.scrollToEnd();
                // }}
                renderItem={(message) => (
                  <MessageBubbleComponent
                    message={message.item}
                    isSelf={message.item.author.user_id === current_user.user_id}
                    position={message.item.message_id}
                    triggerDelete={triggerDelete}
                  />
                )}
              />
            </SafeAreaView>

            <View style={styles.bottomView}>
              <View style={{ flexDirection: 'row' }}>
                <TextInput
                  value={userInput}
                  onKeyPress={(e) => {
                    if (e.nativeEvent.key === 'Enter') {
                      addMessage();
                    }
                  }}
                  onChangeText={(e) => setUserInput(e)}
                  variant="outlined"
                  style={{ flex: 3, padding: 2 }}
                  trailing={(props) => (
                    <IconButton
                      icon={(props) => <AntDesign name="addfile" {...props} />}
                      {...props}
                    />
                  )}
                />

                <Button
                  style={{
                    flex: 1,
                    alignItems: 'center',
                    justifyContent: 'center',
                    marginBottom: 6,
                    marginLeft: 6,
                  }}
                  title="Send"
                  trailing={(props) => <Icon name="send" {...props} />}
                  onPress={() => {
                    addMessage();
                  }}
                />
              </View>
            </View>
          </View>
        </>
      );
    } else {
      return <></>;
    }
  }
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingBottom: 10,
    // paddingTop: StatusBar.currentHeight,
  },
  scrollView: {},
  text: {
    fontSize: 42,
  },
  containerMain: {
    flex: 1,
    height: '100%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  bottomView: {
    width: '95%',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 6,
    bottom: 1,
  },
  textStyle: {
    color: '#fff',
    fontSize: 18,
  },
});

export default ChatWindowComponent;
