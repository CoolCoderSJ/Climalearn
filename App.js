import React from 'react';
import { StyleSheet, Image, Dimensions } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
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

const set = async (key, value) => { try { await AsyncStorage.setItem(key, value) } catch (e) { console.log(e) } }
const setObj = async (key, value) => { try { const jsonValue = JSON.stringify(value); await AsyncStorage.setItem(key, jsonValue) } catch (e) { console.log(e) } }
const get = async (key) => { try { const value = await AsyncStorage.getItem(key); if (value !== null) { try { return JSON.parse(value) } catch { return value } } } catch (e) { console.log(e) } }

let moveOn = false

let width = Dimensions.get('window').width-100

export default () => {
  const [, forceUpdate] = React.useReducer(x => x + 1, 0);

  get("readIntro")
  .then(val => {
    if (val) {
      moveOn = true
      forceUpdate()
    }
  })

  return(
  <>
    <IconRegistry icons={EvaIconsPack}/>
    <ApplicationProvider {...eva} theme={eva.dark}>
    {!moveOn &&
    <Layout style={{flex: 1, justifyContent: 'center', padding: 50}}>

      <Image source={require('./assets/UNGoal13.png')} style={{width: width, height: width, marginBottom: 20}} />

      <Text category="p1" style={{marginBottom: 20}}>
        Each year, the amount of CO2 emitted into the atmosphere increases, and keeps hurting the earth. It has become a global concern, leading the UN to make it one of their 17 Sustainability Development Goals. Goal 13 task 3 (13.3) is to educate the general public about the effects of CO2 on the environment. This app aims to do just that. With Climalearn, you can see what changes the US Department of Energy predicts to the city you live in, and find out how you can help slow this down for a better future.
      </Text>

      <Button onPress={() => {set("readIntro", "true"); moveOn = true; forceUpdate()}}>
        <Text>Get Started</Text>
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
