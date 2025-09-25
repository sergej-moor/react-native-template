import React from 'react';
import { Alert } from 'react-native';

import { translate } from '@/lib';

import { Item } from './item';

export type DeleteAccountItemProps = {
  onDelete: () => void;
  userEmail?: string;
  isDeleting?: boolean;
};

export const DeleteAccountItem = (props: DeleteAccountItemProps) => {
  const handleDeleteAccount = () => {
    props.onDelete();
  };

  const showFinalConfirmation = () => {
    const finalMessage = props.userEmail
      ? `${translate('settings.deleteAccount.finalConfirmMessage')}\n\nAccount: ${props.userEmail}`
      : translate('settings.deleteAccount.finalConfirmMessage');

    Alert.alert(
      translate('settings.deleteAccount.finalConfirmTitle'),
      finalMessage,
      [
        { text: translate('settings.deleteAccount.cancel'), style: 'cancel' },
        {
          text: translate('settings.deleteAccount.deleteForever'),
          style: 'destructive',
          onPress: handleDeleteAccount,
        },
      ],
    );
  };

  const confirmDelete = () => {
    if (props.isDeleting) {
      return; // Prevent multiple confirmations during deletion
    }

    Alert.alert(
      translate('settings.deleteAccount.confirmTitle'),
      `${translate('settings.deleteAccount.confirmMessage')}\n\n${translate('settings.deleteAccount.warningMessage')}`,
      [
        { text: translate('settings.deleteAccount.cancel'), style: 'cancel' },
        {
          text: translate('settings.deleteAccount.iUnderstand'),
          style: 'destructive',
          onPress: showFinalConfirmation,
        },
      ],
    );
  };

  if (props.isDeleting) {
    return (
      <Item
        text={'settings.deleteAccount.title'}
        value={'Deleting account...'}
        onPress={undefined}
      />
    );
  }

  return <Item text={'settings.deleteAccount.title'} onPress={confirmDelete} />;
};
