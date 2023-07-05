import * as React from 'react';
import { View } from 'react-native';
import { Menu, IconButton, Avatar, TouchableRipple } from 'react-native-paper';
import { IconSource } from 'react-native-paper/lib/typescript/src/components/Icon';
import { useGlobalContext } from '../lib/context/GlobalContext';

export interface IMenuItem {
  title: React.ReactNode;
  leadingIcon?: IconSource | undefined;
  trailingIcon?: IconSource | undefined;
  disabled?: boolean | undefined;
  dense?: boolean | undefined;
  anchor?: React.ReactNode;
  onPress?: () => any;
}

function MenuItems(props: { items: IMenuItem[]; closeMenu: () => void }) {
  const { items, closeMenu } = props;
  return (
    <>
      {items.map((menuItem: IMenuItem, key: React.Key) => {
        return (
          <Menu.Item
            key={key}
            onPress={() => {
              menuItem.onPress();
              closeMenu();
            }}
            title={menuItem.title}
            disabled={menuItem.disabled}
          />
        );
      })}
    </>
  );
}

function SettingsMenu(props: { items: any }) {
  const { toggleTheme } = useGlobalContext();
  const [visible, setVisible] = React.useState(false);

  const openMenu = () => setVisible(true);
  const closeMenu = () => setVisible(false);

  const { items } = props;

  return (
    <View
      style={{
        flexDirection: 'row',
        justifyContent: 'center',
      }}
    >
      <Menu
        visible={visible}
        onDismiss={closeMenu}
        anchor={
          // <IconButton icon="dots-horizontal" size={20} onPress={openMenu} />

          <TouchableRipple onPress={openMenu} rippleColor="rgba(0, 0, 0, .32)">
            <Avatar.Icon size={35} icon="account" style={{ margin: 10 }} />
          </TouchableRipple>
        }
      >
        <Menu.Item
          onPress={() => (toggleTheme ? toggleTheme() : console.log('No toggleTheme'))}
          title="Toggle Theme"
        />
        <MenuItems items={items} closeMenu={closeMenu} />
      </Menu>
    </View>
  );
}

export default SettingsMenu;
