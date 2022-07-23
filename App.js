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
import * as Location from 'expo-location';

console.disableYellowBox = true;

const set = async (key, value) => { try { await AsyncStorage.setItem(key, value) } catch (e) { console.log(e) } }
const setObj = async (key, value) => { try { const jsonValue = JSON.stringify(value); await AsyncStorage.setItem(key, jsonValue) } catch (e) { console.log(e) } }
const get = async (key) => { try { const value = await AsyncStorage.getItem(key); if (value !== null) { try { return JSON.parse(value) } catch { return value } } } catch (e) { console.log(e) } }
const delkey = async (key, value) => { try { await AsyncStorage.removeItem(key) } catch (e) { console.log(e) } }

let moveOn = false
let locationNotGranted = false

let width = Dimensions.get('window').width-100


export default () => {
  const [, forceUpdate] = React.useReducer(x => x + 1, 0);

  const requestLocationPermission = () => {
    (async () => {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        locationNotGranted = true;
        forceUpdate()
        return;
      }

      let location = await Location.getCurrentPositionAsync({});
      console.warn(location)
      setObj('location', {
        lat: location.coords.latitude,
        long: location.coords.longitude
      })
      moveOn = true
      locationNotGranted = false;
    })();
  }

  get("readIntro")
  .then(val => {
    if (val) {
      moveOn = true
      forceUpdate()
    }
  })

  get("location")
  .then(val => {
    if (!val) {
      locationNotGranted = true
      forceUpdate()
    }
  })

  return(
  <>
    <IconRegistry icons={EvaIconsPack}/>
    <ApplicationProvider {...eva} theme={eva.dark}>
    {!moveOn && !locationNotGranted &&
    <Layout style={{flex: 1, justifyContent: 'center', padding: 50}}>

      <Image source={require('./assets/UNGoal13.png')} style={{width: width, height: width, marginBottom: 20}} />

      <Text category="p1" style={{marginBottom: 20}}>
        Each year, the amount of CO2 emitted into the atmosphere increases, and keeps hurting the earth. It has become a global concern, leading the UN to make it one of their 17 Sustainability Development Goals. Goal 13 task 3 (13.3) is to educate the general public about the effects of CO2 on the environment. This app aims to do just that. With Climalearn, you can see what changes the US Department of Energy predicts to the city you live in, and find out how you can help slow this down for a better future.
      </Text>

      <Button onPress={() => {set("readIntro", "true"); moveOn = true; requestLocationPermission(); forceUpdate()}}>
        <Text>Get Started</Text>
      </Button>
    </Layout>
    }
    {locationNotGranted && moveOn &&
    <Layout style={{flex: 1, justifyContent: 'center', padding: 50}}>

      <Text category="h5" style={{marginBottom: 20}}>
        Uh oh! You denied the app access to your location. We use your location to show location based predictions and solutions. Your location is stored only on the device.
      </Text>
      <Text>Allow location access-</Text>
      <Text>Android: Press and hold the app, click app info &gt; permissions &gt; location &gt; allow while in use</Text>
      <Text>iOS: Settindd &gt; Expo Go &gt; Location &gt; Allow</Text>
    </Layout>
    }
    {moveOn && !locationNotGranted &&
      <AppNavigator/>
    }
    </ApplicationProvider>
  </>
  )
};
