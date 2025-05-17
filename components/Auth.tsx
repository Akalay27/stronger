import { useState } from "react";
import { Alert, Button, Platform, TextInput, View } from "react-native";
import * as AppleAuthentication from "expo-apple-authentication";
import * as Linking from "expo-linking";
import { supabase } from "../lib/databases/supabase/supabase";

export function Auth() {
    const [email, setEmail]       = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading]   = useState(false);

    const signInWithPassword = async () => {
        setLoading(true);
        const { data, error } = await supabase.auth.signInWithPassword({ email, password });
        setLoading(false);
        if (error) Alert.alert('Sign‑in Error', error.message);
        else console.log('Signed in:', data.user);
    };

    const signUpWithPassword = async () => {
        setLoading(true);
        const { data, error } = await supabase.auth.signUp({ email, password });
        setLoading(false);
        if (error) Alert.alert('Sign‑up Error', error.message);
        else Alert.alert('Welcome!', 'Check your email to confirm your account.');
    };

    if (Platform.OS === "ios")
        return (
            <AppleAuthentication.AppleAuthenticationButton
                buttonType={AppleAuthentication.AppleAuthenticationButtonType.SIGN_IN}
                buttonStyle={AppleAuthentication.AppleAuthenticationButtonStyle.BLACK}
                cornerRadius={5}
                style={{ width: 200, height: 64 }}
                onPress={async () => {
                    try {
                        const credential = await AppleAuthentication.signInAsync({
                            requestedScopes: [
                                AppleAuthentication.AppleAuthenticationScope.FULL_NAME,
                                AppleAuthentication.AppleAuthenticationScope.EMAIL,
                            ],
                        });
                        // Sign in via Supabase Auth.
                        if (credential.identityToken) {
                            const {
                                error,
                                data: { user },
                            } = await supabase.auth.signInWithIdToken({
                                provider: "apple",
                                token: credential.identityToken,
                            });
                            console.log(JSON.stringify({ error, user }, null, 2));
                            if (!error) {
                                // User is signed in.
                            }
                        } else {
                            throw new Error("No identityToken.");
                        }
                    } catch (e) {
                        if (e.code === "ERR_REQUEST_CANCELED") {
                            // handle that the user canceled the sign-in flow
                        } else {
                            // handle other errors
                        }
                    }
                }}
            />
        );
    return (
        <View style={{ flex:1, padding:20, justifyContent:'center' }}>
            <TextInput
                placeholder="Email"
                keyboardType="email-address"
                autoCapitalize="none"
                style={{ marginBottom:12, padding:8, borderWidth:1, borderRadius:4 }}
                value={email}
                onChangeText={setEmail}
            />
            <TextInput
                placeholder="Password"
                secureTextEntry
                style={{ marginBottom:12, padding:8, borderWidth:1, borderRadius:4 }}
                value={password}
                onChangeText={setPassword}
            />

            <Button
                title={loading ? 'Please wait…' : 'Sign In with Password'}
                onPress={signInWithPassword}
                disabled={loading}
            />
            <View style={{ height: 8 }} />

            <Button
                title="Sign Up with Password"
                onPress={signUpWithPassword}
                disabled={loading}
            />
            <View style={{ height: 8 }} />
        </View>
    );
}
