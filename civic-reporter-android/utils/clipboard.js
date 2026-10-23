import * as Clipboard from 'expo-clipboard';
import Toast from 'react-native-toast-message';

export const copyToClipboard = async (text, successMsg = 'Copied to clipboard!') => {
  try {
    await Clipboard.setStringAsync(text);
    if (successMsg) {
      Toast.show({
        type: 'success',
        text1: successMsg,
        position: 'top',
        visibilityTime: 2000,
      });
    }
    return true;
  } catch (err) {
    console.error('Failed to copy text:', err);
    return false;
  }
};

export default copyToClipboard;
