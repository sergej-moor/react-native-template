/* eslint-disable max-lines-per-function */
import { Link } from 'expo-router';
import { useColorScheme } from 'nativewind';
import React from 'react';
import { showMessage } from 'react-native-flash-message';

import { useDeleteUser } from '@/api/auth/use-delete-user';
import { DeleteAccountItem } from '@/components/settings/delete-account-item';
import { Item } from '@/components/settings/item';
import { ItemsContainer } from '@/components/settings/items-container';
import { LanguageItem } from '@/components/settings/language-item';
import { ThemeItem } from '@/components/settings/theme-item';
import {
  colors,
  FocusAwareStatusBar,
  ScrollView,
  Text,
  View,
} from '@/components/ui';
import { Website } from '@/components/ui/icons';
import { signOut, translate, useAuth } from '@/lib';
import { Env } from '@/lib/env';

export default function Settings() {
  const user = useAuth.use.user();
  const { mutateAsync: deleteUserAsync, isPending: isDeletingUser } =
    useDeleteUser({
      onSuccess: () => {
        showMessage({
          message: 'Account deleted successfully',
          type: 'success',
        });
        signOut();
      },
      onError: (error: Error) =>
        showMessage({ message: error.message, type: 'danger' }),
    });
  const { colorScheme } = useColorScheme();
  const iconColor =
    colorScheme === 'dark' ? colors.neutral[400] : colors.neutral[500];

  const handleDeleteUser = async () => {
    if (!user?.email) {
      return;
    }
    await deleteUserAsync({ email: user?.email });
  };

  return (
    <>
      <FocusAwareStatusBar />
      <ScrollView>
        <View className="flex-1 gap-2 p-4">
          <Text className="text-xl font-bold">
            {translate('settings.title')}
          </Text>
          <ItemsContainer title="settings.account.title">
            <Item
              text={'settings.account.name'}
              value={user?.user_metadata?.name ?? ''}
            />
            <Item text={'settings.account.email'} value={user?.email ?? ''} />
            <Link
              asChild
              href={{
                pathname: '/update-password',
              }}
            >
              <Item text="settings.account.password" />
            </Link>
          </ItemsContainer>
          <ItemsContainer title="settings.generale">
            <LanguageItem />
            <ThemeItem />
          </ItemsContainer>

          <ItemsContainer title="settings.links">
            <Link
              asChild
              href={{
                pathname: '/www',
                params: {
                  url: Env.TERMS_OF_SERVICE_URL,
                  title: translate('settings.terms'),
                },
              }}
            >
              <Item text="settings.terms" />
            </Link>
            <Link
              asChild
              href={{
                pathname: '/www',
                params: {
                  url: Env.WEBSITE_URL,
                  title: translate('settings.website'),
                },
              }}
            >
              <Item
                text="settings.website"
                icon={<Website color={iconColor} />}
              />
            </Link>
          </ItemsContainer>

          <ItemsContainer title="settings.about">
            <Item text="settings.version" value={Env.VERSION} />
          </ItemsContainer>

          <View className="my-8">
            <ItemsContainer>
              <DeleteAccountItem
                onDelete={handleDeleteUser}
                userEmail={user?.email}
                isDeleting={isDeletingUser}
              />
              <Item text="settings.logout" onPress={signOut} />
            </ItemsContainer>
          </View>
        </View>
      </ScrollView>
    </>
  );
}
