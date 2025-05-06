import * as MediaLibrary from "expo-media-library";

export async function usePhotosByDate(date: Date) {
    const { status } = await MediaLibrary.requestPermissionsAsync();
    if(status !== "granted")
        throw new Error("Media library permission not granted");

    const album = await MediaLibrary.getAlbumAsync("Stronger Progress Pictures");
    if(!album)
        throw new Error("The Stronger Progress Pictures album could not be found.");

    console.log(album.id)

    const startOfDay = new Date(date);
    startOfDay.setHours(0, 0, 0, 0);

    const endOfDay = new Date(date);
    endOfDay.setHours(23, 59, 59, 999);

    let allAssets: MediaLibrary.Asset[] = [];
    let pageCursor: string | undefined = undefined;

    do {
        const result = await MediaLibrary.getAssetsAsync({
            album: album.id,
            mediaType: ["photo"],
            createdAfter: startOfDay.getTime(),
            createdBefore: endOfDay.getTime(),
            first: 100,
            after: pageCursor,
            sortBy: [MediaLibrary.SortBy.creationTime],
        });

        allAssets = allAssets.concat(result.assets);
        pageCursor = result.hasNextPage ? result.endCursor : undefined;
    } while(pageCursor);

    return allAssets;
}