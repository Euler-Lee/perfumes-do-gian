import 'react-native-url-polyfill/auto';
import React, { useEffect, useState } from 'react';
import { View, ActivityIndicator, Text } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import type { Session } from '@supabase/supabase-js';
import { supabase } from './lib/supabase';
import { colors, headerStyle as hs } from './lib/theme';

// Auth
import LoginScreen  from './screens/auth/LoginScreen';
import SignupScreen from './screens/auth/SignupScreen';

// App
import HomeScreen           from './screens/HomeScreen';
import CategoriasListScreen from './screens/categorias/CategoriasListScreen';
import CategoriaFormScreen  from './screens/categorias/CategoriaFormScreen';
import PerfumesListScreen   from './screens/perfumes/PerfumesListScreen';
import PerfumeFormScreen    from './screens/perfumes/PerfumeFormScreen';
import PerfumeDetalheScreen from './screens/perfumes/PerfumeDetalheScreen';
import ColecaoScreen        from './screens/colecao/ColecaoScreen';

const AuthStack       = createNativeStackNavigator();
const Tab             = createBottomTabNavigator();
const HomeStack       = createNativeStackNavigator();
const CategoriasStack = createNativeStackNavigator();
const PerfumesStack   = createNativeStackNavigator();
const ColecaoStack    = createNativeStackNavigator();

const HEADER      = hs.default;
const HEADER_GOLD = hs.gold;

function HomeNavigator() {
  return (
    <HomeStack.Navigator screenOptions={HEADER}>
      <HomeStack.Screen name="Home" component={HomeScreen} options={{ title: 'Perfumes do Gian' }} />
    </HomeStack.Navigator>
  );
}

function CategoriasNavigator() {
  return (
    <CategoriasStack.Navigator screenOptions={HEADER_GOLD}>
      <CategoriasStack.Screen name="CategoriasList" component={CategoriasListScreen} options={{ title: 'Categorias' }} />
      <CategoriasStack.Screen name="CategoriaForm"  component={CategoriaFormScreen} />
      <CategoriasStack.Screen name="PerfumesList"   component={PerfumesListScreen} />
      <CategoriasStack.Screen name="PerfumeDetalhe" component={PerfumeDetalheScreen} />
      <CategoriasStack.Screen name="PerfumeForm"    component={PerfumeFormScreen} />
    </CategoriasStack.Navigator>
  );
}

function PerfumesNavigator() {
  return (
    <PerfumesStack.Navigator screenOptions={HEADER_GOLD}>
      <PerfumesStack.Screen name="PerfumesList"   component={PerfumesListScreen} options={{ title: 'Perfumes' }} />
      <PerfumesStack.Screen name="PerfumeDetalhe" component={PerfumeDetalheScreen} />
      <PerfumesStack.Screen name="PerfumeForm"    component={PerfumeFormScreen} />
    </PerfumesStack.Navigator>
  );
}

function ColecaoNavigator() {
  return (
    <ColecaoStack.Navigator screenOptions={HEADER_GOLD}>
      <ColecaoStack.Screen name="Colecao"        component={ColecaoScreen} options={{ title: 'Minha Coleção' }} />
      <ColecaoStack.Screen name="PerfumeDetalhe" component={PerfumeDetalheScreen} />
    </ColecaoStack.Navigator>
  );
}

function AppTabs() {
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor:   colors.gold,
        tabBarInactiveTintColor: colors.text3,
        tabBarStyle: {
          backgroundColor: colors.primary,
          borderTopColor: 'rgba(200,169,81,0.3)',
          borderTopWidth: 1,
          height: 58,
          paddingBottom: 6,
          paddingTop: 6,
        },
        tabBarLabelStyle: { fontWeight: '600', fontSize: 10, letterSpacing: 0.2 },
      }}
    >
      <Tab.Screen name="HomeTab" component={HomeNavigator}
        options={{ title: 'Início', tabBarIcon: ({ focused }) => <Text style={{ fontSize: 20, opacity: focused ? 1 : 0.5 }}>🏠</Text> }} />
      <Tab.Screen name="CategoriasTab" component={CategoriasNavigator}
        options={{ title: 'Categorias', tabBarIcon: ({ focused }) => <Text style={{ fontSize: 20, opacity: focused ? 1 : 0.5 }}>🗂️</Text> }} />
      <Tab.Screen name="PerfumesTab" component={PerfumesNavigator}
        options={{ title: 'Perfumes', tabBarIcon: ({ focused }) => <Text style={{ fontSize: 20, opacity: focused ? 1 : 0.5 }}>🫙</Text> }} />
      <Tab.Screen name="ColecaoTab" component={ColecaoNavigator}
        options={{ title: 'Coleção', tabBarIcon: ({ focused }) => <Text style={{ fontSize: 20, opacity: focused ? 1 : 0.5 }}>💎</Text> }} />
    </Tab.Navigator>
  );
}

export default function App() {
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setLoading(false);
    });
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });
    return () => subscription.unsubscribe();
  }, []);

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: colors.primary }}>
        <Text style={{ fontSize: 52, marginBottom: 16 }}>🫙</Text>
        <ActivityIndicator color={colors.gold} size="large" />
      </View>
    );
  }

  return (
    <SafeAreaProvider>
      <NavigationContainer>
        {session ? (
          <AppTabs />
        ) : (
          <AuthStack.Navigator screenOptions={{ headerShown: false }}>
            <AuthStack.Screen name="Login"  component={LoginScreen} />
            <AuthStack.Screen name="Signup" component={SignupScreen} />
          </AuthStack.Navigator>
        )}
      </NavigationContainer>
    </SafeAreaProvider>
  );
}

