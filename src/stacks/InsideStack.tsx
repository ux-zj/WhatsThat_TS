import React, { useEffect } from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createMaterialTopTabNavigator } from '@react-navigation/material-top-tabs';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import Icons from 'react-native-vector-icons/MaterialCommunityIcons';
import { IconButton } from 'react-native-paper';

/**
 * Navigation responsible for authorised users
 */

import ProfileView from '../views/ProfileView';
import ChatSummaryView from '../views/ChaSummaryView';
import ChatView from '../views/ChatView';
import EditChatView from '../views/EditChatView';
import InviteUserView from '../views/InviteUserView';
import AddedUsersView from '../views/AddedUsersView';
import SearchUsersView from '../views/SearchUsersView';
import BlockedUsersView from '../views/BlockedUsersView';

import { useApiContext } from '../lib/context/ApiContext';
import { useAuthContext } from '../lib/context/AuthContext';
import log from '../lib/util/LoggerUtil';
import useFetchHook from '../lib/hooks/useFetchHook';
import { get } from 'react-native/Libraries/TurboModule/TurboModuleRegistry';

const ChatStack = createNativeStackNavigator();
const ProfileStack = createNativeStackNavigator();
const ContactTab = createMaterialTopTabNavigator();

const InsideStack = createNativeStackNavigator();
const InsideTab = createBottomTabNavigator();

const ContactTopTabNavigator = () => {
  return (
    <ContactTab.Navigator>
      <ContactTab.Screen
        name="AddedUsersView"
        component={AddedUsersView}
        options={{ title: 'Contacts' }}
      />

      <ContactTab.Screen
        name="BlockedUsersView"
        component={BlockedUsersView}
        options={{ title: 'Blocked' }}
      />
    </ContactTab.Navigator>
  );
};

const ContactStackNavigator = ({ navigation }) => {
  return (
    <InsideStack.Navigator>
      <InsideStack.Screen
        name="ContactTopTabNavigator"
        component={ContactTopTabNavigator}
        options={{
          title: 'Contacts',
          headerRight: () => (
            <IconButton
              icon="plus"
              size={20}
              onPress={() => navigation.navigate('SearchUsersView')}
            />
          ),
        }}
      />
      <InsideStack.Screen
        name="SearchUsersView"
        component={SearchUsersView}
        options={{
          title: 'Search Users',
        }}
      />
    </InsideStack.Navigator>
  );
};

const ChatStackNavigator = () => {
  return (
    <ChatStack.Navigator>
      <ChatStack.Screen
        name="ChatSummaryView"
        component={ChatSummaryView}
        options={{ title: 'Chat' }}
      />
      <ChatStack.Screen name="ChatView" component={ChatView} />

      <ChatStack.Screen name="EditChatView" component={EditChatView} />
      <ChatStack.Screen name="InviteUserView" component={InviteUserView} />
    </ChatStack.Navigator>
  );
};

const ProfileStackNavigator = () => {
  return (
    <ProfileStack.Navigator>
      <ProfileStack.Screen name="ProfileView" component={ProfileView} />
    </ProfileStack.Navigator>
  );
};

const InsideTabNavigator = () => {
  return (
    <InsideTab.Navigator initialRouteName="ChatStackNavigator">
      <InsideTab.Screen
        name="ChatStackNavigator"
        component={ChatStackNavigator}
        options={{
          title: 'Chat',
          headerShown: false,
          tabBarIcon: ({ color, size }) => <Icons name={'chat'} size={size} color={color} />,
        }}
      />
      <InsideTab.Screen
        name="ContactStackNavigator"
        component={ContactStackNavigator}
        options={{
          headerShown: false,
          title: 'Contacts',
          tabBarIcon: ({ color, size }) => <Icons name={'contacts'} size={size} color={color} />,
        }}
      />
    </InsideTab.Navigator>
  );
};

const InsideStackNavigator = () => {
  const { useFetch } = useApiContext();
  const { authState } = useAuthContext();

  if (!useFetch) {
    log.error('Unable to find Auth API...');
    throw new Error('Unable to find Auth API...');
  }

  const fetch = async () => {
    try {
      const response = await useFetch({ url: `/chat`, method: 'GET' }, true);
      log.debug(`[POLLING] Fetched ChatList: ${response.data.length}`);
    } catch (err) {
      log.error(err);
    }
  };

  const pollTest = () => {
    setInterval(() => {
      fetch();
    }, 10000);
  };

  useEffect(() => {
    if (authState.authenticated === true) pollTest();
  }, [authState.authenticated]);

  return (
    <InsideStack.Navigator>
      <InsideStack.Screen
        name="InsideTabNavigator"
        component={InsideTabNavigator}
        options={{ headerShown: false }}
      />
      <InsideStack.Screen
        name="ProfileStackNavigator"
        component={ProfileStackNavigator}
        options={{ headerShown: false }}
      />
    </InsideStack.Navigator>
  );
};

export default InsideStackNavigator;
