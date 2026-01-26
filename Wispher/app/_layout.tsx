import { Stack } from "expo-router";
import "../global.css"
import { StatusBar } from "expo-status-bar";
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'

export default function RootLayout() {
  const queryClient = new QueryClient();
  return <>
    <QueryClientProvider client={queryClient}>
      <Stack>
        <Stack.Screen
          name="index"
          options={{ 
            headerShown: false,
          }}
        />
      </Stack>
      <StatusBar style="light" backgroundColor="#ff00ff" />
    </QueryClientProvider>
  </>;
}
