/* eslint-disable max-lines-per-function */
import { Link, useRouter } from 'expo-router';
import { useColorScheme } from 'nativewind';
import React from 'react';
import { Alert } from 'react-native';
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
  const isAnonymous = useAuth.use.isAnonymous();
  const router = useRouter();

  const { mutateAsync: deleteUserAsync, isPending: isDeletingUser } =
    useDeleteUser({
      onSuccess: () => {
        showMessage({
          message: 'Account deleted successfully',
          type: 'success',
        });
        signOut();
        // Redirect to home/feed after reset
        router.replace('/');
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

  const handleResetApp = () => {
    Alert.alert(
      'Reset App',
      'Are you sure you want to reset the app? All your local data will be lost.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Reset',
          style: 'destructive',
          onPress: async () => {
            await signOut();
            router.replace('/');
          },
        },
      ],
    );
  };

  // When clicking "Continue as Guest", user is initially null
  // so we treat null user as "Anonymous/Guest" to show the correct UI
  // instead of the logged-in UI with empty fields.
  const isGuest = isAnonymous || !user;

  return (
    <>
      <FocusAwareStatusBar />
      <ScrollView>
        <View className="flex-1 gap-2 p-4">
          <Text className="text-xl font-bold">
            {translate('settings.title')}
          </Text>

          {/* Account Section - Different for Guests vs Registered */}
          {isGuest ? (
            <ItemsContainer title="settings.account.title">
              <View className="px-4 py-2">
                <Text className="text-sm text-neutral-500 dark:text-neutral-400">
                  {translate('settings.guest.subtitle')}
                </Text>
              </View>
              <Link asChild href="/sign-up">
                <Item text="settings.guest.signUp" />
              </Link>
              <Link asChild href="/sign-in">
                <Item text="settings.guest.signIn" />
              </Link>
            </ItemsContainer>
          ) : (
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
          )}

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

          {/* Danger Zone */}
          <View className="my-8">
            <ItemsContainer>
              {isGuest ? (
                <Item text="settings.guest.reset" onPress={handleResetApp} />
              ) : (
                <>
                  <DeleteAccountItem
                    onDelete={handleDeleteUser}
                    userEmail={user?.email}
                    isDeleting={isDeletingUser}
                  />
                  <Item text="settings.logout" onPress={signOut} />
                </>
              )}
            </ItemsContainer>
          </View>
        </View>
      </ScrollView>
    </>
  );
}
