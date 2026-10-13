import 'react-native-gesture-handler';
import {AppRegistry} from 'react-native';
import {registerRootComponent} from 'expo';
import App from './App';

registerRootComponent(App);
// Existing native binaries request this name; Expo registers "main".
AppRegistry.registerComponent('holocron', () => App);
