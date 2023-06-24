import * as React from 'react';
import { View } from 'react-native';
import { Menu, IconButton } from 'react-native-paper';
import { useGlobalContext } from '../lib/context/GlobalContext';
import { IconSource } from 'react-native-paper/lib/typescript/src/components/Icon';

export interface IMenuItem {
  title: React.ReactNode;
  leadingIcon?: IconSource | undefined;
  trailingIcon?: IconSource | undefined;
  disabled?: boolean | undefined;
  dense?: boolean | undefined;
  anchor?: React.ReactNode;
  onPress?: () => any;
}

const MenuItems = (props: { items: IMenuItem[]; }) => {
  const items = props.items;
  return (
    <>
      {items.map((menuItem: IMenuItem, key: React.Key) => {
        return <Menu.Item key={key} onPress={menuItem.onPress} title={menuItem.title} disabled={menuItem.disabled}/>;
      })}
    </>
  );
};

const SettingsMenu = (props: { items: any; }) => {
  const { toggleTheme } = useGlobalContext();
  const [visible, setVisible] = React.useState(false);

  const openMenu = () => setVisible(true);
  const closeMenu = () => setVisible(false);

  const items = props.items;
  
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
        anchor={<IconButton icon="dots-horizontal" size={20} onPress={openMenu} />}
      >
        <Menu.Item
          onPress={() => (toggleTheme ? toggleTheme() : console.log('No toggleTheme'))}
          title="Toggle Theme"
        />
        <MenuItems items={items} />
      </Menu>
    </View>
  );
};

export default SettingsMenu;