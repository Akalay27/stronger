import { PropsWithChildren } from 'react';
import { ScrollView, StyleSheet, type TextProps } from 'react-native';
import { Image } from "expo-image";
import * as MediaLibrary from "expo-media-library";

export type ProgressPictureGalleryProps = TextProps & {
    progressPictures: MediaLibrary.Asset[];
};

export function ProgressPictureGallery({
    progressPictures,
    style,
}: ProgressPictureGalleryProps & PropsWithChildren) {
    return (
        <ScrollView horizontal contentContainerStyle={styles.row}>
            {progressPictures.map(asset => (
                <Image
                    contentFit="cover"
                    key={asset.id}
                    source={{ uri: asset.uri }}
                    style={styles.image}
                />
            ))}
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, padding: 16 },
    dateSection: { marginBottom: 24 },
    dateHeader: { fontSize: 18, fontWeight: '600', marginBottom: 8 },
    row: { flexDirection: 'row' },
    image: {
        width: 100,
        height: 100,
        borderRadius: 8,
        marginRight: 12,
    },
});