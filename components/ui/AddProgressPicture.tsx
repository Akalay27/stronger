import React, { PropsWithChildren, useState, useEffect, SetStateAction } from "react";
import { Alert, type TextProps } from "react-native";
import * as ImagePicker from "expo-image-picker";
import * as MediaLibrary from "expo-media-library";

import { usePhotosByDate } from '@/hooks/usePhotosByDate';
import { useThemeColor } from '@/hooks/useThemeColor';

import { PrimaryContainer } from "@/components/PrimaryContainer";

import { IconSymbol } from "@/components/ui/IconSymbol";

export type AddProgressPictureProps = TextProps & {
    callback: React.Dispatch<SetStateAction<{}>>;
};

export function AddProgressPicture({
    callback,
    style,
}: AddProgressPictureProps & PropsWithChildren) {
    const [hasCameraPermission, setHasCameraPermission] = useState(false);
    const [hasLibraryPermission, setHasLibraryPermission] = useState(false);
    const [photoURI, setPhotoURI] = useState<string | null>(null);

    const pictureIconColor = useThemeColor({ light: "", dark: "" }, "tertiaryText");

    const openCameraAndSave = async () => {
        if(!hasCameraPermission || !hasLibraryPermission) {
            Alert.alert("Permissions Required!", "You need to grant camera and photo permissions first.");
            return;
        }

        const result = await ImagePicker.launchCameraAsync({
            mediaTypes: ["images"],
            quality: 1,
            allowsEditing: false,
        });

        if(result.canceled)
            return;

        setPhotoURI(result.assets[0].uri);

        try {
            const asset = await MediaLibrary.createAssetAsync(result.assets[0].uri);

            const album = await MediaLibrary.getAlbumAsync("Stronger Progress Pictures");

            if(album)
                await MediaLibrary.addAssetsToAlbumAsync([asset], album.id, false);
            else
                await MediaLibrary.createAlbumAsync("Stronger Progress Pictures", asset, false);
        } catch(err) {
            console.error(err);

            Alert.alert("Save Failed!", "We were unable to save your progress picture.");
        } finally {
            const currentDate = new Date();
            const currentDateString = currentDate.toLocaleDateString("en-US");
            const photosByDate = await usePhotosByDate(currentDate);

            callback(prev => ({
                ...prev,
                [currentDateString]: photosByDate,
            }));
        }
    };

    useEffect(() => {
        (async () => {
            const { status: libStatus } = await MediaLibrary.requestPermissionsAsync();
            setHasLibraryPermission(libStatus === "granted");

            const { status: camStatus } = await ImagePicker.requestCameraPermissionsAsync();
            setHasCameraPermission(camStatus === "granted");
        })();
    }, []);

    return (
        <PrimaryContainer
            mainColor="info"
            onPress={openCameraAndSave}
        >
            <IconSymbol name="plus" color={pictureIconColor} size={50}/>
        </PrimaryContainer>
    );
};