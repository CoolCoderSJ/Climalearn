import React from 'react';
import { StyleSheet } from 'react-native';
import {
  ApplicationProvider,
  Button,
  Icon,
  IconRegistry,
  Layout,
  Text,
} from '@ui-kitten/components';
import { EvaIconsPack } from '@ui-kitten/eva-icons';
import * as eva from '@eva-design/eva';
import { AppNavigator } from './navigation';
import 'react-native-gesture-handler';

moveOn = false

export default () => {
  const [, forceUpdate] = React.useReducer(x => x + 1, 0);

  return(
  <>
    <IconRegistry icons={EvaIconsPack}/>
    <ApplicationProvider {...eva} theme={eva.light}>
    {!moveOn &&
    <Layout style={{flex: 1, justifyContent: 'center', alignItems: 'center'}}>
      <Button onPress={() => {moveOn = true; forceUpdate()}}>
        <Text>Move on</Text>
      </Button>
    </Layout>
    }
    {moveOn &&
      <AppNavigator/>
    }
    </ApplicationProvider>
  </>
  )
};
