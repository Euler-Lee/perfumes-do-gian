import 'react-native-url-polyfill/auto';
import React, { useEffect, useState } from 'react';
import { View, ActivityIndicator, Text, Linking } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { SafeAreaProvider, useSafeAreaInsets } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';
import type { Session } from '@supabase/supabase-js';
import { supabase } from './lib/supabase';
import { colors, headerStyle as hs, fontSize, fontWeight } from './lib/theme';
import { CartProvider, useCart } from './context/CartContext';

// Auth
import LoginScreen  from './screens/auth/LoginScreen';
import SignupScreen from './screens/auth/SignupScreen';

// Screens
import HomeScreen           from './screens/HomeScreen';
import PerfumesListScreen   from './screens/perfumes/PerfumesListScreen';
import PerfumeFormScreen    from './screens/perfumes/PerfumeFormScreen';
import PerfumeDetalheScreen from './screens/perfumes/PerfumeDetalheScreen';
import CartScreen           from './screens/cart/CartScreen';
import CheckoutScreen       from './screens/cart/CheckoutScreen';
import ConfirmacaoScreen    from './screens/cart/ConfirmacaoScreen';
import ContaScreen          from './screens/conta/ContaScreen';

const AuthStack   = createNativeStackNavigator();
const Tab         = createBottomTabNavigator();
const HomeStack   = createNativeStackNavigator();
const PerfStack   = createNativeStackNavigator();
const CartStack   = createNativeStackNavigator();
const ContaStack  = createNativeStackNavigator();

const HEADER      = hs.default;
const HEADER_GOLD = hs.gold;

function HomeNavigator() {
  return (
    <HomeStack.Navigator screenOptions={HEADER}>
      <HomeStack.Screen name="Home"          component={HomeScreen}           options={{ title: 'Perfumes do Gian', headerShown: false }} />
      <HomeStack.Screen name="PerfumesList"  component={PerfumesListScreen} />
      <HomeStack.Screen name="PerfumeDetalhe"component={PerfumeDetalheScreen} />
    </HomeStack.Navigator>
  );
}

function PerfumesNavigator() {
  return (
    <PerfStack.Navigator screenOptions={HEADER_GOLD}>
      <PerfStack.Screen name="PerfumesList"  component={PerfumesListScreen}   options={{ title: 'Catálogo' }} />
      <PerfStack.Screen name="PerfumeDetalhe"component={PerfumeDetalheScreen} />
      <PerfStack.Screen name="PerfumeForm"   component={PerfumeFormScreen} />
    </PerfStack.Navigator>
  );
}

function CartNavigator() {
  return (
    <CartStack.Navigator screenOptions={HEADER_GOLD}>
      <CartStack.Screen name="Cart"        component={CartScreen}        options={{ title: 'Carrinho' }} />
      <CartStack.Screen name="Checkout"    component={CheckoutScreen}    options={{ title: 'Finalizar Pedido' }} />
      <CartStack.Screen name="Confirmacao" component={ConfirmacaoScreen} options={{ title: 'Pedido Confirmado', headerShown: false }} />
    </CartStack.Navigator>
  );
}

function ContaNavigator() {
  return (
    <ContaStack.Navigator screenOptions={HEADER_GOLD}>
      <ContaStack.Screen name="Conta" component={ContaScreen} options={{ title: 'Minha Conta' }} />
    </ContaStack.Navigator>
  );
}

function CartTabIcon({ color, size }: { color: string; size: number }) {
  const { count } = useCart();
  return (
    <View>
      <MaterialIcons name="shopping-bag" size={size} color={color} />
      {count > 0 && (
        <View style={{
          position: 'absolute', top: -4, right: -6,
          backgroundColor: colors.gold, borderRadius: 8,
          minWidth: 16, height: 16, justifyContent: 'center', alignItems: 'center', paddingHorizontal: 3,
        }}>
          <Text style={{ fontSize: 9, color: colors.primary, fontWeight: '900' }}>{count}</Text>
        </View>
      )}
    </View>
  );
}

function AppTabs() {
  const insets = useSafeAreaInsets();
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor:   colors.gold,
        tabBarInactiveTintColor: '#6B7A8D',
        tabBarStyle: {
          backgroundColor: colors.primary,
          borderTopColor: 'rgba(200,169,81,0.25)',
          borderTopWidth: 1,
          paddingBottom: insets.bottom || 8,
          height: 56 + (insets.bottom || 8),
        },
        tabBarLabelStyle: { fontWeight: '600', fontSize: 10, letterSpacing: 0.2 },
      }}
    >
      <Tab.Screen name="HomeTab"    component={HomeNavigator}
        options={{ title: 'Início', tabBarIcon: ({ color, size }) => <MaterialIcons name="home" size={size} color={color} /> }} />
      <Tab.Screen name="PerfumesTab" component={PerfumesNavigator}
        options={{ title: 'Catálogo', tabBarIcon: ({ color, size }) => <MaterialIcons name="spa" size={size} color={color} /> }} />
      <Tab.Screen name="CarrinhoTab" component={CartNavigator}
        options={{ title: 'Carrinho', tabBarIcon: ({ color, size }) => <CartTabIcon color={color} size={size} /> }} />
      <Tab.Screen name="ContaTab"   component={ContaNavigator}
        options={{ title: 'Conta', tabBarIcon: ({ color, size }) => <MaterialIcons name="person" size={size} color={color} /> }} />
    </Tab.Navigator>
  );
}

function AppRoot() {
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

    // Deep link handler para OAuth callbacks (implicit flow — tokens no fragment)
    const handleUrl = async (url: string) => {
      if (!url || !url.startsWith('pdg://')) return;
      // Implicit flow: access_token no fragment (#) — Android preserva o fragment no Intent
      const fragment = url.includes('#') ? url.split('#')[1] : null;
      const query    = url.includes('?') ? url.split('?')[1] : null;
      const params   = new URLSearchParams(fragment ?? query ?? '');
      const access_token  = params.get('access_token');
      const refresh_token = params.get('refresh_token');
      if (access_token && refresh_token) {
        await supabase.auth.setSession({ access_token, refresh_token });
      }
    };
    const linkSub = Linking.addEventListener('url', ({ url }) => handleUrl(url));
    Linking.getInitialURL().then(url => url && handleUrl(url));

    return () => { subscription.unsubscribe(); linkSub.remove(); };
  }, []);

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: colors.primary }}>
        <ActivityIndicator color={colors.gold} size="large" />
      </View>
    );
  }

  return (
    <NavigationContainer>
      {session ? (
        <CartProvider>
          <AppTabs />
        </CartProvider>
      ) : (
        <AuthStack.Navigator screenOptions={{ headerShown: false }}>
          <AuthStack.Screen name="Login"  component={LoginScreen} />
          <AuthStack.Screen name="Signup" component={SignupScreen} />
        </AuthStack.Navigator>
      )}
    </NavigationContainer>
  );
}

export default function App() {
  return (
    <SafeAreaProvider>
      <AppRoot />
    </SafeAreaProvider>
  );
}
