/* eslint-disable max-lines-per-function */
import NetInfo from '@react-native-community/netinfo';
import { type Href, useRouter } from 'expo-router';
import React, { useState } from 'react';
import { Alert, TouchableOpacity } from 'react-native';

import { Cover } from '@/components/cover';
import {
  Button,
  FocusAwareStatusBar,
  SafeAreaView,
  Text,
  View,
} from '@/components/ui';
import { hydrateAuth, translate } from '@/lib';
import { useIsFirstTime } from '@/lib/hooks';

// Step Data Interface
interface OnboardingStep {
  title: string;
  subtitle: string;
  content: React.ReactNode;
}

export default function Onboarding() {
  const [, setIsFirstTime] = useIsFirstTime();
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(0);

  // Define the steps of the onboarding wizard
  const steps: Array<OnboardingStep> = [
    {
      title: translate('onboarding.title'),
      subtitle: translate('onboarding.subtitle'),
      content: (
        <View>
          <Text className="my-1 pt-6 text-left text-lg">
            {translate('onboarding.features.production_ready')}
          </Text>
          <Text className="my-1 text-left text-lg">
            {translate('onboarding.features.developer_experience')}
          </Text>
        </View>
      ),
    },
    {
      title: 'Build Faster',
      subtitle: 'Focus on your product',
      content: (
        <View>
          <Text className="my-1 pt-6 text-left text-lg">
            {translate('onboarding.features.minimal_code')}
          </Text>
          <Text className="my-1 text-left text-lg">
            {translate('onboarding.features.well_maintained_libraries')}
          </Text>
        </View>
      ),
    },
    {
      title: 'Start Your Journey',
      subtitle: 'Join our community or explore as a guest',
      content: null, // Auth Choice Screen needs no extra text content
    },
  ];

  const isLastStep = currentStep === steps.length - 1;

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    }
  };

  const finishOnboarding = async (path: Href = '/') => {
    // If the user chooses to continue as guest (path is '/'),
    // we must ensure an anonymous session is created before navigating.
    if (path === '/') {
      const state = await NetInfo.fetch();
      if (!state.isConnected) {
        Alert.alert(
          'No Internet Connection',
          'An internet connection is required to create a new guest account. Please connect to the internet and try again.',
        );
        return;
      }
      await hydrateAuth();
    }

    setIsFirstTime(false);
    router.replace(path);
  };

  return (
    <View className="flex h-full items-center justify-center bg-white dark:bg-black">
      <FocusAwareStatusBar />

      {/* Top Image / Cover Area */}
      <View className="w-full flex-1">
        <Cover />
      </View>

      {/* Content Area */}
      <View className="w-full flex-1 justify-end px-4 pb-8">
        <Text className="my-3 text-center text-5xl font-bold">
          {steps[currentStep].title}
        </Text>
        <Text className="mb-6 text-center text-lg text-gray-600 dark:text-gray-400">
          {steps[currentStep].subtitle}
        </Text>

        {/* Step Content */}
        {steps[currentStep].content && (
          <View className="mb-8 px-4">{steps[currentStep].content}</View>
        )}

        {/* Navigation / Action Buttons */}
        <SafeAreaView className="w-full">
          {isLastStep ? (
            <View className="gap-4">
              <Button
                label="Create Account"
                onPress={() => finishOnboarding('/sign-up')}
              />
              <Button
                label="I have an account"
                variant="secondary"
                onPress={() => finishOnboarding('/sign-in')}
              />
              <TouchableOpacity
                onPress={() => finishOnboarding('/')}
                className="py-2"
              >
                <Text className="text-center text-base font-medium text-gray-500">
                  Maybe Later (Continue as Guest)
                </Text>
              </TouchableOpacity>
            </View>
          ) : (
            <Button label="Next" onPress={handleNext} />
          )}
        </SafeAreaView>

        {/* Step Indicator */}
        {!isLastStep && (
          <View className="mt-4 flex-row justify-center gap-2">
            {steps.map((_, index) => (
              <View
                key={index}
                className={`size-2 rounded-full ${
                  index === currentStep ? 'bg-primary-500' : 'bg-gray-300'
                }`}
              />
            ))}
          </View>
        )}
      </View>
    </View>
  );
}
