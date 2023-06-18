export enum AssetTypes {
    NATIVE_ZEN,
    ERC20_TOKEN,
    ERC721_NFT
}

export type AssetStruct = {
    assetId: number;
    assetType: AssetTypes;
    assetAddress: `0x${string}`;
    amount: string;
    tokekenIds?: bigint[];
};