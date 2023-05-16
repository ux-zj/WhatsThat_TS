import React, { useEffect, useContext, useState, Fragment } from 'react';
import { useRoute } from '@react-navigation/native';
import { UserContext } from '../../context/user.context';
import ContactServices from '../../services/contact.services';
import ContactListComponent from '../../components/contact.list.component';
import IsLoadingIndicator from '../../components/utils/isLoadingIndicator.component';
import { User } from '../../types/api.schema.types';

function BlockedScreen() {
  const current_user = useContext(UserContext);
  const route = useRoute();

  const [isLoading, setIsLoading] = useState(true);
  const [contactList, setContactList] = useState<User[]>();
  const [isSuccess, setIsSuccess] = useState(false);

  useEffect(() => {
    setIsLoading(true);

    function fetchContactList() {
      const result = ContactServices.fetchblocked().then(
        (response) => response,
        (err) => err
      );
      return result;
    }

    fetchContactList()
      .then(
        (contacts) => {
          console.log('BLOCKED', contacts);
          setContactList(contacts);
          setIsSuccess(true);
        },
        (err) => {
          setIsSuccess(false);
        }
      )
      .finally(() => setIsLoading(false));
  }, []);

  function addContact(user_id: number) {
    //Check if theyre in list already
    // MessageServices.sendMessage(chat_id, userInput).then((result) => {
    //     result.status?  setMessageList(messageList?.concat(new_message)) : alert(result.message);
    // })
    ContactServices.addContact(user_id).then((result) => {
      result?.ok ? setContactList(contactList) : alert(result);
    });
  }

  function addToBlock(user_id: number) {
    ContactServices.addContact(user_id).then((result) => {
      result?.ok ? setContactList(contactList) : alert(result);
    });
  }

  if (isLoading) {
    return <IsLoadingIndicator />;
  } else {
    if (isSuccess && contactList) {
      return ContactListComponent(contactList);
    } else {
      return <></>;
    }
  }
}

export default BlockedScreen;
