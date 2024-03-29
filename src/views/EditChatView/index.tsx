/* eslint-disable no-underscore-dangle */
/* eslint-disable camelcase */
import React, { useEffect, useState } from 'react';
import { View, SafeAreaView } from 'react-native';
import {
  Appbar,
  Button,
  Dialog,
  FAB,
  Portal,
  ProgressBar,
  Text,
  TextInput,
  Modal,
  useTheme,
} from 'react-native-paper';

import { useAuth } from '../../lib/context/auth';
import { useApi } from '../../lib/context/api';
import { useNotification } from '../../lib/context/notification';
import useFetchHook from '../../lib/hooks/useFetchHook';
import ChatServices from '../../lib/services/ChatServices';

import ContactList from '../../components/ContactList';
import { TChat, TUser } from '../../lib/types/TSchema';
import styles from '../../styles/GlobalStyle';
import ContactServices from '../../lib/services/ContactServices';
import useConfirm from '../../lib/hooks/useConfirm';

function Members({ members, actions }) {
  return (
    <View>
      <ContactList contacts={members} actions={actions} />
    </View>
  );
}

function Contacts({ apiCaller, existing, actions }) {
  const [contacts, setContacts] = useState<TUser[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const c = ContactServices(apiCaller);
  const getContacts = () => {
    setIsLoading(true);
    c.fetchContactList()
      .then((res) => {
        if (res) {
          const filtered = res.filter((item) => !existing.find((i) => i.user_id === item.user_id));
          setContacts(filtered);
        }
      })
      .catch((err) => {
        console.log(err);
      })
      .finally(() => {
        setIsLoading(false);
      });
  };

  useEffect(() => {
    getContacts();

    return () => {
      setContacts([]);
    };
  }, []);

  if (isLoading) return <Text>Is Loading</Text>;
  if (!contacts) return <Text>No contacts</Text>;
  if (contacts.length === 0) return <Text>No contacts to invite</Text>;

  return (
    <View>
      <ContactList contacts={contacts} actions={actions} />
    </View>
  );
}

/**
 * @description EditChatView is a view that allows the user to edit the chat details
 */
function EditChatView({ route, navigation }) {
  const theme = useTheme();

  const { chat_id } = route.params;
  const current_user = useAuth().authState.id;
  const { apiCaller } = useApi();

  const c = ChatServices(apiCaller);
  const n = useNotification();

  const [chatDetails, setChatDetails] = useState<TChat | undefined>(undefined);
  const [members, setMembers] = useState<TUser[]>([]);
  const [isOwner, setIsOwner] = useState<boolean>(false);
  const [titleEdit, setTitleEdit] = useState<string>('');
  const [handleEditLoad, setHandleEditLoad] = useState<boolean>(false);

  /**
   * Show or hide the dialog
   */
  const [visible, setVisible] = useState(false);
  const showDialog = () => setVisible(true);
  const hideDialog = () => setVisible(false);

  const [state, setState] = useState({ open: false });
  const onStateChange = ({ open }) => setState({ open });
  const { open } = state;

  const [modalVisible, setModalVisible] = useState(false);

  /**
   * useConfirm hook
   */
  const add = useConfirm();
  const remove = useConfirm();

  const { isLoading, onError, onFetch, getFresh } = useFetchHook(
    { url: `/chat/${chat_id}`, method: 'GET' },
    true
  );

  function _handleEdit() {
    if (!isOwner) return;
    if (titleEdit !== '' && titleEdit !== chatDetails?.name) {
      setHandleEditLoad(true);
      c.updateChatDetails(chat_id, { name: titleEdit })
        .then((res) => {
          if (res !== undefined) {
            console.log('Edit done', res);
          }
        })
        .catch((err) => {
          console.log(err);
        })
        .finally(() => {
          setHandleEditLoad(false);
        });
    }
    hideDialog();
  }

  async function _handleInvite(user: TUser) {
    add.setConfirm(
      'Are you sure?',
      `Are you sure you want to invite ${user.first_name} ${user.last_name}?`
    );
    const res = await add.confirm();
    if (res) {
      setHandleEditLoad(true);
      c.addUserToConversation(chat_id, user.user_id)
        .then((res) => {
          if (res) {
            setMembers([...members, user]);
            n.dispatcher.addNotification({
              type: 'Success',
              message: `${user.first_name} ${user.last_name} has been added.`,
            });
          }
        })
        .catch((err) => {
          n.dispatcher.addNotification({ type: 'warn', message: 'Unable to add user...' });
        })
        .finally(() => setHandleEditLoad(false));
    }
  }

  async function _handleRemove(user: TUser) {
    if (user.user_id === current_user) return;
    if (!isOwner) return;
    remove.setConfirm(
      'Are you sure?',
      `Are you sure you want to remove ${user.first_name} ${user.last_name}?`
    );
    const res = await remove.confirm();
    if (res) {
      setHandleEditLoad(true);
      c.removeUserFromConversation(chat_id, user.user_id)
        .then((res) => {
          if (res) {
            const filtered = members.filter((m) => m.user_id !== user.user_id);
            setMembers(filtered);
            n.dispatcher.addNotification({
              type: 'Success',
              message: `${user.first_name} ${user.last_name} has been removed.`,
            });
          }
        })
        .catch((err) => {
          n.dispatcher.addNotification({ type: 'warn', message: 'Unable to remove user...' });
        })
        .finally(() => setHandleEditLoad(false));
    }
  }
  /**
   * @description Fetch chat details
   */
  useEffect(() => {
    onFetch(async () => getFresh()).then((res) => {
      if (res) {
        // console.log(res);
        setChatDetails(res as TChat);
        setMembers(res.members);
        setTitleEdit(res.name);
      }
    });
  }, []);

  // Set if owner
  useEffect(() => {
    // console.log(current_user);
    if (!chatDetails || !current_user) return;
    if (chatDetails.creator.user_id === current_user) {
      setIsOwner(true);
    }
  }, [chatDetails]);

  return (
    <View style={styles.container}>
      <Appbar.Header>
        <Appbar.BackAction
          onPress={() => {
            navigation.goBack();
          }}
        />
        <Appbar.Content title="Chat Details" />
      </Appbar.Header>

      <ProgressBar indeterminate visible={isLoading || handleEditLoad} />
      <SafeAreaView style={{ flex: 10, margin: 10 }}>
        {!!onError && <Text>{onError}</Text>}
        {!chatDetails && !isLoading && <Text>Unable to find details</Text>}
        {!!members && (
          <Members members={members} actions={{ onPress: (user) => _handleRemove(user) }} />
        )}
        {/* FAB Buttons */}
        <Portal>
          {!!isOwner && (
            <FAB.Group
              style={{ position: 'absolute', bottom: 50, right: 0 }}
              open={open}
              visible
              icon={open ? 'pencil' : 'dots-vertical'}
              actions={[
                {
                  icon: 'account-multiple-plus',
                  label: 'Invite user',
                  onPress: () => setModalVisible(true),
                },
                {
                  icon: 'file-document-edit',
                  label: 'Edit chat',
                  onPress: showDialog,
                },
              ]}
              onStateChange={onStateChange}
              onPress={() => {
                if (open) {
                  // do something if the speed dial is open
                }
              }}
            />
          )}
        </Portal>
        {/* Dialog to edit the chat title */}
        <Portal>
          <Dialog visible={visible} onDismiss={hideDialog}>
            <Dialog.Title>Edit Chat Name</Dialog.Title>
            <Dialog.Content>
              <TextInput value={titleEdit} mode="outlined" onChangeText={(e) => setTitleEdit(e)} />
            </Dialog.Content>
            <Dialog.Actions style={{ flexDirection: 'row' }}>
              <Button style={{ flex: 1, alignSelf: 'flex-end' }} onPress={hideDialog}>
                Cancel
              </Button>
              <Button style={{ flex: 1, alignSelf: 'flex-end' }} onPress={() => _handleEdit()}>
                Done
              </Button>
            </Dialog.Actions>
          </Dialog>
        </Portal>
        {/* Modal to invite user */}
        <Portal>
          <Modal
            visible={modalVisible}
            onDismiss={() => setModalVisible(false)}
            style={{ backgroundColor: theme.colors.background, padding: 20 }}
          >
            <View>
              <Contacts
                apiCaller={apiCaller}
                actions={{
                  onPress: (user) => {
                    _handleInvite(user);
                    setModalVisible(false);
                  },
                }}
                existing={members}
              />
            </View>
          </Modal>
        </Portal>
        {/* Confirmation Dialog */}
        <Portal>
          <add.ConfirmationDialog />
          <remove.ConfirmationDialog />
        </Portal>
      </SafeAreaView>
    </View>
  );
}

export default EditChatView;
